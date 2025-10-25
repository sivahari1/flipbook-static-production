import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Client-side documents endpoint that works with demo storage
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, documents } = body

    if (action === 'get') {
      // Return the documents passed from client
      return NextResponse.json({
        success: true,
        documents: documents || [],
        demoMode: true,
        message: 'Documents retrieved from client storage'
      })
    }

    if (action === 'add') {
      // Just acknowledge the add - actual storage happens client-side
      return NextResponse.json({
        success: true,
        message: 'Document added to client storage'
      })
    }

    if (action === 'remove') {
      // Just acknowledge the remove - actual removal happens client-side
      return NextResponse.json({
        success: true,
        message: 'Document removed from client storage'
      })
    }

    return NextResponse.json({
      error: 'Invalid action'
    }, { status: 400 })

  } catch (error) {
    console.error('❌ Client documents API error:', error)
    
    return NextResponse.json({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}