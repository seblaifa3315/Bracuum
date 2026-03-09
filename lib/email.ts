import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.FROM_EMAIL || 'Bracuum <onboarding@resend.dev>'
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || FROM_EMAIL

export async function getAdminEmails(): Promise<string[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY')
    return []
  }

  const supabase = createClient(url, key)

  const { data, error } = await supabase.auth.admin.listUsers()

  if (error) {
    console.error('Failed to fetch admin users:', error)
    return []
  }

  return (data?.users || [])
    .map((user) => user.email)
    .filter((email): email is string => !!email)
}

interface OrderEmailData {
  id: string
  orderNumber: string
  firstName: string
  lastName: string
  email: string
  quantity: number
  productPrice: number
  subtotal: number
  taxAmount: number
  shippingAmount: number
  totalAmount: number
  stripeFee: number | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

function formatAddress(order: OrderEmailData): string {
  const lines = [
    `${order.firstName} ${order.lastName}`,
    order.addressLine1,
    order.addressLine2,
    `${order.city}, ${order.state} ${order.zip}`,
    order.country,
  ].filter(Boolean)
  return lines.join('<br>')
}

/**
 * Send order confirmation email to the customer
 */
export async function sendOrderConfirmation(order: OrderEmailData) {
  const orderNumber = order.orderNumber

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #000; font-size: 24px; margin-bottom: 10px;">Thank you for your order!</h1>
        <p style="color: #666; font-size: 16px;">Order #${orderNumber}</p>
      </div>

      <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="font-size: 18px; margin-top: 0;">Order Summary</h2>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">Bracuum 2-in-1 Vacuum × ${order.quantity}</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(order.subtotal)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">Shipping</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${order.shippingAmount === 0 ? 'Free' : formatPrice(order.shippingAmount)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">Tax</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(order.taxAmount)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: bold;">Total</td>
            <td style="padding: 10px 0; font-weight: bold; text-align: right;">${formatPrice(order.totalAmount)}</td>
          </tr>
        </table>
      </div>

      <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="font-size: 18px; margin-top: 0;">Shipping Address</h2>
        <p style="margin: 0; color: #666;">
          ${formatAddress(order)}
        </p>
      </div>

      <div style="background: #f0f7ff; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="font-size: 18px; margin-top: 0;">What happens next?</h2>
        <ol style="margin: 0; padding-left: 20px; color: #666;">
          <li>We'll prepare your order for shipping</li>
          <li>You'll receive a shipping confirmation with tracking info</li>
          <li>Your Bracuum will arrive in 2-3 business days</li>
        </ol>
      </div>

      <div style="text-align: center; color: #999; font-size: 14px; margin-top: 30px;">
        <p>Questions? Contact us at <a href="mailto:support@bracuum.com" style="color: #666;">support@bracuum.com</a></p>
        <p style="margin-top: 20px;">© ${new Date().getFullYear()} Bracuum. All rights reserved.</p>
      </div>
    </body>
    </html>
  `

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: order.email,
    subject: `Order Confirmed #${orderNumber}`,
    html,
  })

  if (error) {
    console.error('Failed to send order confirmation email:', error)
    throw error
  }

  console.log('Order confirmation email sent to:', order.email)
}

/**
 * Send notification email to the seller about a new order
 */
