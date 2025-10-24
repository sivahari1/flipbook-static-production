import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import * as argon2 from 'argon2'
import { z } from 'zod'

export const runtime = 'nodejs'

const createShareSchema = z.object({
  documentId: z.string(),
  expiresAt: z.string().datetime().optional(),
  maxOpens: z.number().positive().optional(),
  requirePass: z.boolean().default(false),
  passphrase: z.string().optional(),
  passphraseHint: z.string().optional(),
  requireOtp: z.boolean().default(false),
  ipLock: z.string().optional(),
  uaLock: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole('CREATOR')
    const body = await request.json()
    const data = createShareSchema.parse(body)

    // Verify document ownership
    const document = await prisma.document.findFirst({
      where: {
        id: data.documentId,
        ownerId: session.user.id
      }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Generate unique share code
    let code: string
    let attempts = 0
    do {
      code = randomBytes(8).toString('hex')
      const existing = await prisma.shareLink.findUnique({ where: { code } })
      if (!existing) break
      attempts++
    } while (attempts < 10)

    if (attempts >= 10) {
      return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 })
    }

    // Hash passphrase if provided
    let passphraseHash: string | undefined
    if (data.requirePass && data.passphrase) {
      passphraseHash = await argon2.hash(data.passphrase)
    }

    const shareLink = await prisma.shareLink.create({
      data: {
        documentId: data.documentId,
        creatorId: session.user.id,
        code,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        maxOpens: data.maxOpens,
        requirePass: data.requirePass,
        passphraseHint: data.passphraseHint,
        requireOtp: data.requireOtp,
        ipLock: data.ipLock,
        uaLock: data.uaLock,
      }
    })

    return NextResponse.json({
      id: shareLink.id,
      code: shareLink.code,
      url: `${process.env.NEXTAUTH_URL}/s/${shareLink.code}`,
      expiresAt: shareLink.expiresAt,
      maxOpens: shareLink.maxOpens,
      requirePass: shareLink.requirePass,
      requireOtp: shareLink.requireOtp,
    })

  } catch (error) {
    console.error('Share creation error:', error)
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
  }
}