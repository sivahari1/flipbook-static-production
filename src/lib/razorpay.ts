// Razorpay integration utility
export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id?: string
  prefill: {
    name: string
    email: string
    contact?: string
  }
  theme: {
    color: string
  }
  handler: (response: RazorpayResponse) => void
  modal: {
    ondismiss: () => void
  }
}

export interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id?: string
  razorpay_signature?: string
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_key'

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export const initiateRazorpayPayment = async (options: RazorpayOptions): Promise<void> => {
  const isLoaded = await loadRazorpayScript()
  
  if (!isLoaded) {
    throw new Error('Failed to load Razorpay SDK')
  }

  const razorpay = new window.Razorpay(options)
  razorpay.open()
}

// Plan pricing in INR (converted from USD)
export const getPlanPriceInINR = (usdPrice: number): number => {
  const exchangeRate = 83 // Approximate USD to INR rate
  return Math.round(usdPrice * exchangeRate * 100) // Convert to paise
}

// Quick payment link for testing
export const RAZORPAY_PAYMENT_LINK = 'https://rzp.io/rzp/so4wuV3'