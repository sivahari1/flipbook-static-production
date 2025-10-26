import { PDFProcessingError, PDF_ERROR_CODES } from '@/lib/types/pdf'
import { pdfDbService } from '@/lib/database/pdf-service'

export class PDFErrorHandler {
  static async handleProcessingError(
    error: Error,
    documentId: string,
    jobId?: string,
    userId?: string
  ): Promise<void> {
    console.error(`PDF processing error for document ${documentId}:`, error)

    // Determine error type and code
    let errorCode: string = PDF_ERROR_CODES.PROCESSING_TIMEOUT
    let userMessage = 'PDF processing failed due to an unexpected error'

    if (error instanceof PDFProcessingError) {
      errorCode = error.code
      userMessage = error.message
    } else if (error.message.includes('password')) {
      errorCode = PDF_ERROR_CODES.PASSWORD_PROTECTED
      userMessage = 'This PDF is password protected and cannot be processed'
    } else if (error.message.includes('corrupted') || error.message.includes('invalid')) {
      errorCode = PDF_ERROR_CODES.CORRUPTED_FILE
      userMessage = 'The PDF file appears to be corrupted or invalid'
    } else if (error.message.includes('timeout')) {
      errorCode = PDF_ERROR_CODES.PROCESSING_TIMEOUT
      userMessage = 'PDF processing timed out. Please try again with a smaller file'
    } else if (error.message.includes('memory') || error.message.includes('size')) {
      errorCode = PDF_ERROR_CODES.TOO_LARGE
      userMessage = 'The PDF file is too large to process'
    }

    try {
      // Update document status
      await pdfDbService.updateDocumentProcessingStatus(
        documentId,
        'FAILED'
      )

      // Update processing job if provided
      if (jobId) {
        const processingJob = await pdfDbService.getProcessingJob(documentId)
        if (processingJob) {
          await pdfDbService.updateProcessingJob(processingJob.id, {
            status: 'FAILED' as any,
            errorMessage: userMessage,
            completedAt: new Date()
          })
        }
      }

      // Log the error for analytics
      if (userId) {
        await pdfDbService.logDocumentAccess({
          userId,
          documentId,
          action: 'NAVIGATE' as any, // Using as generic error action
          sessionId: `error-${Date.now()}`
        })
      }

    } catch (dbError) {
      console.error('Failed to update database after processing error:', dbError)
    }
  }

  static createUserFriendlyError(error: Error, documentId?: string): PDFProcessingError {
    if (error instanceof PDFProcessingError) {
      return error
    }

    let code: string = PDF_ERROR_CODES.PROCESSING_TIMEOUT
    let message = 'An unexpected error occurred while processing the PDF'

    if (error.message.includes('password')) {
      code = PDF_ERROR_CODES.PASSWORD_PROTECTED
      message = 'This PDF is password protected. Please provide a version without password protection.'
    } else if (error.message.includes('corrupted') || error.message.includes('invalid')) {
      code = PDF_ERROR_CODES.CORRUPTED_FILE
      message = 'The PDF file appears to be corrupted or in an unsupported format.'
    } else if (error.message.includes('timeout')) {
      code = PDF_ERROR_CODES.PROCESSING_TIMEOUT
      message = 'PDF processing timed out. This usually happens with very large or complex files.'
    } else if (error.message.includes('memory') || error.message.includes('size')) {
      code = PDF_ERROR_CODES.TOO_LARGE
      message = 'The PDF file is too large to process. Please try with a smaller file.'
    } else if (error.message.includes('network') || error.message.includes('connection')) {
      code = PDF_ERROR_CODES.STORAGE_ERROR
      message = 'Network error occurred during processing. Please try again.'
    }

    return new PDFProcessingError(message, code, documentId)
  }

  static getRetryStrategy(error: PDFProcessingError): {
    shouldRetry: boolean
    delay: number
    maxAttempts: number
  } {
    switch (error.code) {
      case PDF_ERROR_CODES.PROCESSING_TIMEOUT:
      case PDF_ERROR_CODES.STORAGE_ERROR:
      case PDF_ERROR_CODES.CACHE_ERROR:
        return {
          shouldRetry: true,
          delay: 5000, // 5 seconds
          maxAttempts: 3
        }

      case PDF_ERROR_CODES.TOO_LARGE:
        return {
          shouldRetry: false,
          delay: 0,
          maxAttempts: 0
        }

      case PDF_ERROR_CODES.PASSWORD_PROTECTED:
      case PDF_ERROR_CODES.CORRUPTED_FILE:
      case PDF_ERROR_CODES.INVALID_PDF:
        return {
          shouldRetry: false,
          delay: 0,
          maxAttempts: 0
        }

      default:
        return {
          shouldRetry: true,
          delay: 2000, // 2 seconds
          maxAttempts: 2
        }
    }
  }

