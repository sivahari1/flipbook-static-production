import { randomBytes, createCipher, createDecipher } from 'crypto'

// Fallback crypto implementation for build compatibility
// In production, you should use proper libsodium or AWS KMS

// Generate a new DEK (Data Encryption Key)
export function generateDEK(): Buffer {
  return randomBytes(32) // 256-bit key
}

// Encrypt data with DEK (simplified for demo - use proper encryption in production)
export function encryptWithDEK(data: Buffer, dek: Buffer): Buffer {
  const iv = randomBytes(16)
  const cipher = createCipher('aes-256-cbc', dek)
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()])
  return Buffer.concat([iv, encrypted])
}

// Decrypt data with DEK (simplified for demo - use proper encryption in production)
export function decryptWithDEK(encryptedData: Buffer, dek: Buffer): Buffer {
  const iv = encryptedData.subarray(0, 16)
  const encrypted = encryptedData.subarray(16)
  const decipher = createDecipher('aes-256-cbc', dek)
  return Buffer.concat([decipher.update(encrypted), decipher.final()])
}

// Encrypt DEK with master key (simplified for demo - use KMS in production)
export function encryptDEK(dek: Buffer): string {
  const masterKey = process.env.MASTER_KEY || 'demo-master-key-not-secure'
  const cipher = createCipher('aes-256-cbc', masterKey)
  const encrypted = Buffer.concat([cipher.update(dek), cipher.final()])
  return encrypted.toString('base64')
}

// Decrypt DEK with master key (simplified for demo - use KMS in production)
export function decryptDEK(encryptedDEK: string): Buffer {
  const masterKey = process.env.MASTER_KEY || 'demo-master-key-not-secure'
  const encrypted = Buffer.from(encryptedDEK, 'base64')
  const decipher = createDecipher('aes-256-cbc', masterKey)
  return Buffer.concat([decipher.update(encrypted), decipher.final()])
}

// Generate session ID
export function generateSessionId(): string {
  return randomBytes(16).toString('hex')
}

// Hash IP and User Agent for privacy
export function hashIdentifier(data: string): string {
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(data).digest('hex')
}