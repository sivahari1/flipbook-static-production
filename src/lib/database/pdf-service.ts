import { PrismaClient, ProcessingStatus, JobStatus, AccessAction } from '@prisma/client'
import {
  SearchResult,
  SearchOptions,
  DocumentStats,
  AccessStats,
  PDFProcessingError,
  PDF_ERROR_CODES
} from '@/lib/types/pdf'

const prisma = new PrismaClient()

export class PDFDatabaseService {
  private prisma = prisma

  // Document operations
  async updateDocumentProcessingStatus(
    documentId: string,
    status: ProcessingStatus,
    additionalData?: {
      totalPages?: number
      textExtracted?: boolean
      fileSize?: bigint
      mimeType?: string
      originalFilename?: string
    }
  ): Promise<void> {
    try {
      const updateData: any = {
        processingStatus: status,
        ...additionalData
      }

      if (status === ProcessingStatus.COMPLETED) {
        updateData.processedAt = new Date()
      }

      await this.prisma.document.update({
        where: { id: documentId },
        data: updateData
      })
    } catch (error) {
      throw new PDFProcessingError(
        `Failed to update document status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PDF_ERROR_CODES.STORAGE_ERROR,
        documentId
      )
    }
  }

  async getDocumentWithProcessingInfo(documentId: string) {
    try {
      return await this.prisma.document.findUnique({
        where: { id: documentId },
        include: {
          pdfPages: {
            orderBy: { pageNumber: 'asc' }
          },
          processingJobs: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })
    } catch (error) {
      throw new PDFProcessingError(
        `Failed to get document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PDF_ERROR_CODES.STORAGE_ERROR,
        documentId
      )
    }
  }

  // PDF Page operations
  async createPDFPage(page: {
    documentId: string
    pageNumber: number
    imageUrl: string
    width: number
    height: number
    thumbnailUrl?: string
    textContent?: string
    textBounds?: any
  }) {
    try {
      return await this.prisma.pDFPage.create({
        data: page
      })
    } catch (error) {
      throw new PDFProcessingError(
        `Failed to create PDF page: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PDF_ERROR_CODES.STORAGE_ERROR,
        page.documentId,
        page.pageNumber
      )
    }
  }

  async getPDFPage(documentId: string, pageNumber: number) {
    try {
      return await this.prisma.pDFPage.findUnique({
        where: {
          documentId_pageNumber: {
            documentId,
            pageNumber
          }
        }
      })
    } catch (error) {
      throw new PDFProcessingError(
        `Failed to get PDF page: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PDF_ERROR_CODES.STORAGE_ERROR,
        documentId,
        pageNumber
      )
    }
  }

  async getPDFPages(documentId: string, limit?: number, offset?: number) {
    try {
      return await this.prisma.pDFPage.findMany({
        where: { documentId },
        orderBy: { pageNumber: 'asc' },
        take: limit,
        skip: offset
      })
    } catch (error) {
      throw new PDFProcessingError(
        `Failed to get PDF pages: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PDF_ERROR_CODES.STORAGE_ERROR,
        documentId
      )
    }
  }

  async updatePDFPage(
    documentId: string,
    pageNumber: number,
    updates: {
      imageUrl?: string
      thumbnailUrl?: string
      textContent?: string
      textBounds?: any
    }
  ): Promise<void> {
    try {
      await this.prisma.pDFPage.update({
        where: {
          documentId_pageNumber: {
            documentId,
            pageNumber
          }
        },
        data: updates
      })
    } catch (error) {
      throw new PDFProcessingError(
        `Failed to update PDF page: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PDF_ERROR_CODES.STORAGE_ERROR,
        documentId,
        pageNumber
      )
    }
  }

