import { PDFDocument } from 'pdf-lib'
import pdfParse from 'pdf-parse'
import sharp from 'sharp'
import { pdfDbService } from '@/lib/database/pdf-service'
import {
  PDFProcessingOptions,
  ProcessedPDF,
  ProcessedPage,
  PDFMetadata,
  PageTextContent,
  PDFProcessingError,
  PDF_ERROR_CODES
} from '@/lib/types/pdf'

export class PDFProcessor {
  private readonly MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
  private readonly MAX_PAGES = 1000
  private readonly PROCESSING_TIMEOUT = 30 * 60 * 1000 // 30 minutes

  async processPDF(
    fileBuffer: Buffer,
    documentId: string,
    options: PDFProcessingOptions
  ): Promise<ProcessedPDF> {
    // Validate file size
    if (fileBuffer.length > this.MAX_FILE_SIZE) {
      throw new PDFProcessingError(
        `PDF file too large: ${fileBuffer.length} bytes (max: ${this.MAX_FILE_SIZE})`,
        PDF_ERROR_CODES.TOO_LARGE,
        documentId
      )
    }

    // Create processing job
    const job = await pdfDbService.createProcessingJob({
      documentId,
      status: 'PROCESSING',
      progress: 0
    })

    try {
      // Update document status
      await pdfDbService.updateDocumentProcessingStatus(
        documentId,
        'PROCESSING'
      )

      // Load and validate PDF
      const pdfDoc = await this.loadAndValidatePDF(fileBuffer, documentId)
      const pageCount = pdfDoc.getPageCount()
      
      if (pageCount > this.MAX_PAGES) {
        throw new PDFProcessingError(
          `PDF has too many pages: ${pageCount} (max: ${this.MAX_PAGES})`,
          PDF_ERROR_CODES.TOO_LARGE,
          documentId
        )
      }

      const maxPages = options.maxPages || pageCount
      const pagesToProcess = Math.min(pageCount, maxPages)

      // Update progress
      await pdfDbService.updateProcessingJob(job.id, { progress: 10 })

      // Extract metadata
      const metadata = await this.extractMetadata(pdfDoc)

      // Update progress
      await pdfDbService.updateProcessingJob(job.id, { progress: 20 })

      // Extract text content if requested
      let textContent: PageTextContent[] = []
      if (options.extractText) {
        textContent = await this.extractTextContent(fileBuffer, pagesToProcess, documentId)
        
        // Store text content in database
        for (const pageText of textContent) {
          await pdfDbService.createDocumentTextSearch({
            documentId,
            pageNumber: pageText.pageNumber,
            searchableText: pageText.searchableText,
            wordPositions: pageText.words
          })
        }
      }

      // Update progress
      await pdfDbService.updateProcessingJob(job.id, { progress: 60 })

      // Create page entries (actual rendering will be done on-demand)
      const pages: ProcessedPage[] = []
      for (let i = 0; i < pagesToProcess; i++) {
        const pageNumber = i + 1
        const page: ProcessedPage = {
          pageNumber,
          imageUrl: `/api/pdf/render/${documentId}/${pageNumber}`,
          width: 612, // Standard letter size - will be updated when rendered
          height: 792,
          textBounds: textContent[i]?.words || []
        }

        pages.push(page)

        // Store page info in database
        await pdfDbService.createPDFPage({
          documentId,
          pageNumber,
          imageUrl: page.imageUrl,
          width: page.width,
          height: page.height,
          textContent: textContent[i]?.text || '',
          textBounds: page.textBounds
        })
      }

      // Update progress
      await pdfDbService.updateProcessingJob(job.id, { progress: 90 })

      // Update document with final info
      await pdfDbService.updateDocumentProcessingStatus(
        documentId,
        'COMPLETED',
        {
          totalPages: pageCount,
          textExtracted: options.extractText,
          fileSize: BigInt(fileBuffer.length),
          mimeType: 'application/pdf'
        }
      )

      // Complete the job
      await pdfDbService.updateProcessingJob(job.id, {
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date()
      })

      const result: ProcessedPDF = {
        id: documentId,
        totalPages: pageCount,
        pages,
        textContent,
        thumbnails: [], // Will be generated on-demand
        metadata
      }

      return result

    } catch (error) {
      // Update job with error
      await pdfDbService.updateProcessingJob(job.id, {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      })

      // Update document status
      await pdfDbService.updateDocumentProcessingStatus(
        documentId,
        'FAILED'
      )

      if (error instanceof PDFProcessingError) {
        throw error
      }

      throw new PDFProcessingError(
        `PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PDF_ERROR_CODES.PROCESSING_TIMEOUT,
        documentId
      )
    }
  }

  private async loadAndValidatePDF(fileBuffer: Buffer, documentId: string): Promise<PDFDocument> {
    try {
      const pdfDoc = await PDFDocument.load(fileBuffer)
      
      // Check if PDF is password protected
      // Note: pdf-lib doesn't directly expose password protection info,
      // but we can try to access pages to see if it fails
      try {
        pdfDoc.getPageCount()
      } catch (error) {
        if (error instanceof Error && error.message.includes('password')) {
          throw new PDFProcessingError(
            'PDF is password protected',
            PDF_ERROR_CODES.PASSWORD_PROTECTED,
            documentId
          )
        }
        throw error
      }

      return pdfDoc
    } catch (error) {
      if (error instanceof PDFProcessingError) {
        throw error
      }

      throw new PDFProcessingError(
        'Invalid or corrupted PDF file',
        PDF_ERROR_CODES.INVALID_PDF,
        documentId
      )
    }
  }

  private async extractMetadata(pdfDoc: PDFDocument): Promise<PDFMetadata> {
    try {
      return {
        title: pdfDoc.getTitle() || undefined,
        author: pdfDoc.getAuthor() || undefined,
        subject: pdfDoc.getSubject() || undefined,
        creator: pdfDoc.getCreator() || undefined,
        producer: pdfDoc.getProducer() || undefined,
        creationDate: pdfDoc.getCreationDate() || undefined,
        modificationDate: pdfDoc.getModificationDate() || undefined,
        keywords: pdfDoc.getKeywords()?.split(',').map(k => k.trim()) || undefined
      }
    } catch (error) {
      console.warn('Failed to extract PDF metadata:', error)
      return {}
    }
  }

  private async extractTextContent(
    fileBuffer: Buffer,
    pageCount: number,
    documentId: string
  ): Promise<PageTextContent[]> {
    try {
      const parsedPdf = await pdfParse(fileBuffer)
      const fullText = parsedPdf.text

      // Simple text splitting by pages (this is a basic approximation)
      // In a production system, you'd want more sophisticated page-by-page extraction
      const textPerPage = Math.ceil(fullText.length / pageCount)
      const textContent: PageTextContent[] = []

      for (let i = 0; i < pageCount; i++) {
        const startIndex = i * textPerPage
        const endIndex = Math.min((i + 1) * textPerPage, fullText.length)
        const pageText = fullText.substring(startIndex, endIndex)

        // Create simple word boundaries (this would be enhanced with actual PDF parsing)
        const words = pageText.split(/\s+/).map((word: string, index: number) => ({
          text: word,
          x: (index % 10) * 60, // Simple positioning
          y: Math.floor(index / 10) * 20,
          width: word.length * 8,
          height: 16,
          confidence: 0.9
        }))

        textContent.push({
          pageNumber: i + 1,
          text: pageText,
          words,
          searchableText: pageText.toLowerCase().replace(/[^\w\s]/g, ' ')
        })
      }

      return textContent
    } catch (error) {
      console.error('Text extraction failed:', error)
      throw new PDFProcessingError(
        'Failed to extract text from PDF',
        PDF_ERROR_CODES.TEXT_EXTRACTION_FAILED,
        documentId
      )
    }
  }

  async extractText(fileBuffer: Buffer): Promise<string[]> {
    try {
      const parsedPdf = await pdfParse(fileBuffer)
      return [parsedPdf.text]
    } catch (error) {
      console.error('Text extraction failed:', error)
      return []
    }
  }

  async getPageCount(fileBuffer: Buffer): Promise<number> {
    try {
      const pdfDoc = await PDFDocument.load(fileBuffer)
      return pdfDoc.getPageCount()
    } catch (error) {
      console.error('Failed to get page count:', error)
      return 0
    }
  }

  async validatePDFFile(fileBuffer: Buffer): Promise<{
    isValid: boolean
    pageCount?: number
    isPasswordProtected?: boolean
    fileSize: number
    error?: string
  }> {
    try {
      if (fileBuffer.length > this.MAX_FILE_SIZE) {
        return {
          isValid: false,
          fileSize: fileBuffer.length,
          error: `File too large (${fileBuffer.length} bytes, max: ${this.MAX_FILE_SIZE})`
        }
      }

      const pdfDoc = await PDFDocument.load(fileBuffer)
      const pageCount = pdfDoc.getPageCount()

      if (pageCount > this.MAX_PAGES) {
        return {
          isValid: false,
          pageCount,
          fileSize: fileBuffer.length,
          error: `Too many pages (${pageCount}, max: ${this.MAX_PAGES})`
        }
      }

      return {
        isValid: true,
        pageCount,
        isPasswordProtected: false,
        fileSize: fileBuffer.length
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      return {
        isValid: false,
        fileSize: fileBuffer.length,
        isPasswordProtected: errorMessage.includes('password'),
        error: errorMessage
      }
    }
  }

  async getProcessingStatus(documentId: string) {
    try {
      const job = await pdfDbService.getProcessingJob(documentId)
      const document = await pdfDbService.getDocumentWithProcessingInfo(documentId)

      return {
        status: (document as any)?.processingStatus || 'PENDING',
        progress: job?.progress || 0,
        error: job?.errorMessage,
        startedAt: job?.startedAt,
        completedAt: job?.completedAt,
        totalPages: (document as any)?.totalPages,
        textExtracted: (document as any)?.textExtracted || false
      }
    } catch (error) {
      console.error('Failed to get processing status:', error)
      return {
        status: 'FAILED',
        progress: 0,
        error: 'Failed to get processing status'
      }
    }
  }
}

export const pdfProcessor = new PDFProcessor()