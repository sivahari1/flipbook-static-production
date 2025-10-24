import { NextRequest, NextResponse } from 'next/server'
import { getPlanById } from '@/lib/subscription-plans'
import { z } from 'zod'

export const runtime = 'nodejs'

const checkoutSchema = z.object({
  priceId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { priceId } = checkoutSchema.parse(body)

    // Extract plan ID from price ID (assuming format like 'price_monthly', 'price_quarterly', etc.)
    const planId = priceId.replace('price_', '')
    const plan = getPlanById(planId)

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // For free trial, redirect directly to registration
    if (planId === 'free-trial') {
      return NextResponse.json({ 
        url: '/auth/register?plan=free-trial' 
      })
    }

    // For paid plans, redirect to subscription page with plan details
    // Authentication will be handled on the subscription/payment page
    const subscriptionUrl = `/subscription?plan=${planId}&amount=${plan.pricing.monthly}&name=${encodeURIComponent(plan.name)}`
    
    return NextResponse.json({ 
      url: subscriptionUrl 
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}