  // Text search operations
  async createDocumentTextSearch(textSearch: {
    documentId: string
    pageNumber: number
    searchableText: string
    wordPositions?: any
  }) {
    try {
      return await this.prisma.documentTextSearch.create({
        data: textSearch
      })
    } catch (error) {
      throw new PDFProcessingError(
        `Failed to create text search entry: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PDF_ERROR_CODES.STORAGE_ERROR,
        textSearch.documentId,
        textSearch.pageNumber
      )
    }
  }

  async searchDocumentText(
    documentId: string,
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const {
      pageLimit = 10,
      pageOffset = 0,
      caseSensitive = false
    } = options

    try {
      // Simple text search using Prisma
      const searchMode = caseSensitive ? 'default' : 'insensitive'
      
      const results = await this.prisma.documentTextSearch.findMany({
        where: {
          documentId,
          searchableText: {
            contains: query,
            mode: searchMode
          }
        },
        orderBy: { pageNumber: 'asc' },
        take: pageLimit,
        skip: pageOffset
      })

      // Transform the results to match our SearchResult interface
      const searchResults: SearchResult[] = results.map(row => ({
        pageNumber: row.pageNumber,
        matches: [{
          text: query,
          context: row.searchableText.substring(0, 200),
          position: { x: 0, y: 0, width: 0, height: 0 } // Will be enhanced later
        }],
        totalMatches: 1
      }))

      return searchResults

    } catch (error) {
      throw new PDFProcessingError(
        `Text search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PDF_ERROR_CODES.STORAGE_ERROR,
        documentId
      )
    }
  }

  async getDocumentTextContent(documentId: string, pageNumber?: number) {
    try {
      const where: any = { documentId }
      if (pageNumber !== undefined) {
        where.pageNumber = pageNumber
      }

      return await this.prisma.documentTextSearch.findMany({
        where,
        orderBy: { pageNumber: 'asc' }
      })
    } catch (error) {
      throw new PDFProcessingError(
        `Failed to get document text content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PDF_ERROR_CODES.STORAGE_ERROR,
        documentId,
        pageNumber
      )
    }
  }

  // Processing job operations
  async createProcessingJob(job: {
    documentId: string
    status?: JobStatus
    progress?: number
  }) {
    try {
      return await this.prisma.pDFProcessingJob.create({
        data: {
          documentId: job.documentId,
          status: job.status || JobStatus.QUEUED,
          progress: job.progress || 0
        }
      })
    } catch (error) {
      throw new PDFProcessingError(
        `Failed to create processing job: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PDF_ERROR_CODES.STORAGE_ERROR,
        job.documentId
      )
    }
  }

  async updateProcessingJob(
    jobId: string,
    updates: {
      status?: JobStatus
      progress?: number
      errorMessage?: string
      startedAt?: Date
      completedAt?: Date
    }
  ): Promise<void> {
    try {
      await this.prisma.pDFProcessingJob.update({
        where: { id: jobId },
        data: updates
      })
    } catch (error) {
      throw new PDFProcessingError(
        `Failed to update processing job: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PDF_ERROR_CODES.STORAGE_ERROR
      )
    }
  }

  async getProcessingJob(documentId: string) {
    try {
      return await this.prisma.pDFProcessingJob.findFirst({
        where: { documentId },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      throw new PDFProcessingError(
        `Failed to get processing job: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PDF_ERROR_CODES.STORAGE_ERROR,
        documentId
      )
    }
  }

  async getQueuedJobs(limit: number = 10) {
    try {
      return await this.prisma.pDFProcessingJob.findMany({
        where: { status: JobStatus.QUEUED },
        orderBy: { createdAt: 'asc' },
        take: limit,
        include: {
          document: true
        }
      })
    } catch (error) {
      throw new PDFProcessingError(
        `Failed to get queued jobs: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PDF_ERROR_CODES.STORAGE_ERROR
      )
    }
  }

  // Access logging operations
  async logDocumentAccess(log: {
    userId?: string
    documentId: string
    pageNumber?: number
    action: AccessAction
    ipAddress?: string
    userAgent?: string
    sessionId?: string
    timeSpent?: number
  }): Promise<void> {
    try {
      await this.prisma.documentAccessLog.create({
        data: log
      })
    } catch (error) {
      // Don't throw errors for logging failures, just log them
      console.error('Failed to log document access:', error)
    }
  }

  async getDocumentAccessLogs(
    documentId: string,
    limit: number = 100,
    offset: number = 0
  ) {
    try {
      return await this.prisma.documentAccessLog.findMany({
        where: { documentId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              email: true
            }
          }
        }
      })
    } catch (error) {
      throw new PDFProcessingError(
        `Failed to get access logs: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PDF_ERROR_CODES.STORAGE_ERROR,
        documentId
      )
    }
  }