export async function sendSellerNotification(order: OrderEmailData) {
  const orderNumber = order.orderNumber
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #22c55e; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">New Order Received!</h1>
        <p style="margin: 10px 0 0; opacity: 0.9;">Order #${orderNumber}</p>
      </div>

      <div style="border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px; padding: 20px;">
        <h2 style="font-size: 18px; margin-top: 0;">Customer Details</h2>
        <table style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="color: #666; padding: 5px 0;">Name:</td>
            <td style="padding: 5px 0;">${order.firstName} ${order.lastName}</td>
          </tr>
          <tr>
            <td style="color: #666; padding: 5px 0;">Email:</td>
            <td style="padding: 5px 0;"><a href="mailto:${order.email}">${order.email}</a></td>
          </tr>
        </table>

        <h2 style="font-size: 18px;">Order Details</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">Bracuum 2-in-1 Vacuum × ${order.quantity}</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(order.subtotal)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">Shipping</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${order.shippingAmount === 0 ? 'Free' : formatPrice(order.shippingAmount)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">Tax</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(order.taxAmount)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: bold;">Total Revenue</td>
            <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #22c55e;">${formatPrice(order.totalAmount)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-top: 1px solid #eee; color: #666;">Stripe Fee</td>
            <td style="padding: 10px 0; border-top: 1px solid #eee; text-align: right; color: #ef4444;">${order.stripeFee ? `-${formatPrice(order.stripeFee)}` : 'Pending'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: bold;">Net Revenue</td>
            <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #22c55e;">${order.stripeFee ? formatPrice(order.totalAmount - order.stripeFee - order.taxAmount) : 'Pending'}</td>
          </tr>
        </table>

        <h2 style="font-size: 18px;">Shipping Address</h2>
        <p style="margin: 0 0 20px; color: #666;">
          ${formatAddress(order)}
        </p>

        <div style="text-align: center; margin-top: 20px;">
          <a href="${baseUrl}/admin" style="display: inline-block; background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View in Admin Dashboard</a>
        </div>
      </div>
    </body>
    </html>
  `

  const adminEmails = await getAdminEmails()

  if (adminEmails.length === 0) {
    console.error('No admin users found to send seller notification')
    return
  }

  const results = await Promise.allSettled(
    adminEmails.map((email) =>
      resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `💰 New Order #${orderNumber} - ${formatPrice(order.totalAmount)}`,
        html,
      })
    )
  )

  const failures = results.filter((r) => r.status === 'rejected')
  if (failures.length > 0) {
    console.error('Failed to send some seller notifications:', failures)
  }
}

/**
 * Send shipping confirmation email to the customer
 */
export async function sendShippingConfirmation(order: {
  orderNumber: string
  firstName: string
  email: string
  carrier: string | null
  shippingMethod: string | null
  trackingNumber: string | null
}) {
  const trackingSection = order.trackingNumber
    ? `<div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="font-size: 18px; margin-top: 0;">Tracking Information</h2>
        <table style="width: 100%;">
          ${order.carrier ? `<tr><td style="color: #666; padding: 5px 0;">Carrier:</td><td style="padding: 5px 0;">${order.carrier}</td></tr>` : ''}
          ${order.shippingMethod ? `<tr><td style="color: #666; padding: 5px 0;">Method:</td><td style="padding: 5px 0;">${order.shippingMethod}</td></tr>` : ''}
          <tr><td style="color: #666; padding: 5px 0;">Tracking #:</td><td style="padding: 5px 0; font-family: monospace;">${order.trackingNumber}</td></tr>
        </table>
      </div>`
    : ''

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #000; font-size: 24px; margin-bottom: 10px;">Your order has shipped!</h1>
        <p style="color: #666; font-size: 16px;">Order #${order.orderNumber}</p>
      </div>

      <div style="background: #f0f7ff; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <p style="margin: 0; color: #333;">Hi ${order.firstName},</p>
        <p style="color: #666;">Great news! Your Bracuum order has been shipped and is on its way to you.</p>
      </div>

      ${trackingSection}

      <div style="text-align: center; color: #999; font-size: 14px; margin-top: 30px;">
        <p>Questions? Contact us at <a href="mailto:support@bracuum.com" style="color: #666;">support@bracuum.com</a></p>
        <p style="margin-top: 20px;">&copy; ${new Date().getFullYear()} Bracuum. All rights reserved.</p>
      </div>
    </body>
    </html>
  `

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: order.email,
    subject: `Your Order #${order.orderNumber} Has Shipped!`,
    html,
  })

  if (error) {
    console.error('Failed to send shipping confirmation email:', error)
    throw error
  }

  console.log('Shipping confirmation email sent to:', order.email)
}

/**
 * Send delivery confirmation email to the customer
 */
