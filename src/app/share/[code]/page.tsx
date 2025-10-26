'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

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
}

export default function SharePage() {
  const params = useParams()
  const code = params.code as string
  const [shareData, setShareData] = useState<ShareData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  useEffect(() => {
    if (code) {
      fetchShareData()
    }
  }, [code])

  const fetchShareData = async () => {
    try {
      // Handle demo share links
      if (code?.startsWith('demo-share-')) {
        console.log('Handling demo share link:', code)
        
        // Extract document ID from demo share code
        const documentId = code.replace('demo-share-', '').replace(/^demo-share-/, '')
        
        // Create demo share data
        const demoShareData: ShareData = {
          document: {
            id: documentId || 'demo-sample-1',
            title: 'Demo Document',
            description: 'This is a demo document shared via FlipBook DRM',
            pageCount: 5,
            createdAt: new Date().toISOString()
          },
          shareLink: {
            id: code,
            code: code,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            maxOpens: null,
            openCount: Math.floor(Math.random() * 10),
            requirePass: false
          },
          isValid: true,
          message: 'Demo share link - full functionality available'
        }
        
        setShareData(demoShareData)
        setLoading(false)
        return
      }
      
      const response = await fetch(`/api/share/${code}`)
      const data = await response.json()
      
      if (response.ok && data.isValid) {
        setShareData(data)
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

  const handleViewDocument = async () => {
    try {
      // Record the view
      await fetch(`/api/share/${code}`, {
        method: 'POST'
      })
      
      // Redirect to secure shared document viewer
      window.location.href = `/view/shared/${code}`
    } catch (error) {
      console.error('Error recording view:', error)
      // Still redirect even if view recording fails
      window.location.href = `/view/shared/${code}`
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

  const { document, shareLink } = shareData

  if (showPasswordForm && shareLink.requirePass) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Password Required
            </h1>
            <p className="text-gray-600">
              This document requires a password to access
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleViewDocument(); }}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Access Document
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📄 Flipbook DRM</h1>
              <p className="text-gray-600">Secure Document Sharing</p>
            </div>
            <a
              href="/"
              className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>

      {/* Document Info */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📄</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {document.title}
            </h2>
            {document.description && (
              <p className="text-gray-600 mb-4">{document.description}</p>
            )}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <span>📄 {document.pageCount} pages</span>
              <span>👁️ {shareLink.openCount} views</span>
              {shareLink.expiresAt && (
                <span>⏰ Expires {new Date(shareLink.expiresAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleViewDocument}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
            >
              🔓 View Document
            </button>
          </div>

          {/* Security Features */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              🔒 Security Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">🔐</div>
                <h4 className="font-medium text-gray-900">DRM Protected</h4>
                <p className="text-sm text-gray-600">Copy and print protection</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">💧</div>
                <h4 className="font-medium text-gray-900">Watermarked</h4>
                <p className="text-sm text-gray-600">Dynamic user watermarks</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-medium text-gray-900">Tracked</h4>
                <p className="text-sm text-gray-600">Access monitoring</p>
              </div>
            </div>
          </div>

          {/* Share Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              <strong>Note:</strong> This document is shared securely through Flipbook DRM. 
              All access is monitored and logged for security purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}