  static async validateFileBeforeProcessing(
    fileBuffer: Buffer,
    filename?: string
  ): Promise<{
    isValid: boolean
    error?: PDFProcessingError
  }> {
    try {
      // Check file size (100MB limit)
      const MAX_SIZE = 100 * 1024 * 1024
      if (fileBuffer.length > MAX_SIZE) {
        return {
          isValid: false,
          error: new PDFProcessingError(
            `File too large: ${Math.round(fileBuffer.length / 1024 / 1024)}MB (max: 100MB)`,
            PDF_ERROR_CODES.TOO_LARGE
          )
        }
      }

      // Check if it's actually a PDF by looking at the header
      const pdfHeader = fileBuffer.slice(0, 4).toString()
      if (pdfHeader !== '%PDF') {
        return {
          isValid: false,
          error: new PDFProcessingError(
            'File is not a valid PDF document',
            PDF_ERROR_CODES.INVALID_PDF
          )
        }
      }

      // Check for common corruption indicators
      const fileContent = fileBuffer.toString('binary')
      if (!fileContent.includes('%%EOF')) {
        return {
          isValid: false,
          error: new PDFProcessingError(
            'PDF file appears to be corrupted (missing EOF marker)',
            PDF_ERROR_CODES.CORRUPTED_FILE
          )
        }
      }

      return { isValid: true }

    } catch (error) {
      return {
        isValid: false,
        error: new PDFProcessingError(
          'Failed to validate PDF file',
          PDF_ERROR_CODES.INVALID_PDF
        )
      }
    }
  }

  static formatErrorForUser(error: PDFProcessingError): {
    title: string
    message: string
    suggestions: string[]
    canRetry: boolean
  } {
    const retryStrategy = this.getRetryStrategy(error)

    switch (error.code) {
      case PDF_ERROR_CODES.PASSWORD_PROTECTED:
        return {
          title: 'Password Protected PDF',
          message: 'This PDF is password protected and cannot be processed.',
          suggestions: [
            'Remove the password protection from the PDF',
            'Use a PDF editor to save a copy without password protection',
            'Contact the document owner for an unprotected version'
          ],
          canRetry: false
        }

      case PDF_ERROR_CODES.TOO_LARGE:
        return {
          title: 'File Too Large',
          message: 'The PDF file is too large to process.',
          suggestions: [
            'Compress the PDF using a PDF optimizer',
            'Split the document into smaller parts',
            'Reduce image quality in the PDF',
            'Remove unnecessary pages or content'
          ],
          canRetry: false
        }

      case PDF_ERROR_CODES.CORRUPTED_FILE:
        return {
          title: 'Corrupted PDF File',
          message: 'The PDF file appears to be corrupted or damaged.',
          suggestions: [
            'Try opening the PDF in a PDF reader to verify it works',
            'Re-download or re-create the PDF file',
            'Use a PDF repair tool to fix corruption',
            'Contact the document creator for a new copy'
          ],
          canRetry: false
        }

      case PDF_ERROR_CODES.PROCESSING_TIMEOUT:
        return {
          title: 'Processing Timeout',
          message: 'PDF processing took too long and was cancelled.',
          suggestions: [
            'Try again - this might be a temporary issue',
            'Reduce the PDF file size or complexity',
            'Process during off-peak hours for better performance'
          ],
          canRetry: retryStrategy.shouldRetry
        }

      case PDF_ERROR_CODES.INVALID_PDF:
        return {
          title: 'Invalid PDF File',
          message: 'The uploaded file is not a valid PDF document.',
          suggestions: [
            'Make sure the file has a .pdf extension',
            'Verify the file is actually a PDF document',
            'Try converting the file to PDF format',
            'Upload a different PDF file'
          ],
          canRetry: false
        }

      default:
        return {
          title: 'Processing Error',
          message: error.message || 'An unexpected error occurred while processing the PDF.',
          suggestions: [
            'Try uploading the file again',
            'Check your internet connection',
            'Contact support if the problem persists'
          ],
          canRetry: retryStrategy.shouldRetry
        }
    }
  }
}

export const pdfErrorHandler = PDFErrorHandler