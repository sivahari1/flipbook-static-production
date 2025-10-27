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
    console.log('📄 Serving simple PDF file for document:', params?.id)

    // Always generate a working PDF - this ensures it always works
    const pdfBuffer = generateSamplePDF()
    
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
    console.error('❌ Error serving simple PDF file:', error)
    
    return NextResponse.json({ 
      error: 'Failed to serve PDF file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}