import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getStorageProvider, getFileNameFromStorageKey } from '@/lib/storage'
import { generateSamplePDF } from '@/lib/sample-pdf-generator'
import { readFile } from 'fs/promises'
import { join } from 'path'

export const runtime = 'nodejs'

// Serve demo documents
async function serveDemoDocument(documentId?: string) {
  try {
    const storage = getStorageProvider()
    
    // Try to get the specific demo document
    if (documentId?.startsWith('demo-')) {
      const fileName = `${documentId}.pdf`
      try {
        const pdfBuffer = await storage.getFile(fileName)
        return new NextResponse(pdfBuffer as any, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="demo-document.pdf"`,
            'Cache-Control': 'private, no-cache',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        })
      } catch (error) {
        console.log('📄 Demo document not found in storage, using sample PDF')
      }
    }
    
    // Fallback to sample PDF
    try {
      const samplePdfPath = join(process.cwd(), 'public', 'sample.pdf')
      const pdfBuffer = await readFile(samplePdfPath)
      
      return new NextResponse(pdfBuffer as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="sample-document.pdf"`,
          'Cache-Control': 'private, no-cache',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    } catch (sampleError) {
      console.log('📄 No sample PDF found, generating one dynamically')
      
      // Generate a sample PDF dynamically
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
          'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }
    
  } catch (error) {
    console.error('❌ Error serving demo document:', error)
    return NextResponse.json({
      error: 'Failed to serve demo document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

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

    // Check if database is configured
    const isDatabaseConfigured = process.env.DATABASE_URL && 
                                !process.env.DATABASE_URL.includes('placeholder') && 
                                !process.env.DATABASE_URL.includes('build')

    // Handle demo mode
    if (!isDatabaseConfigured || params?.id?.startsWith('demo-')) {
      console.log('📄 Demo mode - serving demo document')
      return serveDemoDocument(params?.id)
    }

    // Get user email from request headers or query parameters
    const userEmail = request.headers.get('x-user-email') || 
                     new URL(request.url).searchParams.get('userEmail')
    
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

    // Try to serve the actual uploaded file using storage provider
    try {
      const storage = getStorageProvider()
      let pdfBuffer: Buffer
      
      if (document.storageKey) {
        console.log('📄 Trying to serve file with storage key:', document.storageKey)
        
        // Extract filename from storage key
        const fileName = getFileNameFromStorageKey(document.storageKey)
        
        try {
          // Try to get file from storage provider
          pdfBuffer = await storage.getFile(fileName)
        } catch (storageError) {
          console.log('📄 Storage provider failed, trying direct file access:', storageError)
          
          // Fallback to direct file system access for backward compatibility
          let filePath: string
          if (document.storageKey.startsWith('uploads/')) {
            filePath = join(process.cwd(), document.storageKey)
          } else if (document.storageKey.startsWith('temp/')) {
            filePath = join('/tmp/uploads', fileName)
          } else {
            filePath = join(process.cwd(), 'uploads', fileName)
          }
          
          pdfBuffer = await readFile(filePath)
        }
      } else {
        // Fallback to document ID naming
        const fileName = `${document.id}.pdf`
        console.log('📄 No storage key, trying filename:', fileName)
        
        try {
          pdfBuffer = await storage.getFile(fileName)
        } catch (storageError) {
          // Fallback to direct file access
          const filePath = join(process.cwd(), 'uploads', fileName)
          pdfBuffer = await readFile(filePath)
        }
      }
      
      return new NextResponse(pdfBuffer as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline', // Remove filename to prevent easy saving
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'SAMEORIGIN',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; frame-ancestors 'self';",
          'X-Download-Options': 'noopen',
          'X-Permitted-Cross-Domain-Policies': 'none',
          'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type, x-session-id, x-user-email',
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
            'Content-Disposition': 'inline',
            'Cache-Control': 'private, no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'SAMEORIGIN',
            'X-Download-Options': 'noopen',
            'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        })
      } catch (sampleError) {
        console.log('📄 No PDF files found, generating sample PDF')
        
        // Generate a sample PDF as final fallback
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
            'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        })
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