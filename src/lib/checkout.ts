'use client'

export interface CheckoutOptions {
  planId: string
  successUrl?: string
  cancelUrl?: string
}

export async function redirectToCheckout({
  planId,
  successUrl = `${window.location.origin}/dashboard?success=true`,
  cancelUrl = `${window.location.origin}/?canceled=true`
}: CheckoutOptions) {
  try {
    // For enterprise plans, redirect to contact sales
    if (planId === 'enterprise') {
      window.location.href = '/contact-sales'
      return
    }

    // For free trial, redirect directly to registration
    if (planId === 'free-trial') {
      window.location.href = '/auth/register?plan=free-trial'
      return
    }

    // Direct redirect to checkout page - this avoids the Client Component error
    window.location.href = `/checkout/${planId}`
  } catch (error) {
    console.error('Checkout error:', error)
    // Show a user-friendly error message
    alert('Sorry, there was an error processing your request. Please try again or contact support.')
  }
}

export function redirectToContactSales() {
  // For now, just redirect to a contact form or email
  window.location.href = 'mailto:sales@flipbook-drm.com?subject=Enterprise Plan Inquiry'
}