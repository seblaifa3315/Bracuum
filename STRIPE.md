SebastiensMBP2:Bracuum sebastienlaifa$ stripe listen --forward-to localhost:3000/api/webhooks/stripe 

# Stripe Checkout Implementation Guide

This document is a comprehensive guide for implementing Stripe Checkout in the Bracuum project. Follow each step sequentially to build a secure, production-ready payment flow.

---

## Table of Contents

1. [Understanding Stripe Checkout](#1-understanding-stripe-checkout)
2. [Architecture Overview](#2-architecture-overview)
3. [Prerequisites & Setup](#3-prerequisites--setup)
4. [Step 1: Stripe Client Setup](#step-1-stripe-client-setup)
5. [Step 2: Create Checkout Session Endpoint](#step-2-create-checkout-session-endpoint)
6. [Step 3: Cart Page Integration](#step-3-cart-page-integration)
7. [Step 4: Webhook Handler](#step-4-webhook-handler)
8. [Step 5: Success Page](#step-5-success-page)
9. [Step 6: Cancel Page](#step-6-cancel-page)
10. [Step 7: Email Notifications](#step-7-email-notifications)
11. [Step 8: Testing](#step-8-testing)
12. [Step 9: Production Checklist](#step-9-production-checklist)

---

## 1. Understanding Stripe Checkout

### What is Stripe Checkout?

Stripe Checkout is a **hosted payment page** that Stripe provides. Instead of building your own payment form (which requires handling sensitive card data), you redirect customers to a Stripe-hosted page where they enter their payment details.

### Why Hosted Checkout vs Embedded?

| Hosted Checkout | Embedded (Payment Element) |
|-----------------|---------------------------|
| Redirect to stripe.com | Stays on your site |
| Zero PCI compliance burden | Some PCI considerations |
| Stripe handles all UI | You control the UI |
| Less customization | More customization |
| Faster to implement | More complex |

**We're using Hosted Checkout** because it's simpler, more secure, and handles edge cases (3D Secure, retries, etc.) automatically.

### The Payment Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Customer  │     │  Your API   │     │   Stripe    │     │  Webhook    │
│  (Browser)  │     │  (Server)   │     │  (Hosted)   │     │  (Server)   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │ 1. Click Checkout │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │                   │ 2. Create Session │                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │ 3. Return URL     │                   │
       │                   │<──────────────────│                   │
       │                   │                   │                   │
       │ 4. Redirect       │                   │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
       │ 5. Customer pays on Stripe            │                   │
       │──────────────────────────────────────>│                   │
       │                   │                   │                   │
       │                   │                   │ 6. Webhook event  │
       │                   │                   │──────────────────>│
       │                   │                   │                   │
       │                   │                   │   7. Update Order │
       │                   │                   │   8. Send Emails  │
       │                   │                   │                   │
       │ 9. Redirect to success page           │                   │
       │<──────────────────────────────────────│                   │
       │                   │                   │                   │
```

### Critical Concept: Never Trust the Redirect

When Stripe redirects a customer to your success page, **this does NOT mean payment succeeded**. The customer could:
- Manually type your success URL
- Have the page cached
- Experience a network issue before payment completed

**Always use webhooks** to confirm payment. The success page should only display order info - never trigger fulfillment.

---

## 2. Architecture Overview

### Files We'll Create

```
lib/
  stripe.ts                      # Stripe SDK singleton

app/
  api/
    checkout/
      create-session/
        route.ts                 # Creates Stripe Checkout Session
    webhooks/
      stripe/
        route.ts                 # Receives Stripe webhook events
    orders/
      [sessionId]/
        route.ts                 # Fetches order by Stripe session ID
  (public)/
    checkout/
      success/
        page.tsx                 # Post-payment confirmation
      cancel/
        page.tsx                 # Payment cancelled/failed
```

### Files We'll Modify

```
app/(public)/cart/page.tsx       # Add checkout button functionality
package.json                     # Add dependencies
.env.local                       # Add Stripe keys
```

### Data Flow

```
Cart Page
    │
    ▼
POST /api/checkout/create-session
    │
    ├── Validate cart data
    ├── Create Order in DB (status: NEW)
    ├── Create Stripe Checkout Session
    │   └── Include order ID in metadata
    └── Return session.url
    │
    ▼
Redirect to Stripe Checkout (stripe.com)
    │
    ▼
Customer completes payment
    │
    ├─────────────────────────────────┐
    │                                 │
    ▼                                 ▼
Webhook: checkout.session.completed   Redirect to /checkout/success
    │                                      │
    ├── Verify signature                   │
    ├── Extract order ID from metadata     │
    ├── Update Order (status: PAID)        │
    ├── Store shipping/tax details         │
    ├── Send confirmation email            │
    └── Send seller notification           │
                                           │
                                           ▼
                                    GET /api/orders/[sessionId]
                                           │
                                           └── Display order confirmation
```

---

## 3. Prerequisites & Setup

### 3.1 Create Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Create an account (no business verification needed for test mode)
3. Stay in **Test Mode** (toggle in dashboard header)

### 3.2 Get API Keys

1. In Stripe Dashboard → Developers → API Keys
2. Copy these values:
   - **Publishable key**: `pk_test_...` (safe for frontend, but we won't need it for hosted checkout)
   - **Secret key**: `sk_test_...` (server-only, never expose)

### 3.3 Environment Variables

Add to `.env.local`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# App URL (for redirects)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Note:** `STRIPE_WEBHOOK_SECRET` will be obtained in Step 4 when setting up webhooks.

### 3.4 Install Dependencies

```bash
npm install stripe resend
```

- `stripe`: Official Stripe Node.js SDK
- `resend`: Email service for notifications

### 3.5 Configure Stripe Tax (Dashboard)

1. Stripe Dashboard → Settings → Tax
2. Enable Stripe Tax
3. Set your business address (origin for tax calculation)
4. Enable automatic tax collection

### 3.6 Configure Shipping Rates (Dashboard)

1. Stripe Dashboard → Products → Shipping rates
2. Create shipping rate(s):
   - Name: "Standard Shipping"
   - Amount: Your shipping cost (or free)
   - Delivery estimate: Optional but recommended
3. Note the shipping rate ID(s): `shr_...`

---

## Step 1: Stripe Client Setup

### Goal
Create a reusable Stripe client instance that can be imported throughout the application.

### Why a Singleton?

The Stripe SDK should be instantiated once and reused. This:
- Avoids creating multiple instances
- Ensures consistent configuration
- Follows the same pattern as your Prisma client

### File: `lib/stripe.ts`

```typescript
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia', // Use latest stable API version
  typescript: true,
})
```

### Key Points

- **API Version**: Stripe releases new API versions regularly. Pinning a version ensures your code doesn't break when Stripe updates their API. Check the latest version at https://stripe.com/docs/api/versioning
- **TypeScript**: Enables full type safety for Stripe objects
- **Error on missing key**: Fail fast if environment isn't configured

### Verification

After creating this file, you can verify it works by checking TypeScript compilation:
```bash
npx tsc --noEmit
```

---

## Step 2: Create Checkout Session Endpoint

### Goal
Create an API endpoint that:
1. Receives cart data from the frontend
2. Creates a preliminary Order in the database
3. Creates a Stripe Checkout Session
4. Returns the Stripe-hosted checkout URL

### File: `app/api/checkout/create-session/route.ts`

### Request Shape

```typescript
// What the frontend sends
{
  quantity: number  // Number of items (1-10)
}
```

### Response Shape

```typescript
// Success response
{
  url: string  // Stripe Checkout URL to redirect to
}

// Error response
{
  error: string
}
```

### Implementation Logic

```
1. Parse and validate request body
   └── Ensure quantity is 1-10

2. Fetch product from database
   └── Verify product exists and is active

3. Calculate amounts
   ├── Product price × quantity = subtotal
   └── (Tax and shipping calculated by Stripe)

4. Create Order in database
   ├── Status: NEW
   ├── Store product snapshot (price at time of order)
   └── Generate order for tracking

5. Create Stripe Checkout Session
   ├── mode: 'payment' (one-time, not subscription)
   ├── line_items: Product with quantity
   ├── automatic_tax: enabled
   ├── shipping_address_collection: US only
   ├── shipping_options: Your configured rates
   ├── success_url: /checkout/success?session_id={CHECKOUT_SESSION_ID}
   ├── cancel_url: /checkout/cancel
   └── metadata: { orderId: order.id }

6. Update Order with Stripe session ID

7. Return session URL
```

### Stripe Checkout Session Options Explained

| Option | Purpose |
|--------|---------|
| `mode: 'payment'` | One-time payment (vs 'subscription' or 'setup') |
| `line_items` | What the customer is buying |
| `automatic_tax` | Let Stripe calculate sales tax |
| `shipping_address_collection` | Collect shipping address |
| `shipping_options` | Available shipping methods |
| `success_url` | Where to redirect after payment |
| `cancel_url` | Where to redirect if cancelled |
| `metadata` | Your custom data (survives to webhook) |
| `expires_at` | Session expiration (optional, default 24h) |

### The Metadata Pattern

```typescript
metadata: {
  orderId: order.id
}
```

This is crucial. When Stripe sends the webhook, you need to know which Order to update. By storing `orderId` in metadata, it comes back in the webhook payload.

### Line Items Structure

```typescript
line_items: [
  {
    price_data: {
      currency: 'usd',
      product_data: {
        name: product.name,
        description: product.description,
        // images: ['https://...'] // Optional product image
      },
      unit_amount: product.price, // In cents!
    },
    quantity: quantity,
  },
],
```

**Why `price_data` instead of a Stripe Product ID?**

You could pre-create products in Stripe Dashboard and reference them by ID. However, using `price_data` means:
- Your database is the source of truth
- No need to sync products between systems
- Prices can change without Stripe Dashboard updates

### Success URL Token

```typescript
success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
```

The `{CHECKOUT_SESSION_ID}` is a Stripe template variable. Stripe replaces it with the actual session ID when redirecting. This lets your success page fetch order details.

---

## Step 3: Cart Page Integration

### Goal
Add a checkout button that calls the create-session endpoint and redirects to Stripe.

### File: `app/(public)/cart/page.tsx`

### Changes Needed

1. Add loading state for checkout button
2. Create checkout handler function
3. Connect handler to button

### Checkout Handler Logic

```
1. Set loading state
2. POST to /api/checkout/create-session
   └── Body: { quantity: cart.quantity }
3. If error, show error message
4. If success, redirect to session.url
```

### Important: Full Page Redirect

```typescript
window.location.href = session.url
```

Use `window.location.href` (not `router.push`) because you're leaving your site entirely. The user goes to `checkout.stripe.com`.

### Error Handling

Display errors gracefully:
- Network errors
- Validation errors (invalid quantity)
- Product unavailable

### UX Considerations

- Disable button while loading
- Show loading spinner
- Prevent double-clicks
- Clear error when retrying

---

## Step 4: Webhook Handler

### Goal
Create an endpoint that Stripe calls when payment events occur. This is the **source of truth** for order fulfillment.

### File: `app/api/webhooks/stripe/route.ts`

### Understanding Webhooks

When something happens in Stripe (payment succeeds, fails, refunded, etc.), Stripe sends an HTTP POST request to your webhook URL with event details.

```
Stripe Event → POST to your webhook → Your server processes → Returns 200 OK
```

### Webhook Security: Signature Verification

Anyone could POST to your webhook endpoint pretending to be Stripe. To prevent this, Stripe signs every webhook with your `STRIPE_WEBHOOK_SECRET`.

```typescript
const event = stripe.webhooks.constructEvent(
  body,           // Raw request body (must be string, not parsed JSON!)
  signature,      // From Stripe-Signature header
  webhookSecret   // Your STRIPE_WEBHOOK_SECRET
)
```

If the signature is invalid, `constructEvent` throws an error. **Never skip this verification.**

### Critical: Raw Body Requirement

Next.js normally parses request bodies as JSON. But signature verification requires the **raw string body**. You must read it as text:

```typescript
const body = await request.text() // NOT request.json()
```

### Events to Handle

| Event | When it fires | What to do |
|-------|--------------|------------|
| `checkout.session.completed` | Payment succeeded | Update order to PAID, send emails |
| `checkout.session.expired` | Session timed out (24h) | Update order to CANCELLED |
| `checkout.session.async_payment_succeeded` | Delayed payment confirmed | Update order to PAID |
| `checkout.session.async_payment_failed` | Delayed payment failed | Update order to CANCELLED |

For basic card payments, you mainly need `checkout.session.completed`. The async events are for payment methods like bank transfers that take days to settle.

### Webhook Handler Logic

```
1. Read raw body from request
2. Get Stripe-Signature header
3. Verify signature with stripe.webhooks.constructEvent()
4. Switch on event.type

   case 'checkout.session.completed':
     a. Extract session from event.data.object
     b. Get orderId from session.metadata
     c. Fetch full session with expanded data (to get shipping details)
     d. Update Order:
        - status: PAID
        - shippingAddress (from session)
        - taxAmount (from session)
        - shippingAmount (from session)
        - totalAmount (from session)
     e. Send buyer confirmation email
     f. Send seller notification email

   case 'checkout.session.expired':
     a. Extract session
     b. Get orderId from metadata
     c. Update Order status to CANCELLED

5. Return 200 OK (or Stripe will retry)
```

### Expanding Session Data

The webhook payload contains a minimal session object. To get shipping details and line items, you need to retrieve the full session:

```typescript
const session = await stripe.checkout.sessions.retrieve(
  event.data.object.id,
  {
    expand: ['line_items', 'shipping_details', 'customer_details'],
  }
)
```

### Idempotency

Stripe may send the same webhook multiple times (network issues, retries). Your handler must be **idempotent** - processing the same event twice should have the same result as processing it once.

```typescript
// Check if already processed
const order = await prisma.order.findUnique({ where: { id: orderId } })
if (order.status === 'PAID') {
  // Already processed, return success without doing anything
  return NextResponse.json({ received: true })
}
```

### Setting Up Webhook in Stripe Dashboard

**For Development (Local Testing):**

Use Stripe CLI to forward webhooks to localhost:

```bash
# Install Stripe CLI (macOS)
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This outputs a webhook secret starting with `whsec_`. Use this as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

**For Production:**

1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `checkout.session.expired`
4. Copy the signing secret to your production environment

---

## Step 5: Success Page

### Goal
Display order confirmation after successful payment.

### File: `app/(public)/checkout/success/page.tsx`

### How It Works

1. User is redirected from Stripe with `?session_id=cs_xxx`
2. Page extracts session ID from URL
3. Fetches order data from your API
4. Displays confirmation

### Important Considerations

**This page is for display only.** By the time the user sees it:
- The webhook has (likely) already fired
- Order status should already be PAID
- Emails should already be sent

If the webhook hasn't fired yet (rare race condition), the page might show status NEW. This is fine - the webhook will update it.

### What to Display

- Order confirmation number (order ID or generate a friendly number)
- Order summary (product, quantity, price)
- Shipping address
- Total paid
- "You'll receive a confirmation email" message
- Link back to home

### Client vs Server Component

This can be a client component that:
1. Reads `searchParams` for session_id
2. Fetches order on mount
3. Handles loading/error states

Or a server component that:
1. Receives session_id in searchParams prop
2. Fetches order during render
3. Simpler but no loading state

**Recommendation:** Client component for better UX with loading state.

---

## Step 6: Cancel Page

### Goal
Provide a friendly landing when the user cancels checkout or payment fails.

### File: `app/(public)/checkout/cancel/page.tsx`

### When Users Land Here

- They clicked "Back" or closed the Stripe checkout
- Their card was declined
- Session expired
- Any other checkout failure

### What to Display

- Friendly message (not alarming)
- Reassurance that nothing was charged
- Option to try again (link back to cart)
- Option to contact support if issues persist

### Note on Order Cleanup

When a user cancels, there's an Order with status NEW in your database. You have options:

1. **Leave it**: The `checkout.session.expired` webhook will mark it CANCELLED after 24h
2. **Background job**: Periodically clean up old NEW orders
3. **Ignore**: NEW orders that never become PAID are harmless

For MVP, option 1 is fine.

---

## Step 7: Email Notifications

### Goal
Send confirmation emails when payment succeeds.

### File: `lib/email.ts`

### Using Resend

Resend is a modern email API. Simple to use, great deliverability.

### Setup

1. Create account at https://resend.com
2. Add and verify your domain (or use their test domain for development)
3. Create API key
4. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_xxx
   ```

### Email Functions to Create

**1. Buyer Confirmation Email**
- To: Customer email (from order)
- Subject: "Order Confirmed - Bracuum"
- Content:
  - Order number
  - Items purchased
  - Shipping address
  - Total charged
  - Expected delivery info
  - Support contact

**2. Seller Notification Email**
- To: Your business email
- Subject: "New Order #xxx"
- Content:
  - Customer name and email
  - Items and quantity
  - Shipping address
  - Amount received
  - Link to admin dashboard

### Implementation Pattern

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderConfirmation(order: Order) {
  await resend.emails.send({
    from: 'Bracuum <orders@yourdomain.com>',
    to: order.email,
    subject: `Order Confirmed #${order.id}`,
    html: `...` // HTML email content
  })
}
```

### HTML vs React Email

Resend supports React components for emails via `@react-email/components`. For MVP, simple HTML strings work fine. You can upgrade to React Email later for better templates.

### Error Handling

Email sending can fail. Don't let it break your webhook:

```typescript
try {
  await sendOrderConfirmation(order)
} catch (error) {
  console.error('Failed to send confirmation email:', error)
  // Continue - don't fail the webhook for email issues
}
```

---

## Step 8: Testing

### Testing Flow

1. **Start Stripe CLI listener**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. **Start your dev server**
   ```bash
   npm run dev
   ```

3. **Go through checkout flow**
   - Add item to cart
   - Click checkout
   - On Stripe page, use test card

### Stripe Test Cards

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0025 0000 3155 | Requires 3D Secure |
| 4000 0000 0000 9995 | Insufficient funds |

Use any future expiry date and any 3-digit CVC.

### Testing Webhooks

The Stripe CLI shows webhook events in real-time:

```
2024-01-15 10:30:45   --> checkout.session.completed [evt_xxx]
2024-01-15 10:30:45   <-- [200] POST http://localhost:3000/api/webhooks/stripe
```

### Manual Webhook Testing

Stripe CLI can trigger test events:

```bash
stripe trigger checkout.session.completed
```

### Checklist

- [ ] Can create checkout session
- [ ] Redirect to Stripe works
- [ ] Test card payment succeeds
- [ ] Webhook receives event
- [ ] Order status updates to PAID
- [ ] Redirect to success page works
- [ ] Success page shows order info
- [ ] Confirmation email received
- [ ] Seller notification received
- [ ] Cancel flow works
- [ ] Declined card handled gracefully

---

## Step 9: Production Checklist

Before going live:

### Stripe Dashboard

- [ ] Switch from Test to Live mode
- [ ] Add live API keys to production environment
- [ ] Create production webhook endpoint
- [ ] Add live webhook secret to production
- [ ] Verify tax settings
- [ ] Verify shipping rates

### Environment Variables (Production)

```env
STRIPE_SECRET_KEY=sk_live_xxx        # Live secret key
STRIPE_WEBHOOK_SECRET=whsec_xxx      # Live webhook secret
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
RESEND_API_KEY=re_xxx
```

### Code Changes

None! The same code works for test and live - only the API keys differ.

### DNS & Domain

- [ ] Domain verified in Resend
- [ ] SSL certificate active (required for Stripe)

### Testing in Production

1. Make a small real purchase ($1 product or use a coupon)
2. Verify entire flow works
3. Process a refund to confirm that works too

---

## Appendix: Common Issues

### "No signatures found matching the expected signature"

- Using parsed JSON body instead of raw text
- Wrong webhook secret (test vs live, or old secret)
- Request body modified by middleware

### "Webhook keeps retrying"

- Your handler is returning non-200 status
- Handler is throwing uncaught errors
- Handler is timing out (>30s)

### "Order status not updating"

- Webhook not reaching your server (check Stripe Dashboard → Webhooks → Recent deliveries)
- Metadata not being set correctly
- Database update failing silently

### "Emails not sending"

- Invalid Resend API key
- Domain not verified (Resend blocks unverified domains)
- Email going to spam (check spam folder)

### "Redirect not working after payment"

- `success_url` not including full domain
- Missing `{CHECKOUT_SESSION_ID}` template in URL
- Browser blocking redirect (popup blocker)

---

## Quick Reference

### Stripe Objects

| Object | What it is |
|--------|-----------|
| Checkout Session | A single checkout attempt |
| Payment Intent | The actual payment (created by Session) |
| Customer | Optional stored customer (we're not using) |
| Product | Item in Stripe catalog (we're using price_data instead) |
| Price | Pricing for a product (we're using price_data instead) |

### Order Status Flow

```
NEW → (payment succeeds) → PAID → (you ship) → SHIPPED
 │
 └── (session expires/cancelled) → CANCELLED
```

### API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/checkout/create-session` | POST | Create Stripe session, return URL |
| `/api/webhooks/stripe` | POST | Receive Stripe events |
| `/api/orders/[sessionId]` | GET | Fetch order by session ID |

---

## Next Steps

Ready to implement? Follow these steps in order:

1. **[Step 1]** Create `lib/stripe.ts`
2. **[Step 2]** Create `/api/checkout/create-session/route.ts`
3. **[Step 3]** Update cart page with checkout handler
4. **[Step 4]** Create `/api/webhooks/stripe/route.ts`
5. **[Step 5]** Create `/checkout/success/page.tsx`
6. **[Step 6]** Create `/checkout/cancel/page.tsx`
7. **[Step 7]** Create `lib/email.ts` and integrate into webhook
8. **[Step 8]** Test everything thoroughly
9. **[Step 9]** Deploy and go live

Each step builds on the previous. Don't skip ahead!