export async function sendDeliveryConfirmation(order: {
  orderNumber: string
  firstName: string
  email: string
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #000; font-size: 24px; margin-bottom: 10px;">Your order has been delivered!</h1>
        <p style="color: #666; font-size: 16px;">Order #${order.orderNumber}</p>
      </div>

      <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <p style="margin: 0; color: #333;">Hi ${order.firstName},</p>
        <p style="color: #666;">Your Bracuum order has been delivered. We hope you love it!</p>
      </div>

      <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="font-size: 18px; margin-top: 0;">Good to know</h2>
        <ul style="margin: 0; padding-left: 20px; color: #666;">
          <li>Your product comes with a <strong>1-year warranty</strong> starting today</li>
          <li>You have <strong>30 days</strong> to request a return if needed</li>
          <li>Need help getting started? Check out our support page</li>
        </ul>
      </div>

      <div style="background: #f0f7ff; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
        <p style="margin: 0; color: #666; font-size: 14px;">Need to return your order? <a href="${baseUrl}/returns" style="color: #333; font-weight: 600;">Start a return here</a></p>
      </div>

      <div style="text-align: center; color: #999; font-size: 14px; margin-top: 30px;">
        <p>Questions? Contact us at <a href="mailto:support@bracuum.com" style="color: #666;">support@bracuum.com</a></p>
        <p style="margin-top: 20px;">&copy; ${new Date().getFullYear()} Bracuum. All rights reserved.</p>
      </div>
    </body>
    </html>
  `

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: order.email,
    subject: `Your Order #${order.orderNumber} Has Been Delivered!`,
    html,
  })

  if (error) {
    console.error('Failed to send delivery confirmation email:', error)
    throw error
  }

  console.log('Delivery confirmation email sent to:', order.email)
}

/**
 * Send return request confirmation email to the customer
 */
export async function sendReturnRequestConfirmation(order: {
  orderNumber: string
  firstName: string
  email: string
  returnReason: string | null
  returnShippingAddress: Record<string, string> | null
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const reasonLabels: Record<string, string> = {
    CHANGED_MIND: 'Changed my mind',
    DEFECTIVE: 'Product is defective',
    NOT_AS_DESCRIBED: 'Not as described',
    OTHER: 'Other',
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #000; font-size: 24px; margin-bottom: 10px;">Return Request Received</h1>
        <p style="color: #666; font-size: 16px;">Order #${order.orderNumber}</p>
      </div>

      <div style="background: #f0f7ff; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <p style="margin: 0; color: #333;">Hi ${order.firstName},</p>
        <p style="color: #666;">We've received your return request${order.returnReason ? ` (Reason: ${reasonLabels[order.returnReason] || order.returnReason})` : ''}. Here's what happens next:</p>
      </div>

      <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="font-size: 18px; margin-top: 0;">Return Instructions</h2>
        <ol style="margin: 0; padding-left: 20px; color: #666;">
          <li>Pack the product securely in its original packaging if possible</li>
          <li>Include your order number (<strong>${order.orderNumber}</strong>) inside the package</li>
          <li>Ship the package to the return address below</li>
          <li>Once we receive and inspect the product, we'll process your refund</li>
        </ol>
      </div>

      ${order.returnShippingAddress ? `
      <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="font-size: 18px; margin-top: 0;">Return Address</h2>
        <p style="margin: 0; color: #666;">
          ${[
            order.returnShippingAddress.name,
            order.returnShippingAddress.line1,
            order.returnShippingAddress.line2,
            `${order.returnShippingAddress.city}, ${order.returnShippingAddress.state} ${order.returnShippingAddress.zip}`,
            order.returnShippingAddress.country,
          ].filter(Boolean).join('<br>')}
        </p>
      </div>
      ` : ''}

      <div style="background: #fffbeb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>Important:</strong> Please ship your return within 14 days. Refunds are typically processed within 5-10 business days after we receive the item.</p>
      </div>

      <div style="text-align: center; color: #999; font-size: 14px; margin-top: 30px;">
        <p>Questions? Contact us at <a href="mailto:support@bracuum.com" style="color: #666;">support@bracuum.com</a></p>
        <p style="margin-top: 20px;">&copy; ${new Date().getFullYear()} Bracuum. All rights reserved.</p>
      </div>
    </body>
    </html>
  `

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: order.email,
    subject: `Return Request Confirmed - Order #${order.orderNumber}`,
    html,
  })

  if (error) {
    console.error('Failed to send return request confirmation email:', error)
    throw error
  }

  console.log('Return request confirmation email sent to:', order.email)
}

