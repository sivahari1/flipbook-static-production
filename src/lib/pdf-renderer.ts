import { readFile } from 'fs/promises'
import { join } from 'path'
import { getStorageProvider, getFileNameFromStorageKey } from '@/lib/storage'
import { generateSamplePDF } from '@/lib/sample-pdf-generator'

interface RenderOptions {
  width: number
  height: number
  quality: 'low' | 'medium' | 'high'
  format: 'webp' | 'jpeg' | 'png'
}

interface Document {
  id: string
  title: string
  storageKey?: string
  pageCount?: number
}

export async function renderPDFPageToImage(
  document: Document,
  pageNumber: number,
  options: RenderOptions
): Promise<Buffer> {
  try {
    console.log(`🖼️ Rendering page ${pageNumber} of document ${document.id}`)

    // Get PDF buffer
    const pdfBuffer = await getPDFBuffer(document)
    
    // For now, we'll create a placeholder image since PDF processing libraries
    // can be complex to set up. In production, you'd use pdf2pic or similar
    const imageBuffer = await createPlaceholderImage(document, pageNumber, options)
    
    return imageBuffer

  } catch (error) {
    console.error('Error rendering PDF page:', error)
    
    // Fallback to error image
    return createErrorImage(options)
  }
}

async function getPDFBuffer(document: Document): Promise<Buffer> {
  const storage = getStorageProvider()
  
  if (document.storageKey) {
    const fileName = getFileNameFromStorageKey(document.storageKey)
    
    try {
      return await storage.getFile(fileName)
    } catch (storageError) {
      console.log('Storage provider failed, trying direct file access')
      
      let filePath: string
      if (document.storageKey.startsWith('uploads/')) {
        filePath = join(process.cwd(), document.storageKey)
      } else if (document.storageKey.startsWith('temp/')) {
        filePath = join('/tmp/uploads', fileName)
      } else {
        filePath = join(process.cwd(), 'uploads', fileName)
      }
      
      return await readFile(filePath)
    }
  } else {
    // Fallback to document ID naming
    const fileName = `${document.id}.pdf`
    
    try {
      return await storage.getFile(fileName)
    } catch (storageError) {
      const filePath = join(process.cwd(), 'uploads', fileName)
      return await readFile(filePath)
    }
  }
}

async function createPlaceholderImage(
  document: Document,
  pageNumber: number,
  options: RenderOptions
): Promise<Buffer> {
  const { createCanvas } = require('canvas')
  
  const canvas = createCanvas(options.width, options.height)
  const ctx = canvas.getContext('2d')

  // White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, options.width, options.height)

  // Add border
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 2
  ctx.strokeRect(0, 0, options.width, options.height)

  // Document title
  ctx.fillStyle = '#1f2937'
  ctx.font = 'bold 24px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(document.title, options.width / 2, 60)

  // Page number
  ctx.font = '18px Arial'
  ctx.fillStyle = '#6b7280'
  ctx.fillText(`Page ${pageNumber}`, options.width / 2, 90)

  // Content placeholder
  ctx.font = '14px Arial'
  ctx.textAlign = 'left'
  ctx.fillStyle = '#374151'
  
  const contentLines = [
    'This is a secure document viewer.',
    'The actual PDF content would be rendered here.',
    '',
    'Security features active:',
    '• DRM Protection',
    '• Watermarking',
    '• Access Control',
    '• Activity Monitoring',
    '',
    'Document is protected against:',
    '• Unauthorized copying',
    '• Screenshot capture',
    '• Download attempts',
    '• Sharing violations'
  ]

  let yPos = 140
  contentLines.forEach(line => {
    ctx.fillText(line, 40, yPos)
    yPos += 22
  })

  // Add footer
  ctx.font = '12px Arial'
  ctx.fillStyle = '#9ca3af'
  ctx.textAlign = 'center'
  ctx.fillText('Powered by FlipBook DRM', options.width / 2, options.height - 30)

  // Convert to buffer based on format
  let buffer: Buffer
  if (options.format === 'webp') {
    // Canvas doesn't support WebP directly, so we'll use JPEG as fallback
    buffer = canvas.toBuffer('image/jpeg', { quality: getQualityValue(options.quality) })
  } else {
    buffer = canvas.toBuffer(`image/${options.format}`, { quality: getQualityValue(options.quality) })
  }

  return buffer
}

async function createErrorImage(options: RenderOptions): Promise<Buffer> {
  const { createCanvas } = require('canvas')
  
  const canvas = createCanvas(options.width, options.height)
  const ctx = canvas.getContext('2d')

  // Red background
  ctx.fillStyle = '#fef2f2'
  ctx.fillRect(0, 0, options.width, options.height)

  // Error message
  ctx.fillStyle = '#dc2626'
  ctx.font = 'bold 20px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('Error Loading Page', options.width / 2, options.height / 2)

  ctx.font = '14px Arial'
  ctx.fillStyle = '#991b1b'
  ctx.fillText('Please try again or contact support', options.width / 2, options.height / 2 + 30)

  return canvas.toBuffer(`image/${options.format}`)
}

function getQualityValue(quality: 'low' | 'medium' | 'high'): number {
  switch (quality) {
    case 'low': return 0.6
    case 'medium': return 0.8
    case 'high': return 0.95
    default: return 0.8
  }
}

// Cache for rendered pages
const pageCache = new Map<string, { buffer: Buffer; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function getCachedPage(cacheKey: string): Buffer | null {
  const cached = pageCache.get(cacheKey)
  
  if (!cached) {
    return null
  }

  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    pageCache.delete(cacheKey)
    return null
  }

  return cached.buffer
}

export function setCachedPage(cacheKey: string, buffer: Buffer): void {
  pageCache.set(cacheKey, {
    buffer,
    timestamp: Date.now()
  })

  // Clean up old cache entries
  if (pageCache.size > 100) {
    const oldestKey = pageCache.keys().next().value
    pageCache.delete(oldestKey)
  }
}