'use client'

import { useState, useEffect } from 'react'

interface DatabaseStatus {
  status: string
  message: string
  info?: any
  stats?: any
  error?: string
  suggestions?: string[]
}

export default function SetupPage() {
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const checkDatabaseStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/database-status')
      const data = await response.json()
      setDbStatus(data)
    } catch (error) {
      setDbStatus({
        status: 'error',
        message: 'Failed to check database status',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-800 bg-green-50 border-green-200'
      case 'not_configured': return 'text-yellow-800 bg-yellow-50 border-yellow-200'
      case 'connection_error': return 'text-red-800 bg-red-50 border-red-200'
      default: return 'text-gray-800 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '✅'
      case 'not_configured': return '⚠️'
      case 'connection_error': return '❌'
      default: return '❓'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Flipbook DRM Setup
          </h1>
          <p className="text-gray-600">
            Configure your Supabase database for production deployment
          </p>
        </div>

        {/* Database Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Database Status</h2>
            <button
              onClick={checkDatabaseStatus}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Refresh'}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Checking database status...</span>
            </div>
          ) : dbStatus ? (
            <div className={`p-4 rounded-lg border ${getStatusColor(dbStatus.status)}`}>
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{getStatusIcon(dbStatus.status)}</span>
                <h3 className="font-semibold text-lg">{dbStatus.message}</h3>
              </div>
              
              {dbStatus.info && (
                <div className="mt-3 text-sm">
                  <p><strong>Provider:</strong> {dbStatus.info.provider}</p>
                  <p><strong>Type:</strong> {dbStatus.info.type}</p>
                  {dbStatus.info.url && <p><strong>URL:</strong> {dbStatus.info.url}</p>}
                </div>
              )}

              {dbStatus.stats && (
                <div className="mt-3 text-sm">
                  <p><strong>Users in database:</strong> {dbStatus.stats.users}</p>
                  <p><strong>Connection:</strong> {dbStatus.stats.connection}</p>
                </div>
              )}

              {dbStatus.error && (
                <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded text-sm">
                  <strong>Error:</strong> {dbStatus.error}
                </div>
              )}

              {dbStatus.suggestions && (
                <div className="mt-3">
                  <strong className="text-sm">Suggestions:</strong>
                  <ul className="list-disc list-inside text-sm mt-1">
                    {dbStatus.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Setup Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🔧 Setup Instructions</h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-blue-800">Step 1: Create Supabase Project</h3>
              <p className="text-gray-600 text-sm mt-1">
                Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">supabase.com</a> and create a new project
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-green-800">Step 2: Get Database URL</h3>
              <p className="text-gray-600 text-sm mt-1">
                In Supabase Dashboard → Settings → Database → Connection string (URI format)
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-purple-800">Step 3: Configure Vercel</h3>
              <p className="text-gray-600 text-sm mt-1">
                Add DATABASE_URL environment variable in Vercel project settings
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold text-orange-800">Step 4: Deploy Schema</h3>
              <p className="text-gray-600 text-sm mt-1">
                Run <code className="bg-gray-100 px-2 py-1 rounded">npx prisma db push</code> to create tables
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📖 Detailed Setup Guide</h4>
            <p className="text-blue-700 text-sm">
              For complete step-by-step instructions, see the{' '}
              <a 
                href="/SUPABASE_VERCEL_SETUP.md" 
                target="_blank" 
                className="underline font-medium"
              >
                Supabase + Vercel Setup Guide
              </a>
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🚀 Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/upload"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">📄 Test Upload</h3>
              <p className="text-gray-600 text-sm">Try uploading a PDF to test functionality</p>
            </a>
            
            <a
              href="/dashboard"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">📊 Dashboard</h3>
              <p className="text-gray-600 text-sm">View your documents and analytics</p>
            </a>
            
            <a
              href="/auth/sign-up"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">👤 Create Account</h3>
              <p className="text-gray-600 text-sm">Register a new user account</p>
            </a>
            
            <a
              href="/test-upload"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">🧪 Test Upload</h3>
              <p className="text-gray-600 text-sm">Simple upload test without database</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}