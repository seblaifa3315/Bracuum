import { NextRequest, NextResponse, after } from 'next/server'
import { prisma } from '@/lib/prisma/prisma'
import { sendReturnRequestConfirmation, sendReturnRequestAdminNotification } from '@/lib/email'

const VALID_REASONS = ['CHANGED_MIND', 'DEFECTIVE', 'NOT_AS_DESCRIBED', 'OTHER']
const RETURN_WINDOW_DAYS = 30

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, orderNumber, reason, note } = body

    // Validate required fields
    if (!email || !orderNumber || !reason) {
      return NextResponse.json(
        { error: 'Email, order number, and reason are required' },
        { status: 400 }
      )
    }

    if (!VALID_REASONS.includes(reason)) {
      return NextResponse.json(
        { error: 'Invalid return reason' },
        { status: 400 }
      )
    }

    // Find order by order number + email (case-insensitive)
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNumber.trim(),
        email: { equals: email.trim(), mode: 'insensitive' },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'No order found with this order number and email combination' },
        { status: 404 }
      )
    }

    // Validate order is in DELIVERED status
    if (order.status !== 'DELIVERED') {
      if (order.status === 'RETURN_REQUESTED' || order.status === 'RETURN_RECEIVED' || order.status === 'REFUNDED') {
        return NextResponse.json(
          { error: 'A return has already been initiated for this order' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'This order is not eligible for return. Only delivered orders can be returned.' },
        { status: 400 }
      )
    }

    // Validate within 30-day return window
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

    // Fetch product to get return shipping address
    const product = await prisma.product.findFirst()
    const returnShippingAddress = product?.returnShippingAddress as Record<string, string> | null

    // Update order status to RETURN_REQUESTED
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'RETURN_REQUESTED',
        returnRequestedAt: new Date(),
        returnReason: reason,
        returnCustomerNote: note?.trim() || null,
      },
    })

    // Send emails in background
    after(async () => {
      try {
        await sendReturnRequestConfirmation({
          orderNumber: updatedOrder.orderNumber,
          firstName: updatedOrder.firstName,
          email: updatedOrder.email,
          returnReason: updatedOrder.returnReason,
          returnShippingAddress,
        })
        console.log('Return request confirmation email sent')
      } catch (error) {
        console.error('Failed to send return request confirmation email:', error)
      }

      try {
        await sendReturnRequestAdminNotification({
          orderNumber: updatedOrder.orderNumber,
          firstName: updatedOrder.firstName,
          lastName: updatedOrder.lastName,
          email: updatedOrder.email,
          totalAmount: updatedOrder.totalAmount,
          returnReason: updatedOrder.returnReason,
          returnCustomerNote: updatedOrder.returnCustomerNote,
        })
        console.log('Return request admin notification sent')
      } catch (error) {
        console.error('Failed to send return request admin notification:', error)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Return request submitted successfully',
      returnShippingAddress,
    })
  } catch (error) {
    console.error('Return request error:', error)
    return NextResponse.json(
      { error: 'Failed to process return request' },
      { status: 500 }
    )
  }
}
