'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { CognitoAuthService, CognitoUser } from '@/lib/cognito-auth'
import { useIdleTimeout } from '@/hooks/useIdleTimeout'
import { SessionTimeoutWarning } from '@/components/auth/SessionTimeoutWarning'
import { SessionNotification } from '@/components/ui/SessionNotification'

interface AuthContextType {
  user: CognitoUser | null
  isLoading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<CognitoUser | null>
  extendSession: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CognitoUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
  const [warningTimeLeft, setWarningTimeLeft] = useState(60) // 60 seconds warning
  const [showSessionNotification, setShowSessionNotification] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Session timeout configuration
  const SESSION_TIMEOUT = 15 * 60 * 1000 // 15 minutes in milliseconds
  const WARNING_TIME = 60 * 1000 // Show warning 1 minute before timeout

  const refreshUser = async () => {
    // Don't try to refresh user if we're signing out
    if (isSigningOut) {
      setUser(null)
      return null
    }

    try {
      const currentUser = await CognitoAuthService.getCurrentUser()
      setUser(currentUser)
      return currentUser
    } catch (error: any) {
      // Only log non-authentication errors in development
      if (process.env.NODE_ENV === 'development' && !isSigningOut && error?.name !== 'UserUnAuthenticatedException') {
        console.debug('Auth check failed:', error)
      }
      setUser(null)
      return null
    }
  }

  const signOut = async () => {
    try {
      setIsSigningOut(true)
      setShowTimeoutWarning(false) // Hide warning if showing
      await CognitoAuthService.signOut()
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      // Reset signing out flag after a short delay to allow navigation
      setTimeout(() => setIsSigningOut(false), 1000)
    }
  }

  const handleIdleTimeout = () => {
    if (user && !isSigningOut) {
      setShowTimeoutWarning(true)
      setWarningTimeLeft(60) // 60 seconds to decide
    }
  }

  const extendSession = () => {
    setShowTimeoutWarning(false)
    setShowSessionNotification(true)
    // Reset the idle timer by calling reset from useIdleTimeout
    idleTimeout.reset()
  }

  const handleTimeoutLogout = async () => {
    setShowTimeoutWarning(false)
    await signOut()
  }

  // Set up idle timeout - only active when user is authenticated
  const idleTimeout = useIdleTimeout({
    timeout: SESSION_TIMEOUT - WARNING_TIME, // 14 minutes (show warning 1 minute before)
    onTimeout: handleIdleTimeout,
    enabled: !!user && !isSigningOut && !showTimeoutWarning
  })

  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check if we're in the middle of signing out
      if (isSigningOut) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      
      // Define page types
      const isAuthPage = pathname?.startsWith('/auth/')
      const isDashboardPage = pathname?.startsWith('/dashboard')
      const isProtectedPage = isDashboardPage || pathname?.startsWith('/upload') || pathname?.startsWith('/documents') || pathname?.startsWith('/subscription')
      const isPublicPage = pathname === '/' || pathname?.startsWith('/share/') || !isAuthPage && !isProtectedPage

      // Only check authentication if we're on a page that needs it
      if (isAuthPage || isProtectedPage) {
        const currentUser = await refreshUser()
        
        if (currentUser) {
          // User is authenticated
          if (isAuthPage) {
            // Redirect authenticated users away from auth pages
            router.push('/dashboard')
          }
        } else {
          // User is not authenticated
          if (isProtectedPage) {
            // Redirect unauthenticated users to sign in
            router.push('/auth/sign-in')
          }
        }
      } else if (isPublicPage) {
        // For public pages, silently check if user is authenticated without throwing errors
        // Skip this check if we just signed out to avoid errors
        if (!isSigningOut) {
          const currentUser = await refreshUser()
          // User state is already set in refreshUser, no need to do anything else
        }
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [pathname, router, isSigningOut])

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    refreshUser,
    extendSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      
      {/* Session Timeout Warning Modal */}
      <SessionTimeoutWarning
        isVisible={showTimeoutWarning}
        remainingTime={warningTimeLeft}
        onExtendSession={extendSession}
        onLogout={handleTimeoutLogout}
      />
      
      {/* Session Extended Notification */}
      <SessionNotification
        show={showSessionNotification}
        message="Session extended successfully! You'll stay logged in for another 15 minutes."
        type="success"
        onHide={() => setShowSessionNotification(false)}
      />
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}