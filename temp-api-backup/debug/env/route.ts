import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  // Only allow this in development or with a special header
  const debugKey = request.headers.get('x-debug-key')
  
  if (process.env.NODE_ENV === 'production' && debugKey !== 'debug-env-check') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
  }

  const envStatus = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? {
      exists: true,
      isPlaceholder: process.env.DATABASE_URL.includes('placeholder'),
      isBuild: process.env.DATABASE_URL.includes('build'),
      protocol: process.env.DATABASE_URL.split('://')[0],
      length: process.env.DATABASE_URL.length
    } : { exists: false },
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? { exists: true, length: process.env.NEXTAUTH_SECRET.length } : { exists: false },
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'not set',
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(envStatus)
}