// PDF Processing System Types

export interface Document {
  id: string
  title: string
  description?: string
  ownerId: string
  pageCount: number
  storageKey: string
  tilePrefix?: string
  drmOptions?: string
  hasPassphrase: boolean
  createdAt: Date
  updatedAt: Date
  // PDF-specific fields
  processedAt?: Date
  totalPages?: number
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed'
  textExtracted: boolean
  fileSize?: number
  mimeType?: string
  originalFilename?: string
}

export interface PDFPage {
  id: string
  documentId: string
  pageNumber: number
  imageUrl: string
  width: number
  height: number
  thumbnailUrl?: string
  textContent?: string
  textBounds?: TextBound[]
  createdAt: Date
}

export interface TextBound {
  text: string
  x: number
  y: number
  width: number
  height: number
}

export interface DocumentTextSearch {
  id: string
  documentId: string
  pageNumber: number
  searchableText: string
  wordPositions?: WordPosition[]
  createdAt: Date
}

export interface WordPosition {
  word: string
  x: number
  y: number
  width: number
  height: number
  confidence?: number
}

export interface PDFProcessingJob {
  id: string
  documentId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  errorMessage?: string
  startedAt?: Date
  completedAt?: Date
  createdAt: Date
}

export interface DocumentAccessLog {
  id: string
  userId?: string
  documentId: string
  pageNumber?: number
  action: 'view' | 'search' | 'navigate' | 'download' | 'share'
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  timeSpent?: number
  createdAt: Date
}

// Processing interfaces
export interface PDFProcessingOptions {
  quality: 'low' | 'medium' | 'high'
  maxPages?: number
  extractText: boolean
  generateThumbnails: boolean
  watermarkConfig?: WatermarkConfig
}

export interface WatermarkConfig {
  text: string
  opacity: number
  position: 'center' | 'diagonal' | 'corner' | 'multiple'
  fontSize: number
  color: string
  rotation?: number
}

export interface ProcessedPDF {
  id: string
  totalPages: number
  pages: ProcessedPage[]
  textContent: PageTextContent[]
  thumbnails: string[]
  metadata: PDFMetadata
}

export interface ProcessedPage {
  pageNumber: number
  imageUrl: string
  width: number
  height: number
  textBounds?: TextBound[]
}

export interface PageTextContent {
  pageNumber: number
  text: string
  words: TextWord[]
  searchableText: string
}

export interface TextWord {
  text: string
  x: number
  y: number
  width: number
  height: number
  confidence?: number
}

export interface PDFMetadata {
  title?: string
  author?: string
  subject?: string
  creator?: string
  producer?: string
  creationDate?: Date
  modificationDate?: Date
  keywords?: string[]
}

// Search interfaces
export interface SearchOptions {
  caseSensitive?: boolean
  wholeWords?: boolean
  maxResults?: number
  pageLimit?: number
  pageOffset?: number
}

export interface SearchResult {
  pageNumber: number
  matches: TextMatch[]
  totalMatches: number
  rank?: number
  headline?: string
}

export interface TextMatch {
  text: string
  context: string
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  confidence?: number
}

// Rendering interfaces
export interface PageRenderOptions {
  quality: 'low' | 'medium' | 'high'
  width?: number
  height?: number
  format: 'png' | 'jpeg' | 'webp'
  watermark?: WatermarkConfig
}

export interface ThumbnailOptions {
  width: number
  height: number
  quality: number
  format: 'png' | 'jpeg' | 'webp'
}

// Cache interfaces
export interface CacheConfig {
  maxSize: number
  ttl: number
  preloadDistance: number
  compressionLevel: number
}

export interface CachedPage {
  documentId: string
  pageNumber: number
  imageData: Buffer
  metadata: PageMetadata
  cachedAt: Date
  accessCount: number
}

export interface PageMetadata {
  width: number
  height: number
  format: string
  size: number
  quality: string
}

// Analytics interfaces
export interface DocumentStats {
  documentId: string
  title: string
  processingStatus: string
  totalPages?: number
  textExtracted: boolean
  processedAt?: Date
  processingDurationSeconds?: number
  totalAccesses: number
  uniqueViewers: number
  pageViews: number
  searchQueries: number
  avgTimeSpentSeconds?: number
  lastAccessedAt?: Date
  firstAccessedAt?: Date
}

export interface AccessStats {
  totalViews: number
  uniqueUsers: number
  avgTimeSpent: number
  topPages: Array<{
    pageNumber: number
    views: number
  }>
  viewsByDate: Array<{
    date: string
    views: number
  }>
  searchQueries: Array<{
    query: string
    count: number
    lastSearched: Date
  }>
}

// Error types
export class PDFProcessingError extends Error {
  constructor(
    message: string,
    public code: string,
    public documentId?: string,
    public pageNumber?: number
  ) {
    super(message)
    this.name = 'PDFProcessingError'
  }
}

export const PDF_ERROR_CODES = {
  INVALID_PDF: 'INVALID_PDF',
  CORRUPTED_FILE: 'CORRUPTED_FILE',
  PASSWORD_PROTECTED: 'PASSWORD_PROTECTED',
  TOO_LARGE: 'TOO_LARGE',
  PROCESSING_TIMEOUT: 'PROCESSING_TIMEOUT',
  STORAGE_ERROR: 'STORAGE_ERROR',
  TEXT_EXTRACTION_FAILED: 'TEXT_EXTRACTION_FAILED',
  RENDERING_FAILED: 'RENDERING_FAILED',
  CACHE_ERROR: 'CACHE_ERROR'
} as const

// Utility types
export type ProcessingStatus = Document['processingStatus']
export type AccessAction = DocumentAccessLog['action']
export type JobStatus = PDFProcessingJob['status']
export type QualityLevel = PDFProcessingOptions['quality']