'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function VerifyEmailSentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleResendVerification = async () => {
    if (!email) return

    setIsResending(true)
    setResendMessage('')

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setResendMessage('✅ Verification email sent! Please check your inbox.')
      } else {
        setResendMessage('❌ ' + (data.error || 'Failed to send verification email'))
      }
    } catch (error) {
      setResendMessage('❌ An error occurred. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #f3e8ff 100%)'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '1rem',
        padding: '3rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '90%'
      }}>
        {/* Email Icon */}
        <div style={{
          width: '4rem',
          height: '4rem',
          margin: '0 auto 2rem auto',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg style={{ width: '2rem', height: '2rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: '#111827', 
          marginBottom: '1rem' 
        }}>
          Check Your Email
        </h1>
        
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '1.5rem',
          fontSize: '1rem'
        }}>
          We've sent a verification link to:
        </p>

        <div style={{
          background: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '2rem',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          color: '#374151',
          wordBreak: 'break-all'
        }}>
          {email || 'your email address'}
        </div>

        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <h3 style={{ 
            color: '#1e40af', 
            fontSize: '1rem', 
            fontWeight: '600', 
            marginBottom: '0.5rem' 
          }}>
            📧 Next Steps:
          </h3>
          <ol style={{ 
            color: '#1e40af', 
            fontSize: '0.875rem', 
            margin: 0, 
            paddingLeft: '1.5rem' 
          }}>
            <li>Check your email inbox (and spam folder)</li>
            <li>Click the verification link in the email</li>
            <li>Return here to sign in to your account</li>
          </ol>
        </div>

        {resendMessage && (
          <div style={{
            background: resendMessage.includes('✅') ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${resendMessage.includes('✅') ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem',
            fontSize: '0.875rem',
            color: resendMessage.includes('✅') ? '#166534' : '#dc2626'
          }}>
            {resendMessage}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleResendVerification}
            disabled={isResending || !email}
            style={{
              padding: '0.75rem 1.5rem',
              background: isResending ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: isResending ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isResending && (
              <div style={{
                width: '1rem',
                height: '1rem',
                border: '2px solid transparent',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
            {isResending ? 'Sending...' : 'Resend Email'}
          </button>
          
          <button
            onClick={() => router.push('/auth/sign-in')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'white',
              color: '#374151',
              border: '2px solid #d1d5db',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Back to Sign In
          </button>
        </div>

        <div style={{ 
          marginTop: '2rem', 
          paddingTop: '1.5rem', 
          borderTop: '1px solid #e5e7eb',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <p>
            Didn't receive the email? Check your spam folder or try resending.
          </p>
          <p>
            The verification link will expire in 24 hours for security.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailSentPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #f3e8ff 100%)'
      }}>
        <div>Loading...</div>
      </div>
    }>
      <VerifyEmailSentContent />
    </Suspense>
  )
}