/**
 * Send return request notification to admin emails
 */
export async function sendReturnRequestAdminNotification(order: {
  orderNumber: string
  firstName: string
  lastName: string
  email: string
  totalAmount: number
  returnReason: string | null
  returnCustomerNote: string | null
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const reasonLabels: Record<string, string> = {
    CHANGED_MIND: 'Changed my mind',
    DEFECTIVE: 'Product is defective',
    NOT_AS_DESCRIBED: 'Not as described',
    OTHER: 'Other',
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #ea580c; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Return Request</h1>
        <p style="margin: 10px 0 0; opacity: 0.9;">Order #${order.orderNumber}</p>
      </div>

      <div style="border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px; padding: 20px;">
        <h2 style="font-size: 18px; margin-top: 0;">Customer Details</h2>
        <table style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="color: #666; padding: 5px 0;">Name:</td>
            <td style="padding: 5px 0;">${order.firstName} ${order.lastName}</td>
          </tr>
          <tr>
            <td style="color: #666; padding: 5px 0;">Email:</td>
            <td style="padding: 5px 0;"><a href="mailto:${order.email}">${order.email}</a></td>
          </tr>
          <tr>
            <td style="color: #666; padding: 5px 0;">Order Total:</td>
            <td style="padding: 5px 0;">${formatPrice(order.totalAmount)}</td>
          </tr>
        </table>

        <h2 style="font-size: 18px;">Return Details</h2>
        <table style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="color: #666; padding: 5px 0;">Reason:</td>
            <td style="padding: 5px 0;">${order.returnReason ? reasonLabels[order.returnReason] || order.returnReason : 'Not specified'}</td>
          </tr>
          ${order.returnCustomerNote ? `<tr>
            <td style="color: #666; padding: 5px 0; vertical-align: top;">Note:</td>
            <td style="padding: 5px 0;">${order.returnCustomerNote}</td>
          </tr>` : ''}
        </table>

        <div style="text-align: center; margin-top: 20px;">
          <a href="${baseUrl}/admin/returns" style="display: inline-block; background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View in Returns Dashboard</a>
        </div>
      </div>
    </body>
    </html>
  `

  const adminEmails = await getAdminEmails()

  if (adminEmails.length === 0) {
    console.error('No admin users found to send return request notification')
    return
  }

  const results = await Promise.allSettled(
    adminEmails.map((email) =>
      resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `Return Request - Order #${order.orderNumber}`,
        html,
      })
    )
  )

  const failures = results.filter((r) => r.status === 'rejected')
  if (failures.length > 0) {
    console.error('Failed to send some return request notifications:', failures)
  }
}

/**
 * Send return received confirmation email to the customer
 */
export async function sendReturnReceivedConfirmation(order: {
  orderNumber: string
  firstName: string
  email: string
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #000; font-size: 24px; margin-bottom: 10px;">We Received Your Return</h1>
        <p style="color: #666; font-size: 16px;">Order #${order.orderNumber}</p>
      </div>

      <div style="background: #f0f7ff; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <p style="margin: 0; color: #333;">Hi ${order.firstName},</p>
        <p style="color: #666;">We've received your returned item for order #${order.orderNumber}. Our team is inspecting it now.</p>
      </div>

      <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="font-size: 18px; margin-top: 0;">What happens next?</h2>
        <p style="margin: 0; color: #666;">Once the inspection is complete, we'll process your refund. You'll receive a confirmation email when the refund has been issued. Refunds typically take 5-10 business days to appear on your statement.</p>
      </div>

      <div style="text-align: center; color: #999; font-size: 14px; margin-top: 30px;">
        <p>Questions? Contact us at <a href="mailto:support@bracuum.com" style="color: #666;">support@bracuum.com</a></p>
        <p style="margin-top: 20px;">&copy; ${new Date().getFullYear()} Bracuum. All rights reserved.</p>
      </div>
    </body>
    </html>
  `

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: order.email,
    subject: `Return Received - Order #${order.orderNumber}`,
    html,
  })

  if (error) {
    console.error('Failed to send return received confirmation email:', error)
    throw error
  }

  console.log('Return received confirmation email sent to:', order.email)
}

