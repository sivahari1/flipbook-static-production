'use client'

import { useState, useEffect } from 'react'
import { Download, Share2, FileText, Eye, Shield, Trash2, Maximize2, Minimize2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// Inline PDF Viewer Component
function InlinePDFViewer({ documentId, title }: { documentId: string, title?: string }) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }
  
  return (
    <>
      <div className={`relative bg-white rounded-lg border-2 border-gray-200 overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50' : 'h-[600px]'}`}>
        {/* PDF Viewer Header */}
        <div className="flex items-center justify-between p-3 bg-gray-100 border-b">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {title || 'PDF Document'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        {/* PDF Preview Placeholder */}
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Ready for Viewing</h3>
            <p className="text-gray-600 mb-4">
              Click "Download PDF" or "Open in New Tab" below to view the document.
            </p>
            <div className="text-sm text-gray-500">
              In-browser PDF viewing is temporarily disabled due to security restrictions.
            </div>
          </div>
        </div>
      </div>
      
      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-40"
          onClick={toggleFullscreen}
        />
      )}
    </>
  )
}

interface SimplePDFDisplayProps {
  documentId: string
  title?: string
  onDelete?: () => void
}

export function SimplePDFDisplay({ documentId, title, onDelete }: SimplePDFDisplayProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [document, setDocument] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    loadDocumentInfo()
  }, [documentId])

  const loadDocumentInfo = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      // Add user email to headers if available
      if (user?.email) {
        headers['x-user-email'] = user.email
      }

      const response = await fetch(`/api/documents/${documentId}`, {
        headers
      })
      
      if (!response.ok) {
        throw new Error(`Failed to load document (${response.status})`)
      }

      const docData = await response.json()
      
      if (!docData.success) {
        throw new Error(docData.error || 'Failed to load document')
      }

      setDocument(docData.document)
      setIsLoading(false)
      
    } catch (error) {
      console.error('Error loading document:', error)
      setError(error instanceof Error ? error.message : 'Failed to load document')
      setIsLoading(false)
    }
  }

  const getPdfUrl = () => {
    const baseUrl = `/api/documents/${documentId}/file`
    if (user?.email) {
      return `${baseUrl}?userEmail=${encodeURIComponent(user.email)}`
    }
    return baseUrl
  }

  const handleDownload = () => {
    const pdfUrl = getPdfUrl()
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `${title || 'document'}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleViewInBrowser = () => {
    const pdfUrl = getPdfUrl()
    window.open(pdfUrl, '_blank')
  }

  const handleShare = async () => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (user?.email) {
        headers['x-user-email'] = user.email
      }

      const response = await fetch(`/api/documents/${documentId}/share`, {
        method: 'POST',
        headers
      })
      
      if (response.ok) {
        const data = await response.json()
        const shareUrl = data.share.url
        
        // Copy to clipboard
        await navigator.clipboard.writeText(shareUrl)
        
        alert(`Share link created and copied to clipboard!\n\n${shareUrl}\n\nThis link will expire in 30 days.`)
      } else {
        const errorData = await response.json()
        alert(`Failed to create share link: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error creating share link:', error)
      // Fallback to current page URL
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('Document link copied to clipboard!')
      } catch (clipboardError) {
        alert('Failed to create share link. Please try again.')
      }
    }
  }

  const handleDelete = async () => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (user?.email) {
        headers['x-user-email'] = user.email
      }

      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers
      })

      if (!response.ok) {
        throw new Error('Failed to delete document')
      }

      alert('Document deleted successfully!')
      if (onDelete) {
        onDelete()
      } else {
        // Redirect to documents page
        window.location.href = '/documents'
      }
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete document. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-gray-100 rounded-lg">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Document</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={loadDocumentInfo}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-2"
            >
              Try Again
            </button>
            <p className="text-sm text-gray-500">
              Make sure the development server is running
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title || 'PDF Document'}</h2>
            <p className="text-sm text-gray-600">
              {document?.pageCount || 'Unknown'} pages • DRM Protected
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Share Document"
          >
            <Share2 className="w-5 h-5" />
          </button>
          
          {document?.canEdit && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              title="Delete Document"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* PDF Preview Area */}
      <div className="p-6 bg-gray-50">
        <InlinePDFViewer documentId={documentId} title={title} />
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            onClick={handleDownload}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Download PDF</span>
          </button>
          
          <button
            onClick={handleViewInBrowser}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Eye className="w-5 h-5" />
            <span>Open in New Tab</span>
          </button>
        </div>
      </div>

      {/* Document Info */}
      <div className="p-6 border-t">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Pages</p>
              <p className="text-sm text-gray-600">{document?.pageCount || 'Unknown'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Protection</p>
              <p className="text-sm text-gray-600">DRM Protected</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Access</p>
              <p className="text-sm text-gray-600">{document?.accessLevel || 'Viewer'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-100 rounded-full mr-3">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Document</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{title}"? This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  handleDelete()
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}