import { PDFProcessingError, PDF_ERROR_CODES } from '@/lib/types/pdf'

export interface ValidationResult {
  isValid: boolean
  error?: PDFProcessingError
  warnings?: string[]
  metadata?: {
    fileSize: number
    estimatedPages?: number
    mimeType?: string
  }
}

export class PDFValidator {
  private static readonly MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
  private static readonly MIN_FILE_SIZE = 1024 // 1KB
  private static readonly MAX_PAGES = 1000
  private static readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/x-pdf',
    'application/acrobat',
    'applications/vnd.pdf',
    'text/pdf',
    'text/x-pdf'
  ]

  static async validateFile(
    file: File | Buffer,
    filename?: string
  ): Promise<ValidationResult> {
    try {
      let fileBuffer: Buffer
      let fileSize: number
      let mimeType: string | undefined

      // Handle File object or Buffer
      if (file instanceof File) {
        fileSize = file.size
        mimeType = file.type
        fileBuffer = Buffer.from(await file.arrayBuffer())
      } else {
        fileSize = file.length
        fileBuffer = file
      }

      // Basic file size validation
      const sizeValidation = this.validateFileSize(fileSize)
      if (!sizeValidation.isValid) {
        return sizeValidation
      }

      // MIME type validation (if available)
      if (mimeType) {
        const mimeValidation = this.validateMimeType(mimeType)
        if (!mimeValidation.isValid) {
          return mimeValidation
        }
      }

      // File extension validation (if filename provided)
      if (filename) {
        const extensionValidation = this.validateFileExtension(filename)
        if (!extensionValidation.isValid) {
          return extensionValidation
        }
      }

      // PDF header validation
      const headerValidation = this.validatePDFHeader(fileBuffer)
      if (!headerValidation.isValid) {
        return headerValidation
      }

      // PDF structure validation
      const structureValidation = this.validatePDFStructure(fileBuffer)
      if (!structureValidation.isValid) {
        return structureValidation
      }

      // Estimate page count for additional validation
      const estimatedPages = this.estimatePageCount(fileBuffer)
      if (estimatedPages > this.MAX_PAGES) {
        return {
          isValid: false,
          error: new PDFProcessingError(
            `PDF has too many pages (estimated: ${estimatedPages}, max: ${this.MAX_PAGES})`,
            PDF_ERROR_CODES.TOO_LARGE
          )
        }
      }

      // Check for potential security issues
      const securityValidation = this.validateSecurity(fileBuffer)
      
      return {
        isValid: true,
        warnings: securityValidation.warnings,
        metadata: {
          fileSize,
          estimatedPages,
          mimeType
        }
      }

    } catch (error) {
      return {
        isValid: false,
        error: new PDFProcessingError(
          `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          PDF_ERROR_CODES.INVALID_PDF
        )
      }
    }
  }

  private static validateFileSize(fileSize: number): ValidationResult {
    if (fileSize < this.MIN_FILE_SIZE) {
      return {
        isValid: false,
        error: new PDFProcessingError(
          `File too small: ${fileSize} bytes (minimum: ${this.MIN_FILE_SIZE} bytes)`,
          PDF_ERROR_CODES.INVALID_PDF
        )
      }
    }

    if (fileSize > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: new PDFProcessingError(
          `File too large: ${Math.round(fileSize / 1024 / 1024)}MB (maximum: ${Math.round(this.MAX_FILE_SIZE / 1024 / 1024)}MB)`,
          PDF_ERROR_CODES.TOO_LARGE
        )
      }
    }

    return { isValid: true }
  }

  private static validateMimeType(mimeType: string): ValidationResult {
    if (!this.ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
      return {
        isValid: false,
        error: new PDFProcessingError(
          `Invalid MIME type: ${mimeType}. Expected: application/pdf`,
          PDF_ERROR_CODES.INVALID_PDF
        )
      }
    }

    return { isValid: true }
  }

  private static validateFileExtension(filename: string): ValidationResult {
    const extension = filename.toLowerCase().split('.').pop()
    
    if (extension !== 'pdf') {
      return {
        isValid: false,
        error: new PDFProcessingError(
          `Invalid file extension: .${extension}. Expected: .pdf`,
          PDF_ERROR_CODES.INVALID_PDF
        )
      }
    }

    return { isValid: true }
  }

  private static validatePDFHeader(buffer: Buffer): ValidationResult {
    // Check PDF header
    const header = buffer.slice(0, 8).toString('ascii')
    
    if (!header.startsWith('%PDF-')) {
      return {
        isValid: false,
        error: new PDFProcessingError(
          'Invalid PDF header. File may be corrupted or not a PDF.',
          PDF_ERROR_CODES.INVALID_PDF
        )
      }
    }

    // Extract PDF version
    const versionMatch = header.match(/%PDF-(\d+\.\d+)/)
    if (!versionMatch) {
      return {
        isValid: false,
        error: new PDFProcessingError(
          'Cannot determine PDF version from header.',
          PDF_ERROR_CODES.INVALID_PDF
        )
      }
    }

    const version = parseFloat(versionMatch[1])
    if (version < 1.0 || version > 2.0) {
      return {
        isValid: false,
        error: new PDFProcessingError(
          `Unsupported PDF version: ${version}. Supported versions: 1.0-2.0`,
          PDF_ERROR_CODES.INVALID_PDF
        )
      }
    }

    return { isValid: true }
  }

  private static validatePDFStructure(buffer: Buffer): ValidationResult {
    const content = buffer.toString('binary')

    // Check for EOF marker
    if (!content.includes('%%EOF')) {
      return {
        isValid: false,
        error: new PDFProcessingError(
          'PDF file appears to be corrupted (missing EOF marker).',
          PDF_ERROR_CODES.CORRUPTED_FILE
        )
      }
    }

    // Check for essential PDF objects
    const requiredObjects = ['obj', 'endobj']
    for (const obj of requiredObjects) {
      if (!content.includes(obj)) {
        return {
          isValid: false,
          error: new PDFProcessingError(
            `PDF file appears to be corrupted (missing ${obj} markers).`,
            PDF_ERROR_CODES.CORRUPTED_FILE
          )
        }
      }
    }

    // Check for xref table or cross-reference stream
    if (!content.includes('xref') && !content.includes('/XRef')) {
      return {
        isValid: false,
        error: new PDFProcessingError(
          'PDF file appears to be corrupted (missing cross-reference table).',
          PDF_ERROR_CODES.CORRUPTED_FILE
        )
      }
    }

    return { isValid: true }
  }

  private static estimatePageCount(buffer: Buffer): number {
    const content = buffer.toString('binary')
    
    // Count page objects - this is a rough estimate
    const pageMatches = content.match(/\/Type\s*\/Page[^s]/g)
    if (pageMatches) {
      return pageMatches.length
    }

    // Fallback: count /Page references
    const pageRefMatches = content.match(/\/Page\s/g)
    if (pageRefMatches) {
      return Math.max(1, Math.floor(pageRefMatches.length / 2)) // Rough estimate
    }

    // Default estimate based on file size (very rough)
    const estimatedPages = Math.max(1, Math.floor(buffer.length / (50 * 1024))) // ~50KB per page
    return Math.min(estimatedPages, this.MAX_PAGES)
  }

  private static validateSecurity(buffer: Buffer): { warnings: string[] } {
    const content = buffer.toString('binary')
    const warnings: string[] = []

    // Check for encryption
    if (content.includes('/Encrypt')) {
      warnings.push('PDF contains encryption - may require password for processing')
    }

    // Check for JavaScript
    if (content.includes('/JavaScript') || content.includes('/JS')) {
      warnings.push('PDF contains JavaScript - potential security risk')
    }

    // Check for forms
    if (content.includes('/AcroForm') || content.includes('/XFA')) {
      warnings.push('PDF contains interactive forms')
    }

    // Check for embedded files
    if (content.includes('/EmbeddedFile')) {
      warnings.push('PDF contains embedded files')
    }

    // Check for external links
    if (content.includes('/URI') || content.includes('http://') || content.includes('https://')) {
      warnings.push('PDF contains external links')
    }

    return { warnings }
  }

  static async validateBuffer(buffer: Buffer, filename?: string): Promise<ValidationResult> {
    return this.validateFile(buffer, filename)
  }

  static async validateUploadedFile(file: File): Promise<ValidationResult> {
    return this.validateFile(file, file.name)
  }

  static getValidationRules() {
    return {
      maxFileSize: this.MAX_FILE_SIZE,
      minFileSize: this.MIN_FILE_SIZE,
      maxPages: this.MAX_PAGES,
      allowedMimeTypes: this.ALLOWED_MIME_TYPES,
      allowedExtensions: ['pdf'],
      supportedVersions: '1.0-2.0'
    }
  }

  static formatValidationError(error: PDFProcessingError): {
    title: string
    message: string
    suggestions: string[]
  } {
    switch (error.code) {
      case PDF_ERROR_CODES.TOO_LARGE:
        return {
          title: 'File Too Large',
          message: error.message,
          suggestions: [
            'Compress the PDF using a PDF optimizer',
            'Split large documents into smaller parts',
            'Reduce image quality in the PDF',
            'Remove unnecessary content or pages'
          ]
        }

      case PDF_ERROR_CODES.INVALID_PDF:
        return {
          title: 'Invalid PDF File',
          message: error.message,
          suggestions: [
            'Ensure the file is a valid PDF document',
            'Try opening the file in a PDF reader first',
            'Re-save the document as a PDF',
            'Use a different PDF file'
          ]
        }

      case PDF_ERROR_CODES.CORRUPTED_FILE:
        return {
          title: 'Corrupted PDF File',
          message: error.message,
          suggestions: [
            'Try opening the PDF in a PDF reader to verify it works',
            'Re-download or re-create the PDF file',
            'Use a PDF repair tool to fix corruption',
            'Contact the document creator for a new copy'
          ]
        }

      case PDF_ERROR_CODES.PASSWORD_PROTECTED:
        return {
          title: 'Password Protected PDF',
          message: error.message,
          suggestions: [
            'Remove password protection from the PDF',
            'Use a PDF editor to save without password protection',
            'Contact the document owner for an unprotected version'
          ]
        }

      default:
        return {
          title: 'Validation Error',
          message: error.message,
          suggestions: [
            'Check that the file is a valid PDF',
            'Try with a different PDF file',
            'Contact support if the problem persists'
          ]
        }
    }
  }
}

export const pdfValidator = PDFValidator