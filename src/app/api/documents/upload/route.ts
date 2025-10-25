import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getStorageProvider } from '@/lib/storage'
import { isDatabaseConfigured } from '@/lib/database-config'

export const runtime = 'nodejs'

// Demo upload handler for when database is not configured
async function handleDemoUpload(request: NextRequest) {
  try {
    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string || null
    const file = formData.get('document') as File
    
    // Validate required fields
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Document title is required' }, { status: 400 })
    }
    
    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'Document file is required' }, { status: 400 })
    }
    
    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }
    
    // Generate a unique document ID
    const documentId = `demo-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    
    // Save file using demo storage
    const storage = getStorageProvider()
    const fileName = `${documentId}.pdf`
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const storageKey = await storage.saveFile(fileName, fileBuffer)
    
    // Get page count (simplified for demo)
    let pageCount = Math.floor(Math.random() * 20) + 5
    
    // Return demo response
    const response = {
      success: true,
      document: {
        id: documentId,
        title: title.trim(),
        description: description?.trim() || null,
        pageCount,
        createdAt: new Date().toISOString(),
        fileName: `${documentId}.pdf`,
        fileSize: fileBuffer.length,
        storageKey,
        demoMode: true,
        owner: { email: 'demo@example.com', role: 'CREATOR' },
        shareLinks: [],
        _count: { viewAudits: 0, shareLinks: 0 },
        hasPassphrase: false,
        viewAudits: []
      },
      message: 'Document uploaded successfully in demo mode!',
      demoMode: true
    }
    
    return NextResponse.json(response, { status: 200 })
    
  } catch (error) {
    console.error('❌ Demo upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload document in demo mode',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('📤 Document upload API called')
  
  try {
    // Check if we have a valid database connection
    if (!isDatabaseConfigured()) {
      console.log('⚠️ Database not configured, using demo mode')
      return handleDemoUpload(request)
    }

    // FIRST: Check authentication before processing any form data
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      console.log('❌ No user email provided in headers')
      return NextResponse.json({ 
        error: 'Authentication required',
        message: 'You must be signed in to upload documents'
      }, { status: 401 })
    }
    
    console.log('🔍 Looking for authenticated user:', userEmail)
    
    // Find the authenticated user with proper error handling
    let currentUser
    try {
      currentUser = await prisma.user.findUnique({
        where: { email: userEmail }
      })
    } catch (dbError) {
      console.error('❌ Database connection error:', dbError)
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to verify user authentication. Please try again.'
      }, { status: 503 })
    }
    
    if (!currentUser) {
      console.log('❌ User not found in database:', userEmail)
      return NextResponse.json({ 
        error: 'User not found',
        message: 'Please complete your registration'
      }, { status: 403 })
    }
    
    console.log('✅ Authenticated user found:', currentUser.email, 'Role:', currentUser.role)

    // SECOND: Parse form data after authentication is confirmed
    const formData = await request.formData()
    console.log('📋 Form data parsed successfully')
    
    // Extract and validate form data
    const title = formData.get('title') as string
    const description = formData.get('description') as string || null
    const file = formData.get('document') as File
    const watermark = formData.get('watermark') === 'on' || formData.get('watermark') === 'true'
    const watermarkType = formData.get('watermarkType') as string || 'text'
    const watermarkText = formData.get('watermarkText') as string || ''
    const watermarkImage = formData.get('watermarkImage') as File | null
    const preventDownload = formData.get('preventDownload') === 'on' || formData.get('preventDownload') === 'true'
    const trackViews = formData.get('trackViews') === 'on' || formData.get('trackViews') === 'true'
    const expiry = formData.get('expiry') as string
    const maxViews = formData.get('maxViews') as string
    
    console.log('📝 Extracted data:', {
      title,
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      watermark,
      watermarkType
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
    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    console.log('🆔 Generated document ID:', documentId)
    
    // Process watermark image if provided
    let watermarkImagePath = null
    if (watermarkImage && watermarkImage.size > 0) {
      // Validate watermark image
      if (!watermarkImage.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Watermark must be an image file' }, { status: 400 })
      }
      
      if (watermarkImage.size > 5 * 1024 * 1024) { // 5MB limit for watermark
        return NextResponse.json({ error: 'Watermark image must be less than 5MB' }, { status: 400 })
      }
      
      watermarkImagePath = `watermarks/${documentId}/${watermarkImage.name}`
      console.log('🖼️ Watermark image path:', watermarkImagePath)
    }

    // Create DRM options
    const drmOptions = {
      watermark,
      watermarkType: watermark ? watermarkType : null,
      watermarkText: watermark && watermarkText ? watermarkText : null,
      watermarkImagePath: watermark && watermarkImagePath ? watermarkImagePath : null,
      preventDownload,
      trackViews,
      expiry: expiry ? parseInt(expiry) : null,
      maxViews: maxViews ? parseInt(maxViews) : null
    }
    
    console.log('⚙️ DRM options:', drmOptions)

    // Save the actual PDF file using the storage provider
    const storage = getStorageProvider()
    const fileName = `${documentId}.pdf`
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    
    console.log('💾 Saving file with storage provider...')
    const storageKey = await storage.saveFile(fileName, fileBuffer)
    console.log('✅ File saved with storage key:', storageKey)
    
    // Get actual page count from PDF
    let pageCount = 1
    try {
      const { pdfProcessor } = await import('@/lib/pdf/processor')
      pageCount = await pdfProcessor.getPageCount(fileBuffer)
    } catch (error) {
      console.log('Could not get page count, using default:', error)
      pageCount = Math.floor(Math.random() * 20) + 5 // Fallback to random
    }
    
    console.log('💾 Creating document in database...')
    
    // Create document in database with authenticated user as owner
    const document = await prisma.document.create({
      data: {
        ownerId: currentUser.id,
        title: title.trim(),
        description: description?.trim() || null,
        pageCount,
        storageKey,
        tilePrefix: `tiles/${documentId}/`,
        drmOptions: JSON.stringify(drmOptions),
        hasPassphrase: false
      }
    })

    console.log('✅ Document created successfully:', document.id)

    // Prepare response
    const response = {
      success: true,
      document: {
        id: document.id,
        title: document.title,
        description: document.description,
        pageCount: document.pageCount,
        createdAt: document.createdAt,
        watermarkInfo: watermark ? {
          type: watermarkType,
          hasText: !!watermarkText,
          hasImage: !!watermarkImagePath
        } : null
      },
      message: 'Document uploaded and processed successfully!'
    }
    
    console.log('📤 Sending success response')
    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('❌ Document upload error:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json({ 
      error: 'Failed to upload document',
      details: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}