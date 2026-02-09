'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Mail, ArrowLeft, Loader2 } from 'lucide-react'
import { useCart } from '@/lib/context/CartContext'

interface Order {
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
  currency: string
  status: string
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  createdAt: string
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { clearCart } = useCart()
  const cartCleared = useRef(false)

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided')
      setIsLoading(false)
      return
    }

    let isCancelled = false
    const maxRetries = 10
    const retryDelay = 1500 // 1.5 seconds between retries

    async function fetchOrderWithRetry(attempt = 1): Promise<void> {
      if (isCancelled) return

      try {
        const response = await fetch(`/api/orders/${sessionId}`)
        const data = await response.json()

        if (isCancelled) return

        if (response.ok) {
          setOrder(data.order)
          setIsLoading(false)

          // Clear the cart after successful order (only once)
          if (!cartCleared.current) {
            clearCart()
            cartCleared.current = true
          }
          return
        }

        // If order not found and we have retries left, wait and try again
        // This handles the race condition where webhook hasn't processed yet
        if (response.status === 404 && attempt < maxRetries) {
          console.log(`Order not found, retrying... (${attempt}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          return fetchOrderWithRetry(attempt + 1)
        }

        throw new Error(data.error || 'Failed to fetch order')
      } catch (err) {
        if (isCancelled) return
        console.error('Error fetching order:', err)
        setError(err instanceof Error ? err.message : 'Failed to load order')
        setIsLoading(false)
      }
    }

    fetchOrderWithRetry()

    return () => {
      isCancelled = true
    }
  }, [sessionId, clearCart])

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  }

  if (isLoading) {
    return (
      <div className="pt-24 lg:pt-32 px-4 max-w-2xl mx-auto text-center">
        <Loader2 size={48} className="animate-spin mx-auto text-gray-400" />
        <p className="mt-4 text-gray-500">Loading your order...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="pt-24 lg:pt-32 px-4 max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-medium text-gray-900 mb-4">
          {error === 'Order not found' ? 'Order Not Found' : 'Something went wrong'}
        </h1>
        <p className="text-gray-500 mb-8">
          {error === 'Order not found'
            ? 'Your order may still be processing. Please check your email for confirmation.'
            : error || 'Unable to load order details.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-black hover:underline"
        >
          <ArrowLeft size={18} />
          Return to home
        </Link>
      </div>
    )
  }

  return (
    <div className="pt-24 lg:pt-32 px-4 max-w-2xl mx-auto pb-12">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-medium text-gray-900 mb-2">
          Thank you for your order!
        </h1>
        <p className="text-gray-500">
          Order #{order.orderNumber}
        </p>
      </div>

      {/* Order Details Card */}
      <div className="border border-gray-200 rounded-ui overflow-hidden mb-6">
        {/* Email Confirmation Notice */}
        <div className="bg-blue-50 px-6 py-4 flex items-start gap-3">
          <Mail size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            A confirmation email has been sent to <strong>{order.email}</strong>
          </p>
        </div>

        {/* Order Summary */}
        <div className="p-6">
          <h2 className="font-medium text-gray-900 mb-4">Order Summary</h2>

          {/* Product Line */}
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">
              Bracuum 2-in-1 Vacuum × {order.quantity}
            </span>
            <span className="font-medium">{formatPrice(order.subtotal)}</span>
          </div>

          {/* Shipping */}
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">
              {order.shippingAmount === 0 ? 'Free' : formatPrice(order.shippingAmount)}
            </span>
          </div>

          {/* Tax */}
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Tax</span>
            <span className="font-medium">{formatPrice(order.taxAmount)}</span>
          </div>

          {/* Total */}
          <div className="flex justify-between py-3">
            <span className="text-lg font-medium">Total</span>
            <span className="text-lg font-medium">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-start gap-3">
            <Package size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Shipping to</h3>
              <p className="text-gray-600 text-sm">
                {order.firstName} {order.lastName}
                <br />
                {order.addressLine1}
                {order.addressLine2 && <><br />{order.addressLine2}</>}
                <br />
                {order.city}, {order.state} {order.zip}
                <br />
                {order.country}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="bg-gray-50 rounded-ui p-6 mb-6">
        <h2 className="font-medium text-gray-900 mb-3">What happens next?</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>1. We&apos;ll prepare your order for shipping</li>
          <li>2. You&apos;ll receive a shipping confirmation with tracking info</li>
          <li>3. Your Bracuum will arrive in 2-3 business days</li>
        </ul>
      </div>

      {/* Back to Home */}
      <Link
        href="/"
        className="block w-full text-center border border-black bg-black text-white py-4 rounded-ui font-medium tracking-wide hover:bg-transparent hover:text-black transition-colors"
      >
        CONTINUE SHOPPING
      </Link>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="pt-24 lg:pt-32 px-4 max-w-2xl mx-auto text-center">
      <Loader2 size={48} className="animate-spin mx-auto text-gray-400" />
      <p className="mt-4 text-gray-500">Loading your order...</p>
    </div>
  )
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  )
}
