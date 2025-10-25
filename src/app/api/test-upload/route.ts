import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  console.log('🧪 Test upload endpoint called')
  
  try {
    // Check database connection first
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder') || process.env.DATABASE_URL.includes('build')) {
      return NextResponse.json({ 
        error: 'Database URL not configured',
        message: 'DATABASE_URL environment variable is missing or invalid',
        status: 'database_not_configured'
      }, { status: 503 })
    }

    // Test database connection
    try {
      await prisma.$connect()
      console.log('✅ Database connection successful')
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError)
      return NextResponse.json({
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        status: 'database_connection_failed'
      }, { status: 500 })
    }

    // Test creating a user (to verify tables exist)
    try {
      const testEmail = `test-${Date.now()}@example.com`
      const testUser = await prisma.user.create({
        data: {
          email: testEmail,
          role: 'SUBSCRIBER',
          emailVerified: true
        }
      })
      console.log('✅ Test user created:', testUser.id)

      // Clean up test user
      await prisma.user.delete({
        where: { id: testUser.id }
      })
      console.log('✅ Test user cleaned up')

    } catch (tableError) {
      console.error('❌ Database table error:', tableError)
      return NextResponse.json({
        error: 'Database tables not found or invalid',
        details: tableError instanceof Error ? tableError.message : 'Unknown table error',
        status: 'database_tables_missing',
        suggestion: 'Run the SQL schema in Supabase SQL Editor'
      }, { status: 500 })
    }

    await prisma.$disconnect()

    // Test file upload simulation
    const formData = await request.formData()
    const title = formData.get('title') as string
    const file = formData.get('document') as File

    if (!title) {
      return NextResponse.json({ 
        error: 'Title is required',
        status: 'validation_error'
      }, { status: 400 })
    }

    if (!file) {
      return NextResponse.json({ 
        error: 'File is required',
        status: 'validation_error'
      }, { status: 400 })
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: 'All tests passed! Upload functionality is working.',
      tests: {
        database_connection: 'passed',
        database_tables: 'passed',
        file_validation: 'passed',
        environment_variables: 'passed'
      },
      file_info: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Test upload error:', error)
    
    return NextResponse.json({
      error: 'Test upload failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      status: 'test_failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test upload endpoint is ready',
    instructions: 'Send a POST request with title and document file to test upload functionality',
    debug_urls: {
      environment: '/api/debug/env',
      database: '/api/debug/db'
    }
  })
}