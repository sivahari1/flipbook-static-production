import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...')
    console.log('📊 DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('📊 DATABASE_URL preview:', process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.substring(0, 20) + '...' : 'Not set')

    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection successful:', result)

    // Test if User table exists
    try {
      const userCount = await prisma.user.count()
      console.log('👥 User table accessible, count:', userCount)
      
      return NextResponse.json({
        success: true,
        database: {
          connected: true,
          url: process.env.DATABASE_URL ? 'Connected to Supabase' : 'No URL',
          userTableExists: true,
          userCount,
          testQuery: result
        },
        message: 'Database connection successful'
      })
    } catch (tableError) {
      console.log('⚠️ User table not accessible:', tableError)
      
      return NextResponse.json({
        success: false,
        database: {
          connected: true,
          url: process.env.DATABASE_URL ? 'Connected to Supabase' : 'No URL',
          userTableExists: false,
          error: tableError instanceof Error ? tableError.message : 'Table access error',
          testQuery: result
        },
        message: 'Database connected but tables not accessible'
      })
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error)
    
    return NextResponse.json({
      success: false,
      database: {
        connected: false,
        url: process.env.DATABASE_URL ? 'URL exists but connection failed' : 'No URL set',
        error: error instanceof Error ? error.message : 'Connection failed'
      },
      message: 'Database connection failed'
    }, { status: 500 })
  }
}