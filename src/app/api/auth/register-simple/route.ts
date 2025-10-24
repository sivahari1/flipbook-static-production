import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Simple registration called with:', body)
    
    // For now, just return success to test the flow
    return NextResponse.json({
      id: 'temp-id',
      email: body.email,
      role: body.role,
      message: 'Registration successful! Please use the sample credentials provided.',
      note: 'This is a temporary endpoint. Use the sample credentials to test the application.'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Simple registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}