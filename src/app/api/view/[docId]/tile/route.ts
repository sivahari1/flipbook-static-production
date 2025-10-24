import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { downloadFromS3 } from '@/lib/s3'
import { addWatermark } from '@/lib/watermark'
import { rateLimit } from '@/lib/rateLimit'
import { getClientInfo } from '@/lib/device'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

export const runtime = 'nodejs'

const tileSchema = z.object({
  docId: z.string(),
  page: z.coerce.number().min(1),
  z: z.coerce.number().optional(),
  x: z.coerce.number().optional(),
  y: z.coerce.number().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const resolvedParams = await params
    const url = new URL(request.url)
    const { docId, page, z, x, y } = tileSchema.parse({
      docId: resolvedParams.docId,
      page: url.searchParams.get('page'),
      z: url.searchParams.get('z'),
      x: url.searchParams.get('x'),
      y: url.searchParams.get('y'),
    })

    // Verify token (from header or query param for img src compatibility)
    let token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      token = url.searchParams.get('token')
    }
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 401 })
    }

    let payload: { sub: string; docId: string; sessionId: string; ipHash: string; uaHash: string; type: string }
    try {
      payload = jwt.verify(token, process.env.NEXTAUTH_SECRET!)
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (payload.docId !== docId) {
      return NextResponse.json({ error: 'Token mismatch' }, { status: 403 })
    }

    // Verify client info matches token
    const { ipHash, uaHash } = getClientInfo(request)
    if (payload.ipHash !== ipHash || payload.uaHash !== uaHash) {
      return NextResponse.json({ error: 'Client mismatch' }, { status: 403 })
    }

    // Rate limiting
    const rateLimitKey = `tile:${payload.sub}:${docId}`
    const rateLimitResult = await rateLimit(rateLimitKey, 60, 60000) // 60 requests per minute
    
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    // Get document
    const document = await prisma.document.findUnique({
      where: { id: docId }
    })

    if (!document || page > document.pageCount) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // Construct S3 key for page image
    const imageKey = z && x !== undefined && y !== undefined 
      ? `tiles/${docId}/${page}/${z}/${x}_${y}.jpg`
      : `pages/${docId}/${page}.jpg`

    try {
      // Download image from S3
      const imageBuffer = await downloadFromS3(imageKey)

      // Get user/share info for watermark
      let watermarkText = 'Protected Content'
      if (payload.type === 'user') {
        const user = await prisma.user.findUnique({
          where: { id: payload.sub }
        })
        watermarkText = `${user?.email} • ${new Date().toISOString()} • ${payload.sessionId.slice(0, 6)}`
      } else {
        const shareLink = await prisma.shareLink.findUnique({
          where: { id: payload.sub }
        })
        watermarkText = `${shareLink?.code} • ${new Date().toISOString()} • ${payload.sessionId.slice(0, 6)}`
      }

      // Add dynamic watermark
      const watermarkedImage = await addWatermark(imageBuffer, {
        text: watermarkText,
        opacity: 0.3,
        fontSize: 16,
        position: 'center'
      })

      // Log tile access
      await prisma.viewAudit.create({
        data: {
          userId: payload.type === 'user' ? payload.sub : null,
          shareLinkId: payload.type === 'share' ? payload.sub : null,
          documentId: docId,
          ipHash,
          uaHash,
          sessionId: payload.sessionId,
          event: 'tile_access',
          meta: { page, z, x, y }
        }
      })

      return new NextResponse(watermarkedImage, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'private, no-store, no-cache, must-revalidate',
          'X-Content-Type-Options': 'nosniff',
        }
      })

    } catch (error) {
      console.error('S3 download error:', error)
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

  } catch (error) {
    console.error('Tile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}