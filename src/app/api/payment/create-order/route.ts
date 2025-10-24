import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { z } from 'zod'

export const runtime = 'nodejs'

const createOrderSchema = z.object({
  planId: z.string(),
  amount: z.number(),
  currency: z.string().default('INR'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, amount, currency } = createOrderSchema.parse(body)

    // For now, we'll create a simple order ID
    // In production, you'd integrate with Razorpay's Order API
    const orderId = `order_${Date.now()}_${session.user.id}`

    // Store the order details in your database if needed
    // await prisma.paymentOrder.create({
    //   data: {
    //     orderId,
    //     userId: session.user.id,
    //     planId,
    //     amount,
    //     currency,
    //     status: 'created'
    //   }
    // })

    return NextResponse.json({
      orderId,
      amount,
      currency,
      planId
    })

  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}