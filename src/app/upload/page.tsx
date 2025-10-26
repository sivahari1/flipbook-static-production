'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/layout/Header'

export default function FastUploadPage() {
  const { user, isLoading, isAuthenticated } = useAuth()

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
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [uploadedDocument, setUploadedDocument] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    setUploadProgress(0)
    setMessage('Starting upload...')
    
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      
      // Validate form
      const title = formData.get('title') as string
      const file = formData.get('document') as File
      
      if (!title?.trim()) {
        throw new Error('Please enter a document title')
      }
      
      if (!file || file.size === 0) {
        throw new Error('Please select a PDF file')
      }
      
      if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('Please select a valid PDF file')
      }
      
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size must be less than 50MB')
      }
      
      setMessage('Uploading file...')
      
      // Progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 15
        })
      }, 200)
      
      // Prepare headers with user email for authentication
      const headers: HeadersInit = {}
      
      // Add user email to headers if available
      if (user?.email) {
        headers['x-user-email'] = user.email
      }
      
      // Try main upload endpoint first (saves to database)
      let response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers,
        body: formData
      })
      
      // If main endpoint fails due to database issues, try demo endpoint
      if (!response.ok && (response.status === 503 || response.status === 500)) {
        console.log('Database upload failed, trying demo upload...')
        response = await fetch('/api/documents/upload-demo', {
          method: 'POST',
          body: formData
        })
        
        // If demo also fails, try simple upload as final fallback
        if (!response.ok) {
          console.log('Demo upload failed, trying simple upload...')
          response = await fetch('/api/simple-upload', {
            method: 'POST',
            body: formData
          })
        }
      }
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      console.log('Upload response status:', response.status)
      console.log('Upload response headers:', Object.fromEntries(response.headers.entries()))
      
      let result
      try {
        const responseText = await response.text()
        console.log('Raw response:', responseText)
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse response:', parseError)
        throw new Error('Server returned invalid response. Check server logs.')
      }
      
      console.log('Parsed result:', result)
      
      if (!response.ok) {
        const errorMsg = result.error || result.details || `Server error (${response.status})`
        console.error('Upload failed with error:', errorMsg)
        throw new Error(errorMsg)
      }
      
      const successMsg = result.message || '✅ Upload successful!'
      setMessage(successMsg)
      setUploadedDocument(result.document)
      
      // Save to localStorage in demo mode (detect demo mode from response or document)
      const isDemoMode = result.demoMode || result.document?.demoMode || result.document?.id?.startsWith('demo-') || result.document?.id?.startsWith('simple-')
      
      if (result.document && isDemoMode) {
        try {
          const stored = localStorage.getItem('flipbook-demo-documents')
          const existingDocs = stored ? JSON.parse(stored) : []
          
          // Create document object for storage with all required fields
          const docForStorage = {
            id: result.document.id,
            title: result.document.title,
            description: result.document.description || null,
            pageCount: result.document.pageCount || 1,
            createdAt: result.document.createdAt || new Date().toISOString(),
            fileName: result.document.fileName || `${result.document.id}.pdf`,
            fileSize: result.document.fileSize || 0,
            storageKey: result.document.storageKey || `demo/${result.document.id}.pdf`,
            owner: { email: 'demo@example.com', role: 'CREATOR' },
            shareLinks: [],
            _count: { viewAudits: 0, shareLinks: 0 },
            hasPassphrase: false,
            viewAudits: [],
            demoMode: true
          }
          
          // Add to beginning of array
          existingDocs.unshift(docForStorage)
          
          // Save back to localStorage
          localStorage.setItem('flipbook-demo-documents', JSON.stringify(existingDocs))
          
          console.log('📱 Document saved to localStorage for demo mode:', docForStorage.title)
          console.log('📱 Total documents in localStorage:', existingDocs.length)
        } catch (storageError) {
          console.error('Failed to save to localStorage:', storageError)
        }
      } else {
        console.log('📱 Not saving to localStorage - not demo mode or no document')
        console.log('📱 Demo mode check:', { isDemoMode, hasDocument: !!result.document })
      }
      
      // Show additional success info
      console.log('🎉 SUCCESS! Document uploaded:', result.document?.title)
      console.log('📄 Document ID:', result.document?.id)
      console.log('📊 File size:', result.document?.fileSize, 'bytes')
      console.log('📑 Page count:', result.document?.pageCount)
      
      // Reset form
      ;(e.target as HTMLFormElement).reset()
      
    } catch (error) {
      console.error('Upload error:', error)
      setMessage(`❌ ${error instanceof Error ? error.message : 'Upload failed'}`)
    } finally {
      setIsUploading(false)
      if (!uploadedDocument) {
        setUploadProgress(0)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">📄 Flipbook DRM</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</a>
              <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Upload Document</h2>
            <p className="text-blue-100 text-sm mt-1">Upload your PDF to create a secure, shareable flipbook</p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF Document *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <div className="text-4xl mb-2">📄</div>
                  <input
                    type="file"
                    name="document"
                    accept=".pdf"
                    required
                    disabled={isUploading}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                  />
                  <p className="text-gray-500 text-sm mt-2">Select a PDF file (Max 50MB)</p>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  disabled={isUploading}
                  placeholder="Enter document title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  rows={3}
                  disabled={isUploading}
                  placeholder="Brief description of the document"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                />
              </div>

              {/* Security Options */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Security Options</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" name="watermark" defaultChecked disabled={isUploading} className="mr-2" />
                    <span className="text-sm text-gray-700">Add watermark</span>
                  </label>
                  <input
                    type="text"
                    name="watermarkText"
                    placeholder="Watermark text (e.g., Company Name)"
                    disabled={isUploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                  />
                  <label className="flex items-center">
                    <input type="checkbox" name="preventDownload" defaultChecked disabled={isUploading} className="mr-2" />
                    <span className="text-sm text-gray-700">Prevent downloads</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" name="trackViews" defaultChecked disabled={isUploading} className="mr-2" />
                    <span className="text-sm text-gray-700">Track views</span>
                  </label>
                </div>
              </div>

              {/* Progress Bar */}
              {isUploading && (
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {/* Status Message */}
              {message && (
                <div className={`p-4 rounded-lg ${
                  message.startsWith('✅') 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : message.startsWith('❌')
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}>
                  {message}
                </div>
              )}

              {/* Success Info */}
              {uploadedDocument && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <div className="text-green-500 text-2xl mr-3">🎉</div>
                    <h3 className="text-green-800 font-bold text-lg">Upload Successful!</h3>
                  </div>
                  <div className="text-green-700 space-y-2">
                    <p><strong>📄 Title:</strong> {uploadedDocument.title}</p>
                    <p><strong>📑 Pages:</strong> {uploadedDocument.pageCount}</p>
                    <p><strong>🆔 Document ID:</strong> {uploadedDocument.id}</p>
                    <p><strong>📊 File Size:</strong> {(uploadedDocument.fileSize / 1024).toFixed(1)} KB</p>
                    {uploadedDocument.demoMode && (
                      <p className="text-green-600 bg-green-100 p-2 rounded text-sm">
                        <strong>ℹ️ Demo Mode:</strong> File processed successfully! For full features like sharing and analytics, configure the database.
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <button 
                      onClick={() => {
                        setUploadedDocument(null)
                        setMessage('')
                        setUploadProgress(0)
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      ✅ Upload Another Document
                    </button>
                    <a 
                      href="/dashboard" 
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      📊 Go to Dashboard
                    </a>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <a
                  href="/dashboard"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </a>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isUploading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  )}
                  {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">What happens after upload?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start">
              <div className="text-blue-500 mr-2">🔒</div>
              <div>Your PDF is encrypted and secured with DRM protection</div>
            </div>
            <div className="flex items-start">
              <div className="text-green-500 mr-2">🔗</div>
              <div>A unique sharing link is generated for secure access</div>
            </div>
            <div className="flex items-start">
              <div className="text-purple-500 mr-2">📊</div>
              <div>View analytics and manage access from your dashboard</div>
            </div>
            <div className="flex items-start">
              <div className="text-red-500 mr-2">🚫</div>
              <div>Recipients can only view - downloads are prevented</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}