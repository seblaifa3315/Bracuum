import { NextRequest, NextResponse, after } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/prisma'
import { stripe } from '@/lib/stripe'
import {
  sendReturnReceivedConfirmation,
  sendRefundConfirmation,
  sendReturnDeniedNotification,
} from '@/lib/email'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = user.user_metadata?.role === 'admin'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action } = body

    // Find the order
    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    switch (action) {
      case 'mark_received': {
        if (order.status !== 'RETURN_REQUESTED') {
          return NextResponse.json(
            { error: 'Order must be in RETURN_REQUESTED status' },
            { status: 400 }
          )
        }

        const updatedOrder = await prisma.order.update({
          where: { id },
          data: {
            status: 'RETURN_RECEIVED',
            returnReceivedAt: new Date(),
          },
        })

        after(async () => {
          try {
            await sendReturnReceivedConfirmation({
              orderNumber: updatedOrder.orderNumber,
              firstName: updatedOrder.firstName,
              email: updatedOrder.email,
            })
            console.log('Return received confirmation email sent')
          } catch (err) {
            console.error('Failed to send return received email:', err)
          }
        })

        return NextResponse.json({ success: true, data: updatedOrder })
      }

      case 'issue_refund': {
        if (order.status !== 'RETURN_RECEIVED') {
          return NextResponse.json(
            { error: 'Order must be in RETURN_RECEIVED status' },
            { status: 400 }
          )
        }

        if (!order.stripePaymentIntentId) {
          return NextResponse.json(
            { error: 'No payment intent found for this order. Cannot process refund.' },
            { status: 400 }
          )
        }

        // Create Stripe refund — the charge.refunded webhook will update status to REFUNDED
        try {
          await stripe.refunds.create({
            payment_intent: order.stripePaymentIntentId,
          })
        } catch (stripeError) {
          const message = stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error'
          console.error('Stripe refund failed:', message)
          return NextResponse.json(
            { error: `Stripe refund failed: ${message}` },
            { status: 400 }
          )
        }

        // Stripe refund succeeded — update order status immediately
        // (The charge.refunded webhook will also fire, but we update now for responsiveness)
        const refundedOrder = await prisma.order.update({
          where: { id },
          data: {
            status: 'REFUNDED',
            refundedAt: new Date(),
          },
        })

        // Send refund email in background
        after(async () => {
          try {
            await sendRefundConfirmation({
              orderNumber: order.orderNumber,
              firstName: order.firstName,
              email: order.email,
              totalAmount: order.totalAmount,
            })
            console.log('Refund confirmation email sent')
          } catch (err) {
            console.error('Failed to send refund confirmation email:', err)
          }
        })

        return NextResponse.json({
          success: true,
          data: refundedOrder,
        })
      }

      case 'deny_return': {
        if (order.status !== 'RETURN_REQUESTED' && order.status !== 'RETURN_RECEIVED') {
          return NextResponse.json(
            { error: 'Order must be in RETURN_REQUESTED or RETURN_RECEIVED status' },
            { status: 400 }
          )
        }

        const { reason } = body
        if (!reason || typeof reason !== 'string' || !reason.trim()) {
          return NextResponse.json(
            { error: 'A reason is required to deny a return' },
            { status: 400 }
          )
        }

        const deniedOrder = await prisma.order.update({
          where: { id },
          data: {
            status: 'RETURN_DENIED',
            returnDeniedAt: new Date(),
            returnDeniedReason: reason.trim(),
          },
        })

        after(async () => {
          try {
            await sendReturnDeniedNotification({
              orderNumber: deniedOrder.orderNumber,
              firstName: deniedOrder.firstName,
              email: deniedOrder.email,
              reason: reason.trim(),
            })
            console.log('Return denied notification email sent')
          } catch (err) {
            console.error('Failed to send return denied email:', err)
          }
        })

        return NextResponse.json({ success: true, data: deniedOrder })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Return action error:', error)
    return NextResponse.json(
      { error: 'Failed to process return action' },
      { status: 500 }
    )
  }
}
