import { NextResponse } from 'next/server'
import { ensureSupabaseBucket } from '@/lib/supabase-storage'

export async function GET() {
  try {
    console.log('🔧 Initializing Supabase storage...')
    
    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured',
        message: 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required'
      }, { status: 400 })
    }

    const bucketCreated = await ensureSupabaseBucket()
    
    if (bucketCreated) {
      return NextResponse.json({
        success: true,
        message: 'Supabase storage initialized successfully',
        bucket: 'documents'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to initialize Supabase storage',
        message: 'Could not create or verify documents bucket'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ Storage initialization error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Storage initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}