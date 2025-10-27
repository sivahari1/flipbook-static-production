import { join } from 'path'
import { writeFile, readFile, mkdir, access } from 'fs/promises'
import { supabaseStorage, ensureSupabaseBucket } from './supabase-storage'

export interface StorageProvider {
  saveFile(key: string, buffer: Buffer): Promise<string>
  getFile(key: string): Promise<Buffer>
  deleteFile(key: string): Promise<void>
  getFileUrl(key: string): Promise<string>
}

class LocalStorageProvider implements StorageProvider {
  private uploadsDir: string

  constructor() {
    this.uploadsDir = join(process.cwd(), 'uploads')
  }

  async ensureUploadsDir() {
    try {
      await access(this.uploadsDir)
    } catch {
      await mkdir(this.uploadsDir, { recursive: true })
    }
  }

  async saveFile(key: string, buffer: Buffer): Promise<string> {
    await this.ensureUploadsDir()
    const filePath = join(this.uploadsDir, key)
    await writeFile(filePath, buffer)
    return `uploads/${key}`
  }

  async getFile(key: string): Promise<Buffer> {
    const filePath = join(this.uploadsDir, key)
    return await readFile(filePath)
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = join(this.uploadsDir, key)
    const fs = await import('fs/promises')
    await fs.unlink(filePath)
  }

  async getFileUrl(key: string): Promise<string> {
    return `/api/documents/file/${key}`
  }
}

class TempStorageProvider implements StorageProvider {
  private tempDir: string

  constructor() {
    this.tempDir = '/tmp/uploads'
  }

  async ensureTempDir() {
    try {
      await access(this.tempDir)
    } catch {
      await mkdir(this.tempDir, { recursive: true })
    }
  }

  async saveFile(key: string, buffer: Buffer): Promise<string> {
    await this.ensureTempDir()
    const filePath = join(this.tempDir, key)
    await writeFile(filePath, buffer)
    return `temp/${key}`
  }

  async getFile(key: string): Promise<Buffer> {
    const filePath = join(this.tempDir, key)
    return await readFile(filePath)
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = join(this.tempDir, key)
    const fs = await import('fs/promises')
    await fs.unlink(filePath)
  }

  async getFileUrl(key: string): Promise<string> {
    return `/api/documents/file/${key}`
  }
}

// Demo storage that stores files in memory (for demo mode)
class DemoStorageProvider implements StorageProvider {
  private files = new Map<string, Buffer>()

  async saveFile(key: string, buffer: Buffer): Promise<string> {
    this.files.set(key, buffer)
    return `demo/${key}`
  }

  async getFile(key: string): Promise<Buffer> {
    const buffer = this.files.get(key)
    if (!buffer) {
      throw new Error('File not found in demo storage')
    }
    return buffer
  }

  async deleteFile(key: string): Promise<void> {
    this.files.delete(key)
  }

  async getFileUrl(key: string): Promise<string> {
    return `/api/documents/file/${key}`
  }
}

// Supabase Storage Provider for production use
class SupabaseStorageProvider implements StorageProvider {
  async saveFile(key: string, buffer: Buffer): Promise<string> {
    try {
      await ensureSupabaseBucket()
      const path = await supabaseStorage.uploadFile(key, buffer)
      return `supabase/${path}`
    } catch (error) {
      console.error('❌ Supabase storage failed, falling back to temp storage:', error)
      // Fallback to temp storage
      const tempProvider = new TempStorageProvider()
      return await tempProvider.saveFile(key, buffer)
    }
  }

  async getFile(key: string): Promise<Buffer> {
    try {
      return await supabaseStorage.downloadFile(key)
    } catch (error) {
      console.error('❌ Supabase download failed:', error)
      throw error
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await supabaseStorage.deleteFile(key)
    } catch (error) {
      console.error('❌ Supabase delete failed:', error)
      throw error
    }
  }

  async getFileUrl(key: string): Promise<string> {
    return `/api/documents/file/${key}`
  }
}

// Factory function to get the appropriate storage provider
export function getStorageProvider(): StorageProvider {
  // Check if database is configured
  const isDatabaseConfigured = process.env.DATABASE_URL && 
                              !process.env.DATABASE_URL.includes('placeholder') && 
                              !process.env.DATABASE_URL.includes('build')

  // Check if Supabase is configured
  const isSupabaseConfigured = process.env.SUPABASE_URL && 
                              process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!isDatabaseConfigured) {
    console.log('📦 Using demo storage provider (no database)')
    return new DemoStorageProvider()
  }

  if (isSupabaseConfigured) {
    console.log('📦 Using Supabase storage provider (production)')
    return new SupabaseStorageProvider()
  }

  // Check if we're in a serverless environment (AWS Amplify, Vercel, etc.)
  const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME || 
                      process.env.VERCEL || 
                      process.env.NODE_ENV === 'production'

  if (isServerless) {
    console.log('📦 Using temp storage provider (serverless environment)')
    return new TempStorageProvider()
  }

  console.log('📦 Using local storage provider (development)')
  return new LocalStorageProvider()
}

// Helper function to extract filename from storage key
export function getFileNameFromStorageKey(storageKey: string): string {
  if (storageKey.includes('/')) {
    return storageKey.split('/').pop() || storageKey
  }
  return storageKey
}

// Helper function to get file path from storage key
export function getFilePathFromStorageKey(storageKey: string): string {
  if (storageKey.startsWith('uploads/')) {
    return join(process.cwd(), storageKey)
  } else if (storageKey.startsWith('temp/')) {
    return join('/tmp/uploads', storageKey.replace('temp/', ''))
  } else if (storageKey.startsWith('demo/')) {
    // Demo files are handled differently
    return storageKey
  } else {
    // Fallback to uploads directory
    return join(process.cwd(), 'uploads', storageKey)
  }
}