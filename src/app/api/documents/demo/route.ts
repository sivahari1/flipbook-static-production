import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Demo documents endpoint that works without database
export async function GET(request: NextRequest) {
  console.log('📄 Demo documents API called')
  
  try {
    // Return mock documents for demo mode
    const demoDocuments = [
      {
        id: 'demo-sample-1',
        title: 'Sample Document 1',
        description: 'This is a demo document for testing purposes',
        pageCount: 5,
        createdAt: new Date().toISOString(),
        fileName: 'sample-document-1.pdf',
        fileSize: 245760,
        demoMode: true
      },
      {
        id: 'demo-sample-2', 
        title: 'Sample Document 2',
        description: 'Another demo document',
        pageCount: 8,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        fileName: 'sample-document-2.pdf',
        fileSize: 512000,
        demoMode: true
      }
    ]

    return NextResponse.json({
      success: true,
      documents: demoDocuments,
      message: 'Demo documents loaded',
      note: 'These are sample documents. Upload your own PDFs to see them here.',
      demoMode: true
    })

  } catch (error) {
    console.error('❌ Demo documents error:', error)
    
    return NextResponse.json({
      error: 'Failed to load demo documents',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}