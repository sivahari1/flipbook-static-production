'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'

export default function StorageDebugPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [databaseStatus, setDatabaseStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkStorage()
    checkDatabase()
  }, [])

  const checkStorage = () => {
    try {
      const stored = localStorage.getItem('flipbook-demo-documents')
      const docs = stored ? JSON.parse(stored) : []
      setDocuments(docs)
      console.log('📱 Documents in localStorage:', docs)
    } catch (error) {
      console.error('Error reading localStorage:', error)
    }
  }

  const checkDatabase = async () => {
    try {
      const response = await fetch('/api/debug/database-status')
      const data = await response.json()
      setDatabaseStatus(data)
      console.log('🔍 Database status:', data)
    } catch (error) {
      console.error('Error checking database:', error)
      setDatabaseStatus({ error: 'Failed to check database' })
    } finally {
      setLoading(false)
    }
  }

  const clearStorage = () => {
    localStorage.removeItem('flipbook-demo-documents')
    setDocuments([])
    alert('localStorage cleared!')
  }

  const testUpload = async () => {
    // Create a test document in localStorage
    const testDoc = {
      id: `test-${Date.now()}`,
      title: 'Test Document',
      description: 'This is a test document created for debugging',
      pageCount: 3,
      createdAt: new Date().toISOString(),
      fileName: 'test.pdf',
      fileSize: 12345,
      storageKey: 'test/test.pdf',
      owner: { email: 'test@example.com', role: 'CREATOR' },
      shareLinks: [],
      _count: { viewAudits: 0, shareLinks: 0 },
      hasPassphrase: false,
      viewAudits: [],
      demoMode: true
    }

    const existing = documents || []
    const updated = [testDoc, ...existing]
    
    localStorage.setItem('flipbook-demo-documents', JSON.stringify(updated))
    setDocuments(updated)
    alert('Test document added!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Storage Debug</h1>
        
        {/* Database Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Database Status</h2>
          {loading ? (
            <p>Checking database...</p>
          ) : (
            <div className="space-y-2">
              <p><strong>Configured:</strong> {databaseStatus?.configured ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Connected:</strong> {databaseStatus?.connected ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Message:</strong> {databaseStatus?.message}</p>
              {databaseStatus?.stats && (
                <div>
                  <p><strong>Users:</strong> {databaseStatus.stats.users}</p>
                  <p><strong>Documents:</strong> {databaseStatus.stats.documents}</p>
                </div>
              )}
              {databaseStatus?.error && (
                <p className="text-red-600"><strong>Error:</strong> {databaseStatus.error}</p>
              )}
            </div>
          )}
        </div>

        {/* localStorage Documents */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">localStorage Documents</h2>
            <div className="space-x-2">
              <button
                onClick={checkStorage}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Refresh
              </button>
              <button
                onClick={testUpload}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add Test Document
              </button>
              <button
                onClick={clearStorage}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Clear Storage
              </button>
            </div>
          </div>
          
          <p className="mb-4"><strong>Count:</strong> {documents.length} documents</p>
          
          {documents.length === 0 ? (
            <p className="text-gray-600">No documents found in localStorage</p>
          ) : (
            <div className="space-y-4">
              {documents.map((doc, index) => (
                <div key={doc.id || index} className="border rounded p-4">
                  <h3 className="font-semibold">{doc.title}</h3>
                  <p className="text-sm text-gray-600">ID: {doc.id}</p>
                  <p className="text-sm text-gray-600">Pages: {doc.pageCount}</p>
                  <p className="text-sm text-gray-600">Created: {new Date(doc.createdAt).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Demo Mode: {doc.demoMode ? 'Yes' : 'No'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <a
              href="/documents"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Documents Page
            </a>
            <a
              href="/upload"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Upload Document
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}