import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isDatabaseConfigured, getDatabaseInfo } from '@/lib/database-config'

export async function GET() {
  try {
    const dbInfo = getDatabaseInfo()
    
    if (!dbInfo.configured) {
      return NextResponse.json({
        status: 'not_configured',
        message: 'Database not configured',
        info: dbInfo,
        setup_guide: '/SUPABASE_VERCEL_SETUP.md'
      })
    }

    // Try to connect to database
    try {
      await prisma.$connect()
      
      // Try a simple query to verify tables exist
      const userCount = await prisma.user.count()
      
      return NextResponse.json({
        status: 'connected',
        message: 'Database connected successfully',
        info: dbInfo,
        stats: {
          users: userCount,
          connection: 'active'
        }
      })
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      
      return NextResponse.json({
        status: 'connection_error',
        message: 'Database configured but connection failed',
        info: dbInfo,
        error: dbError instanceof Error ? dbError.message : 'Unknown error',
        suggestions: [
          'Check if DATABASE_URL is correct',
          'Verify Supabase project is not paused',
          'Run: npx prisma db push to create tables',
          'Check network connectivity'
        ]
      })
    }
  } catch (error) {
    console.error('Database status check error:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check database status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}