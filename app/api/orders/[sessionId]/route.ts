import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Find order by Stripe checkout session ID
    const order = await prisma.order.findFirst({
      where: { stripeCheckoutSessionId: sessionId },
      select: {
        id: true,
        orderNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        quantity: true,
        productPrice: true,
        subtotal: true,
        taxAmount: true,
        shippingAmount: true,
        totalAmount: true,
        currency: true,
        status: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        zip: true,
        country: true,
        createdAt: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
