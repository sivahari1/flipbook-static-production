'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Shield, Eye, FileText } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { DRMProtection } from '@/components/security/DRMProtection'
import { useDRMProtection } from '@/hooks/useDRMProtection'

interface SecurePDFViewerProps {
  documentId: string
  title?: string
  userEmail: string
  onAccessDenied?: () => void
  onSecurityViolation?: (violation: SecurityViolation) => void
}

interface SecurityViolation {
  type: 'screenshot_attempt' | 'devtools_opened' | 'copy_attempt' | 'print_attempt' | 'save_attempt' | 'unauthorized_access'
  timestamp: Date
  details: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  userAgent: string
  url: string
}

interface SecureSession {
  id: string
  expiresAt: string
  maxDuration: number
}

interface WatermarkConfig {
  userEmail: string
  timestamp: string
  positions: Array<{ x: number; y: number; rotation: number }>
  opacity: number
  rotation: number
  fontSize: string
}

interface DocumentInfo {
  id: string
  title: string
  totalPages: number
  accessLevel: 'owner' | 'viewer'
}

export function SecurePDFViewer({ 
  documentId, 
  title, 
  userEmail, 
  onAccessDenied, 
  onSecurityViolation 
}: SecurePDFViewerProps) {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1.0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<SecureSession | null>(null)
  const [document, setDocument] = useState<DocumentInfo | null>(null)
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig | null>(null)
  const [pageImages, setPageImages] = useState<Map<number, string>>(new Map())
  const [loadingPages, setLoadingPages] = useState<Set<number>>(new Set())
  
  const viewerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Initialize DRM protection
  const drm = useDRMProtection({
    enabled: true,
    onViolation: (violation) => {
      onSecurityViolation?.(violation)
      console.warn('🚨 DRM Violation:', violation)
    },
    autoActivate: true,
    logViolations: true,
    showWarnings: true
  })

  useEffect(() => {
    initializeSecureSession()
  }, [documentId, userEmail])

  useEffect(() => {
    if (session && document && currentPage) {
      loadPage(currentPage)
      // Preload adjacent pages
      if (currentPage > 1) loadPage(currentPage - 1)
      if (currentPage < totalPages) loadPage(currentPage + 1)
    }
  }, [session, document, currentPage, zoomLevel])

  const initializeSecureSession = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/documents/${documentId}/secure-view`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail || user?.email || '',
          'Authorization': `Bearer ${(user as any)?.accessToken || ''}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          onAccessDenied?.()
          setError('Authentication required')
          return
        }
        if (response.status === 403) {
          onAccessDenied?.()
          setError('Access denied')
          return
        }
        throw new Error(`Failed to create secure session: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create secure session')
      }

      setSession(data.session)
      setDocument(data.document)
      setTotalPages(data.document.totalPages)
      setWatermarkConfig(data.security.watermarkConfig)
      setIsLoading(false)

    } catch (error) {
      console.error('Error initializing secure session:', error)
      setError(error instanceof Error ? error.message : 'Failed to initialize secure session')
      setIsLoading(false)
    }
  }

  const loadPage = async (pageNumber: number) => {
    if (!session || !document || pageImages.has(pageNumber) || loadingPages.has(pageNumber)) {
      return
    }

    setLoadingPages(prev => new Set(prev).add(pageNumber))

    try {
      const params = new URLSearchParams({
        width: Math.floor(800 * zoomLevel).toString(),
        height: Math.floor(1200 * zoomLevel).toString(),
        quality: zoomLevel > 1.5 ? 'high' : 'medium',
        format: 'webp',
        watermark: 'true'
      })

      const response = await fetch(
        `/api/documents/${documentId}/pages/${pageNumber}?${params}`,
        {
          headers: {
            'x-session-id': session.id,
            'x-user-email': userEmail || user?.email || ''
          }
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          // Session expired, reinitialize
          await initializeSecureSession()
          return
        }
        throw new Error(`Failed to load page ${pageNumber}`)
      }

      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)
      
      setPageImages(prev => new Map(prev).set(pageNumber, imageUrl))

    } catch (error) {
      console.error(`Error loading page ${pageNumber}:`, error)
      if (pageNumber === currentPage) {
        setError(`Failed to load page ${pageNumber}`)
      }
    } finally {
      setLoadingPages(prev => {
        const newSet = new Set(prev)
        newSet.delete(pageNumber)
        return newSet
      })
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const zoomIn = () => {
    const newZoom = Math.min(zoomLevel + 0.25, 3.0)
    setZoomLevel(newZoom)
    // Clear page cache to reload with new zoom
    setPageImages(new Map())
  }

  const zoomOut = () => {
    const newZoom = Math.max(zoomLevel - 0.25, 0.5)
    setZoomLevel(newZoom)
    // Clear page cache to reload with new zoom
    setPageImages(new Map())
  }

  const fitToWidth = () => {
    setZoomLevel(1.0)
    setPageImages(new Map())
  }

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value)
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Security: Disable right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    onSecurityViolation?.({
      type: 'copy_attempt',
      timestamp: new Date(),
      details: 'Right-click context menu blocked',
      severity: 'low',
      userAgent: navigator.userAgent,
      url: window.location.href
    })
  }

  // Security: Disable text selection
  const handleSelectStart = (e: any) => {
    e.preventDefault()
  }

  // Security: Block keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const blockedKeys = [
      'F12', // Developer tools
      'PrintScreen', // Screenshot
    ]
    
    const blockedCombos = [
      { ctrl: true, key: 'c' }, // Copy
      { ctrl: true, key: 'a' }, // Select all
      { ctrl: true, key: 's' }, // Save
      { ctrl: true, key: 'p' }, // Print
      { ctrl: true, shift: true, key: 'I' }, // Dev tools
      { ctrl: true, shift: true, key: 'J' }, // Dev tools
      { ctrl: true, shift: true, key: 'C' }, // Dev tools
      { alt: true, key: 'PrintScreen' }, // Alt + Print Screen
    ]

    if (blockedKeys.includes(e.key)) {
      e.preventDefault()
      onSecurityViolation?.({
        type: 'screenshot_attempt',
        timestamp: new Date(),
        details: `Blocked key: ${e.key}`,
        severity: 'medium',
        userAgent: navigator.userAgent,
        url: window.location.href
      })
      return
    }

    for (const combo of blockedCombos) {
      if (
        (combo.ctrl && e.ctrlKey) &&
        (combo.shift ? e.shiftKey : true) &&
        e.key.toLowerCase() === combo.key.toLowerCase()
      ) {
        e.preventDefault()
        onSecurityViolation?.({
          type: 'copy_attempt',
          timestamp: new Date(),
          details: `Blocked combination: ${combo.ctrl ? 'Ctrl+' : ''}${combo.shift ? 'Shift+' : ''}${combo.key}`,
          severity: 'medium',
          userAgent: navigator.userAgent,
          url: window.location.href
        })
        return
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing secure session...</p>
          <p className="text-sm text-gray-500 mt-2">Setting up DRM protection</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-gray-100 rounded-lg">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={initializeSecureSession}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const currentPageImage = pageImages.get(currentPage)
  const isCurrentPageLoading = loadingPages.has(currentPage)

  return (
    <DRMProtection
      enabled={true}
      onViolation={onSecurityViolation}
      showWarnings={true}
      strictMode={true}
      className="bg-white rounded-lg shadow-lg overflow-hidden"
    >
      <div 
        className="select-none"
        onContextMenu={handleContextMenu}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        ref={viewerRef}
        style={{ userSelect: 'none', WebkitUserSelect: 'none' } as React.CSSProperties}
      >
      {/* Security Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title || document?.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>🔒 DRM Protected</span>
              <span>👁️ {document?.accessLevel === 'owner' ? 'Owner' : 'Viewer'}</span>
              <span>📄 Page {currentPage} of {totalPages}</span>
            </div>
          </div>
        </div>
        
        {/* Zoom Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            disabled={zoomLevel <= 0.5}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          
          <button
            onClick={zoomIn}
            disabled={zoomLevel >= 3.0}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={fitToWidth}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
            title="Fit to Width"
          >
            Fit
          </button>
        </div>
      </div>

      {/* Document Viewer */}
      <div className="relative bg-gray-100 min-h-[600px] flex items-center justify-center overflow-auto">
        {isCurrentPageLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading page {currentPage}...</p>
          </div>
        ) : currentPageImage ? (
          <div className="bg-white shadow-lg max-w-full max-h-full">
            <img
              ref={imageRef}
              src={currentPageImage}
              alt={`Page ${currentPage}`}
              className="max-w-full h-auto block"
              style={{ 
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                pointerEvents: 'none'
              }}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
        ) : (
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Page not available</p>
            <button
              onClick={() => loadPage(currentPage)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Watermark Overlay (Visual indicator) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 right-4 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
            Protected by FlipBook DRM
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-t">
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage <= 1}
            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            First
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={handlePageInput}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center"
            />
            <span className="text-sm text-gray-500">/ {totalPages}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage >= totalPages}
            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Last
          </button>
          
          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Security Status Bar */}
      <div className="px-4 py-2 bg-blue-50 border-t text-xs text-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span>🔒 DRM Active</span>
            <span>💧 Watermarked</span>
            <span>📊 Access Logged</span>
          </div>
          <div>
            Session expires: {session ? new Date(session.expiresAt).toLocaleTimeString() : 'Unknown'}
          </div>
        </div>
      </div>
      </div>
    </DRMProtection>
  )
}