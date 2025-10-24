import { PDFDocument } from 'pdf-lib';
import * as pdfParse from 'pdf-parse';
import sharp from 'sharp';

export interface PDFProcessingOptions {
  quality: 'low' | 'medium' | 'high';
  maxPages?: number;
  extractText: boolean;
  generateThumbnails: boolean;
}

export interface ProcessedPage {
  pageNumber: number;
  imageUrl: string;
  width: number;
  height: number;
  textContent?: string;
}

export interface ProcessedPDF {
  id: string;
  totalPages: number;
  pages: ProcessedPage[];
  textContent: string[];
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
  };
}

export class PDFProcessor {
  async processPDF(
    fileBuffer: Buffer,
    documentId: string,
    options: PDFProcessingOptions
  ): Promise<ProcessedPDF> {
    try {
      // Load PDF document
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const pageCount = pdfDoc.getPageCount();
      const maxPages = options.maxPages || pageCount;
      const pagesToProcess = Math.min(pageCount, maxPages);

      // Extract metadata
      const title = pdfDoc.getTitle();
      const author = pdfDoc.getAuthor();
      const subject = pdfDoc.getSubject();
      const creator = pdfDoc.getCreator();

      const metadata = {
        title: title || undefined,
        author: author || undefined,
        subject: subject || undefined,
        creator: creator || undefined,
      };

      // Extract text content if requested
      let textContent: string[] = [];
      if (options.extractText) {
        try {
          const parsedPdf = await pdfParse(fileBuffer);
          // Split text by pages (this is a simple approximation)
          const fullText = parsedPdf.text;
          const textPerPage = Math.ceil(fullText.length / pageCount);
          
          for (let i = 0; i < pagesToProcess; i++) {
            const startIndex = i * textPerPage;
            const endIndex = Math.min((i + 1) * textPerPage, fullText.length);
            textContent.push(fullText.substring(startIndex, endIndex));
          }
        } catch (error) {
          console.error('Text extraction failed:', error);
          textContent = new Array(pagesToProcess).fill('');
        }
      }

      // For now, create placeholder pages since we need a more complex setup for actual PDF rendering
      // This will be enhanced in the next steps
      const pages: ProcessedPage[] = [];
      for (let i = 0; i < pagesToProcess; i++) {
        pages.push({
          pageNumber: i + 1,
          imageUrl: `/api/pdf/render/${documentId}/${i + 1}`, // This will be implemented next
          width: 612, // Standard letter size
          height: 792,
          textContent: textContent[i] || '',
        });
      }

      return {
        id: documentId,
        totalPages: pageCount,
        pages,
        textContent,
        metadata,
      };
    } catch (error) {
      console.error('PDF processing failed:', error);
      throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async extractText(fileBuffer: Buffer): Promise<string[]> {
    try {
      const parsedPdf = await pdfParse(fileBuffer);
      return [parsedPdf.text]; // For now, return as single page
    } catch (error) {
      console.error('Text extraction failed:', error);
      return [];
    }
  }

  async getPageCount(fileBuffer: Buffer): Promise<number> {
    try {
      const pdfDoc = await PDFDocument.load(fileBuffer);
      return pdfDoc.getPageCount();
    } catch (error) {
      console.error('Failed to get page count:', error);
      return 0;
    }
  }
}

export const pdfProcessor = new PDFProcessor();