/**
 * Send refund confirmation email to the customer
 */
export async function sendRefundConfirmation(order: {
  orderNumber: string
  firstName: string
  email: string
  totalAmount: number
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #000; font-size: 24px; margin-bottom: 10px;">Your Refund Has Been Issued</h1>
        <p style="color: #666; font-size: 16px;">Order #${order.orderNumber}</p>
      </div>

      <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <p style="margin: 0; color: #333;">Hi ${order.firstName},</p>
        <p style="color: #666;">We've issued a refund of <strong>${formatPrice(order.totalAmount)}</strong> for your order #${order.orderNumber}.</p>
      </div>

      <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="font-size: 18px; margin-top: 0;">Refund Details</h2>
        <table style="width: 100%;">
          <tr>
            <td style="color: #666; padding: 5px 0;">Refund Amount:</td>
            <td style="padding: 5px 0; font-weight: bold;">${formatPrice(order.totalAmount)}</td>
          </tr>
          <tr>
            <td style="color: #666; padding: 5px 0;">Timeline:</td>
            <td style="padding: 5px 0;">5-10 business days to appear on your statement</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; color: #999; font-size: 14px; margin-top: 30px;">
        <p>Questions? Contact us at <a href="mailto:support@bracuum.com" style="color: #666;">support@bracuum.com</a></p>
        <p style="margin-top: 20px;">&copy; ${new Date().getFullYear()} Bracuum. All rights reserved.</p>
      </div>
    </body>
    </html>
  `

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: order.email,
    subject: `Refund Issued - Order #${order.orderNumber}`,
    html,
  })

  if (error) {
    console.error('Failed to send refund confirmation email:', error)
    throw error
  }

  console.log('Refund confirmation email sent to:', order.email)
}

/**
 * Send contact form submission to admin emails
 */
export async function sendContactForm(data: {
  name: string
  email: string
  message: string
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #000; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">New Contact Message</h1>
      </div>

      <div style="border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px; padding: 20px;">
        <table style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="color: #666; padding: 5px 0; vertical-align: top; width: 80px;">Name:</td>
            <td style="padding: 5px 0;">${data.name}</td>
          </tr>
          <tr>
            <td style="color: #666; padding: 5px 0; vertical-align: top;">Email:</td>
            <td style="padding: 5px 0;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
        </table>

        <h2 style="font-size: 16px; margin-bottom: 8px;">Message</h2>
        <div style="background: #f9f9f9; border-radius: 6px; padding: 16px; color: #333; white-space: pre-wrap;">${data.message}</div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="mailto:${data.email}?subject=Re: Your message to Bracuum" style="display: inline-block; background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reply to ${data.name}</a>
        </div>
      </div>
    </body>
    </html>
  `

  const adminEmails = await getAdminEmails()

  if (adminEmails.length === 0) {
    console.error('No admin users found to send contact form notification')
    throw new Error('No admin recipients configured')
  }

  const results = await Promise.allSettled(
    adminEmails.map((email) =>
      resend.emails.send({
        from: CONTACT_FROM_EMAIL,
        to: email,
        subject: `New Contact Message from ${data.name}`,
        html,
        replyTo: data.email,
      })
    )
  )

  const failures = results.filter((r) => r.status === 'rejected')
  if (failures.length > 0) {
    console.error('Failed to send some contact notifications:', failures)
    throw new Error('Failed to send contact email')
  }

  console.log('Contact form email sent to admins')
}
