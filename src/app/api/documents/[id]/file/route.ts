import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'

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
    console.log('📄 Serving PDF file for document:', params?.id)

    // Get user email from request headers
    const userEmail = request.headers.get('x-user-email')
    
    // Find the document
    const document = await prisma.document.findUnique({
      where: { id: params?.id ?? '' },
      include: {
        owner: {
          select: { 
            id: true,
            email: true, 
            role: true 
          }
        }
      }
    })

    if (!document) {
      console.log('❌ Document not found:', params?.id)
      return NextResponse.json({
        error: 'Document not found'
      }, { status: 404 })
    }

    // Check permissions if user is provided
    if (userEmail) {
      const dbUser = await prisma.user.findUnique({
        where: { email: userEmail }
      })

      if (dbUser) {
        const isOwner = document.owner.id === dbUser.id
        const isCreatorOrSubscriber = ['CREATOR', 'SUBSCRIBER'].includes(dbUser.role)
        
        if (!isOwner && !isCreatorOrSubscriber) {
          return NextResponse.json({
            error: 'Access denied'
          }, { status: 403 })
        }
      }
    }

    // Try to serve the actual uploaded file
    try {
      let filePath: string
      
      if (document.storageKey) {
        // Use the storage key to find the file
        if (document.storageKey.startsWith('uploads/')) {
          // File is directly in uploads directory
          filePath = join(process.cwd(), document.storageKey)
        } else {
          // Extract filename from storage key
          const fileName = document.storageKey.split('/').pop()
          if (fileName) {
            filePath = join(process.cwd(), 'uploads', fileName)
          } else {
            throw new Error('Invalid storage key')
          }
        }
      } else {
        // Fallback to document ID naming
        const fileName = `${document.id}.pdf`
        filePath = join(process.cwd(), 'uploads', fileName)
      }
      
      console.log('📄 Trying to serve file:', filePath)
      const pdfBuffer = await readFile(filePath)
      
      return new NextResponse(pdfBuffer as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${document.title}.pdf"`,
          'Cache-Control': 'private, no-cache',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    } catch (fileError) {
      console.log('📄 Uploaded file not found:', fileError)
      console.log('📄 Document storage key:', document.storageKey)
      console.log('📄 Trying sample PDF as fallback')
      
      // Fallback to sample PDF
      try {
        const samplePdfPath = join(process.cwd(), 'public', 'sample.pdf')
        const pdfBuffer = await readFile(samplePdfPath)
        
        return new NextResponse(pdfBuffer as any, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${document.title}.pdf"`,
            'Cache-Control': 'private, no-cache',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        })
      } catch (sampleError) {
        console.log('📄 No PDF files found')
        
        return NextResponse.json({
          error: 'PDF file not found',
          message: 'The PDF file for this document could not be found. Please re-upload the document.',
          documentInfo: {
            id: document.id,
            title: document.title,
            storageKey: document.storageKey
          }
        }, { status: 404 })
      }
    }

  } catch (error) {
    console.error('❌ Error serving PDF file:', error)
    
    return NextResponse.json({ 
      error: 'Failed to serve PDF file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}