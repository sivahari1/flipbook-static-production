'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { FormField } from './FormField'
import { LoadingSpinner, GradientSpinner } from './LoadingSpinner'
import { FormSuccessOverlay } from './SuccessAnimation'
import { FadeIn } from '@/components/animations/FadeIn'
import { cn } from '@/lib/utils'

interface AuthData {
  email: string
  password: string
  confirmPassword?: string
  role?: 'SUBSCRIBER' | 'CREATOR'
}

interface AuthFormProps {
  type: 'signin' | 'signup'
  onSubmit: (data: AuthData) => Promise<void>
  loading?: boolean
  error?: string
  success?: boolean
  onSuccessComplete?: () => void
}

interface ValidationErrors {
  email?: string
  password?: string
  confirmPassword?: string
}

export function AuthForm({
  type,
  onSubmit,
  loading = false,
  error,
  success = false,
  onSuccessComplete
}: AuthFormProps) {
  const [formData, setFormData] = useState<AuthData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'SUBSCRIBER'
  })
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isShaking, setIsShaking] = useState(false)
  
  const isSignUp = type === 'signup'
  
  // Real-time validation
  useEffect(() => {
    const errors: ValidationErrors = {}
    
    // Email validation
    if (touched.email && formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address'
      }
    }
    
    // Password validation
    if (touched.password && formData.password) {
      if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters'
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        errors.password = 'Password must contain uppercase, lowercase, and number'
      }
    }
    
    // Confirm password validation (signup only)
    if (isSignUp && touched.confirmPassword && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
      }
    }
    
    setValidationErrors(errors)
  }, [formData, touched, isSignUp])
  
  // Trigger shake animation on error
  useEffect(() => {
    if (error) {
      setIsShaking(true)
      const timer = setTimeout(() => setIsShaking(false), 500)
      return () => clearTimeout(timer)
    }
  }, [error])
  
  const handleFieldChange = (field: keyof AuthData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Mark all fields as touched for validation
    const allFields = ['email', 'password']
    if (isSignUp) allFields.push('confirmPassword')
    
    const newTouched = allFields.reduce((acc, field) => {
      acc[field] = true
      return acc
    }, {} as Record<string, boolean>)
    
    setTouched(newTouched)
    
    // Check if there are validation errors
    const hasErrors = Object.keys(validationErrors).length > 0
    if (hasErrors) {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
      return
    }
    
    await onSubmit(formData)
  }
  
  const isFormValid = Object.keys(validationErrors).length === 0 && 
    formData.email && formData.password && 
    (!isSignUp || formData.confirmPassword)

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Floating Shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-float" />
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '0.5s' }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>
      </div>
      
      {/* Form Container */}
      <FadeIn className="relative z-10 w-full max-w-md mx-4">
        <motion.div
          animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center mb-4"
            >
              <User className="w-8 h-8 text-white" />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-gray-900">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600">
              {isSignUp 
                ? 'Join our secure document platform' 
                : 'Sign in to your secure document platform'
              }
            </p>
          </div>
          
          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
              >
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">
                  {isSignUp ? 'Account created successfully!' : 'Signed in successfully!'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  x: [0, -5, 5, -5, 5, 0] // Shake animation
                }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  x: { duration: 0.5, ease: 'easeInOut' }
                }}
                className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-error-pulse"
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                </motion.div>
                <span className="font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <FormField
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(value) => handleFieldChange('email', value)}
              onBlur={() => handleFieldBlur('email')}
              error={validationErrors.email}
              required
              icon={<Mail className="w-5 h-5" />}
              placeholder="Enter your email"
            />
            
            {/* Role Selection (Sign Up Only) */}
            {isSignUp && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Account Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'SUBSCRIBER', label: 'Subscriber', desc: 'View documents' },
                    { value: 'CREATOR', label: 'Creator', desc: 'Upload & share' }
                  ].map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => handleFieldChange('role', option.value as 'SUBSCRIBER' | 'CREATOR')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'p-4 rounded-lg border-2 text-left transition-all duration-200',
                        formData.role === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      )}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm opacity-70">{option.desc}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Password Field */}
            <FormField
              label="Password"
              type="password"
              value={formData.password}
              onChange={(value) => handleFieldChange('password', value)}
              onBlur={() => handleFieldBlur('password')}
              error={validationErrors.password}
              required
              icon={<Lock className="w-5 h-5" />}
              placeholder="Enter your password"
            />
            
            {/* Confirm Password Field (Sign Up Only) */}
            {isSignUp && (
              <FormField
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword || ''}
                onChange={(value) => handleFieldChange('confirmPassword', value)}
                onBlur={() => handleFieldBlur('confirmPassword')}
                error={validationErrors.confirmPassword}
                required
                icon={<Lock className="w-5 h-5" />}
                placeholder="Confirm your password"
              />
            )}
            
            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || !isFormValid}
              whileHover={!loading && isFormValid ? { scale: 1.02 } : {}}
              whileTap={!loading && isFormValid ? { scale: 0.98 } : {}}
              className={cn(
                'w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200',
                'bg-gradient-primary hover:shadow-lg hover:shadow-blue-500/25',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                'flex items-center justify-center gap-3'
              )}
            >
              {loading ? (
                <>
                  <GradientSpinner size="sm" />
                  <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                </>
              ) : (
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              )}
            </motion.button>
          </form>
          
          {/* Footer */}
          <div className="text-center">
            <p className="text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <Link 
                href={isSignUp ? '/auth/sign-in' : '/auth/sign-up'}
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Link>
            </p>
          </div>
        </motion.div>
      </FadeIn>
      
      {/* Success Overlay */}
      <FormSuccessOverlay
        isVisible={success}
        message={isSignUp ? 'Account Created Successfully!' : 'Welcome Back!'}
        onComplete={onSuccessComplete}
      />
    </div>
  )
}