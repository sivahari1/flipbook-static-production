'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CognitoAuthService } from '@/lib/cognito-auth'
import { LoadingSpinner } from '@/components/auth/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import { getPlanById } from '@/lib/subscription-plans'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

function RegisterForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'register' | 'verify'>('register')
  const [verificationCode, setVerificationCode] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()
  
  const planId = searchParams.get('plan')
  const redirectType = searchParams.get('redirect')
  const plan = planId ? getPlanById(planId) : null

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }

    try {
      const result = await CognitoAuthService.signUp(formData.username, formData.password, {
        email: formData.email
      })
      
      if (result.success) {
        setStep('verify')
      } else {
        setError(result.error || 'Registration failed')
      }
    } catch (error: any) {
      setError(error.message || 'Registration failed')
    }
    
    setIsLoading(false)
  }

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await CognitoAuthService.confirmSignUp(formData.username, verificationCode)
      
      if (result.success) {
        // Redirect based on plan selection
        if (planId && redirectType === 'checkout') {
          router.push(`/checkout/${planId}`)
        } else if (planId === 'free-trial') {
          router.push('/dashboard?trial=true')
        } else {
          router.push('/dashboard')
        }
      } else {
        setError(result.error || 'Verification failed')
      }
    } catch (error: any) {
      setError(error.message || 'Verification failed')
    }
    
    setIsLoading(false)
  }

  const handleResendCode = async () => {
    setIsLoading(true)
    try {
      const result = await CognitoAuthService.resendConfirmationCode(formData.username)
      if (result.success) {
        setError('')
        alert('Verification code sent! Check your email.')
      } else {
        setError(result.error || 'Failed to resend code')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to resend code')
    }
    setIsLoading(false)
  }

  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
            <p className="text-gray-600 mt-2">
              We sent a verification code to <strong>{formData.email}</strong>
            </p>
          </div>

          <form onSubmit={handleVerifyEmail} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                required
                maxLength={6}
                pattern="[0-9]{6}"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : (
                plan ? `Verify & Continue with ${plan.name}` : 'Verify & Start Free Trial'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Didn't receive the code? Resend
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📧 Check Your Email</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Check your inbox and spam folder</li>
              <li>• Look for email from: no-reply@verificationemail.com</li>
              <li>• Subject: "Your verification code"</li>
              <li>• Wait up to 5 minutes for delivery</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {plan ? `Subscribe to ${plan.name}` : 'Start Your Free Trial'}
          </h1>
          <p className="text-gray-600 mt-2">
            {plan ? `Create your account to continue with ${plan.name}` : 'Get 7 days free access to all premium features'}
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Choose a username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={3}
              pattern="[a-zA-Z0-9_-]+"
              title="Username can only contain letters, numbers, underscores, and hyphens"
            />
            <p className="text-xs text-gray-500 mt-1">
              3+ characters, letters, numbers, underscores, and hyphens only
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a strong password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters with uppercase, lowercase, number, and special character
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : (
              plan ? `Continue with ${plan.name}` : 'Start Free Trial'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/sign-in" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">
            {plan ? `🎯 ${plan.name} Features:` : '🎉 What\'s Included in Your Free Trial:'}
          </h3>
          <ul className="text-sm text-green-700 space-y-1">
            {plan ? (
              plan.features.slice(0, 5).map((feature, index) => (
                <li key={index}>• {feature.name}</li>
              ))
            ) : (
              <>
                <li>• Upload and protect unlimited PDFs</li>
                <li>• Advanced DRM and watermarking</li>
                <li>• Analytics dashboard</li>
                <li>• 7 days full access</li>
                <li>• No credit card required</li>
              </>
            )}
          </ul>
          {plan && (
            <div className="mt-2 text-sm text-green-600 font-medium">
              Price: ₹{(plan.pricing.monthly / 100).toLocaleString('en-IN')} for {
                plan.id === 'monthly' ? '1 month' :
                plan.id === 'quarterly' ? '3 months' :
                plan.id === 'biannual' ? '6 months' :
                plan.id === 'annual' ? '12 months' : 'the period'
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}