import { NextRequest, NextResponse } from 'next/server'
import { getStorageProvider } from '@/lib/storage'
import { generateSamplePDF } from '@/lib/sample-pdf-generator'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  context: { params: { filename: string } } | { params: Promise<{ filename: string }> }
) {
  // Normalize params
  let params: { filename: string } | undefined
  try {
    const p = (context as any).params
    params = p && typeof (p as any).then === 'function' ? await p : p
  } catch (e) {
    params = (context as any).params
  }

  try {
    console.log('📄 Serving file by filename:', params?.filename)

    if (!params?.filename) {
      return NextResponse.json({
        error: 'Filename is required'
      }, { status: 400 })
    }

    const storage = getStorageProvider()
    
    try {
      // Try to get the file from storage
      const fileBuffer = await storage.getFile(params.filename)
      
      return new NextResponse(fileBuffer as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${params.filename}"`,
          'Cache-Control': 'private, no-cache',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
      
    } catch (storageError) {
      console.log('📄 File not found in storage, generating sample PDF')
      
      // Generate a sample PDF as fallback
      const pdfBuffer = generateSamplePDF()
      
      return new NextResponse(pdfBuffer as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${params.filename}"`,
          'Cache-Control': 'private, no-cache',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

  } catch (error) {
    console.error('❌ Error serving file:', error)
    
    return NextResponse.json({ 
      error: 'Failed to serve file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}