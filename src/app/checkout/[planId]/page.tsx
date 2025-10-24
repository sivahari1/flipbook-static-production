'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getPlanById } from '@/lib/subscription-plans'
import { LoadingSpinner } from '@/components/auth/LoadingSpinner'
import { FadeIn } from '@/components/animations/FadeIn'
import { SlideUp } from '@/components/animations/SlideUp'
import { formatINR } from '@/lib/currency'
import { initiateRazorpayPayment, loadRazorpayScript, RAZORPAY_KEY_ID } from '@/lib/razorpay'
import { CheckCircle, CreditCard, Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const planId = params.planId as string
  const plan = planId ? getPlanById(planId) : null

  useEffect(() => {
    // If user is not authenticated, redirect to registration with plan info
    if (!authLoading && !user && plan) {
      router.push(`/auth/register?plan=${planId}&redirect=checkout`)
      return
    }
  }, [user, authLoading, planId, plan, router])

  const handlePayment = async () => {
    if (!user || !plan) return

    setIsProcessing(true)
    setError(null)

    try {
      // Load Razorpay script
      const isRazorpayLoaded = await loadRazorpayScript()
      if (!isRazorpayLoaded) {
        throw new Error('Failed to load payment gateway')
      }

      // Create order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          amount: plan.pricing.monthly * 100, // Convert to paise
          currency: 'INR',
        }),
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order')
      }

      const orderData = await orderResponse.json()

      // Initiate Razorpay payment
      await initiateRazorpayPayment({
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'FlipBook DRM',
        description: `${plan.name} Subscription`,
        order_id: orderData.orderId,
        prefill: {
          name: user.email?.split('@')[0] || 'User',
          email: user.email || '',
        },
        theme: {
          color: '#3B82F6',
        },
        handler: async (response) => {
          // Handle successful payment
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                planId: plan.id,
              }),
            })

            if (verifyResponse.ok) {
              // Update subscription in database
              await fetch('/api/subscription', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  plan: plan.id,
                  status: 'active',
                  currentPeriodEnd: new Date(Date.now() + (plan.id === 'monthly' ? 30 : plan.id === 'quarterly' ? 90 : plan.id === 'biannual' ? 180 : 365) * 24 * 60 * 60 * 1000).toISOString(),
                }),
              })

              router.push(`/payment/success?plan=${plan.id}`)
            } else {
              throw new Error('Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            router.push('/payment/failed')
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
          },
        },
      })

    } catch (error) {
      console.error('Payment error:', error)
      setError(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Plan Not Found</h1>
          <p className="text-gray-600 mb-6">The selected subscription plan could not be found.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <FadeIn>
        <div className="container mx-auto px-4 py-16">
          {/* Navigation Header */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="max-w-2xl mx-auto">
            <SlideUp>
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Complete Your Purchase
                </h1>
                <p className="text-lg text-gray-600">
                  You're just one step away from securing your documents
                </p>
              </div>
            </SlideUp>

            <SlideUp delay={0.2}>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <CreditCard className="w-6 h-6 mr-3 text-blue-600" />
                  Order Summary
                </h2>
                
                <div className="border-2 border-gray-200 rounded-xl p-6 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-gray-600 text-sm">{plan.description}</p>
                    </div>
                    {plan.popular && (
                      <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Popular
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {feature.name}
                      </div>
                    ))}
                    {plan.features.length > 4 && (
                      <div className="text-sm text-gray-500">
                        +{plan.features.length - 4} more features
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatINR(plan.pricing.monthly)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      * GST will be added as applicable
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <LoadingSpinner className="w-5 h-5 mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Pay Securely with Razorpay
                    </>
                  )}
                </button>

                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      256-bit SSL
                    </div>
                    <div>•</div>
                    <div>PCI Compliant</div>
                    <div>•</div>
                    <div>30-day Refund</div>
                  </div>
                </div>
              </div>
            </SlideUp>

            <SlideUp delay={0.4}>
              <div className="text-center text-sm text-gray-600">
                <p>
                  By proceeding with the payment, you agree to our{' '}
                  <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
                </p>
              </div>
            </SlideUp>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}