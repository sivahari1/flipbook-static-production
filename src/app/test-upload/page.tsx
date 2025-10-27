'use client'

import { useState } from 'react'

export default function TestUploadPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      
      const response = await fetch('/api/simple-upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      setResult({ success: response.ok, data })
    } catch (error) {
      setResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Upload Functionality</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Document Title</label>
              <input
                type="text"
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Test Document"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">PDF File</label>
              <input
                type="file"
                name="document"
                accept=".pdf"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing Upload...' : 'Test Upload'}
            </button>
          </form>
        </div>

        {result && (
          <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h3 className="font-bold mb-2">{result.success ? '✅ Success!' : '❌ Error'}</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-800 mb-2">Upload Status Check</h3>
          <p className="text-blue-700 text-sm">
            This page tests if the upload functionality is working. If you see a success message after uploading a PDF, 
            the upload system is functional. The main upload page at <a href="/upload" className="underline">/upload</a> should work.
          </p>
        </div>
      </div>
    </div>
  )
}