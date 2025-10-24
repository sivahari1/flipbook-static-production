'use client'

import { useState } from 'react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('SUBSCRIBER')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/auth/sign-in'
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #f3e8ff 100%)'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '3rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', marginBottom: '1rem' }}>
            Registration Complete!
          </h2>
          <div style={{ color: '#6b7280', textAlign: 'left', marginBottom: '1rem' }}>
            <p style={{ marginBottom: '1rem' }}>Use these sample credentials to test the application:</p>
            <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
              <p><strong>Subscriber:</strong> demo@example.com / demo123</p>
              <p><strong>Creator:</strong> creator@example.com / creator123</p>
              <p><strong>Admin:</strong> admin@example.com / admin123</p>
            </div>
          </div>
          <p style={{ color: '#6b7280' }}>Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #f3e8ff 100%)'
    }}>
      <div style={{ width: '100%', maxWidth: '28rem', margin: '0 1rem' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '2rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              margin: '0 auto 1rem auto',
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '1.5rem' }}>👤</div>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
              Create Account
            </h1>
            <p style={{ color: '#4b5563' }}>Join our secure document platform</p>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0 }}>
                ⚠️ {error}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  opacity: isLoading ? 0.6 : 1
                }}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.75rem' }}>
                Account Type <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setRole('SUBSCRIBER')}
                  disabled={isLoading}
                  style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: role === 'SUBSCRIBER' ? '2px solid #3b82f6' : '2px solid #d1d5db',
                    background: role === 'SUBSCRIBER' ? '#eff6ff' : 'white',
                    color: role === 'SUBSCRIBER' ? '#1d4ed8' : '#374151',
                    textAlign: 'left',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1
                  }}
                >
                  <div style={{ fontWeight: '500' }}>Subscriber</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>View documents</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('CREATOR')}
                  disabled={isLoading}
                  style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: role === 'CREATOR' ? '2px solid #3b82f6' : '2px solid #d1d5db',
                    background: role === 'CREATOR' ? '#eff6ff' : 'white',
                    color: role === 'CREATOR' ? '#1d4ed8' : '#374151',
                    textAlign: 'left',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1
                  }}
                >
                  <div style={{ fontWeight: '500' }}>Creator</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>Upload & share</div>
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  opacity: isLoading ? 0.6 : 1
                }}
                placeholder="Enter your password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Confirm Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  opacity: isLoading ? 0.6 : 1
                }}
                placeholder="Confirm your password"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                color: 'white',
                background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #4f46e5)',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isLoading && (
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: '#4b5563' }}>
              Already have an account?{' '}
              <a href="/auth/sign-in" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
                Sign In
              </a>
            </p>
            <div style={{ marginTop: '1rem' }}>
              <a href="/" style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'underline' }}>
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}