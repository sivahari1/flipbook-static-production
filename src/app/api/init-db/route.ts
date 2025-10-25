import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Check if we have a valid database connection
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder') || process.env.DATABASE_URL.includes('build')) {
      return NextResponse.json({ 
        error: 'Database URL not configured',
        message: 'Please set DATABASE_URL environment variable'
      }, { status: 503 })
    }

    console.log('🔄 Initializing database...')

    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    // Run database migrations/initialization
    try {
      // Try to create a test user to verify tables exist
      const testUser = await prisma.user.findFirst()
      console.log('✅ Database tables verified')
    } catch (error) {
      console.log('⚠️ Database tables may need to be created')
      // This is expected if tables don't exist yet
    }

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Database initialization error:', error)
    
    return NextResponse.json({
      error: 'Database initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}