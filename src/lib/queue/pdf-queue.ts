import { Queue, Worker, Job } from 'bullmq'
import Redis from 'ioredis'
import { pdfProcessor } from '@/lib/pdf/processor'
import { pdfDbService } from '@/lib/database/pdf-service'
import { PDFProcessingOptions } from '@/lib/types/pdf'

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true
})

// Job data interface
interface PDFProcessingJobData {
  documentId: string
  fileBuffer: Buffer
  options: PDFProcessingOptions
  userId?: string
}

// Create the PDF processing queue
export const pdfProcessingQueue = new Queue('pdf-processing', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 10, // Keep last 10 completed jobs
    removeOnFail: 50,     // Keep last 50 failed jobs
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
})

// Worker to process PDF jobs
const pdfWorker = new Worker(
  'pdf-processing',
  async (job: Job<PDFProcessingJobData>) => {
    const { documentId, fileBuffer, options, userId } = job.data

    try {
      console.log(`Starting PDF processing for document ${documentId}`)
      
      // Update job progress
      await job.updateProgress(0)

      // Process the PDF
      const result = await pdfProcessor.processPDF(fileBuffer, documentId, options)

      // Update job progress
      await job.updateProgress(100)

      console.log(`PDF processing completed for document ${documentId}`)
      
      return {
        success: true,
        documentId,
        totalPages: result.totalPages,
        textExtracted: options.extractText
      }

    } catch (error) {
      console.error(`PDF processing failed for document ${documentId}:`, error)
      
      // Log the error to database
      await pdfDbService.logDocumentAccess({
        documentId,
        userId,
        action: 'NAVIGATE', // Using as a generic action for processing errors
        sessionId: `processing-${Date.now()}`
      })

      throw error
    }
  },
  {
    connection: redis,
    concurrency: 2, // Process 2 PDFs concurrently
    limiter: {
      max: 5,     // Max 5 jobs per duration
      duration: 60000, // 1 minute
    },
  }
)

// Event handlers for the worker
pdfWorker.on('completed', async (job: Job, result: any) => {
  console.log(`PDF processing job ${job.id} completed:`, result)
})

pdfWorker.on('failed', async (job: Job | undefined, err: Error) => {
  console.error(`PDF processing job ${job?.id} failed:`, err.message)
  
  if (job?.data?.documentId) {
    // Update the processing job status in database
    const processingJob = await pdfDbService.getProcessingJob(job.data.documentId)
    if (processingJob) {
      await pdfDbService.updateProcessingJob(processingJob.id, {
        status: 'FAILED',
        errorMessage: err.message,
        completedAt: new Date()
      })
    }
  }
})

pdfWorker.on('progress', async (job: Job, progress: any) => {
  const progressNum = typeof progress === 'number' ? progress : parseInt(progress) || 0
  console.log(`PDF processing job ${job.id} progress: ${progressNum}%`)
  
  // Update the processing job progress in database
  if (job.data?.documentId) {
    const processingJob = await pdfDbService.getProcessingJob(job.data.documentId)
    if (processingJob) {
      await pdfDbService.updateProcessingJob(processingJob.id, {
        progress: Math.round(progressNum)
      })
    }
  }
})

// Queue management functions
export class PDFQueueManager {
  async addProcessingJob(
    documentId: string,
    fileBuffer: Buffer,
    options: PDFProcessingOptions,
    userId?: string
  ): Promise<string> {
    try {
      const job = await pdfProcessingQueue.add(
        'process-pdf',
        {
          documentId,
          fileBuffer,
          options,
          userId
        },
        {
          jobId: `pdf-${documentId}-${Date.now()}`,
          delay: 0, // Process immediately
          priority: options.quality === 'high' ? 10 : 5, // Higher priority for high quality
        }
      )

      console.log(`Added PDF processing job ${job.id} for document ${documentId}`)
      return job.id!
    } catch (error) {
      console.error('Failed to add PDF processing job:', error)
      throw error
    }
  }

  async getJobStatus(jobId: string) {
    try {
      const job = await pdfProcessingQueue.getJob(jobId)
      if (!job) {
        return null
      }

      return {
        id: job.id,
        status: await job.getState(),
        progress: job.progress,
        data: job.data,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason,
        returnvalue: job.returnvalue
      }
    } catch (error) {
      console.error('Failed to get job status:', error)
      return null
    }
  }

  async cancelJob(jobId: string): Promise<boolean> {
    try {
      const job = await pdfProcessingQueue.getJob(jobId)
      if (!job) {
        return false
      }

      await job.remove()
      console.log(`Cancelled PDF processing job ${jobId}`)
      return true
    } catch (error) {
      console.error('Failed to cancel job:', error)
      return false
    }
  }

  async getQueueStats() {
    try {
      const waiting = await pdfProcessingQueue.getWaiting()
      const active = await pdfProcessingQueue.getActive()
      const completed = await pdfProcessingQueue.getCompleted()
      const failed = await pdfProcessingQueue.getFailed()

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        total: waiting.length + active.length + completed.length + failed.length
      }
    } catch (error) {
      console.error('Failed to get queue stats:', error)
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        total: 0
      }
    }
  }

  async cleanQueue() {
    try {
      // Clean old completed and failed jobs
      await pdfProcessingQueue.clean(24 * 60 * 60 * 1000, 10, 'completed') // Keep completed jobs for 24 hours
      await pdfProcessingQueue.clean(7 * 24 * 60 * 60 * 1000, 50, 'failed') // Keep failed jobs for 7 days
      
      console.log('PDF processing queue cleaned')
    } catch (error) {
      console.error('Failed to clean queue:', error)
    }
  }

  async pauseQueue() {
    await pdfProcessingQueue.pause()
    console.log('PDF processing queue paused')
  }

  async resumeQueue() {
    await pdfProcessingQueue.resume()
    console.log('PDF processing queue resumed')
  }

  async closeQueue() {
    await pdfWorker.close()
    await pdfProcessingQueue.close()
    await redis.disconnect()
    console.log('PDF processing queue closed')
  }
}

export const pdfQueueManager = new PDFQueueManager()

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down PDF processing queue...')
  await pdfQueueManager.closeQueue()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Shutting down PDF processing queue...')
  await pdfQueueManager.closeQueue()
  process.exit(0)
})