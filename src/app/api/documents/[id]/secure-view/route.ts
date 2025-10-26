import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSecureSession } from '@/lib/secure-session'

export const runtime = 'nodejs'

interface SecureDocumentResponse {
  success: boolean
  document: {
    id: string
    title: string
    totalPages: number
    accessLevel: 'owner' | 'viewer'
  }
  session: {
    id: string
    expiresAt: string
    maxDuration: number
  }
  security: {
    watermarkConfig: {
      userEmail: string
      timestamp: string
      positions: Array<{ x: number; y: number; rotation: number }>
      opacity: number
      rotation: number
      fontSize: string
    }
    protectionLevel: 'standard' | 'high' | 'maximum'
  }
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  // Normalize params
  let params: { id: string } | undefined
  try {
    const p = (context as any).params
    params = p && typeof (p as any).then === 'function' ? await p : p
  } catch (e) {
    params = (context as any).params
  }

  try {
    console.log('🔒 Secure view request for document:', params?.id)

    // Get user email from request headers
    const userEmail = request.headers.get('x-user-email')
    const authHeader = request.headers.get('authorization')

    if (!userEmail) {
      return NextResponse.json({
        success: false,
        error: 'User authentication required'
      }, { status: 401 })
    }

    // Check if database is configured
    const isDatabaseConfigured = process.env.DATABASE_URL && 
                                !process.env.DATABASE_URL.includes('placeholder') && 
                                !process.env.DATABASE_URL.includes('build')

    // Handle demo mode
    if (!isDatabaseConfigured || params?.id?.startsWith('demo-')) {
      console.log('🔒 Demo mode - creating demo secure session')
      
      const demoResponse: SecureDocumentResponse = {
        success: true,
        document: {
          id: params?.id || 'demo-sample-1',
          title: 'Demo Document',
          totalPages: 5,
          accessLevel: 'viewer'
        },
        session: {
          id: `session-${Date.now()}`,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
          maxDuration: 1800 // 30 minutes in seconds
        },
        security: {
          watermarkConfig: {
            userEmail: userEmail,
            timestamp: new Date().toISOString(),
            positions: [
              { x: 20, y: 20, rotation: 45 },
              { x: 50, y: 50, rotation: -30 },
              { x: 80, y: 30, rotation: 15 },
              { x: 30, y: 70, rotation: -45 },
              { x: 70, y: 80, rotation: 30 }
            ],
            opacity: 0.1,
            rotation: 45,
            fontSize: '14px'
          },
          protectionLevel: 'high'
        }
      }

      return NextResponse.json(demoResponse)
    }

    // Find the document
    const document = await prisma.document.findUnique({
      where: { id: params?.id ?? '' },
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
      console.log('❌ Document not found:', params?.id)
      return NextResponse.json({
        success: false,
        error: 'Document not found'
      }, { status: 404 })
    }

    // Find the requesting user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 401 })
    }

    // Check permissions
    const isOwner = document.owner.id === user.id
    const isCreatorOrSubscriber = ['CREATOR', 'SUBSCRIBER'].includes(user.role)
    
    if (!isOwner && !isCreatorOrSubscriber) {
      return NextResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 })
    }

    // Generate secure session
    const session = await generateSecureSession(user.id, document.id)

    // Log access attempt
    await prisma.documentAccess.create({
      data: {
        documentId: document.id,
        userId: user.id,
        accessTime: new Date(),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        sessionId: session.id
      }
    })

    // Generate watermark positions
    const watermarkPositions = [
      { x: 15, y: 15, rotation: 45 },
      { x: 50, y: 25, rotation: -30 },
      { x: 85, y: 35, rotation: 15 },
      { x: 25, y: 65, rotation: -45 },
      { x: 75, y: 75, rotation: 30 },
      { x: 40, y: 85, rotation: -15 }
    ]

    const response: SecureDocumentResponse = {
      success: true,
      document: {
        id: document.id,
        title: document.title,
        totalPages: document.pageCount || 1,
        accessLevel: isOwner ? 'owner' : 'viewer'
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt.toISOString(),
        maxDuration: 1800 // 30 minutes
      },
      security: {
        watermarkConfig: {
          userEmail: user.email,
          timestamp: new Date().toISOString(),
          positions: watermarkPositions,
          opacity: 0.08,
          rotation: 45,
          fontSize: '12px'
        },
        protectionLevel: 'high'
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Error in secure view:', error)
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create secure view session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}