import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Analytics API called')

    // Check if database is configured
    const isDatabaseConfigured = process.env.DATABASE_URL && 
                                !process.env.DATABASE_URL.includes('placeholder') && 
                                !process.env.DATABASE_URL.includes('build')

    if (!isDatabaseConfigured) {
      console.log('📊 Database not configured, returning demo analytics')
      
      // Return demo analytics data
      return NextResponse.json({
        success: true,
        analytics: {
          totalViews: Math.floor(Math.random() * 100) + 50,
          totalDocuments: Math.floor(Math.random() * 20) + 5,
          totalUsers: Math.floor(Math.random() * 10) + 1,
          recentViews: [
            { document: 'Sample Document 1', views: 15, date: '2024-10-25' },
            { document: 'Sample Document 2', views: 8, date: '2024-10-24' },
            { document: 'Demo PDF', views: 23, date: '2024-10-23' }
          ]
        },
        demoMode: true
      })
    }

    // Get user email from headers for authentication
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({
        error: 'Authentication required'
      }, { status: 401 })
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 })
    }

    // Get analytics data from database
    const [totalDocuments, totalViews] = await Promise.all([
      prisma.document.count({
        where: { ownerId: user.id }
      }),
      prisma.viewAudit.count({
        where: {
          document: {
            ownerId: user.id
          }
        }
      })
    ])

    // Get recent views
    const recentViews = await prisma.viewAudit.findMany({
      where: {
        document: {
          ownerId: user.id
        }
      },
      include: {
        document: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        viewedAt: 'desc'
      },
      take: 10
    })

    const analytics = {
      totalViews,
      totalDocuments,
      totalUsers: 1, // For now, just the current user
      recentViews: recentViews.map(view => ({
        document: view.document.title,
        views: 1, // Each audit is one view
        date: view.viewedAt.toISOString().split('T')[0]
      }))
    }

    return NextResponse.json({
      success: true,
      analytics
    })

  } catch (error) {
    console.error('❌ Analytics API error:', error)
    
    return NextResponse.json({
      error: 'Failed to fetch analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}