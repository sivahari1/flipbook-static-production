'use client'

import { useState, useEffect } from 'react'

interface SimplePDFViewerProps {
  documentId: string
  title?: string
}

export function SimplePDFViewer({ documentId, title }: SimplePDFViewerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simple timeout to show loading state briefly
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF document...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-gray-100 rounded-lg">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Direct PDF URL - this will always work
  const pdfUrl = `/api/documents/${documentId}/simple-file`

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Simple Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title || 'Document'}</h2>
          <p className="text-sm text-gray-600">PDF Document Viewer</p>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="relative bg-gray-100">
        <iframe
          src={pdfUrl}
          className="w-full h-[800px] border-0"
          title={`PDF Viewer - ${title || 'Document'}`}
          style={{
            minHeight: '800px'
          }}
          onError={() => {
            setError('Failed to load PDF document')
          }}
        />
      </div>

      {/* Simple Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <span>📄 PDF Document</span>
          <span>FlipBook DRM</span>
        </div>
      </div>
    </div>
  )
}