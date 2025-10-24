import { NextRequest } from 'next/server'
import { hashIdentifier } from './crypto'

export function getClientInfo(request: NextRequest) {
  const ip = request.ip || 
    request.headers.get('x-forwarded-for')?.split(',')[0] || 
    request.headers.get('x-real-ip') || 
    'unknown'
    
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return {
    ip,
    userAgent,
    ipHash: hashIdentifier(ip),
    uaHash: hashIdentifier(userAgent)
  }
}

export function generateFingerprint(request: NextRequest): string {
  const { ip, userAgent } = getClientInfo(request)
  const acceptLanguage = request.headers.get('accept-language') || ''
  const acceptEncoding = request.headers.get('accept-encoding') || ''
  
  const fingerprint = `${ip}:${userAgent}:${acceptLanguage}:${acceptEncoding}`
  return hashIdentifier(fingerprint)
}