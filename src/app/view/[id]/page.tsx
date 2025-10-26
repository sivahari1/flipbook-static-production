'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/layout/Header'
import { NativePDFViewer } from '@/components/pdf/NativePDFViewer'

export default function DocumentViewer() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [document, setDocument] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [errorType, setErrorType] = useState<'not_found' | 'access_denied' | 'auth_required' | 'general'>('general')

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        setError('You must be signed in to view documents')
        setErrorType('auth_required')
        setLoading(false)
        return
      }
      
      if (params.id) {
        fetchDocument(params.id as string)
      }
    }
  }, [params.id, isAuthenticated, authLoading])

  const fetchDocument = async (id: string) => {
    try {
      // Prepare headers with user email for authentication
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      // Add user email to headers if available
      if (user?.email) {
        headers['x-user-email'] = user.email
      }
      
      const response = await fetch(`/api/documents/${id}`, {
        headers
      })
      const data = await response.json()
      
      if (response.ok && data.success) {
        setDocument(data.document)
      } else {
        // Handle different error types
        if (response.status === 401) {
          setError(data.message || 'Authentication required')
          setErrorType('auth_required')
        } else if (response.status === 403) {
          setError(data.message || 'Access denied')
          setErrorType('access_denied')
        } else if (response.status === 404) {
          setError('Document not found')
          setErrorType('not_found')
        } else {
          setError(data.error || 'Failed to load document')
          setErrorType('general')
        }
      }
    } catch (err) {
      setError('Failed to load document')
      setErrorType('general')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!document) return
    
    try {
      const response = await fetch(`/api/documents/${document.id}/share`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        const shareUrl = data.share.url
        
        // Copy to clipboard
        await navigator.clipboard.writeText(shareUrl)
        
        alert(`Share link created and copied to clipboard!\n\n${shareUrl}\n\nThis link will expire in 30 days.`)
      } else {
        const errorData = await response.json()
        alert(`Failed to create share link: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error creating share link:', error)
      alert('Failed to create share link. Please try again.')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen pt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading document...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    const getErrorContent = () => {
      switch (errorType) {
        case 'auth_required':
          return {
            icon: '🔐',
            title: 'Sign In Required',
            message: error,
            buttonText: 'Sign In',
            buttonAction: () => router.push('/auth/sign-in')
          }
        case 'access_denied':
          return {
            icon: '🚫',
            title: 'Access Denied',
            message: error,
            buttonText: 'Back to Documents',
            buttonAction: () => router.push('/documents')
          }
        case 'not_found':
          return {
            icon: '📄',
            title: 'Document Not Found',
            message: 'The document you are looking for does not exist or has been removed.',
            buttonText: 'Back to Documents',
            buttonAction: () => router.push('/documents')
          }
        default:
          return {
            icon: '❌',
            title: 'Error Loading Document',
            message: error,
            buttonText: 'Try Again',
            buttonAction: () => window.location.reload()
          }
      }
    }

    const errorContent = getErrorContent()

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen pt-16">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="text-6xl mb-4">{errorContent.icon}</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{errorContent.title}</h1>
            <p className="text-gray-600 mb-6">{errorContent.message}</p>
            <button
              onClick={errorContent.buttonAction}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {errorContent.buttonText}
            </button>
            {errorType === 'auth_required' && (
              <div className="mt-4">
                <button
                  onClick={() => router.push('/auth/register')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Don't have an account? Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      {/* Document Header */}
      <div className="bg-white shadow-sm border-b mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">{document?.title}</h1>
              <span className="ml-4 text-sm text-gray-500">
                {document?.pageCount} pages • Protected
              </span>
              {document?.accessLevel && (
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {document.accessLevel === 'owner' ? 'Owner' : 'Viewer'}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {document?.canEdit && (
                <button 
                  onClick={handleShare}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  🔗 Share
                </button>
              )}
              <button
                onClick={() => router.push('/documents')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Documents
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <NativePDFViewer 
            documentId={document?.id || ''}
            title={document?.title}
            userEmail={user?.email || ''}
            onAccessDenied={() => {
              setError('Access denied to this document')
              setErrorType('access_denied')
            }}
            onSecurityViolation={(violation) => {
              console.warn('Security violation detected:', violation)
              // Could show a warning toast or log to analytics
            }}
          />
        </div>
      </div>
    </div>
  )
}