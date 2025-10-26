'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { NativePDFViewer } from '@/components/pdf/NativePDFViewer'

interface ShareData {
  document: {
    id: string
    title: string
    description?: string
    pageCount: number
    createdAt: string
  }
  shareLink: {
    id: string
    code: string
    expiresAt?: string
    maxOpens?: number
    openCount: number
    requirePass: boolean
  }
  isValid: boolean
  message?: string
  userEmail?: string
}

export default function SharedDocumentViewer() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const [shareData, setShareData] = useState<ShareData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewerEmail, setViewerEmail] = useState('')

  useEffect(() => {
    if (code) {
      fetchShareData()
    }
  }, [code])

  const fetchShareData = async () => {
    try {
      const response = await fetch(`/api/share/${code}`)
      const data = await response.json()
      
      if (response.ok && data.isValid) {
        setShareData(data)
        // For shared documents, we'll use a generic viewer email
        setViewerEmail(data.userEmail || `shared-viewer-${Date.now()}@flipbook.drm`)
        
        // Record the view
        await fetch(`/api/share/${code}`, {
          method: 'POST'
        }).catch(err => console.warn('Failed to record view:', err))
        
      } else {
        setError(data.message || 'Share link is invalid')
      }
    } catch (error) {
      console.error('Error fetching share data:', error)
      setError('Failed to load shared document')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared document...</p>
        </div>
      </div>
    )
  }

  if (error || !shareData || !shareData.isValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Share Link Invalid
          </h1>
          <p className="text-gray-600 mb-6">
            {error || shareData?.message || 'This share link is invalid, expired, or has reached its maximum number of opens.'}
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    )
  }

  const { document } = shareData

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">📄 {document.title}</h1>
              <span className="ml-4 text-sm text-gray-500">
                Shared Document • {document.pageCount} pages
              </span>
              <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                Shared Access
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                🔗 Shared via FlipBook DRM
              </span>
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Secure Document Viewer */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <NativePDFViewer 
            documentId={document.id}
            title={document.title}
            userEmail={viewerEmail}
            onAccessDenied={() => {
              setError('Access denied to this shared document')
            }}
            onSecurityViolation={(violation) => {
              console.warn('Security violation on shared document:', violation)
              // Could implement stricter handling for shared documents
              if (violation.severity === 'high') {
                setError('Security violation detected. Access terminated.')
              }
            }}
          />
        </div>
      </div>

      {/* Shared Document Footer */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-600">
            <p>
              This document is shared securely through <strong>FlipBook DRM</strong>. 
              All access is monitored and logged for security purposes.
            </p>
            <div className="mt-2 flex items-center justify-center space-x-6">
              <span>🔒 DRM Protected</span>
              <span>💧 Watermarked</span>
              <span>📊 Access Tracked</span>
              <span>⏰ Session Limited</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}