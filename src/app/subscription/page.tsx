'use client'

import { FadeIn } from '@/components/animations/FadeIn'
import { SlideUp } from '@/components/animations/SlideUp'
import { subscriptionPlans } from '@/lib/subscription-plans'
import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'

export default function SubscriptionPage() {
  // Filter out the free trial plan for the upgrade options
  const paidPlans = subscriptionPlans.filter(plan => plan.id !== 'free-trial')

  // Format price in INR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <FadeIn>
        <div className="container mx-auto px-4 py-16">
          {/* Navigation Header */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Subscription Plans
            </h1>
            <p className="text-xl text-gray-600">
              Choose the perfect plan for your document security needs
            </p>
          </div>

          {/* Current Subscription Status */}
          <SlideUp delay={0.2}>
            <div className="max-w-4xl mx-auto mb-12">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Current Subscription
                </h2>
                
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      7-Day Free Trial
                    </h3>
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Active
                    </span>
                  </div>
                  <p className="text-green-800 text-sm mb-2">
                    🎉 You're enjoying full access to all premium features for FREE!
                  </p>
                  <p className="text-green-700 text-xs">
                    ⏰ Trial expires soon. Choose a plan below to continue with uninterrupted access.
                  </p>
                </div>
              </div>
            </div>
          </SlideUp>

          {/* Pricing Plans */}
          <SlideUp delay={0.4}>
            <div className="max-w-6xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                Upgrade Your Plan
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paidPlans.map((plan, index) => (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-2xl p-8 shadow-xl border-2 ${
                      plan.popular ? 'border-purple-500' : 'border-gray-200'
                    } hover:shadow-2xl transition-all duration-300`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {plan.description}
                      </p>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-gray-900">
                          {formatPrice(plan.pricing.monthly)}
                        </span>
                        <span className="text-gray-600 ml-2">
                          {plan.id === 'monthly' ? '/month' :
                           plan.id === 'quarterly' ? '/3 months' :
                           plan.id === 'biannual' ? '/6 months' :
                           '/12 months'}
                        </span>
                      </div>
                      
                      {/* Show savings for longer plans */}
                      {plan.id !== 'monthly' && (
                        <div className="text-green-600 text-sm font-semibold">
                          {plan.id === 'quarterly' && '💰 Save vs Monthly'}
                          {plan.id === 'biannual' && '💰 Great Value!'}
                          {plan.id === 'annual' && '🎉 Best Value!'}
                        </div>
                      )}
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.slice(0, 6).map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700 text-sm">{feature.name}</span>
                        </li>
                      ))}
                      {plan.features.length > 6 && (
                        <li className="text-gray-500 text-sm ml-8">
                          +{plan.features.length - 6} more features
                        </li>
                      )}
                    </ul>

                    <button
                      onClick={() => {
                        // Redirect to payment page with plan details
                        const paymentUrl = `/payment/create?plan=${plan.id}&amount=${plan.pricing.monthly}&name=${encodeURIComponent(plan.name)}`
                        window.location.href = paymentUrl
                      }}
                      className={`block w-full text-center py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                    >
                      {plan.ctaText || `Choose ${plan.name}`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </SlideUp>

          {/* Additional Information */}
          <SlideUp delay={0.6}>
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Choose FlipBook DRM?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
                  <div>
                    <div className="text-2xl mb-2">🔒</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Military-Grade Security</h4>
                    <p>Advanced encryption and DRM protection for your sensitive documents</p>
                  </div>
                  <div>
                    <div className="text-2xl mb-2">⚡</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Lightning Fast</h4>
                    <p>Optimized performance with global CDN and intelligent caching</p>
                  </div>
                  <div>
                    <div className="text-2xl mb-2">🎯</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Easy Integration</h4>
                    <p>Simple APIs and SDKs for seamless integration with your workflow</p>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-gray-600 text-sm">
                    All plans include 24/7 support, 99.9% uptime guarantee, and 30-day money-back guarantee
                  </p>
                </div>
              </div>
            </div>
          </SlideUp>
        </div>
      </FadeIn>
    </div>
  )
}