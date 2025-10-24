'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ViewerState {
  manifest: any
  token: string
  currentPage: number
  loading: boolean
  error: string
}

export default function ViewerPage() {
  const params = useParams()
  const docId = params.id as string
  
  const [state, setState] = useState<ViewerState>({
    manifest: null,
    token: '',
    currentPage: 1,
    loading: true,
    error: ''
  })

  const [watermarkVisible, setWatermarkVisible] = useState(true)

  // Security: Disable right-click, text selection, and keyboard shortcuts
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault()
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable common shortcuts
      if (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'a' || e.key === 'c')) {
        e.preventDefault()
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault()
      }
    }
    const handleSelectStart = (e: Event) => e.preventDefault()

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('selectstart', handleSelectStart)
    document.body.style.userSelect = 'none'

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('selectstart', handleSelectStart)
      document.body.style.userSelect = ''
    }
  }, [])

  // Security: Monitor visibility and blur events
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Log suspicious activity
        fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            docId,
            event: 'visibility_hidden',
            timestamp: new Date().toISOString()
          })
        }).catch(() => {})
      }
    }

    const handleBlur = () => {
      // Log when window loses focus
      fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docId,
          event: 'window_blur',
          timestamp: new Date().toISOString()
        })
      }).catch(() => {})
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
    }
  }, [docId])

  // Load manifest and get viewing token
  const loadManifest = useCallback(async () => {
    try {
      const shareCode = new URLSearchParams(window.location.search).get('share')
      const headers: Record<string, string> = {}
      
      if (shareCode) {
        headers['x-share-code'] = shareCode
      }

      const response = await fetch(`/api/view/${docId}/manifest`, { headers })
      
      if (!response.ok) {
        throw new Error('Failed to load document')
      }

      const manifest = await response.json()
      
      setState(prev => ({
        ...prev,
        manifest,
        token: manifest.token,
        loading: false
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to load document',
        loading: false
      }))
    }
  }, [docId])

  useEffect(() => {
    loadManifest()
  }, [loadManifest])

  // Refresh token before expiry
  useEffect(() => {
    if (!state.token) return

    const refreshInterval = setInterval(() => {
      loadManifest()
    }, 90000) // Refresh every 90 seconds (token expires in 2 minutes)

    return () => clearInterval(refreshInterval)
  }, [state.token, loadManifest])

  const getTileUrl = (page: number) => {
    if (!state.token) return ''
    // Note: In a real implementation, you'd need to handle auth headers differently
    // This is a simplified version for the demo
    return `/api/view/${docId}/tile?page=${page}&token=${encodeURIComponent(state.token)}`
  }

  const nextPage = () => {
    if (state.currentPage < state.manifest?.pageCount) {
      setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))
    }
  }

  const prevPage = () => {
    if (state.currentPage > 1) {
      setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))
    }
  }

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading secure document...</div>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-red-400 text-xl">{state.error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Floating watermark */}
      {watermarkVisible && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-white/20 text-lg font-mono transform rotate-12 animate-pulse select-none">
            PROTECTED CONTENT • {new Date().toISOString()} • SECURE VIEW
          </div>
        </div>
      )}

      {/* Drifting watermark */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        <div className="absolute animate-bounce text-white/10 text-xs font-mono select-none"
             style={{ 
               top: '20%', 
               left: '10%',
               animationDuration: '8s',
               animationDelay: '0s'
             }}>
          SECURE • VIEW ONLY
        </div>
        <div className="absolute animate-bounce text-white/10 text-xs font-mono select-none"
             style={{ 
               top: '60%', 
               right: '15%',
               animationDuration: '12s',
               animationDelay: '2s'
             }}>
          PROTECTED DOCUMENT
        </div>
        <div className="absolute animate-bounce text-white/10 text-xs font-mono select-none"
             style={{ 
               bottom: '30%', 
               left: '70%',
               animationDuration: '10s',
               animationDelay: '4s'
             }}>
          NO DOWNLOAD • NO PRINT
        </div>
      </div>

      {/* Main viewer */}
      <div className="relative z-30 flex flex-col h-screen">
        {/* Header */}
        <div className="bg-gray-900 p-4 flex justify-between items-center">
          <div className="text-sm text-gray-300">
            Page {state.currentPage} of {state.manifest?.pageCount}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWatermarkVisible(!watermarkVisible)}
            className="text-gray-300 hover:text-white"
          >
            {watermarkVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        {/* Document viewer */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <img
              src={getTileUrl(state.currentPage)}
              alt={`Page ${state.currentPage}`}
              className="w-full h-auto shadow-2xl select-none"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              style={{ 
                maxHeight: 'calc(100vh - 200px)',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-gray-900 p-4 flex justify-center items-center gap-4">
          <Button
            variant="ghost"
            onClick={prevPage}
            disabled={state.currentPage <= 1}
            className="text-white hover:bg-gray-700"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <span className="text-gray-300 px-4">
            {state.currentPage} / {state.manifest?.pageCount}
          </span>
          
          <Button
            variant="ghost"
            onClick={nextPage}
            disabled={state.currentPage >= state.manifest?.pageCount}
            className="text-white hover:bg-gray-700"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Anti-screenshot overlay (partial deterrent) */}
      <div className="fixed inset-0 pointer-events-none z-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.01] to-transparent animate-pulse" />
      </div>
    </div>
  )
}