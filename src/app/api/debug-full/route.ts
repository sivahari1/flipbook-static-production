import { NextResponse } from 'next/server'

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV,
    
    // Environment Variables Check
    env_variables: {
      DATABASE_URL: {
        exists: !!process.env.DATABASE_URL,
        length: process.env.DATABASE_URL?.length || 0,
        starts_with: process.env.DATABASE_URL?.substring(0, 30) || 'Not set',
        contains_supabase: process.env.DATABASE_URL?.includes('supabase') || false
      },
      SUPABASE_URL: {
        exists: !!process.env.SUPABASE_URL,
        value: process.env.SUPABASE_URL || 'Not set'
      },
      SUPABASE_ANON_KEY: {
        exists: !!process.env.SUPABASE_ANON_KEY,
        length: process.env.SUPABASE_ANON_KEY?.length || 0
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
      },
      DIRECT_URL: {
        exists: !!process.env.DIRECT_URL,
        length: process.env.DIRECT_URL?.length || 0
      }
    },
    
    // Prisma Check
    prisma_status: 'checking...',
    
    // All environment variables (for debugging)
    all_env_keys: Object.keys(process.env).filter(key => 
      key.includes('DATABASE') || 
      key.includes('SUPABASE') || 
      key.includes('POSTGRES') ||
      key.includes('DB')
    )
  }
  
  // Test Prisma Connection
  try {
    const { prisma } = await import('@/lib/prisma')
    
    await prisma.$connect()
    const result = await prisma.$queryRaw`SELECT 1 as test, version() as pg_version`
    
    // Try to check if tables exist
    let tablesExist = false
    try {
      await prisma.user.count()
      tablesExist = true
    } catch (tableError) {
      // Tables might not exist yet
    }
    
    await prisma.$disconnect()
    
    diagnostics.prisma_status = {
      status: 'connected',
      result: result,
      tables_exist: tablesExist
    }
  } catch (error) {
    diagnostics.prisma_status = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined
    }
  }
  
  return NextResponse.json(diagnostics, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}