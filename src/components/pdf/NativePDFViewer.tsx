'use client'

import { useState, useEffect, useRef } from 'react'
import { Shield, Eye, FileText, Share2, Download, ZoomIn, ZoomOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { DRMProtection, createDRMProtection, type SecurityViolation } from '@/lib/drm-protection'
import '@/styles/security.css'

interface NativePDFViewerProps {
  documentId: string
  title?: string
  userEmail: string
  onAccessDenied?: () => void
  onSecurityViolation?: (violation: SecurityViolation) => void
}

// SecurityViolation interface is now imported from drm-protection

interface SecureSession {
  id: string
  expiresAt: string
  maxDuration: number
}

interface DocumentInfo {
  id: string
  title: string
  totalPages: number
  accessLevel: 'owner' | 'viewer'
}

export function NativePDFViewer({ 
  documentId, 
  title, 
  userEmail, 
  onAccessDenied, 
  onSecurityViolation 
}: NativePDFViewerProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<SecureSession | null>(null)
  const [document, setDocument] = useState<DocumentInfo | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [drmProtection, setDrmProtection] = useState<DRMProtection | null>(null)
  const [watermarkPositions, setWatermarkPositions] = useState<Array<{x: number, y: number, rotation: number}>>([])
  const [watermarkOverlay, setWatermarkOverlay] = useState<HTMLElement | null>(null)
  
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Helper function to create security violations with required fields
  const createSecurityViolation = (
    type: SecurityViolation['type'],
    details: string,
    severity: SecurityViolation['severity']
  ): SecurityViolation => ({
    type,
    timestamp: new Date(),
    details,
    severity,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
  })

  useEffect(() => {
    initializeSecureSession()
    initializeDRMProtection()
    generateWatermarkPositions()
    
    // Enhanced security monitoring - only in browser
    if (typeof window === 'undefined') {
      return
    }
    
    const securityMonitor = setInterval(() => {
      // Check for developer tools
      const devtools = {
        open: false,
        orientation: null
      }
      
      const threshold = 160
      
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true
          onSecurityViolation?.(createSecurityViolation(
            'devtools_opened',
            'Developer tools detected',
            'high'
          ))
        }
      }
      
      // Check for zoom level changes that might bypass watermarks
      const zoomLevel = Math.round(window.devicePixelRatio * 100)
      if (zoomLevel !== 100) {
        onSecurityViolation?.(createSecurityViolation(
          'unauthorized_access',
          `Zoom level changed to ${zoomLevel}%`,
          'medium'
        ))
      }
      
      // Check for screen recording software (basic detection)
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function') {
        navigator.mediaDevices.enumerateDevices().then(devices => {
          const screenDevices = devices.filter(device => 
            device.kind === 'videoinput' && 
            device.label.toLowerCase().includes('screen')
          )
          if (screenDevices.length > 0) {
            onSecurityViolation?.(createSecurityViolation(
              'screenshot_attempt',
              'Screen recording device detected',
              'high'
            ))
          }
        }).catch(() => {
          // Ignore errors - user might have denied permissions
        })
      }
    }, 2000)
    
    return () => {
      clearInterval(securityMonitor)
    }
  }, [documentId, userEmail, onSecurityViolation])

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
      
      // Create secure PDF URL with session and DRM parameters
      const pdfFileUrl = `/api/documents/${documentId}/file?session=${data.session.id}&email=${encodeURIComponent(userEmail || user?.email || '')}&drm=true&nodownload=true`
      setPdfUrl(pdfFileUrl)
      
      setIsLoading(false)

    } catch (error) {
      console.error('Error initializing secure session:', error)
      
      // Fallback to demo document if the specific document is not found
      console.log('Falling back to demo document...')
      try {
        // Create a fallback document object
        const fallbackDocument = {
          id: 'demo-fallback',
          title: title || 'Demo Document',
          totalPages: 25,
          accessLevel: 'viewer'
        }
        
        setDocument(fallbackDocument)
        
        // Use demo document URL
        const demoUrl = `/api/documents/demo-1/file`
        setPdfUrl(demoUrl)
        
        setIsLoading(false)
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
        setError(error instanceof Error ? error.message : 'Failed to initialize secure session')
        setIsLoading(false)
      }
    }
  }

  const initializeDRMProtection = () => {
    const protection = createDRMProtection((violation) => {
      onSecurityViolation?.(violation)
      
      // Log violation to server
      fetch('/api/security/violation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          userEmail: userEmail || user?.email,
          violation
        })
      }).catch(console.error)
    })
    
    protection.activate()
    setDrmProtection(protection)
  }

  const generateWatermarkPositions = () => {
    // Only generate positions in browser environment
    if (typeof window === 'undefined') {
      setWatermarkPositions([])
      return
    }
    
    const positions = []
    const spacing = 200
    
    for (let x = 0; x < window.innerWidth; x += spacing) {
      for (let y = 0; y < window.innerHeight; y += spacing) {
        positions.push({
          x: x + Math.random() * 50,
          y: y + Math.random() * 50,
          rotation: -45 + Math.random() * 20
        })
      }
    }
    
    setWatermarkPositions(positions)
  }

  const handleShare = async () => {
    try {
      setIsSharing(true)
      
      const response = await fetch(`/api/documents/${documentId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expiresIn: 30, // 30 days
          maxOpens: null,
          description: `Shared: ${title || document?.title}`
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create share link')
      }

      const data = await response.json()
      
      if (data.success && data.share) {
        setShareUrl(data.share.url)
        setShowShareModal(true)
      } else {
        throw new Error(data.error || 'Failed to create share link')
      }
      
    } catch (error) {
      console.error('Error creating share link:', error)
      alert('Failed to create share link: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsSharing(false)
    }
  }

  const copyShareUrl = () => {
    if (shareUrl && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
      alert('Share link copied to clipboard!')
    }
  }

  // Security: Disable right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    onSecurityViolation?.(createSecurityViolation(
      'copy_attempt',
      'Right-click context menu blocked',
      'low'
    ))
  }

  // Enhanced security: Block all save/print/screenshot attempts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const blockedKeys = [
      'F12', // Developer tools
      'PrintScreen', // Screenshot
      'F5', // Refresh (can bypass security)
      'F11', // Fullscreen (can bypass watermarks)
    ]
    
    const blockedCombos = [
      // Copy/Paste/Select
      { ctrl: true, key: 'c' }, // Copy
      { ctrl: true, key: 'v' }, // Paste
      { ctrl: true, key: 'x' }, // Cut
      { ctrl: true, key: 'a' }, // Select all
      { ctrl: true, key: 'z' }, // Undo
      { ctrl: true, key: 'y' }, // Redo
      
      // Save/Print
      { ctrl: true, key: 's' }, // Save
      { ctrl: true, key: 'p' }, // Print
      { ctrl: true, shift: true, key: 'S' }, // Save As
      
      // Developer tools
      { ctrl: true, shift: true, key: 'I' }, // Dev tools
      { ctrl: true, shift: true, key: 'J' }, // Dev tools console
      { ctrl: true, shift: true, key: 'C' }, // Dev tools inspect
      { ctrl: true, shift: true, key: 'K' }, // Dev tools console
      { ctrl: true, key: 'u' }, // View source
      
      // Screenshot attempts
      { alt: true, key: 'PrintScreen' }, // Alt + Print Screen
      { ctrl: true, key: 'PrintScreen' }, // Ctrl + Print Screen
      { shift: true, key: 'PrintScreen' }, // Shift + Print Screen
      { cmd: true, shift: true, key: '3' }, // Mac screenshot
      { cmd: true, shift: true, key: '4' }, // Mac screenshot
      { cmd: true, shift: true, key: '5' }, // Mac screenshot
      
      // Browser functions that can bypass security
      { ctrl: true, key: 'r' }, // Refresh
      { ctrl: true, shift: true, key: 'R' }, // Hard refresh
      { ctrl: true, key: 'h' }, // History
      { ctrl: true, key: 'j' }, // Downloads
      { ctrl: true, key: 'd' }, // Bookmark (can save URL)
      { ctrl: true, shift: true, key: 'Delete' }, // Clear data
      
      // Navigation that can bypass security
      { alt: true, key: 'F4' }, // Close window
      { ctrl: true, key: 'w' }, // Close tab
      { ctrl: true, shift: true, key: 'T' }, // Reopen closed tab
      { ctrl: true, key: 't' }, // New tab
      { ctrl: true, key: 'n' }, // New window
      { ctrl: true, shift: true, key: 'N' }, // New incognito window
    ]

    // Block function keys that can be used for screenshots or bypassing security
    if (e.key.startsWith('F') && ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'].includes(e.key)) {
      e.preventDefault()
      onSecurityViolation?.(createSecurityViolation(
        'screenshot_attempt',
        `Blocked function key: ${e.key}`,
        'high'
      ))
      return
    }

    if (blockedKeys.includes(e.key)) {
      e.preventDefault()
      onSecurityViolation?.(createSecurityViolation(
        'screenshot_attempt',
        `Blocked key: ${e.key}`,
        'high'
      ))
      return
    }

    for (const combo of blockedCombos) {
      const ctrlPressed = combo.ctrl && (e.ctrlKey || e.metaKey) // Support both Ctrl and Cmd
      const shiftPressed = combo.shift ? e.shiftKey : true
      const altPressed = combo.alt ? e.altKey : true
      const cmdPressed = combo.cmd ? e.metaKey : true
      
      if (ctrlPressed && shiftPressed && altPressed && cmdPressed &&
          e.key.toLowerCase() === combo.key.toLowerCase()) {
        e.preventDefault()
        
        const violationType = combo.key === 's' || combo.key === 'p' ? 'copy_attempt' : 
                            combo.key === 'PrintScreen' || combo.key === '3' || combo.key === '4' || combo.key === '5' ? 'screenshot_attempt' : 
                            'unauthorized_access'
        
        onSecurityViolation?.(createSecurityViolation(
          violationType,
          `Blocked combination: ${combo.ctrl ? 'Ctrl+' : ''}${combo.cmd ? 'Cmd+' : ''}${combo.shift ? 'Shift+' : ''}${combo.alt ? 'Alt+' : ''}${combo.key}`,
          'high'
        ))
        return
      }
    }
  }

  // Enhanced screenshot protection
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }

    const handleVisibilityChange = () => {
      if (typeof window !== 'undefined' && typeof window.document !== 'undefined' && window.document.hidden) {
        onSecurityViolation?.(createSecurityViolation(
          'screenshot_attempt',
          'Document visibility changed - possible screenshot attempt',
          'medium'
        ))
      }
    }

    const handleBlur = () => {
      onSecurityViolation?.(createSecurityViolation(
        'screenshot_attempt',
        'Window lost focus - possible screenshot attempt',
        'low'
      ))
    }

    const handleResize = () => {
      onSecurityViolation?.(createSecurityViolation(
        'unauthorized_access',
        'Window resized - possible security bypass attempt',
        'low'
      ))
    }

    // Add event listeners for enhanced security
    if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
      window.document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('blur', handleBlur)
      window.addEventListener('resize', handleResize)
    }

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
      onSecurityViolation?.(createSecurityViolation(
        'copy_attempt',
        'Drag operation blocked',
        'medium'
      ))
    }

    if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
      window.document.addEventListener('dragstart', handleDragStart)
    }

    return () => {
      // Clean up event listeners
      if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
        window.document.removeEventListener('visibilitychange', handleVisibilityChange)
        window.document.removeEventListener('dragstart', handleDragStart)
        window.removeEventListener('blur', handleBlur)
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [onSecurityViolation])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF document...</p>
          <p className="text-sm text-gray-500 mt-2">Setting up secure viewer</p>
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

  return (
    <>
      {/* Security overlay for screenshot protection */}
      <div className="security-overlay" />
      
      <div 
        className="bg-white rounded-lg shadow-lg overflow-hidden select-none drm-protected"
        onContextMenu={handleContextMenu}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        style={{ 
          userSelect: 'none', 
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        } as React.CSSProperties}
        onDragStart={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        onDragOver={(e) => e.preventDefault()}
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
                <span>📄 {document?.totalPages} pages</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Share Document"
            >
              <Share2 className="w-4 h-4" />
              <span>{isSharing ? 'Sharing...' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="relative bg-gray-100 min-h-[800px]">
          {pdfUrl ? (
            <iframe
              ref={iframeRef}
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH&zoom=page-fit&pagemode=none`}
              className="w-full h-[800px] border-0"
              title={`PDF Viewer - ${title || document?.title}`}
              style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                pointerEvents: 'auto'
              }}
              onLoad={() => {
                // Add additional security measures to iframe
                if (iframeRef.current) {
                  try {
                    const iframeDoc = iframeRef.current.contentDocument
                    if (iframeDoc) {
                      // Disable right-click in iframe
                      iframeDoc.addEventListener('contextmenu', (e) => {
                        e.preventDefault()
                        onSecurityViolation?.(createSecurityViolation(
                          'copy_attempt',
                          'Right-click blocked in PDF viewer',
                          'medium'
                        ))
                      })
                      
                      // Disable text selection in iframe
                      iframeDoc.addEventListener('selectstart', (e) => {
                        e.preventDefault()
                        onSecurityViolation?.(createSecurityViolation(
                          'copy_attempt',
                          'Text selection blocked in PDF viewer',
                          'low'
                        ))
                      })

                      // Block keyboard shortcuts in iframe
                      iframeDoc.addEventListener('keydown', (e) => {
                        const blockedKeys = ['F12', 'PrintScreen', 'F5', 'F11']
                        const blockedCombos = [
                          { ctrl: true, key: 's' }, // Save
                          { ctrl: true, key: 'p' }, // Print
                          { ctrl: true, key: 'c' }, // Copy
                          { ctrl: true, key: 'a' }, // Select all
                          { ctrl: true, shift: true, key: 'I' }, // Dev tools
                        ]

                        if (blockedKeys.includes(e.key)) {
                          e.preventDefault()
                          e.stopPropagation()
                          onSecurityViolation?.(createSecurityViolation(
                            'screenshot_attempt',
                            `Blocked key in PDF: ${e.key}`,
                            'high'
                          ))
                        }

                        for (const combo of blockedCombos) {
                          if ((combo.ctrl && (e.ctrlKey || e.metaKey)) &&
                              (combo.shift ? e.shiftKey : true) &&
                              e.key.toLowerCase() === combo.key.toLowerCase()) {
                            e.preventDefault()
                            e.stopPropagation()
                            onSecurityViolation?.(createSecurityViolation(
                              'copy_attempt',
                              `Blocked combo in PDF: ${combo.ctrl ? 'Ctrl+' : ''}${combo.shift ? 'Shift+' : ''}${combo.key}`,
                              'high'
                            ))
                          }
                        }
                      })

                      // Disable drag and drop in iframe
                      iframeDoc.addEventListener('dragstart', (e) => {
                        e.preventDefault()
                        onSecurityViolation?.(createSecurityViolation(
                          'copy_attempt',
                          'Drag operation blocked in PDF viewer',
                          'medium'
                        ))
                      })

                      // Add CSS to hide PDF toolbar and disable interactions
                      const style = iframeDoc.createElement('style')
                      style.textContent = `
                        * {
                          -webkit-user-select: none !important;
                          -moz-user-select: none !important;
                          -ms-user-select: none !important;
                          user-select: none !important;
                          -webkit-touch-callout: none !important;
                          -webkit-tap-highlight-color: transparent !important;
                        }
                        
                        /* Hide PDF.js toolbar and controls */
                        #toolbarContainer,
                        #secondaryToolbar,
                        #toolbar,
                        .toolbar,
                        .findbar,
                        #findbar,
                        .secondaryToolbar,
                        #secondaryToolbar,
                        .doorHanger,
                        #doorHanger {
                          display: none !important;
                          visibility: hidden !important;
                        }
                        
                        /* Disable print styles */
                        @media print {
                          * { display: none !important; }
                        }
                      `
                      iframeDoc.head.appendChild(style)
                    }
                  } catch (e) {
                    // Cross-origin restrictions may prevent access
                    console.log('Cannot access iframe content due to security restrictions')
                  }
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-[800px]">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">PDF not available</p>
                <button
                  onClick={initializeSecureSession}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Watermark Overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden watermark-overlay">
            {/* Multiple watermark positions to prevent easy removal */}
            {watermarkPositions.map((pos, index) => (
              <div
                key={index}
                className="watermark-text absolute"
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  transform: `rotate(${pos.rotation}deg)`,
                  opacity: 0.08,
                  fontSize: '12px',
                  color: '#000000',
                  fontFamily: 'Arial, sans-serif',
                  whiteSpace: 'nowrap',
                  zIndex: 10000
                }}
              >
                {userEmail || user?.email || 'Protected'} • {new Date().toLocaleDateString()}
              </div>
            ))}
            
            {/* Corner watermarks */}
            <div className="absolute top-2 left-2 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
              🔒 DRM Protected
            </div>
            <div className="absolute top-2 right-2 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
              FlipBook DRM
            </div>
            <div className="absolute bottom-2 left-2 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
              {userEmail || user?.email}
            </div>
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
              {new Date().toLocaleString()}
            </div>
            
            {/* Center watermark */}
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-300"
              style={{
                fontSize: '48px',
                opacity: 0.05,
                transform: 'translate(-50%, -50%) rotate(-45deg)',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}
            >
              PROTECTED BY FLIPBOOK DRM
            </div>
            {[
              { top: '10%', left: '15%', rotation: '45deg', opacity: 0.08 },
              { top: '25%', left: '50%', rotation: '-30deg', opacity: 0.06 },
              { top: '35%', left: '85%', rotation: '15deg', opacity: 0.08 },
              { top: '65%', left: '25%', rotation: '-45deg', opacity: 0.07 },
              { top: '75%', left: '75%', rotation: '30deg', opacity: 0.08 },
              { top: '85%', left: '40%', rotation: '-15deg', opacity: 0.06 },
              { top: '45%', left: '60%', rotation: '60deg', opacity: 0.05 },
              { top: '55%', left: '30%', rotation: '-60deg', opacity: 0.07 },
            ].map((pos, index) => (
              <div
                key={index}
                className="absolute text-xs text-black font-mono select-none"
                style={{
                  top: pos.top,
                  left: pos.left,
                  transform: `rotate(${pos.rotation}) translate(-50%, -50%)`,
                  opacity: pos.opacity,
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
                  whiteSpace: 'nowrap'
                }}
              >
                <div>{userEmail || user?.email}</div>
                <div>FLIPBOOK DRM</div>
                <div>{new Date().toLocaleDateString()}</div>
                <div>{document?.id?.substring(0, 8)}</div>
              </div>
            ))}

            {/* Corner watermarks */}
            <div className="absolute top-2 left-2 text-xs text-gray-500 bg-white/70 px-2 py-1 rounded opacity-60 select-none">
              🔒 {userEmail || user?.email}
            </div>
            <div className="absolute top-2 right-2 text-xs text-gray-500 bg-white/70 px-2 py-1 rounded opacity-60 select-none">
              PROTECTED BY FLIPBOOK DRM
            </div>
            <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white/70 px-2 py-1 rounded opacity-60 select-none">
              UNAUTHORIZED COPYING PROHIBITED
            </div>
            <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/70 px-2 py-1 rounded opacity-60 select-none">
              {new Date().toLocaleString()}
            </div>

            {/* Center watermark */}
            <div 
              className="absolute top-1/2 left-1/2 text-lg text-gray-400 font-bold select-none"
              style={{
                transform: 'translate(-50%, -50%) rotate(-45deg)',
                opacity: 0.03,
                fontSize: '48px',
                fontFamily: 'monospace',
                letterSpacing: '4px'
              }}
            >
              FLIPBOOK DRM PROTECTED
            </div>

            {/* Dynamic moving watermark */}
            <div 
              className="absolute text-xs text-gray-400 select-none animate-pulse"
              style={{
                top: `${20 + (Date.now() % 60)}%`,
                left: `${20 + (Date.now() % 60)}%`,
                opacity: 0.04,
                transform: 'rotate(25deg)'
              }}
            >
              {userEmail || user?.email} • {new Date().toISOString().substring(0, 10)}
            </div>
          </div>
        </div>

        {/* Security Status Bar */}
        <div className="px-4 py-2 bg-blue-50 border-t text-xs text-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span>🔒 DRM Active</span>
              <span>💧 Watermarked</span>
              <span>📊 Access Logged</span>
              <span>📄 Native PDF Viewer</span>
            </div>
            <div>
              Session expires: {session ? new Date(session.expiresAt).toLocaleTimeString() : 'Unknown'}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share Document</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">{title || document?.title}</h4>
              <p className="text-sm text-gray-600">Share this document securely with others</p>
            </div>

            {shareUrl && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share URL:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                  <button
                    onClick={copyShareUrl}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <div className="flex items-start">
                <div className="text-yellow-600 mr-2">⚠️</div>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Security Notice:</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>Link expires in 30 days</li>
                    <li>All access is logged and monitored</li>
                    <li>Document is protected with DRM</li>
                    <li>Watermarks identify viewers</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={copyShareUrl}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}