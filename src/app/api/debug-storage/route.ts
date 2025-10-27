import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getStorageProvider, getFileNameFromStorageKey } from '@/lib/storage'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercel_env: process.env.VERCEL_ENV,
      storage_info: {},
      documents: [],
      storage_test: {}
    }

    // Test storage provider
    const storage = getStorageProvider()
    diagnostics.storage_info = {
      provider_type: storage.constructor.name,
      is_serverless: !!(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL),
      is_vercel: !!process.env.VERCEL
    }

    // Get recent documents from database
    try {
      const documents = await prisma.document.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          storageKey: true,
          createdAt: true,
          owner: {
            select: { email: true }
          }
        }
      })

      diagnostics.documents = documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        storageKey: doc.storageKey,
        createdAt: doc.createdAt,
        owner: doc.owner.email
      }))

      // Test file access for each document
      for (const doc of documents) {
        if (doc.storageKey) {
          const fileName = getFileNameFromStorageKey(doc.storageKey)
          
          try {
            // Test storage provider access
            await storage.getFile(fileName)
            diagnostics.storage_test[doc.id] = {
              status: 'success',
              method: 'storage_provider',
              fileName: fileName,
              storageKey: doc.storageKey
            }
          } catch (storageError) {
            try {
              // Test direct file access
              let filePath: string
              if (doc.storageKey.startsWith('uploads/')) {
                filePath = join(process.cwd(), doc.storageKey)
              } else if (doc.storageKey.startsWith('temp/')) {
                filePath = join('/tmp/uploads', fileName)
              } else {
                filePath = join(process.cwd(), 'uploads', fileName)
              }
              
              await readFile(filePath)
              diagnostics.storage_test[doc.id] = {
                status: 'success',
                method: 'direct_file_access',
                filePath: filePath,
                storageKey: doc.storageKey
              }
            } catch (fileError) {
              diagnostics.storage_test[doc.id] = {
                status: 'failed',
                storageError: storageError instanceof Error ? storageError.message : 'Unknown storage error',
                fileError: fileError instanceof Error ? fileError.message : 'Unknown file error',
                fileName: fileName,
                storageKey: doc.storageKey
              }
            }
          }
        }
      }
    } catch (dbError) {
      diagnostics.documents = []
      diagnostics.storage_test = {
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }
    }

    return NextResponse.json(diagnostics, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to run storage diagnostics',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}