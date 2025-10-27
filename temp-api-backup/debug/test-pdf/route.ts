import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { renderPDFPageToImage } from '@/lib/pdf-renderer'

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'uploads', 'doc-1761410426810-8eud4vvgt.pdf')
    console.log('Testing PDF file read from:', filePath)
    
    const buffer = await readFile(filePath)
    console.log('PDF file read successfully, size:', buffer.length, 'bytes')
    
    // Test if it's a valid PDF by checking the header
    const header = buffer.slice(0, 4).toString()
    const isValidPDF = header === '%PDF'
    
    // Test PDF rendering
    let renderingResult = null
    try {
      const mockDocument = {
        id: 'test-doc',
        title: 'Test Document',
        storageKey: 'uploads/doc-1761410426810-8eud4vvgt.pdf'
      }
      
      console.log('Testing PDF rendering...')
      const imageBuffer = await renderPDFPageToImage(mockDocument, 1, {
        width: 400,
        height: 600,
        quality: 'medium',
        format: 'png'
      })
      
      renderingResult = {
        success: true,
        imageSize: imageBuffer.length
      }
      console.log('PDF rendering successful, image size:', imageBuffer.length)
      
    } catch (renderError) {
      console.error('PDF rendering failed:', renderError)
      renderingResult = {
        success: false,
        error: renderError instanceof Error ? renderError.message : 'Unknown rendering error'
      }
    }
    
    return NextResponse.json({
      success: true,
      fileExists: true,
      fileSize: buffer.length,
      isValidPDF,
      header: buffer.slice(0, 10).toString(),
      filePath,
      rendering: renderingResult
    })

  } catch (error) {
    console.error('Error reading PDF file:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}