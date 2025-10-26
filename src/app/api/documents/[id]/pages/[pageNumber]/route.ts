import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession } from '@/lib/secure-session'
import { renderPDFPageToImage } from '@/lib/pdf-renderer'
import { addWatermarkToImage } from '@/lib/watermark'

export const runtime = 'nodejs'

interface PageRenderParams {
  width?: number
  height?: number
  quality?: 'low' | 'medium' | 'high'
  format?: 'webp' | 'jpeg' | 'png'
  watermark?: boolean
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string; pageNumber: string } } | { params: Promise<{ id: string; pageNumber: string }> }
) {
  // Normalize params
  let params: { id: string; pageNumber: string } | undefined
  try {
    const p = (context as any).params
    params = p && typeof (p as any).then === 'function' ? await p : p
  } catch (e) {
    params = (context as any).params
  }

  try {
    const documentId = params?.id
    const pageNumber = parseInt(params?.pageNumber || '1')
    
    console.log(`🖼️ Rendering page ${pageNumber} for document:`, documentId)

    // Get query parameters
    const url = new URL(request.url)
    const width = parseInt(url.searchParams.get('width') || '800')
    const height = parseInt(url.searchParams.get('height') || '1200')
    const quality = (url.searchParams.get('quality') || 'medium') as 'low' | 'medium' | 'high'
    const format = (url.searchParams.get('format') || 'webp') as 'webp' | 'jpeg' | 'png'
    const includeWatermark = url.searchParams.get('watermark') !== 'false'

    // Get session and user info
    const sessionId = request.headers.get('x-session-id')
    const userEmail = request.headers.get('x-user-email')

    if (!sessionId || !userEmail) {
      return NextResponse.json({
        error: 'Session authentication required'
      }, { status: 401 })
    }

    // Validate session
    const session = await validateSession(sessionId)
    if (!session || session.documentId !== documentId) {
      return NextResponse.json({
        error: 'Invalid or expired session'
      }, { status: 401 })
    }

    // Check if database is configured
    const isDatabaseConfigured = process.env.DATABASE_URL && 
                                !process.env.DATABASE_URL.includes('placeholder') && 
                                !process.env.DATABASE_URL.includes('build')

    // Handle demo mode
    if (!isDatabaseConfigured || documentId?.startsWith('demo-')) {
      console.log('🖼️ Demo mode - generating demo page image')
      
      const demoImageBuffer = await generateDemoPageImage(pageNumber, {
        width,
        height,
        quality,
        format,
        userEmail,
        includeWatermark
      })

      return new NextResponse(demoImageBuffer, {
        headers: {
          'Content-Type': `image/${format}`,
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY'
        }
      })
    }

    // Find the document
    const document = await prisma.document.findUnique({
      where: { id: documentId ?? '' },
      include: {
        owner: {
          select: { 
            id: true,
            email: true, 
            role: true 
          }
        }
      }
    })

    if (!document) {
      return NextResponse.json({
        error: 'Document not found'
      }, { status: 404 })
    }

    // Validate page number
    if (pageNumber < 1 || (document.pageCount && pageNumber > document.pageCount)) {
      return NextResponse.json({
        error: 'Invalid page number'
      }, { status: 400 })
    }

    // Render PDF page to image
    const imageBuffer = await renderPDFPageToImage(document, pageNumber, {
      width,
      height,
      quality,
      format
    })

    // Add watermark if requested
    let finalImageBuffer = imageBuffer
    if (includeWatermark) {
      finalImageBuffer = await addWatermarkToImage(imageBuffer, {
        userEmail,
        timestamp: new Date().toISOString(),
        format,
        opacity: 0.08
      })
    }

    // Log page access
    await prisma.pageAccess.create({
      data: {
        documentId: document.id,
        userId: session.userId,
        pageNumber,
        accessTime: new Date(),
        sessionId: session.id
      }
    }).catch(err => {
      console.warn('Failed to log page access:', err)
    })

    return new NextResponse(finalImageBuffer, {
      headers: {
        'Content-Type': `image/${format}`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    })

  } catch (error) {
    console.error('❌ Error rendering page:', error)
    
    return NextResponse.json({ 
      error: 'Failed to render page',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function generateDemoPageImage(
  pageNumber: number,
  options: {
    width: number
    height: number
    quality: string
    format: string
    userEmail: string
    includeWatermark: boolean
  }
): Promise<Buffer> {
  const { createCanvas } = require('canvas')
  
  const canvas = createCanvas(options.width, options.height)
  const ctx = canvas.getContext('2d')

  // White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, options.width, options.height)

  // Add demo content
  ctx.fillStyle = '#333333'
  ctx.font = 'bold 32px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(`Demo Document`, options.width / 2, 80)

  ctx.font = '24px Arial'
  ctx.fillText(`Page ${pageNumber}`, options.width / 2, 120)

  // Add some demo text content
  ctx.font = '16px Arial'
  ctx.textAlign = 'left'
  ctx.fillStyle = '#666666'
  
  const demoText = [
    'This is a demonstration of the secure PDF viewer.',
    'The document is protected with DRM features including:',
    '• Dynamic watermarking',
    '• Copy protection',
    '• Download prevention',
    '• Access monitoring',
    '',
    'All content is rendered server-side for security.',
    'User access is tracked and logged.',
    '',
    `Current user: ${options.userEmail}`,
    `Rendered at: ${new Date().toLocaleString()}`
  ]

  let yPos = 180
  demoText.forEach(line => {
    ctx.fillText(line, 50, yPos)
    yPos += 25
  })

  // Add watermarks if requested
  if (options.includeWatermark) {
    ctx.save()
    ctx.globalAlpha = 0.1
    ctx.fillStyle = '#000000'
    ctx.font = '14px Arial'
    ctx.textAlign = 'center'

    // Multiple watermark positions
    const positions = [
      { x: options.width * 0.2, y: options.height * 0.2, rotation: 45 },
      { x: options.width * 0.5, y: options.height * 0.3, rotation: -30 },
      { x: options.width * 0.8, y: options.height * 0.4, rotation: 15 },
      { x: options.width * 0.3, y: options.height * 0.7, rotation: -45 },
      { x: options.width * 0.7, y: options.height * 0.8, rotation: 30 }
    ]

    positions.forEach(pos => {
      ctx.save()
      ctx.translate(pos.x, pos.y)
      ctx.rotate((pos.rotation * Math.PI) / 180)
      ctx.fillText(`${options.userEmail}`, 0, 0)
      ctx.fillText(`FLIPBOOK DRM`, 0, 20)
      ctx.restore()
    })

    ctx.restore()
  }

  // Convert to buffer
  const buffer = canvas.toBuffer(`image/${options.format}`)
  return buffer
}