'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getPlanById } from '@/lib/subscription-plans'
import { formatINR } from '@/lib/currency'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(true)
  const [message, setMessage] = useState('Processing your payment...')
  const [countdown, setCountdown] = useState(5)

  const planId = searchParams.get('plan')
  const plan = planId ? getPlanById(planId) : null

  useEffect(() => {
    const processPayment = async () => {
      try {
        if (!plan) {
          setMessage('Plan information not found.')
          setIsProcessing(false)
          return
        }

        // Send email confirmation
        try {
          await fetch('/api/email/payment-confirmation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user?.email,
              planName: plan.name,
              amount: formatINR(plan.pricing.monthly),
              planId: plan.id,
            }),
          })
        } catch (emailError) {
          console.error('Email sending failed:', emailError)
          // Don't fail the whole process if email fails
        }

        setMessage(`Payment successful! Your ${plan.name} subscription has been activated.`)
        setIsProcessing(false)

        // Start countdown
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval)
              router.push('/dashboard?subscription=success')
              return 0
            }
            return prev - 1
          })
        }, 1000)

        return () => clearInterval(countdownInterval)
      } catch (error) {
        console.error('Payment processing error:', error)
        setMessage('An error occurred while processing your payment.')
        setIsProcessing(false)
      }
    }

    processPayment()
  }, [searchParams, router, plan, user])

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
        {isProcessing ? (
          <div>
            <div style={{
              width: '4rem',
              height: '4rem',
              margin: '0 auto 2rem auto',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
              Processing Payment
            </h1>
            <p style={{ color: '#6b7280' }}>{message}</p>
          </div>
        ) : (
          <div>
            <div style={{
              width: '4rem',
              height: '4rem',
              margin: '0 auto 2rem auto',
              background: message.includes('successful') ? '#10b981' : '#ef4444',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {message.includes('successful') ? (
                <svg style={{ width: '2rem', height: '2rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg style={{ width: '2rem', height: '2rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#111827', 
              marginBottom: '1rem' 
            }}>
              {message.includes('successful') ? 'Payment Successful!' : 'Payment Failed'}
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>{message}</p>
            
            {message.includes('successful') && (
              <>
                <div style={{ 
                  background: '#f0f9ff', 
                  border: '1px solid #0ea5e9', 
                  borderRadius: '0.5rem', 
                  padding: '1rem', 
                  marginBottom: '2rem' 
                }}>
                  <h3 style={{ color: '#0369a1', fontWeight: '600', marginBottom: '0.5rem' }}>
                    📧 Confirmation Email Sent
                  </h3>
                  <p style={{ color: '#0369a1', fontSize: '0.875rem' }}>
                    A confirmation email has been sent to {user?.email} with your subscription details.
                  </p>
                </div>
                
                <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>
                  Redirecting to dashboard in {countdown} seconds...
                </p>
              </>
            )}
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => router.push('/dashboard?subscription=success')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Go to Dashboard Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
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
      <PaymentSuccessContent />
    </Suspense>
  )
}