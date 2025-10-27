import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isDatabaseConfigured } from '@/lib/database-config'

export const runtime = 'nodejs'

export async function GET() {
  try {
    console.log('🔍 Checking database status...')
    
    const dbConfigured = isDatabaseConfigured()
    console.log('Database configured:', dbConfigured)
    
    if (!dbConfigured) {
      return NextResponse.json({
        configured: false,
        message: 'Database not configured - using demo mode',
        databaseUrl: process.env.DATABASE_URL ? 'Present but invalid' : 'Not set'
      })
    }
    
    // Try to connect to database
    try {
      await prisma.$connect()
      console.log('✅ Database connection successful')
      
      // Try a simple query
      const userCount = await prisma.user.count()
      const docCount = await prisma.document.count()
      
      return NextResponse.json({
        configured: true,
        connected: true,
        message: 'Database is working properly',
        stats: {
          users: userCount,
          documents: docCount
        }
      })
      
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError)
      
      return NextResponse.json({
        configured: true,
        connected: false,
        message: 'Database configured but connection failed',
        error: dbError instanceof Error ? dbError.message : 'Unknown error'
      })
    }
    
  } catch (error) {
    console.error('❌ Error checking database status:', error)
    
    return NextResponse.json({
      configured: false,
      connected: false,
      message: 'Error checking database status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}