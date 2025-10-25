import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isDatabaseConfigured } from '@/lib/database-config'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    console.log('📋 Fetching documents...')

    // Check if database is configured
    if (!isDatabaseConfigured()) {
      console.log('📋 Database not configured, returning demo documents')
      
      // Return demo documents
      const demoDocuments = [
        {
          id: 'demo-sample-1',
          title: 'Sample Document 1',
          description: 'This is a demo document for testing purposes',
          pageCount: 5,
          createdAt: new Date().toISOString(),
          owner: { email: 'demo@example.com', role: 'CREATOR' },
          shareLinks: [],
          _count: { viewAudits: 15, shareLinks: 0 },
          hasPassphrase: false,
          viewAudits: Array(15).fill(null).map((_, i) => ({ id: i, viewedAt: new Date() }))
        },
        {
          id: 'demo-sample-2', 
          title: 'Sample Document 2',
          description: 'Another demo document',
          pageCount: 8,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          owner: { email: 'demo@example.com', role: 'CREATOR' },
          shareLinks: [],
          _count: { viewAudits: 8, shareLinks: 0 },
          hasPassphrase: false,
          viewAudits: Array(8).fill(null).map((_, i) => ({ id: i, viewedAt: new Date() }))
        }
      ]
      
      return NextResponse.json({ 
        success: true, 
        documents: demoDocuments,
        demoMode: true 
      })
    }

    // Get documents including related owner, share links and counts
    const documents = await prisma.document.findMany({
      include: {
        owner: {
          select: { email: true, role: true }
        },
        shareLinks: {
          select: {
            id: true,
            code: true,
            expiresAt: true,
            maxOpens: true,
            openCount: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { viewAudits: true, shareLinks: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Found ${documents.length} documents`)

    // Map to the shape the client expects
    const payload = documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      description: doc.description ?? null,
      pageCount: doc.pageCount,
      createdAt: doc.createdAt?.toISOString?.() ?? String(doc.createdAt),
      owner: {
        email: doc.owner?.email ?? null,
        role: doc.owner?.role ?? null
      },
      shareLinks: (doc.shareLinks || []).map((s) => ({
        id: s.id,
        code: s.code,
        expiresAt: s.expiresAt ? s.expiresAt.toISOString() : null,
        maxOpens: s.maxOpens ?? null,
        openCount: s.openCount,
        createdAt: s.createdAt.toISOString()
      })),
      _count: {
        viewAudits: doc._count?.viewAudits ?? 0,
        shareLinks: doc._count?.shareLinks ?? 0
      },
      hasPassphrase: doc.hasPassphrase ?? false
    }))

    return NextResponse.json({ success: true, documents: payload })

  } catch (error) {
    console.error('❌ Error fetching documents:', error)

    return NextResponse.json({
      error: 'Failed to fetch documents',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}