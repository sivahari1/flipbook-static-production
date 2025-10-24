'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Share2 } from 'lucide-react'

interface IframePDFViewerProps {
  documentId: string
  fileUrl?: string
  title?: string
}

export function IframePDFViewer({ documentId, fileUrl, title }: IframePDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    loadPDFUrl()
  }, [fileUrl, documentId])

  const loadPDFUrl = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // First, try to get document info
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      // Add user email if available (for authentication)
      const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail')
      if (userEmail) {
        headers['x-user-email'] = userEmail
      }

      const response = await fetch(`/api/documents/${documentId}`, { headers })
      
      if (!response.ok) {
        throw new Error(`Document not found or access denied (${response.status})`)
      }

      const docData = await response.json()
      
      if (!docData.success) {
        throw new Error(docData.error || 'Failed to load document')
      }

      // Construct the PDF file URL
      const pdfFileUrl = `/api/documents/${documentId}/file`
      
      // Test if the PDF file is accessible
      const fileResponse = await fetch(pdfFileUrl, { 
        method: 'HEAD',
        headers: userEmail ? { 'x-user-email': userEmail } : {}
      })
      
      if (fileResponse.ok) {
        setPdfUrl(pdfFileUrl)
        setIsLoading(false)
      } else if (fileResponse.status === 404) {
        // File not found, show a helpful message
        setError('PDF file not found. This might be a newly uploaded document that needs processing.')
        setIsLoading(false)
      } else if (fileResponse.status === 403) {
        setError('Access denied. You do not have permission to view this document.')
        setIsLoading(false)
      } else {
        throw new Error(`PDF file not accessible (${fileResponse.status})`)
      }
      
    } catch (error) {
      console.error('Error loading PDF URL:', error)
      setError(error instanceof Error ? error.message : 'Failed to load PDF document')
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `${title || 'document'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleShare = async () => {
    if (pdfUrl) {
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('Document link copied to clipboard!')
      } catch (error) {
        console.error('Failed to copy link:', error)
      }
    }
  }

  if (isLoading) {
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
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading PDF</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadPDFUrl}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* PDF Viewer Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title || 'PDF Document'}</h2>
          <p className="text-sm text-gray-600">
            Secure PDF Viewer with DRM Protection
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Share Document"
          >
            <Share2 className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleDownload}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Download PDF"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF Content Area with Watermark */}
      <div className="relative bg-gray-100 min-h-[700px]">
        {/* Watermark Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 text-4xl font-bold text-gray-200 opacity-20">
            FLIPBOOK DRM
          </div>
        </div>
        
        {/* PDF Iframe with fallback */}
        {pdfUrl && (
          <div className="relative w-full h-[700px]">
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
              className="w-full h-full border-0"
              title={title || 'PDF Document'}
              onLoad={() => {
                console.log('PDF iframe loaded successfully')
                setIsLoading(false)
              }}
              onError={(e) => {
                console.error('PDF iframe failed to load:', e)
                setError('PDF viewer failed to load. Click download to view the file.')
              }}
            />
            
            {/* Fallback message if iframe fails */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
              <div className="text-center p-4">
                <p className="text-sm text-gray-600 mb-2">
                  If the PDF doesn't display properly, click the download button above.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              DRM Protected
            </span>
            <span>Secure Viewing</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>FlipBook DRM Platform</span>
          </div>
        </div>
      </div>
    </div>
  )
}