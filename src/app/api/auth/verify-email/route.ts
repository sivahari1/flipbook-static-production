import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, generateWelcomeEmailHTML } from '@/lib/email'
import { z } from 'zod'

export const runtime = 'nodejs'

const verifyEmailSchema = z.object({
  token: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = verifyEmailSchema.parse(body)

    // Find user by verification token
    const user = await prisma.user.findUnique({
      where: { 
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date() // Token must not be expired
        }
      }
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'Invalid or expired verification token' 
      }, { status: 400 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ 
        message: 'Email already verified',
        verified: true 
      })
    }

    // Update user as verified and clear verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      }
    })

    // Send welcome email
    await sendEmail({
      to: user.email,
      subject: 'Welcome to Flipbook DRM - Email Verified!',
      html: generateWelcomeEmailHTML(user.email.split('@')[0]),
    })

    return NextResponse.json({ 
      message: 'Email verified successfully',
      verified: true,
      email: user.email
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ error: 'Email verification failed' }, { status: 500 })
  }
}