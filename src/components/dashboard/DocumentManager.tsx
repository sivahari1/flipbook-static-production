'use client'

import { useState, useEffect } from 'react'

interface Document {
  id: string
  title: string
  description?: string
  pageCount: number
  createdAt: string
  owner: {
    email: string
    role: string
  }
  shareLinks: Array<{
    id: string
    code: string
    expiresAt?: string
    maxOpens?: number
    openCount: number
    createdAt: string
  }>
  _count: {
    viewAudits: number
    shareLinks: number
  }
}

interface ShareModalProps {
  document: Document
  isOpen: boolean
  onClose: () => void
  onShare: (shareData: any) => void
}

function ShareModal({ document, isOpen, onClose, onShare }: ShareModalProps) {
  const [expiresIn, setExpiresIn] = useState(7)
  const [maxOpens, setMaxOpens] = useState('')
  const [requirePassword, setRequirePassword] = useState(false)
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/documents/${document.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expiresIn,
          maxOpens: maxOpens ? parseInt(maxOpens) : null,
          requirePassword,
          description: description || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create share link')
      }

      const data = await response.json()
      onShare(data.shareLink)
      onClose()
    } catch (error) {
      console.error('Error creating share link:', error)
      alert('Failed to create share link')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Share Document</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-900">{document.title}</h4>
          <p className="text-sm text-gray-600">{document.pageCount} pages</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expires in (days)
            </label>
            <select
              value={expiresIn}
              onChange={(e) => setExpiresIn(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value={1}>1 day</option>
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={0}>Never expires</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max opens (optional)
            </label>
            <input
              type="number"
              value={maxOpens}
              onChange={(e) => setMaxOpens(e.target.value)}
              placeholder="Unlimited"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share description"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="requirePassword"
              checked={requirePassword}
              onChange={(e) => setRequirePassword(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="requirePassword" className="text-sm text-gray-700">
              Require password (coming soon)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Share Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [shareModal, setShareModal] = useState<{ isOpen: boolean; document?: Document }>({
    isOpen: false
  })
  const [shareLinks, setShareLinks] = useState<any[]>([])

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents')
      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }
      const data = await response.json()
      setDocuments(data.documents)
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = (document: Document) => {
    setShareModal({ isOpen: true, document })
  }

  const handleShareCreated = (shareLink: any) => {
    setShareLinks([...shareLinks, shareLink])
    // Refresh documents to get updated share count
    fetchDocuments()
    
    // Show success message with share URL
    alert(`Share link created successfully!\n\nURL: ${shareLink.url}\n\nYou can copy this link to share the document.`)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Your Documents
        </h3>
        <div className="text-center py-12 text-gray-500">
          <div className="text-5xl mb-4">📄</div>
          <p className="mb-4">No documents uploaded yet</p>
          <a
            href="/documents/new"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Upload Your First Document
          </a>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Your Documents ({documents.length})
        </h3>
        
        <div className="space-y-4">
          {documents.map((document) => (
            <div
              key={document.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {document.title}
                  </h4>
                  {document.description && (
                    <p className="text-gray-600 mb-3">{document.description}</p>
                  )}
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span>📄 {document.pageCount} pages</span>
                    <span>👁️ {document._count?.viewAudits || 0} views</span>
                    <span>🔗 {document._count?.shareLinks || 0} share links</span>
                    <span>📅 {new Date(document.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleShare(document)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    🔗 Share
                  </button>
                  <a
                    href={`/view/${document.id}`}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors inline-block"
                  >
                    👁️ View
                  </a>
                </div>
              </div>
              
              {document.shareLinks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Recent Share Links:</h5>
                  <div className="space-y-2">
                    {document.shareLinks.slice(0, 3).map((link) => (
                      <div key={link.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {link.code.substring(0, 8)}...
                          </code>
                          <span className="text-gray-600">
                            {link.openCount} opens
                          </span>
                          {link.expiresAt && (
                            <span className="text-gray-500">
                              expires {new Date(link.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            const url = `${window.location.origin}/share/${link.code}`
                            navigator.clipboard.writeText(url)
                            alert('Share link copied to clipboard!')
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          📋 Copy
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ShareModal
        document={shareModal.document!}
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false })}
        onShare={handleShareCreated}
      />
    </>
  )
}