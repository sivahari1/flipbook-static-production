'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Share2, Shield, Eye } from 'lucide-react'

interface DemoDocument {
  id: string
  title: string
  description: string
  pageCount: number
  createdAt: string
  fileName: string
  fileSize: number
  demoMode: boolean
}

export default function DemoViewPage() {
  const params = useParams()
  const [document, setDocument] = useState<DemoDocument | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchDocument()
  }, [params.id])

  const fetchDocument = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/documents/demo/${params.id}`)
      const data = await response.json()
      
      if (data.success) {
        setDocument(data.document)
      } else {
        setError(data.error || 'Document not found')
      }
    } catch (error) {
      console.error('Error fetching document:', error)
      setError('Failed to load document')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading document...</p>
        </div>
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            href="/documents" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Documents
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link 
                href="/documents" 
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{document.title}</h1>
                <p className="text-sm text-gray-500">
                  {document.pageCount} pages • {(document.fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Shield className="w-3 h-3 mr-1" />
                Demo Mode
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-blue-500 text-xl mr-3">ℹ️</div>
            <div>
              <h3 className="text-blue-800 font-medium">Demo Document Viewer</h3>
              <p className="text-blue-700 text-sm mt-1">
                This is a demonstration of the document viewer. In full mode, your actual PDF would be displayed here with DRM protection.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Viewer Controls */}
          <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {document.pageCount}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(document.pageCount, currentPage + 1))}
                disabled={currentPage === document.pageCount}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center px-3 py-1 text-gray-600 hover:text-gray-900">
                <Eye className="w-4 h-4 mr-1" />
                Views: 0
              </button>
            </div>
          </div>

          {/* Demo PDF Display */}
          <div className="p-8 text-center bg-gray-100 min-h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Demo PDF Page {currentPage}</h3>
              <p className="text-gray-500 mb-4">
                This represents page {currentPage} of "{document.title}"
              </p>
              <div className="bg-white p-6 rounded-lg shadow-sm max-w-md mx-auto">
                <div className="text-gray-400 text-sm mb-2">DEMO WATERMARK</div>
                <div className="h-32 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-500">PDF Content Would Appear Here</span>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Protected by FlipBook DRM • Page {currentPage}/{document.pageCount}
                </div>
              </div>
            </div>
          </div>

          {/* Document Info */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">File Name:</span>
                <span className="text-gray-600 ml-2">{document.fileName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <span className="text-gray-600 ml-2">
                  {new Date(document.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Protection:</span>
                <span className="text-green-600 ml-2">✓ DRM Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              <strong>Demo Mode:</strong> To view actual PDFs and enable full functionality, configure the database connection.
            </p>
          </div>
          <Link 
            href="/upload" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Upload Your Own PDF
          </Link>
        </div>
      </div>
    </div>
  )
}