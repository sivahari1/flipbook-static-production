import { Worker } from 'bullmq'
import { prisma } from '@/lib/prisma'
import { downloadFromS3, uploadToS3 } from '@/lib/s3'
import { decryptDEK, decryptWithDEK } from '@/lib/crypto'
import sharp from 'sharp'
import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFileSync, unlinkSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const execAsync = promisify(exec)

interface TileJob {
  documentId: string
}

// PDF to image conversion using Poppler (preferred) or pdfjs fallback
async function convertPdfToImages(pdfBuffer: Buffer, documentId: string): Promise<string[]> {
  const tempDir = tmpdir()
  const pdfPath = join(tempDir, `${documentId}.pdf`)
  const outputPrefix = join(tempDir, `${documentId}_page`)
  
  try {
    // Write PDF to temp file
    writeFileSync(pdfPath, pdfBuffer)
    
    // Try Poppler first (pdftocairo)
    try {
      await execAsync(`pdftocairo -jpeg -scale-to 2560 "${pdfPath}" "${outputPrefix}"`)
      
      // Find generated images
      const images: string[] = []
      let page = 1
      while (true) {
        const imagePath = `${outputPrefix}-${page.toString().padStart(2, '0')}.jpg`
        if (existsSync(imagePath)) {
          images.push(imagePath)
          page++
        } else {
          break
        }
      }
      
      return images
      
    } catch (popplerError) {
      console.log('Poppler not available, falling back to pdfjs')
      
      // Fallback to pdfjs-dist (TODO: implement pdfjs conversion)
      throw new Error('pdfjs fallback not implemented yet')
    }
    
  } finally {
    // Cleanup temp PDF
    if (existsSync(pdfPath)) {
      unlinkSync(pdfPath)
    }
  }
}

async function processTileJob(job: any) {
  const { documentId } = job.data as TileJob
  
  console.log(`Processing tiling job for document: ${documentId}`)
  
  try {
    // Get document from database
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    })
    
    if (!document) {
      throw new Error(`Document ${documentId} not found`)
    }
    
    // Download encrypted PDF from S3
    console.log(`Downloading encrypted PDF: ${document.storageKey}`)
    const encryptedPdf = await downloadFromS3(document.storageKey)
    
    // Decrypt PDF in memory
    const drmOptions = document.drmOptions as any
    const dek = decryptDEK(drmOptions.encryptedDEK)
    const pdfBuffer = decryptWithDEK(encryptedPdf, dek)
    
    console.log(`Decrypted PDF, size: ${pdfBuffer.length} bytes`)
    
    // Convert PDF pages to images
    const imageFiles = await convertPdfToImages(pdfBuffer, documentId)
    console.log(`Generated ${imageFiles.length} page images`)
    
    // Process and upload each page
    const pageCount = imageFiles.length
    const tilePrefix = `pages/${documentId}`
    
    for (let i = 0; i < imageFiles.length; i++) {
      const imagePath = imageFiles[i]
      const pageNumber = i + 1
      
      try {
        // Optimize image with Sharp
        const optimizedImage = await sharp(imagePath)
          .jpeg({ quality: 85, progressive: true })
          .toBuffer()
        
        // Upload to S3
        const s3Key = `${tilePrefix}/${pageNumber}.jpg`
        await uploadToS3(s3Key, optimizedImage, 'image/jpeg')
        
        console.log(`Uploaded page ${pageNumber}: ${s3Key}`)
        
        // Cleanup temp file
        unlinkSync(imagePath)
        
      } catch (pageError) {
        console.error(`Error processing page ${pageNumber}:`, pageError)
        // Cleanup temp file on error
        if (existsSync(imagePath)) {
          unlinkSync(imagePath)
        }
      }
    }
    
    // Update document with page count and tile prefix
    await prisma.document.update({
      where: { id: documentId },
      data: {
        pageCount,
        tilePrefix
      }
    })
    
    console.log(`Tiling completed for document ${documentId}: ${pageCount} pages`)
    
  } catch (error) {
    console.error(`Tiling job failed for document ${documentId}:`, error)
    throw error
  }
}

// Create and start the worker
const worker = new Worker('pdf-tiling', processTileJob, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  concurrency: 2, // Process 2 jobs concurrently
})

worker.on('completed', (job) => {
  console.log(`Tiling job ${job.id} completed successfully`)
})

worker.on('failed', (job, err) => {
  console.error(`Tiling job ${job?.id} failed:`, err)
})

worker.on('error', (err) => {
  console.error('Worker error:', err)
})

console.log('PDF tiling worker started')

export default worker