import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getClientInfo, generateFingerprint } from '@/lib/device'
import { generateSessionId } from '@/lib/crypto'
import jwt from 'jsonwebtoken'
import * as argon2 from 'argon2'
import { z } from 'zod'

export const runtime = 'nodejs'

const manifestSchema = z.object({
  docId: z.string(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const { docId } = manifestSchema.parse(await params)
    const session = await auth()
    const { ipHash, uaHash } = getClientInfo(request)
    
    // Find document
    const document = await prisma.document.findUnique({
      where: { id: docId },
      include: { owner: true }
    })
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    let accessGranted = false
    let userId: string | null = null
    let shareLinkId: string | null = null

    // Check if user has subscription access
    if (session?.user) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { subscription: true }
      })
      
      if (user?.subscription?.status === 'active' || user?.role === 'ADMIN' || user?.id === document.ownerId) {
        accessGranted = true
        userId = user.id
      }
    }

    // Check share link access
    const shareCode = request.headers.get('x-share-code')
    if (!accessGranted && shareCode) {
      const shareLink = await prisma.shareLink.findUnique({
        where: { code: shareCode },
        include: { document: true }
      })
      
      if (shareLink && shareLink.documentId === docId) {
        // Check expiry
        if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
          return NextResponse.json({ error: 'Share link expired' }, { status: 403 })
        }
        
        // Check max opens
        if (shareLink.maxOpens && shareLink.openCount >= shareLink.maxOpens) {
          return NextResponse.json({ error: 'Share link limit reached' }, { status: 403 })
        }
        
        accessGranted = true
        shareLinkId = shareLink.id
      }
    }

    if (!accessGranted) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check document passphrase if required
    if (document.hasPassphrase) {
      const docPass = request.headers.get('x-doc-pass')
      if (!docPass || !document.passphraseHash) {
        return NextResponse.json({ error: 'Document passphrase required' }, { status: 401 })
      }
      
      const validPass = await argon2.verify(document.passphraseHash, docPass)
      if (!validPass) {
        return NextResponse.json({ error: 'Invalid passphrase' }, { status: 401 })
      }
    }

    // Generate session token
    const sessionId = generateSessionId()
    const fingerprint = generateFingerprint(request)
    
    const token = jwt.sign(
      {
        sub: userId || shareLinkId,
        docId,
        sessionId,
        ipHash,
        uaHash,
        fingerprint,
        type: userId ? 'user' : 'share'
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '2m' }
    )

    // Log access
    await prisma.viewAudit.create({
      data: {
        userId,
        shareLinkId,
        documentId: docId,
        ipHash,
        uaHash,
        sessionId,
        event: 'manifest_access',
        meta: { fingerprint }
      }
    })

    return NextResponse.json({
      pageCount: document.pageCount,
      token,
      sessionId
    })

  } catch (error) {
    console.error('Manifest error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}