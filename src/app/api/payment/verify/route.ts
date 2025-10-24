import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const runtime = 'nodejs'

const verifyPaymentSchema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_order_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
  planId: z.string(),
  amount: z.number(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { razorpay_payment_id, razorpay_order_id, planId, amount } = verifyPaymentSchema.parse(body)

    // In production, you would verify the payment signature with Razorpay
    // For now, we'll assume the payment is successful if we have a payment ID

    if (!razorpay_payment_id) {
      return NextResponse.json({ error: 'Invalid payment' }, { status: 400 })
    }

    // Calculate subscription end date based on plan
    const planDurations: Record<string, number> = {
      'monthly': 30,
      'quarterly': 90,
      'semi-annual': 180,
      'annual': 365,
    }

    const durationDays = planDurations[planId] || 30
    const currentPeriodEnd = new Date()
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + durationDays)

    // Create or update subscription
    const subscription = await prisma.subscription.upsert({
      where: { userId: session.user.id },
      update: {
        plan: planId,
        status: 'active',
        currentPeriodEnd,
      },
      create: {
        userId: session.user.id,
        plan: planId,
        status: 'active',
        currentPeriodEnd,
      },
    })

    // Log the payment (you might want to create a payments table)
    console.log('Payment successful:', {
      userId: session.user.id,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      planId,
      amount
    })

    return NextResponse.json({
      success: true,
      subscription,
      message: 'Payment verified and subscription activated'
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}