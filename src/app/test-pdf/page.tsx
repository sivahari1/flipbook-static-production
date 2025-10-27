'use client'

export default function TestPDFPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">PDF Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Direct PDF Test</h2>
          <p className="mb-4">This should show a working PDF:</p>
          
          <iframe
            src="/api/documents/test123/simple-file"
            className="w-full h-[600px] border border-gray-300 rounded"
            title="Test PDF"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Links</h2>
          <div className="space-y-2">
            <div>
              <a 
                href="/api/documents/test123/simple-file" 
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                Direct PDF Link (test123)
              </a>
            </div>
            <div>
              <a 
                href="/api/documents/any-id/simple-file" 
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                Direct PDF Link (any-id)
              </a>
            </div>
            <div>
              <a 
                href="/view/test123" 
                className="text-blue-600 hover:underline"
              >
                View Page Test
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}