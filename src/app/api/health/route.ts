import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET() {
  try {
    console.log('🏥 Health check requested')
    
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection OK')
    
    // Check environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ]
    
    const missingEnvVars = requiredEnvVars.filter(
      envVar => !process.env[envVar]
    )
    
    if (missingEnvVars.length > 0) {
      console.log('❌ Missing environment variables:', missingEnvVars)
      return NextResponse.json({
        status: 'error',
        message: 'Missing required environment variables',
        missing: missingEnvVars
      }, { status: 500 })
    }
    
    // Check user count
    const userCount = await prisma.user.count()
    console.log(`👥 Users in database: ${userCount}`)
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: 'connected',
      userCount,
      version: '1.0.0'
    }
    
    console.log('✅ Health check passed')
    return NextResponse.json(healthData)
    
  } catch (error) {
    console.error('❌ Health check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}