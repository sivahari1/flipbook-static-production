import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  // Only allow this in development or with a special header
  const debugKey = request.headers.get('x-debug-key')
  
  if (process.env.NODE_ENV === 'production' && debugKey !== 'debug-db-check') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
  }

  try {
    // Check if we have a valid database URL
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder') || process.env.DATABASE_URL.includes('build')) {
      return NextResponse.json({
        status: 'error',
        message: 'Database URL not configured or using placeholder',
        databaseUrl: process.env.DATABASE_URL ? 'present but invalid' : 'missing'
      }, { status: 503 })
    }

    // Try to connect to the database
    await prisma.$connect()
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    await prisma.$disconnect()

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      testQuery: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database connection test failed:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}