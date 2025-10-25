import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isDatabaseConfigured } from '@/lib/database-config'

export const runtime = 'nodejs'

// Sync user to database endpoint
export async function POST(request: NextRequest) {
  console.log('🔄 Sync user API called')
  
  try {
    // Check if we have a valid database connection
    if (!isDatabaseConfigured()) {
      console.log('⚠️ Database not configured, skipping user sync')
      return NextResponse.json({ 
        success: true,
        message: 'User sync skipped - database not configured',
        demoMode: true
      })
    }

    const body = await request.json()
    const { email, name } = body

    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required' 
      }, { status: 400 })
    }

    console.log('🔍 Syncing user:', email)

    // Try to find or create user
    try {
      let user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        // Create new user with CREATOR role by default
        user = await prisma.user.create({
          data: {
            email,
            passwordHash: 'cognito-managed', // Placeholder since Cognito manages passwords
            role: 'CREATOR', // CREATOR role allows document access
            emailVerified: true // Assume verified if coming from auth provider
          }
        })
        console.log('✅ New user created with CREATOR role:', user.email)
      } else {
        // Update existing user
        user = await prisma.user.update({
          where: { email },
          data: {
            emailVerified: true,
          },
        })
        console.log('✅ Existing user updated:', user.email)
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        message: 'User synced successfully'
      })

    } catch (dbError) {
      console.error('❌ Database error during user sync:', dbError)
      return NextResponse.json({
        success: true, // Don't fail login for database issues
        message: 'User sync failed but login continued',
        error: dbError instanceof Error ? dbError.message : 'Database error'
      })
    }

  } catch (error) {
    console.error('❌ User sync error:', error)
    
    return NextResponse.json({
      success: true, // Don't fail login for sync issues
      message: 'User sync failed but login continued',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}