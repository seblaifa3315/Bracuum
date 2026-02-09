import { NextRequest, NextResponse, after } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma/prisma'
import { sendOrderConfirmation, sendSellerNotification } from '@/lib/email'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  // 1. Read raw body (required for signature verification)
  const body = await request.text()

  // 2. Get the Stripe signature header
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('Missing stripe-signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // 3. Verify the webhook signature
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  // 4. Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session)
        break

      case 'charge.updated':
        await handleChargeUpdated(event.data.object as Stripe.Charge)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break

      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // 5. Return 200 to acknowledge receipt
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    // Return 500 so Stripe will retry
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout.session.completed:', session.id)

  // Check if order already exists (idempotency)
  const existingOrder = await prisma.order.findFirst({
    where: { stripeCheckoutSessionId: session.id },
  })

  if (existingOrder) {
    console.log('Order already exists for session:', session.id)
    return
  }

  // Retrieve the full session with expanded data
  const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ['line_items', 'shipping_cost.shipping_rate'],
  }) as Stripe.Checkout.Session

  // Extract metadata
  const metadata = fullSession.metadata || {}
  console.log('Metadata:', metadata)

  const productId = metadata.productId
  const quantity = parseInt(metadata.quantity || '1', 10)
  const productPrice = parseInt(metadata.productPrice || '0', 10)
  const productName = metadata.productName || 'Unknown Product'

  if (!productId) {
    console.error('Missing productId in metadata')
    throw new Error('Missing productId in metadata')
  }

  // Extract customer details
  const customerDetails = fullSession.customer_details
  const shippingDetails = fullSession.collected_information?.shipping_details

  // Debug: log what we're getting from Stripe
  console.log('Customer details:', JSON.stringify(customerDetails, null, 2))
  console.log('Shipping details:', JSON.stringify(shippingDetails, null, 2))
  console.log('Collected information:', JSON.stringify(fullSession.collected_information, null, 2))

  // Parse name into first/last (simple split)
  const fullName = shippingDetails?.name || customerDetails?.name || 'Unknown'
  const nameParts = fullName.split(' ')
  const firstName = nameParts[0] || 'Unknown'
  const lastName = nameParts.slice(1).join(' ') || 'Unknown'

  // Extract shipping address
  const shippingAddress = shippingDetails?.address as Stripe.Address | undefined

  // Calculate amounts (all in cents)
  const subtotal = productPrice * quantity
  const taxAmount = fullSession.total_details?.amount_tax || 0
  const shippingAmount = fullSession.total_details?.amount_shipping || 0
  const totalAmount = fullSession.amount_total || subtotal + taxAmount + shippingAmount

  // Note: Stripe fee is captured via charge.updated webhook (more reliable)

  // Debug: log all values before creating order
  console.log('Order data:', {
    firstName,
    lastName,
    email: customerDetails?.email,
    quantity,
    productPrice,
    subtotal,
    taxAmount,
    shippingAmount,
    totalAmount,
    currency: fullSession.currency,
    shippingAddress,
  })

  // Generate order number atomically (BRC-0001, BRC-0002, etc.)
  // Uses upsert + increment to prevent race conditions
  let counter = await prisma.orderCounter.findUnique({
    where: { id: 'default' },
  })

  if (!counter) {
    // First time: check existing orders to find the highest number
    const lastOrder = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { orderNumber: true },
    })

    let startNumber = 0
    if (lastOrder?.orderNumber) {
      const match = lastOrder.orderNumber.match(/BRC-(\d+)/)
      if (match) {
        startNumber = parseInt(match[1], 10)
      }
    }

    // Create counter starting from the next number
    counter = await prisma.orderCounter.create({
      data: { id: 'default', lastNumber: startNumber + 1 },
    })
  } else {
    // Counter exists, increment it
    counter = await prisma.orderCounter.update({
      where: { id: 'default' },
      data: { lastNumber: { increment: 1 } },
    })
  }

  const orderNumber = `BRC-${counter.lastNumber.toString().padStart(4, '0')}`

  // Create the order
  const order = await prisma.order.create({
    data: {
      // Order number
      orderNumber,
      // Customer info
      firstName,
      lastName,
      email: customerDetails?.email || 'unknown@example.com',
      phoneNumber: customerDetails?.phone || null,
      quantity,

      // Pricing
      productPrice,
      subtotal,
      taxAmount,
      shippingAmount,
      totalAmount,
      // stripeFee is set via charge.updated webhook
      currency: fullSession.currency || 'usd',

      // Status
      status: 'PAID',

      // Stripe
      stripeCheckoutSessionId: session.id,

      // Shipping address (store full object)
      shippingAddress: (shippingAddress || {}) as object,

      // Structured address fields (for US orders)
      addressLine1: shippingAddress?.line1 || null,
      addressLine2: shippingAddress?.line2 || null,
      city: shippingAddress?.city || null,
      state: shippingAddress?.state || null,
      zip: shippingAddress?.postal_code || null,
      country: shippingAddress?.country || null,
    },
  })

  console.log('Order created:', order.id)

  // Send customer confirmation email in background (after response)
  // This prevents webhook timeout while still sending emails
  after(async () => {
    try {
      await sendOrderConfirmation(order)
      await prisma.order.update({
        where: { id: order.id },
        data: { customerEmailSentAt: new Date() },
      })
      console.log('Customer confirmation email sent (background)')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Failed to send order confirmation email:', errorMessage)
      await prisma.order.update({
        where: { id: order.id },
        data: { customerEmailError: errorMessage },
      })
    }
  })

  // Note: Seller notification is sent from charge.updated handler
  // so it includes the Stripe fee
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  console.log('Processing checkout.session.expired:', session.id)

  // With Option B, we don't create orders until payment succeeds,
  // so there's nothing to cancel. Just log for monitoring.
  console.log('Checkout session expired (no order was created):', session.id)
}

