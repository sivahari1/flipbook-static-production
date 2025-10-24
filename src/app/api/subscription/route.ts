import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const runtime = 'nodejs'

const subscriptionSchema = z.object({
  plan: z.string(),
  status: z.string().default('active'),
  currentPeriodEnd: z.string().transform((str) => new Date(str)),
})

// Get current user's subscription
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Subscription fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}

// Create or update subscription
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan, status, currentPeriodEnd } = subscriptionSchema.parse(body)

    const subscription = await prisma.subscription.upsert({
      where: { userId: session.user.id },
      update: {
        plan,
        status,
        currentPeriodEnd,
      },
      create: {
        userId: session.user.id,
        plan,
        status,
        currentPeriodEnd,
      },
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Subscription update error:', error)
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
  }
}