import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🔗 Creating share link for document:', id)
    
    // Check if database is configured
    const isDatabaseConfigured = process.env.DATABASE_URL && 
                                !process.env.DATABASE_URL.includes('placeholder') && 
                                !process.env.DATABASE_URL.includes('build')

    // Handle demo documents
    if (!isDatabaseConfigured || id?.startsWith('demo-')) {
      console.log('🔗 Creating demo share link for:', id)
      
      // Generate a demo share code
      const shareCode = `demo-share-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
      const baseUrl = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000'
      
      return NextResponse.json({
        success: true,
        share: {
          code: shareCode,
          url: `${baseUrl}/share/${shareCode}`,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          maxOpens: null,
          openCount: 0,
          demoMode: true
        },
        message: 'Demo share link created! This link will redirect to the document viewer.'
      })
    }
    
    // Find the document
    const document = await prisma.document.findUnique({
      where: { id }
    })

    if (!document) {
      return NextResponse.json({
        error: 'Document not found'
      }, { status: 404 })
    }

    // Generate a unique share code
    const shareCode = `share-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    
    // Find or create demo user for creator
    let demoUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    })

    if (!demoUser) {
      // Create demo user if it doesn't exist
      demoUser = await prisma.user.create({
        data: {
          email: 'demo@example.com',
          passwordHash: 'demo-hash',
          role: 'CREATOR',
          emailVerified: true
        }
      })
    }

    // Create share record
    const share = await prisma.shareLink.create({
      data: {
        documentId: document.id,
        creatorId: demoUser.id,
        code: shareCode,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        maxOpens: null,
        openCount: 0
      }
    })

    console.log('✅ Share link created:', shareCode)

    return NextResponse.json({
      success: true,
      share: {
        code: share.code,
        url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/share/${share.code}`,
        expiresAt: share.expiresAt,
        maxOpens: share.maxOpens,
        openCount: share.openCount
      }
    })

  } catch (error) {
    console.error('❌ Error creating share link:', error)
    
    return NextResponse.json({ 
      error: 'Failed to create share link',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('📋 Getting share links for document:', id)
    
    // Check if database is configured
    const isDatabaseConfigured = process.env.DATABASE_URL && 
                                !process.env.DATABASE_URL.includes('placeholder') && 
                                !process.env.DATABASE_URL.includes('build')

    // Handle demo documents
    if (!isDatabaseConfigured || id?.startsWith('demo-')) {
      console.log('📋 Returning demo share links for:', id)
      
      const baseUrl = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000'
      
      return NextResponse.json({
        success: true,
        shares: [
          {
            code: `demo-share-${id}`,
            url: `${baseUrl}/share/demo-share-${id}`,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            maxOpens: null,
            openCount: 0,
            demoMode: true
          }
        ],
        demoMode: true
      })
    }
    
    // Get all shares for this document
    const shares = await prisma.shareLink.findMany({
      where: { 
        documentId: id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Found ${shares.length} share links`)

    return NextResponse.json({
      success: true,
      shares: shares.map(share => ({
        code: share.code,
        url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/share/${share.code}`,
        createdAt: share.createdAt,
        expiresAt: share.expiresAt,
        maxOpens: share.maxOpens,
        openCount: share.openCount
      }))
    })

  } catch (error) {
    console.error('❌ Error fetching share links:', error)
    
    return NextResponse.json({ 
      error: 'Failed to fetch share links',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}