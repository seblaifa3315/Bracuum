import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.FROM_EMAIL || 'Bracuum <onboarding@resend.dev>'
const SELLER_EMAIL = process.env.SELLER_EMAIL || 'seller@example.com'

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

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: SELLER_EMAIL,
    subject: `💰 New Order #${orderNumber} - ${formatPrice(order.totalAmount)}`,
    html,
  })

  if (error) {
    console.error('Failed to send seller notification email:', error)
    throw error
  }

  console.log('Seller notification email sent')
}
