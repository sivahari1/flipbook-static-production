import { randomBytes } from 'crypto'

export interface SecureSession {
  id: string
  userId: string
  documentId: string
  expiresAt: Date
  createdAt: Date
  isActive: boolean
}

// In-memory session store (in production, use Redis or database)
const sessionStore = new Map<string, SecureSession>()

export async function generateSecureSession(userId: string, documentId: string): Promise<SecureSession> {
  const sessionId = randomBytes(32).toString('hex')
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000) // 30 minutes

  const session: SecureSession = {
    id: sessionId,
    userId,
    documentId,
    expiresAt,
    createdAt: now,
    isActive: true
  }

  sessionStore.set(sessionId, session)

  // Clean up expired sessions
  cleanupExpiredSessions()

  return session
}

export async function validateSession(sessionId: string): Promise<SecureSession | null> {
  const session = sessionStore.get(sessionId)
  
  if (!session) {
    return null
  }

  if (session.expiresAt < new Date() || !session.isActive) {
    sessionStore.delete(sessionId)
    return null
  }

  return session
}

export async function invalidateSession(sessionId: string): Promise<void> {
  const session = sessionStore.get(sessionId)
  if (session) {
    session.isActive = false
    sessionStore.set(sessionId, session)
  }
}

export async function extendSession(sessionId: string, additionalMinutes: number = 30): Promise<boolean> {
  const session = sessionStore.get(sessionId)
  
  if (!session || !session.isActive) {
    return false
  }

  session.expiresAt = new Date(Date.now() + additionalMinutes * 60 * 1000)
  sessionStore.set(sessionId, session)
  
  return true
}

function cleanupExpiredSessions(): void {
  const now = new Date()
  
  for (const [sessionId, session] of sessionStore.entries()) {
    if (session.expiresAt < now) {
      sessionStore.delete(sessionId)
    }
  }
}

// Clean up expired sessions every 5 minutes
setInterval(cleanupExpiredSessions, 5 * 60 * 1000)