async function handleChargeUpdated(charge: Stripe.Charge) {
  // Only process if we have a balance transaction with fee info
  if (!charge.balance_transaction || !charge.payment_intent) {
    return
  }

  console.log('Processing charge.updated:', charge.id)

  try {
    // Get the balance transaction to extract the fee
    const balanceTransaction = typeof charge.balance_transaction === 'string'
      ? await stripe.balanceTransactions.retrieve(charge.balance_transaction)
      : charge.balance_transaction

    if (!balanceTransaction?.fee) {
      return
    }

    // Find the order by payment intent (via checkout session)
    // First, get the checkout session that created this payment
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: charge.payment_intent as string,
      limit: 1,
    })

    const sessionId = sessions.data[0]?.id
    if (!sessionId) {
      console.log('No checkout session found for charge:', charge.id)
      return
    }

    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        stripeCheckoutSessionId: sessionId,
      },
    })

    if (!order) {
      console.log('No order found for session:', sessionId)
      return
    }

    // Only update and notify if fee not already set
    if (order.stripeFee !== null) {
      console.log('Order already has Stripe fee, skipping')
      return
    }

    // Update the order with the Stripe fee
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { stripeFee: balanceTransaction.fee },
    })

    console.log('Updated order with Stripe fee:', balanceTransaction.fee)

    // Send seller notification in background (after response)
    after(async () => {
      try {
        await sendSellerNotification(updatedOrder)
        await prisma.order.update({
          where: { id: order.id },
          data: { sellerEmailSentAt: new Date() },
        })
        console.log('Seller notification email sent (background)')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('Failed to send seller notification email:', errorMessage)
        await prisma.order.update({
          where: { id: order.id },
          data: { sellerEmailError: errorMessage },
        })
      }
    })
  } catch (err) {
    console.error('Failed to update Stripe fee:', err)
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log('Processing charge.refunded:', charge.id)

  try {
    // Find the order by looking up the checkout session from payment intent
    if (!charge.payment_intent) {
      console.log('No payment intent for refunded charge:', charge.id)
      return
    }

    const sessions = await stripe.checkout.sessions.list({
      payment_intent: charge.payment_intent as string,
      limit: 1,
    })

    const sessionId = sessions.data[0]?.id
    if (!sessionId) {
      console.log('No checkout session found for refunded charge:', charge.id)
      return
    }

    // Update order status to REFUNDED
    const updatedOrder = await prisma.order.updateMany({
      where: {
        stripeCheckoutSessionId: sessionId,
        status: { not: 'REFUNDED' }, // Don't update if already refunded
      },
      data: {
        status: 'REFUNDED',
        refundedAt: new Date(),
      },
    })

    if (updatedOrder.count > 0) {
      console.log('Order marked as refunded for session:', sessionId)
    }
  } catch (err) {
    console.error('Failed to handle refund:', err)
  }
}

async function handleDisputeCreated(dispute: Stripe.Dispute) {
  console.log('Processing charge.dispute.created:', dispute.id)

  try {
    // Get the charge from the dispute
    const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id
    if (!chargeId) {
      console.log('No charge found for dispute:', dispute.id)
      return
    }

    const charge = await stripe.charges.retrieve(chargeId)
    if (!charge.payment_intent) {
      console.log('No payment intent for disputed charge:', chargeId)
      return
    }

    const sessions = await stripe.checkout.sessions.list({
      payment_intent: charge.payment_intent as string,
      limit: 1,
    })

    const sessionId = sessions.data[0]?.id
    if (!sessionId) {
      console.log('No checkout session found for disputed charge:', chargeId)
      return
    }

    // Log the dispute - you may want to add a disputes table or status field
    console.log('⚠️ DISPUTE CREATED for order with session:', sessionId)
    console.log('Dispute reason:', dispute.reason)
    console.log('Dispute amount:', dispute.amount)

    // Find and log the order for manual review
    const order = await prisma.order.findFirst({
      where: { stripeCheckoutSessionId: sessionId },
      select: { id: true, orderNumber: true, email: true, totalAmount: true },
    })

    if (order) {
      console.log('⚠️ DISPUTED ORDER:', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerEmail: order.email,
        amount: order.totalAmount,
        disputeReason: dispute.reason,
      })
    }
  } catch (err) {
    console.error('Failed to handle dispute:', err)
  }
}
