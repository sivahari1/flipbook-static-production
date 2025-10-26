'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/layout/Header'
import Link from 'next/link'
import { Upload, FileText, Share2, Shield, Eye, Calendar, ExternalLink, Copy, MoreVertical, Trash2, RefreshCw } from 'lucide-react'

interface Document {
  id: string
  title: string
  description: string | null
  pageCount: number
  createdAt: string
  owner: {
    email: string | null
    role: string | null
  }
  shareLinks: Array<{
    id: string
    code: string
    expiresAt: string | null
    maxOpens: number | null
    openCount: number
    createdAt: string
  }>
  _count: {
    viewAudits: number
    shareLinks: number
  }
  hasPassphrase: boolean
}

export default function DocumentsPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoadingDocs, setIsLoadingDocs] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      fetchDocuments()
    }
  }, [isAuthenticated])

  // Refresh documents when page becomes visible (user returns from upload)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        console.log('📱 Page became visible, refreshing documents...')
        fetchDocuments()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isAuthenticated])

  const fetchDocuments = async () => {
    try {
      setIsLoadingDocs(true)
      
      // Prepare headers with user email for authentication
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      // Add user email to headers if available
      if (user?.email) {
        headers['x-user-email'] = user.email
      }
      
      // Try main documents endpoint first
      let response = await fetch('/api/documents', {
        headers
      })
      
      // If main endpoint fails (500 - database not configured), use demo mode with client storage
      if (response.status === 500) {
        console.log('Database not configured, using demo documents...')
        
        // Get uploaded documents from localStorage
        let uploadedDocs = []
        try {
          const stored = localStorage.getItem('flipbook-demo-documents')
          uploadedDocs = stored ? JSON.parse(stored) : []
          console.log('📋 Found uploaded documents in localStorage:', uploadedDocs.length)
        } catch (e) {
          console.log('No uploaded documents found in localStorage')
        }
        
        // Get default demo documents
        const demoResponse = await fetch('/api/documents/demo')
        const demoData = await demoResponse.json()
        
        // Combine uploaded and demo documents
        const allDocuments = [...uploadedDocs, ...(demoData.documents || [])]
        
        setDocuments(allDocuments)
        if (uploadedDocs.length > 0) {
          setError(`Demo Mode: Showing ${uploadedDocs.length} uploaded document(s) and ${demoData.documents?.length || 0} sample documents.`)
        } else {
          setError('Demo Mode: Database not configured. Showing sample documents. Upload your own PDFs to see them here.')
        }
        return
      }
      
      const data = await response.json()
      
      if (data.success) {
        setDocuments(data.documents)
        if (data.demoMode) {
          setError('Demo Mode: Showing sample documents. Upload your own PDFs to see them here.')
        }
      } else {
        setError(data.error || 'Failed to fetch documents')
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      setError('Failed to load documents')
    } finally {
      setIsLoadingDocs(false)
    }
  }

  const createShareLink = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expiresAt: null, // No expiration
          maxOpens: null,  // Unlimited opens
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Refresh documents to show new share link
        fetchDocuments()
        
        // Copy share link to clipboard
        const shareUrl = `${window.location.origin}/share/${data.share.code}`
        await navigator.clipboard.writeText(shareUrl)
        alert('Share link created and copied to clipboard!')
      } else {
        alert('Failed to create share link: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating share link:', error)
      alert('Failed to create share link')
    }
  }

  const deleteDocument = async (documentId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

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
      
      if (response.ok) {
        alert('Document deleted successfully!')
        // Refresh documents list
        fetchDocuments()
      } else {
        const errorData = await response.json()
        alert(`Failed to delete document: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Failed to delete document')
    }
  }

  const copyShareLink = async (code: string) => {
    try {
      const shareUrl = `${window.location.origin}/share/${code}`
      await navigator.clipboard.writeText(shareUrl)
      alert('Share link copied to clipboard!')
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      alert('Failed to copy link')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // AuthProvider will handle redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Documents</h1>
            <p className="text-gray-600">Manage and share your protected documents</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchDocuments}
              disabled={isLoadingDocs}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Refresh documents list"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingDocs ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/upload"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Document</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {isLoadingDocs ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading documents...</p>
            </div>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="text-center py-12">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents yet</h3>
              <p className="text-gray-600 mb-6">Upload your first PDF to get started with secure document sharing</p>
              <Link
                href="/upload"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Document</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <h3 className="text-xl font-semibold text-gray-900">{doc.title}</h3>
                    </div>
                    
                    {doc.description && (
                      <p className="text-gray-600 mb-3">{doc.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <FileText className="w-4 h-4" />
                        <span>{doc.pageCount} pages</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{doc._count?.viewAudits || 0} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share2 className="w-4 h-4" />
                        <span>{doc._count?.shareLinks || 0} share links</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Created {new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Share Links */}
                    {doc.shareLinks.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Share Links:</h4>
                        <div className="space-y-2">
                          {doc.shareLinks.map((link) => (
                            <div key={link.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center space-x-3">
                                <ExternalLink className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    /share/{link.code}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {link.openCount} opens • Created {new Date(link.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => copyShareLink(link.code)}
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                <Copy className="w-4 h-4" />
                                <span>Copy</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      href={`/view/${doc.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </Link>
                    
                    <button
                      onClick={() => createShareLink(doc.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                    
                    <button
                      onClick={() => deleteDocument(doc.id, doc.title)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Secure Storage</h3>
            </div>
            <p className="text-gray-600">Your documents are encrypted and stored securely in the cloud with enterprise-grade protection.</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Share2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Easy Sharing</h3>
            </div>
            <p className="text-gray-600">Generate secure sharing links with customizable permissions and expiration dates.</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">DRM Protection</h3>
            </div>
            <p className="text-gray-600">Advanced DRM features prevent unauthorized copying, printing, and downloading.</p>
          </div>
        </div>
      </div>
    </div>
  )
}