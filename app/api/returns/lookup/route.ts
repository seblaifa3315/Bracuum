import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/prisma'

const RETURN_WINDOW_DAYS = 30

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, orderNumber } = body

    if (!email || !orderNumber) {
      return NextResponse.json(
        { error: 'Email and order number are required' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNumber.trim(),
        email: { equals: email.trim(), mode: 'insensitive' },
      },
      select: {
        orderNumber: true,
        firstName: true,
        status: true,
        deliveredAt: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'No order found with this order number and email combination' },
        { status: 404 }
      )
    }

    if (order.status === 'RETURN_REQUESTED' || order.status === 'RETURN_RECEIVED' || order.status === 'REFUNDED') {
      return NextResponse.json(
        { error: 'A return has already been initiated for this order' },
        { status: 400 }
      )
    }

    if (order.status !== 'DELIVERED') {
      return NextResponse.json(
        { error: 'This order is not eligible for return. Only delivered orders can be returned.' },
        { status: 400 }
      )
    }

    if (!order.deliveredAt) {
      return NextResponse.json(
        { error: 'This order has no delivery date on record. Please contact support.' },
        { status: 400 }
      )
    }

    const deliveredDate = new Date(order.deliveredAt)
    const returnDeadline = new Date(deliveredDate.getTime() + RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000)
    if (new Date() > returnDeadline) {
      return NextResponse.json(
        { error: 'The 30-day return window has expired for this order' },
        { status: 400 }
      )
    }

    const product = await prisma.product.findFirst({ select: { contactEmail: true } })

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      firstName: order.firstName,
      contactEmail: product?.contactEmail || 'contact@bracuum.com',
    })
  } catch (error) {
    console.error('Return lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to look up order' },
      { status: 500 }
    )
  }
}
