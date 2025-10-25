import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isDatabaseConfigured, getDatabaseInfo } from '@/lib/database-config'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Database setup initiated...')
    
    const dbInfo = getDatabaseInfo()
    console.log('📊 Database info:', dbInfo)
    
    if (!dbInfo.configured) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        message: 'Please set up DATABASE_URL environment variable with your Supabase connection string'
      }, { status: 400 })
    }

    // Test connection
    console.log('🔍 Testing database connection...')
    await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection successful')

    // Check if tables exist and create if needed
    console.log('📋 Checking database schema...')
    
    try {
      // Try to query User table
      const userCount = await prisma.user.count()
      console.log('👥 User table exists, count:', userCount)
      
      // Try to query Document table
      const docCount = await prisma.document.count()
      console.log('📄 Document table exists, count:', docCount)
      
      return NextResponse.json({
        success: true,
        database: {
          ...dbInfo,
          tablesExist: true,
          userCount,
          documentCount: docCount
        },
        message: 'Database is properly configured and tables exist'
      })
      
    } catch (tableError) {
      console.log('⚠️ Tables do not exist, need to run migrations')
      
      return NextResponse.json({
        success: false,
        database: {
          ...dbInfo,
          tablesExist: false,
          error: tableError instanceof Error ? tableError.message : 'Tables not found'
        },
        message: 'Database connected but tables need to be created. Run: npx prisma db push',
        instructions: [
          '1. Run: npx prisma generate',
          '2. Run: npx prisma db push',
          '3. Verify tables are created'
        ]
      })
    }

  } catch (error) {
    console.error('❌ Database setup failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database setup failed',
      message: 'Failed to connect to database. Check your DATABASE_URL configuration.'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const dbInfo = getDatabaseInfo()
    
    if (!dbInfo.configured) {
      return NextResponse.json({
        success: false,
        database: dbInfo,
        message: 'Database not configured'
      })
    }

    // Test connection and tables
    try {
      await prisma.$queryRaw`SELECT 1 as test`
      
      const userCount = await prisma.user.count()
      const docCount = await prisma.document.count()
      
      return NextResponse.json({
        success: true,
        database: {
          ...dbInfo,
          connected: true,
          tablesExist: true,
          userCount,
          documentCount: docCount
        },
        message: 'Database is fully operational'
      })
      
    } catch (error) {
      return NextResponse.json({
        success: false,
        database: {
          ...dbInfo,
          connected: false,
          error: error instanceof Error ? error.message : 'Connection failed'
        },
        message: 'Database connection or schema issues detected'
      })
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database status check failed'
    }, { status: 500 })
  }
}