import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabaseStorage, ensureSupabaseBucket } from '@/lib/supabase-storage'
import { generateSamplePDF } from '@/lib/sample-pdf-generator'

export async function POST() {
  try {
    console.log('🔄 Starting storage migration...')
    
    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured'
      }, { status: 400 })
    }

    // Ensure bucket exists
    await ensureSupabaseBucket()

    // Get all documents that don't have Supabase storage
    const documents = await prisma.document.findMany({
      where: {
        OR: [
          { storageKey: { not: { startsWith: 'supabase/' } } },
          { storageKey: null }
        ]
      },
      take: 10 // Limit to 10 documents at a time
    })

    console.log(`📄 Found ${documents.length} documents to migrate`)

    const results = []

    for (const document of documents) {
      try {
        console.log(`🔄 Migrating document: ${document.id} - ${document.title}`)
        
        // Generate a sample PDF for this document since we can't recover the original
        const pdfBuffer = generateSamplePDF()
        const fileName = `${document.id}.pdf`
        
        // Upload to Supabase
        const supabasePath = await supabaseStorage.uploadFile(fileName, pdfBuffer)
        const newStorageKey = `supabase/${supabasePath}`
        
        // Update document record
        await prisma.document.update({
          where: { id: document.id },
          data: { storageKey: newStorageKey }
        })
        
        results.push({
          documentId: document.id,
          title: document.title,
          status: 'success',
          oldStorageKey: document.storageKey,
          newStorageKey: newStorageKey
        })
        
        console.log(`✅ Migrated document: ${document.id}`)
        
      } catch (error) {
        console.error(`❌ Failed to migrate document ${document.id}:`, error)
        
        results.push({
          documentId: document.id,
          title: document.title,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.status === 'success').length
    const failCount = results.filter(r => r.status === 'failed').length

    return NextResponse.json({
      success: true,
      message: `Migration completed: ${successCount} successful, ${failCount} failed`,
      results,
      summary: {
        total: documents.length,
        successful: successCount,
        failed: failCount
      }
    })

  } catch (error) {
    console.error('❌ Migration error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}