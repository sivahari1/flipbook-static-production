'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CognitoAuthService } from '@/lib/cognito-auth'
import { LoadingSpinner } from './LoadingSpinner'
import { SuccessAnimation } from './SuccessAnimation'

interface CognitoAuthFormProps {
  mode: 'signin' | 'signup'
  onSuccess?: () => void
  onModeChange?: (mode: 'signin' | 'signup') => void
}

export function CognitoAuthForm({ mode, onSuccess, onModeChange }: CognitoAuthFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState<'form' | 'verify' | 'success'>('form')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    const result = await CognitoAuthService.signUp(formData.email, formData.password)
    
    if (result.success) {
      setMessage(result.message || 'Please check your email for verification code')
      setStep('verify')
    } else {
      setError(result.error || 'Sign up failed')
    }
    
    setIsLoading(false)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const result = await CognitoAuthService.signIn(formData.email, formData.password)
    
    if (result.success) {
      setStep('success')
      setTimeout(() => {
        onSuccess?.()
      }, 2000)
    } else {
      setError(result.error || 'Sign in failed')
    }
    
    setIsLoading(false)
  }

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const result = await CognitoAuthService.confirmSignUp(formData.email, formData.verificationCode)
    
    if (result.success) {
      setStep('success')
      setTimeout(() => {
        onModeChange?.('signin')
      }, 2000)
    } else {
      setError(result.error || 'Verification failed')
    }
    
    setIsLoading(false)
  }

  const handleResendCode = async () => {
    setIsLoading(true)
    const result = await CognitoAuthService.resendConfirmationCode(formData.email)
    
    if (result.success) {
      setMessage(result.message || 'Verification code sent')
    } else {
      setError(result.error || 'Failed to resend code')
    }
    
    setIsLoading(false)
  }

  if (step === 'success') {
    return (
      <div className="text-center">
        <SuccessAnimation />
        <h3 className="text-xl font-semibold text-gray-900 mt-4">
          {mode === 'signup' ? 'Account Created!' : 'Welcome Back!'}
        </h3>
        <p className="text-gray-600 mt-2">
          {mode === 'signup' 
            ? 'You can now sign in with your credentials' 
            : 'Redirecting to dashboard...'}
        </p>
      </div>
    )
  }

  if (step === 'verify') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900">Verify Your Email</h3>
          <p className="text-gray-600 mt-2">
            We sent a verification code to {formData.email}
          </p>
        </div>

        <form onSubmit={handleVerifyEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              name="verificationCode"
              value={formData.verificationCode}
              onChange={handleInputChange}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              maxLength={6}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Verify Email'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Resend verification code
            </button>
          </div>
        </form>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-gray-600 mt-2">
          {mode === 'signup' 
            ? 'Sign up to start protecting your documents' 
            : 'Sign in to your account'}
        </p>
      </div>

      <form onSubmit={mode === 'signup' ? handleSignUp : handleSignIn} className="space-y-4">
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
            placeholder="Enter your password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            minLength={8}
          />
          {mode === 'signup' && (
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters with uppercase, lowercase, number, and special character
            </p>
          )}
        </div>

        {mode === 'signup' && (
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
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            mode === 'signup' ? 'Create Account' : 'Sign In'
          )}
        </button>
      </form>

      <div className="text-center">
        <button
          onClick={() => onModeChange?.(mode === 'signup' ? 'signin' : 'signup')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {mode === 'signup' 
            ? 'Already have an account? Sign in' 
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </motion.div>
  )
}