'use client'

import { useState, useEffect } from 'react'
import { Download, Share2, FileText, Eye, Shield } from 'lucide-react'

interface DownloadPDFViewerProps {
  documentId: string
  fileUrl?: string
  title?: string
}

export function DownloadPDFViewer({ documentId, fileUrl, title }: DownloadPDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [document, setDocument] = useState<any>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    loadDocumentInfo()
  }, [documentId])

  const loadDocumentInfo = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get user email for authentication
      const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail')
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
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

      setDocument(docData.document)
      setPdfUrl(`/api/documents/${documentId}/file`)
      setIsLoading(false)
      
    } catch (error) {
      console.error('Error loading document:', error)
      setError(error instanceof Error ? error.message : 'Failed to load document')
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!pdfUrl) return

    try {
      const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail')
      const headers: HeadersInit = {}
      
      if (userEmail) {
        headers['x-user-email'] = userEmail
      }

      const response = await fetch(pdfUrl, { headers })
      
      if (!response.ok) {
        throw new Error('Failed to download PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${title || 'document'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download PDF. Please try again.')
    }
  }

  const handleViewInBrowser = () => {
    if (pdfUrl) {
      const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail')
      const urlWithAuth = userEmail ? `${pdfUrl}?email=${encodeURIComponent(userEmail)}` : pdfUrl
      window.open(urlWithAuth, '_blank')
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Document link copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document information...</p>
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
              Make sure the development server is running with <code>npm run dev</code>
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
              Secure PDF Viewer with DRM Protection
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
        </div>
      </div>

      {/* Document Info */}
      <div className="p-6 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
              <p className="text-sm font-medium text-gray-900">Access Level</p>
              <p className="text-sm text-gray-600">{document?.accessLevel || 'Viewer'}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleViewInBrowser}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Eye className="w-5 h-5" />
            <span>View in Browser</span>
          </button>
          
          <button
            onClick={handleDownload}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* DRM Notice */}
      <div className="p-6 bg-yellow-50 border-t">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">DRM Protection Active</h4>
            <p className="text-sm text-yellow-700 mt-1">
              This document is protected by FlipBook DRM. Viewing and downloading are logged for security purposes.
              The document may include watermarks and access restrictions as configured by the owner.
            </p>
          </div>
        </div>
      </div>

      {/* Watermark Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-10">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 text-4xl font-bold text-gray-400">
          FLIPBOOK DRM
        </div>
      </div>
    </div>
  )
}