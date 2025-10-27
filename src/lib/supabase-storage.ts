import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export interface SupabaseStorageProvider {
  uploadFile(fileName: string, fileBuffer: Buffer, contentType?: string): Promise<string>
  downloadFile(fileName: string): Promise<Buffer>
  deleteFile(fileName: string): Promise<void>
  getPublicUrl(fileName: string): string
}

class SupabaseStorageService implements SupabaseStorageProvider {
  private bucketName = 'documents'

  async uploadFile(fileName: string, fileBuffer: Buffer, contentType = 'application/pdf'): Promise<string> {
    try {
      console.log('📤 Uploading file to Supabase Storage:', fileName)
      
      const { data, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .upload(fileName, fileBuffer, {
          contentType,
          upsert: true
        })

      if (error) {
        console.error('❌ Supabase upload error:', error)
        throw new Error(`Failed to upload file: ${error.message}`)
      }

      console.log('✅ File uploaded successfully:', data.path)
      return data.path
    } catch (error) {
      console.error('❌ Upload error:', error)
      throw error
    }
  }

  async downloadFile(fileName: string): Promise<Buffer> {
    try {
      console.log('📥 Downloading file from Supabase Storage:', fileName)
      
      const { data, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .download(fileName)

      if (error) {
        console.error('❌ Supabase download error:', error)
        throw new Error(`Failed to download file: ${error.message}`)
      }

      if (!data) {
        throw new Error('No file data received')
      }

      const buffer = Buffer.from(await data.arrayBuffer())
      console.log('✅ File downloaded successfully, size:', buffer.length)
      return buffer
    } catch (error) {
      console.error('❌ Download error:', error)
      throw error
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      console.log('🗑️ Deleting file from Supabase Storage:', fileName)
      
      const { error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .remove([fileName])

      if (error) {
        console.error('❌ Supabase delete error:', error)
        throw new Error(`Failed to delete file: ${error.message}`)
      }

      console.log('✅ File deleted successfully')
    } catch (error) {
      console.error('❌ Delete error:', error)
      throw error
    }
  }

  getPublicUrl(fileName: string): string {
    const { data } = supabaseAdmin.storage
      .from(this.bucketName)
      .getPublicUrl(fileName)
    
    return data.publicUrl
  }
}

export const supabaseStorage = new SupabaseStorageService()

// Helper function to ensure bucket exists
export async function ensureSupabaseBucket() {
  try {
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError)
      return false
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'documents')
    
    if (!bucketExists) {
      console.log('📦 Creating documents bucket...')
      
      const { error: createError } = await supabaseAdmin.storage.createBucket('documents', {
        public: false,
        allowedMimeTypes: ['application/pdf'],
        fileSizeLimit: 52428800 // 50MB
      })

      if (createError) {
        console.error('❌ Error creating bucket:', createError)
        return false
      }

      console.log('✅ Documents bucket created successfully')
    }

    return true
  } catch (error) {
    console.error('❌ Error ensuring bucket:', error)
    return false
  }
}