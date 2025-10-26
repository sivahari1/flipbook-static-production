// PDF Processing System - Main exports

import { getEnvironmentConfig } from './config'

// Core processor
export { PDFProcessor, pdfProcessor } from './processor'

// Validation
export { PDFValidator, pdfValidator } from './validator'
export type { ValidationResult } from './validator'

// Error handling
export { PDFErrorHandler, pdfErrorHandler } from './error-handler'

// Configuration
export {
  PDF_CONFIG,
  getEnvironmentConfig,
  getQualityConfig,
  getThumbnailConfig,
  getCacheConfig,
  getSecurityConfig,
  isValidQuality,
  isValidFormat,
  getMaxFileSize,
  getMaxPages,
  getProcessingTimeout
} from './config'

// Queue management
export { pdfProcessingQueue, PDFQueueManager, pdfQueueManager } from '../queue/pdf-queue'

// Types
export * from '../types/pdf'

// Database service
export { pdfDbService } from '../database/pdf-service'

// Utility functions
export const createProcessingOptions = (
  quality: 'low' | 'medium' | 'high' = 'medium',
  extractText: boolean = true,
  generateThumbnails: boolean = true,
  maxPages?: number
) => ({
  quality,
  extractText,
  generateThumbnails,
  maxPages
})

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatProcessingTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

export const getProcessingStatusText = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'Waiting to process...'
    case 'processing':
      return 'Processing PDF...'
    case 'completed':
      return 'Processing complete'
    case 'failed':
      return 'Processing failed'
    default:
      return 'Unknown status'
  }
}

export const getProgressColor = (progress: number): string => {
  if (progress < 25) return 'bg-red-500'
  if (progress < 50) return 'bg-yellow-500'
  if (progress < 75) return 'bg-blue-500'
  return 'bg-green-500'
}

// Constants for easy access
const envConfig = getEnvironmentConfig()

export const PDF_CONSTANTS = {
  MAX_FILE_SIZE: envConfig.MAX_FILE_SIZE,
  MAX_PAGES: envConfig.MAX_PAGES,
  PROCESSING_TIMEOUT: envConfig.PROCESSING_TIMEOUT,
  SUPPORTED_FORMATS: ['pdf'],
  SUPPORTED_MIME_TYPES: [
    'application/pdf',
    'application/x-pdf',
    'application/acrobat',
    'applications/vnd.pdf',
    'text/pdf',
    'text/x-pdf'
  ],
  QUALITY_LEVELS: ['low', 'medium', 'high'] as const,
  IMAGE_FORMATS: ['png', 'jpeg', 'webp'] as const
}