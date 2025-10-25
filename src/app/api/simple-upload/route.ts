import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Simple upload endpoint that works without database or file storage
export async function POST(request: NextRequest) {
  console.log('📤 Simple upload API called')
  
  try {
    // Parse form data
    const formData = await request.formData()
    console.log('📋 Form data parsed successfully')
    
    // Extract and validate form data
    const title = formData.get('title') as string
    const description = formData.get('description') as string || null
    const file = formData.get('document') as File
    
    console.log('📝 Extracted data:', {
      title,
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size
    })
    
    // Validate required fields
    if (!title || !title.trim()) {
      console.log('❌ Missing title')
      return NextResponse.json({ error: 'Document title is required' }, { status: 400 })
    }
    
    if (!file || file.size === 0) {
      console.log('❌ Missing or empty file')
      return NextResponse.json({ error: 'Document file is required' }, { status: 400 })
    }
    
    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      console.log('❌ Invalid file type:', file.type)
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }
    
    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      console.log('❌ File too large:', file.size)
      return NextResponse.json({ error: 'File size must be less than 50MB' }, { status: 400 })
    }

    // Generate a unique document ID
    const documentId = `simple-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    console.log('🆔 Generated document ID:', documentId)
    
    // Process file in memory only (no storage)
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    console.log('💾 File processed in memory:', fileBuffer.length, 'bytes')
    
    // Estimate page count based on file size (rough approximation)
    const estimatedPageCount = Math.max(1, Math.floor(fileBuffer.length / 50000)) // ~50KB per page
    
    console.log('✅ Simple upload processed successfully')

    // Success response
    const response = {
      success: true,
      document: {
        id: documentId,
        title: title.trim(),
        description: description?.trim() || null,
        pageCount: estimatedPageCount,
        createdAt: new Date().toISOString(),
        fileName: file.name,
        fileSize: file.size,
        originalName: file.name,
        type: file.type,
        mode: 'simple'
      },
      message: 'Document processed successfully!',
      note: 'File processed in memory. For persistent storage and full features, configure database.',
      timestamp: new Date().toISOString()
    }
    
    console.log('📤 Sending success response')
    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('❌ Simple upload error:', error)
    
    return NextResponse.json({ 
      error: 'Failed to process document',
      details: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Simple upload endpoint is ready',
    description: 'Processes PDF files in memory without requiring database or file storage',
    usage: 'Send POST request with title and document file'
  })
}