  // Analytics operations
  async getDocumentStats(documentId: string): Promise<DocumentStats | null> {
    try {
      const document = await this.prisma.document.findUnique({
        where: { id: documentId },
        include: {
          processingJobs: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          accessLogs: {
            select: {
              userId: true,
              action: true,
              timeSpent: true,
              createdAt: true
            }
          }
        }
      })

      if (!document) return null

      const job = document.processingJobs[0]
      const logs = document.accessLogs

      // Calculate analytics
      const totalAccesses = logs.length
      const uniqueViewers = new Set(logs.map(log => log.userId).filter(Boolean)).size
      const pageViews = logs.filter(log => log.action === AccessAction.VIEW).length
      const searchQueries = logs.filter(log => log.action === AccessAction.SEARCH).length
      const avgTimeSpent = logs.reduce((sum, log) => sum + (log.timeSpent || 0), 0) / logs.length || 0
      const lastAccessed = logs.length > 0 ? logs[0].createdAt : null
      const firstAccessed = logs.length > 0 ? logs[logs.length - 1].createdAt : null

      const processingDuration = job?.startedAt && job?.completedAt 
        ? (job.completedAt.getTime() - job.startedAt.getTime()) / 1000 
        : null

      const stats: DocumentStats = {
        documentId: document.id,
        title: document.title,
        processingStatus: document.processingStatus,
        totalPages: document.totalPages || undefined,
        textExtracted: document.textExtracted,
        processedAt: document.processedAt || undefined,
        processingDurationSeconds: processingDuration || undefined,
        totalAccesses,
        uniqueViewers,
        pageViews,
        searchQueries,
        avgTimeSpentSeconds: avgTimeSpent || undefined,
        lastAccessedAt: lastAccessed || undefined,
        firstAccessedAt: firstAccessed || undefined
      }

      return stats
    } catch (error) {
      throw new PDFProcessingError(
        `Failed to get document stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PDF_ERROR_CODES.STORAGE_ERROR,
        documentId
      )
    }
  }

  async getDocumentAccessAnalytics(documentId: string): Promise<AccessStats | null> {
    try {
      const logs = await this.prisma.documentAccessLog.findMany({
        where: { documentId },
        include: {
          user: {
            select: { id: true, email: true }
          }
        }
      })

      if (logs.length === 0) return null

      const totalViews = logs.filter(log => log.action === AccessAction.VIEW).length
      const uniqueUsers = new Set(logs.map(log => log.userId).filter(Boolean)).size
      const avgTimeSpent = logs.reduce((sum, log) => sum + (log.timeSpent || 0), 0) / logs.length

      // Group by page for top pages
      const pageViews = logs
        .filter(log => log.action === AccessAction.VIEW && log.pageNumber)
        .reduce((acc, log) => {
          const page = log.pageNumber!
          acc[page] = (acc[page] || 0) + 1
          return acc
        }, {} as Record<number, number>)

      const topPages = Object.entries(pageViews)
        .map(([page, views]) => ({ pageNumber: parseInt(page), views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10)

      // Group by date for views by date
      const viewsByDate = logs
        .filter(log => log.action === AccessAction.VIEW)
        .reduce((acc, log) => {
          const date = log.createdAt.toISOString().split('T')[0]
          acc[date] = (acc[date] || 0) + 1
          return acc
        }, {} as Record<string, number>)

      const viewsByDateArray = Object.entries(viewsByDate)
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => a.date.localeCompare(b.date))

      const analytics: AccessStats = {
        totalViews,
        uniqueUsers,
        avgTimeSpent,
        topPages,
        viewsByDate: viewsByDateArray,
        searchQueries: [] // Will be implemented later with more detailed queries
      }

      return analytics
    } catch (error) {
      throw new PDFProcessingError(
        `Failed to get access analytics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PDF_ERROR_CODES.STORAGE_ERROR,
        documentId
      )
    }
  }

  // Cleanup operations
  async deleteDocumentPDFData(documentId: string): Promise<void> {
    try {
      // Delete in transaction to ensure consistency
      await this.prisma.$transaction([
        this.prisma.documentAccessLog.deleteMany({ where: { documentId } }),
        this.prisma.documentTextSearch.deleteMany({ where: { documentId } }),
        this.prisma.pDFPage.deleteMany({ where: { documentId } }),
        this.prisma.pDFProcessingJob.deleteMany({ where: { documentId } })
      ])
    } catch (error) {
      console.error(`Failed to delete PDF data for document ${documentId}:`, error)
      throw error
    }
  }

  async cleanupOldAccessLogs(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const result = await this.prisma.documentAccessLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      })

      return result.count
    } catch (error) {
      throw new PDFProcessingError(
        `Failed to cleanup old access logs: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PDF_ERROR_CODES.STORAGE_ERROR
      )
    }
  }
}

export const pdfDbService = new PDFDatabaseService()