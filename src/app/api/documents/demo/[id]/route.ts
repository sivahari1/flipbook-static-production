import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Demo document details endpoint
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  console.log('📄 Demo document details API called for ID:', params.id)
  
  try {
    // Return mock document details based on ID
    const demoDocument = {
      id: params.id,
      title: `Demo Document ${params.id.split('-').pop()}`,
      description: 'This is a demo document for testing the viewer functionality',
      pageCount: Math.floor(Math.random() * 15) + 5, // 5-20 pages
      createdAt: new Date().toISOString(),
      fileName: `demo-${params.id}.pdf`,
      fileSize: Math.floor(Math.random() * 1000000) + 100000, // 100KB - 1MB
      demoMode: true,
      storageKey: `demo/${params.id}.pdf`,
      drmOptions: JSON.stringify({
        watermark: true,
        watermarkText: 'DEMO MODE',
        preventDownload: true,
        trackViews: false
      })
    }

    return NextResponse.json({
      success: true,
      document: demoDocument,
      message: 'Demo document details loaded',
      note: 'This is a sample document for demonstration purposes.',
      demoMode: true
    })

  } catch (error) {
    console.error('❌ Demo document details error:', error)
    
    return NextResponse.json({
      error: 'Failed to load demo document',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}