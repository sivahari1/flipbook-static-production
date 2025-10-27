'use client'

import { useState } from 'react'

export default function FixStoragePage() {
  const [initStatus, setInitStatus] = useState<any>(null)
  const [migrateStatus, setMigrateStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const initializeStorage = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/init-storage')
      const data = await response.json()
      setInitStatus(data)
    } catch (error) {
      setInitStatus({ success: false, error: 'Failed to initialize storage' })
    } finally {
      setLoading(false)
    }
  }

  const migrateDocuments = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/migrate-storage', { method: 'POST' })
      const data = await response.json()
      setMigrateStatus(data)
    } catch (error) {
      setMigrateStatus({ success: false, error: 'Failed to migrate documents' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Fix Storage Issue</h1>
        
        <div className="space-y-6">
          {/* Step 1: Initialize Storage */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Step 1: Initialize Supabase Storage</h2>
            <p className="text-gray-600 mb-4">
              This will create the necessary storage bucket in your Supabase project.
            </p>
            
            <button
              onClick={initializeStorage}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Initializing...' : 'Initialize Storage'}
            </button>
            
            {initStatus && (
              <div className={`mt-4 p-4 rounded-lg ${initStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <pre className="text-sm">{JSON.stringify(initStatus, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Step 2: Migrate Documents */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Step 2: Migrate Existing Documents</h2>
            <p className="text-gray-600 mb-4">
              This will move your existing documents to Supabase Storage and generate sample PDFs for documents that lost their files.
            </p>
            
            <button
              onClick={migrateDocuments}
              disabled={loading || !initStatus?.success}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Migrating...' : 'Migrate Documents'}
            </button>
            
            {migrateStatus && (
              <div className={`mt-4 p-4 rounded-lg ${migrateStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <pre className="text-sm">{JSON.stringify(migrateStatus, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-800 mb-4">📋 What This Does:</h3>
            <ul className="text-blue-700 space-y-2">
              <li>✅ Creates a secure storage bucket in your Supabase project</li>
              <li>✅ Migrates existing documents to persistent storage</li>
              <li>✅ Generates sample PDFs for documents that lost their files</li>
              <li>✅ Updates database records with new storage locations</li>
              <li>✅ Ensures all future uploads use persistent storage</li>
            </ul>
            
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> Since the original PDF files were lost due to serverless storage limitations, 
                the migration will create sample PDFs for your existing documents. New uploads will work perfectly!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}