'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'

interface DatabaseStatus {
  success: boolean
  database?: {
    configured: boolean
    type: string
    provider: string
    connected?: boolean
    tablesExist?: boolean
    userCount?: number
    documentCount?: number
    error?: string
  }
  message: string
  instructions?: string[]
}

export default function DatabaseDebugPage() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [setupLoading, setSetupLoading] = useState(false)

  const checkDatabaseStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/setup/database')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({
        success: false,
        message: 'Failed to check database status'
      })
    } finally {
      setLoading(false)
    }
  }

  const setupDatabase = async () => {
    try {
      setSetupLoading(true)
      const response = await fetch('/api/setup/database', { method: 'POST' })
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({
        success: false,
        message: 'Failed to setup database'
      })
    } finally {
      setSetupLoading(false)
    }
  }

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Debug Panel</h1>
          
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Database Status</h2>
              <button
                onClick={checkDatabaseStatus}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Refresh Status'}
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Checking database status...</p>
              </div>
            ) : status ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${status.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`font-medium ${status.success ? 'text-green-800' : 'text-red-800'}`}>
                    {status.message}
                  </p>
                </div>
                
                {status.database && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-medium text-gray-900">Configuration</h3>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Configured:</span> {status.database.configured ? '✅ Yes' : '❌ No'}</p>
                        <p><span className="font-medium">Type:</span> {status.database.type}</p>
                        <p><span className="font-medium">Provider:</span> {status.database.provider}</p>
                        {status.database.connected !== undefined && (
                          <p><span className="font-medium">Connected:</span> {status.database.connected ? '✅ Yes' : '❌ No'}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium text-gray-900">Tables & Data</h3>
                      <div className="text-sm space-y-1">
                        {status.database.tablesExist !== undefined && (
                          <p><span className="font-medium">Tables Exist:</span> {status.database.tablesExist ? '✅ Yes' : '❌ No'}</p>
                        )}
                        {status.database.userCount !== undefined && (
                          <p><span className="font-medium">Users:</span> {status.database.userCount}</p>
                        )}
                        {status.database.documentCount !== undefined && (
                          <p><span className="font-medium">Documents:</span> {status.database.documentCount}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {status.database?.error && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 font-medium">Error Details:</p>
                    <p className="text-yellow-700 text-sm mt-1">{status.database.error}</p>
                  </div>
                )}
                
                {status.instructions && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 font-medium">Setup Instructions:</p>
                    <ol className="text-blue-700 text-sm mt-2 space-y-1">
                      {status.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">No status information available</p>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Database Actions</h2>
            <div className="space-y-4">
              <button
                onClick={setupDatabase}
                disabled={setupLoading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {setupLoading ? 'Setting up...' : 'Setup Database'}
              </button>
              
              <p className="text-sm text-gray-600">
                This will test the database connection and verify that all required tables exist.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}