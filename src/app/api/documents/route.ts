import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    console.log('📋 Fetching documents...')

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