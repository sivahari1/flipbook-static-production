'use client'

import { useState, useEffect } from 'react'

export default function FullDiagnosticPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploadTest, setUploadTest] = useState<any>(null)
  const [uploadLoading, setUploadLoading] = useState(false)

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug-full')
      const data = await response.json()
      setDiagnostics(data)
    } catch (error) {
      setDiagnostics({
        error: 'Failed to run diagnostics',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const testUpload = async () => {
    setUploadLoading(true)
    setUploadTest(null)
    
    try {
      // Create a simple test file
      const testContent = 'This is a test file for upload functionality'
      const blob = new Blob([testContent], { type: 'text/plain' })
      const file = new File([blob], 'test.txt', { type: 'text/plain' })
      
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/test-upload', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      setUploadTest({
        success: response.ok,
        status: response.status,
        data: result
      })
    } catch (error) {
      setUploadTest({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setUploadLoading(false)
    }
  }

  const getEnvStatus = (envVar: any) => {
    if (!envVar.exists) return { color: 'text-red-600', icon: '❌', status: 'Missing' }
    if (envVar.length < 10) return { color: 'text-yellow-600', icon: '⚠️', status: 'Too Short' }
    return { color: 'text-green-600', icon: '✅', status: 'OK' }
  }

  const getPrismaStatus = (prismaStatus: any) => {
    if (prismaStatus === 'checking...') return { color: 'text-blue-600', icon: '🔄', status: 'Checking...' }
    if (prismaStatus.status === 'connected') return { color: 'text-green-600', icon: '✅', status: 'Connected' }
    return { color: 'text-red-600', icon: '❌', status: 'Failed' }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">🔍 Full System Diagnostics</h1>
          <p className="text-gray-600">Complete analysis of your Supabase + Vercel setup</p>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">System Status</h2>
          <div className="space-x-4">
            <button
              onClick={runDiagnostics}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Running...' : 'Refresh Diagnostics'}
            </button>
            <button
              onClick={testUpload}
              disabled={uploadLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {uploadLoading ? 'Testing...' : 'Test Upload'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Running comprehensive diagnostics...</p>
          </div>
        ) : diagnostics ? (
          <div className="space-y-6">
            {/* Environment Variables */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">🔧 Environment Variables</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(diagnostics.env_variables || {}).map(([key, value]: [string, any]) => {
                  const status = getEnvStatus(value)
                  return (
                    <div key={key} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{key}</span>
                        <span className={`${status.color} flex items-center`}>
                          {status.icon} {status.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Length: {value.length}</p>
                        {value.starts_with && <p>Starts with: {value.starts_with}</p>}
                        {value.value && value.value !== 'Not set' && <p>Value: {value.value}</p>}
                        {value.contains_supabase !== undefined && (
                          <p>Contains 'supabase': {value.contains_supabase ? '✅' : '❌'}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Database Connection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">🗄️ Database Connection</h3>
              <div className="border rounded-lg p-4">
                {(() => {
                  const status = getPrismaStatus(diagnostics.prisma_status)
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-medium">Prisma Connection</span>
                        <span className={`${status.color} flex items-center`}>
                          {status.icon} {status.status}
                        </span>
                      </div>
                      
                      {diagnostics.prisma_status.status === 'connected' && (
                        <div className="space-y-2 text-sm">
                          <p className="text-green-600">✅ Database connection successful!</p>
                          <p>Tables exist: {diagnostics.prisma_status.tables_exist ? '✅ Yes' : '❌ No (run prisma db push)'}</p>
                          {diagnostics.prisma_status.result && (
                            <details className="mt-2">
                              <summary className="cursor-pointer font-medium">Database Info</summary>
                              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                                {JSON.stringify(diagnostics.prisma_status.result, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      )}
                      
                      {diagnostics.prisma_status.status === 'error' && (
                        <div className="space-y-2 text-sm">
                          <p className="text-red-600">❌ Database connection failed</p>
                          <p className="text-red-600">Error: {diagnostics.prisma_status.error}</p>
                          {diagnostics.prisma_status.stack && (
                            <details className="mt-2">
                              <summary className="cursor-pointer font-medium">Error Stack</summary>
                              <pre className="mt-2 text-xs bg-red-50 p-2 rounded overflow-auto">
                                {diagnostics.prisma_status.stack}
                              </pre>
                            </details>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Upload Test Results */}
            {uploadTest && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">📤 Upload Test Results</h3>
                <div className={`border rounded-lg p-4 ${uploadTest.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Upload Test</span>
                    <span className={uploadTest.success ? 'text-green-600' : 'text-red-600'}>
                      {uploadTest.success ? '✅ Success' : '❌ Failed'}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>Status: {uploadTest.status}</p>
                    {uploadTest.error && <p className="text-red-600">Error: {uploadTest.error}</p>}
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium">Full Response</summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(uploadTest.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              </div>
            )}

            {/* System Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">ℹ️ System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Environment:</span> {diagnostics.environment}
                </div>
                <div>
                  <span className="font-medium">Vercel Env:</span> {diagnostics.vercel_env || 'Not set'}
                </div>
                <div>
                  <span className="font-medium">Timestamp:</span> {new Date(diagnostics.timestamp).toLocaleString()}
                </div>
              </div>
              
              {diagnostics.all_env_keys && diagnostics.all_env_keys.length > 0 && (
                <div className="mt-4">
                  <span className="font-medium">Database-related env keys found:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {diagnostics.all_env_keys.map((key: string) => (
                      <span key={key} className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {key}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Troubleshooting Guide */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">🔧 Troubleshooting Guide</h3>
              <div className="space-y-4 text-blue-700">
                <div>
                  <h4 className="font-medium">If DATABASE_URL is missing or incorrect:</h4>
                  <ol className="list-decimal list-inside text-sm mt-1 space-y-1">
                    <li>Go to <a href="https://vercel.com/dashboard" className="underline" target="_blank">Vercel Dashboard</a></li>
                    <li>Find your project and go to Settings → Environment Variables</li>
                    <li>Add DATABASE_URL with your Supabase connection string</li>
                    <li>Redeploy your application</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-medium">If database connects but tables don't exist:</h4>
                  <ol className="list-decimal list-inside text-sm mt-1 space-y-1">
                    <li>Run <code className="bg-blue-100 px-1 rounded">npx prisma db push</code> locally</li>
                    <li>Or visit <code className="bg-blue-100 px-1 rounded">/api/init-db</code> to initialize</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-medium">If upload test fails:</h4>
                  <ol className="list-decimal list-inside text-sm mt-1 space-y-1">
                    <li>Check if all environment variables are set correctly</li>
                    <li>Verify Supabase project is not paused</li>
                    <li>Check Vercel function logs for detailed errors</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load diagnostics</p>
          </div>
        )}
      </div>
    </div>
  )
}