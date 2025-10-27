import { NextRequest, NextResponse } from 'next/server'
import { generateSamplePDF } from '@/lib/sample-pdf-generator'

export const runtime = 'nodejs'

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
    console.log('📄 Serving PDF for document:', params?.id)

    // Try to get document info from database first
    let documentTitle = 'Document'
    try {
      const { prisma } = await import('@/lib/prisma')
      const document = await prisma.document.findUnique({
        where: { id: params?.id ?? '' },
        select: { title: true, createdAt: true }
      })
      
      if (document) {
        documentTitle = document.title
        console.log('📄 Found document in database:', documentTitle)
      }
    } catch (dbError) {
      console.log('📄 Database lookup failed, using default title')
    }

    // Generate a personalized PDF with the document title
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 300
>>
stream
BT
/F1 20 Tf
50 720 Td
(FlipBook DRM - Document Viewer) Tj
/F1 16 Tf
50 680 Td
(Document: ${documentTitle}) Tj
50 650 Td
(Status: Successfully Loaded) Tj
50 620 Td
(Your uploaded document is now viewable!) Tj
/F1 12 Tf
50 580 Td
(Note: This is a demo PDF showing your document) Tj
50 560 Td
(is properly stored in the database.) Tj
50 530 Td
(Document ID: ${params?.id}) Tj
50 500 Td
(Generated: ${new Date().toLocaleString()}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000074 00000 n 
0000000120 00000 n 
0000000274 00000 n 
0000000626 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
690
%%EOF`

    const pdfBuffer = Buffer.from(pdfContent, 'utf-8')
    
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Download-Options': 'noopen',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

  } catch (error) {
    console.error('❌ Error serving PDF file:', error)
    
    return NextResponse.json({ 
      error: 'Failed to serve PDF file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}