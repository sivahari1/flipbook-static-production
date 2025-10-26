import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    console.log('📋 Returning demo documents')
    
    // Return demo documents for testing
    const demoDocuments = [
      {
        id: 'demo-sample-1',
        title: 'Sample Document 1',
        description: 'This is a demo document for testing the secure PDF viewer',
        pageCount: 5,
        createdAt: new Date().toISOString(),
        owner: { email: 'demo@flipbook.drm', role: 'CREATOR' },
        shareLinks: [],
        _count: { viewAudits: 15, shareLinks: 0 },
        hasPassphrase: false
      },
      {
        id: 'demo-sample-2', 
        title: 'Sample Document 2',
        description: 'Another demo document with more pages',
        pageCount: 8,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        owner: { email: 'demo@flipbook.drm', role: 'CREATOR' },
        shareLinks: [
          {
            id: 'demo-share-1',
            code: 'demo-share-sample-2',
            expiresAt: null,
            maxOpens: null,
            openCount: 3,
            createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
          }
        ],
        _count: { viewAudits: 8, shareLinks: 1 },
        hasPassphrase: false
      },
      {
        id: 'demo-sample-3',
        title: 'Protected Document',
        description: 'A demo document with password protection',
        pageCount: 12,
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        owner: { email: 'demo@flipbook.drm', role: 'CREATOR' },
        shareLinks: [],
        _count: { viewAudits: 25, shareLinks: 0 },
        hasPassphrase: true
      }
    ]
    
    return NextResponse.json({ 
      success: true, 
      documents: demoDocuments,
      demoMode: true 
    })

  } catch (error) {
    console.error('❌ Error returning demo documents:', error)
    
    return NextResponse.json({
      error: 'Failed to fetch demo documents',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}