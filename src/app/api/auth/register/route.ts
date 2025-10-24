import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, generateVerificationEmailHTML } from '@/lib/email'
import * as argon2 from 'argon2'
import { z } from 'zod'
import crypto from 'crypto'
import { Role } from '@prisma/client'

export const runtime = 'nodejs'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['SUBSCRIBER', 'CREATOR']).default('SUBSCRIBER'),
})

export async function POST(request: NextRequest) {
  try {
    // Check if we have a valid database connection
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder') || process.env.DATABASE_URL.includes('build')) {
      return NextResponse.json({ 
        error: 'Database not configured. Please set DATABASE_URL environment variable.' 
      }, { status: 503 })
    }

    console.log('Registration API called')
    const body = await request.json()
    console.log('Request body:', body)
    const { email, password, role } = registerSchema.parse(body)
    console.log('Parsed data:', { email, role })

    // Check if user already exists
    console.log('Checking for existing user...')
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    console.log('Existing user:', existingUser ? 'found' : 'not found')

    if (existingUser) {
      if (!(existingUser as any).emailVerified) {
        return NextResponse.json({ 
          error: 'User already exists but email not verified. Please check your email for verification link.',
          needsVerification: true,
          email: email
        }, { status: 400 })
      }
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Hash password
    console.log('Hashing password...')
    const passwordHash = await argon2.hash(password)
    console.log('Password hashed successfully')

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user
    console.log('Creating user...')
    const userData: any = {
      email,
      passwordHash,
      role: role as Role,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    }
    console.log('User data:', userData)
    
    const user = await prisma.user.create({
      data: userData
    })
    console.log('User created successfully:', user.id)

    // Create verification URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`

    // Send verification email
    const emailSent = await sendEmail({
      to: email,
      subject: 'Verify Your Email - Flipbook DRM',
      html: generateVerificationEmailHTML(verificationUrl, email.split('@')[0]),
    })

    if (!emailSent) {
      console.warn('Failed to send verification email, but user was created')
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      emailVerified: false, // New users are not verified by default
      message: 'Registration successful! Please check your email to verify your account.',
      verificationEmailSent: emailSent
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}