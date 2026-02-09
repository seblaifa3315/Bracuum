import Link from 'next/link'
import { XCircle, ShoppingCart, ArrowLeft } from 'lucide-react'

export default function CheckoutCancel() {
  return (
    <div className="pt-24 lg:pt-32 px-4 max-w-2xl mx-auto pb-12">
      {/* Cancel Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle size={32} className="text-gray-400" />
        </div>
        <h1 className="text-3xl font-medium text-gray-900 mb-2">
          Checkout cancelled
        </h1>
        <p className="text-gray-500">
          Your payment was not processed and you have not been charged.
        </p>
      </div>

      {/* Info Card */}
      <div className="border border-gray-200 rounded-ui p-6 mb-6">
        <h2 className="font-medium text-gray-900 mb-3">What happened?</h2>
        <p className="text-gray-600 text-sm mb-4">
          You may have cancelled the checkout, or there was an issue with the payment.
          Your cart items are still saved and ready when you are.
        </p>
        <p className="text-gray-600 text-sm">
          If you experienced any issues or have questions, please contact us at{' '}
          <a href="mailto:support@bracuum.com" className="text-black underline">
            support@bracuum.com
          </a>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Link
          href="/cart"
          className="flex items-center justify-center gap-2 w-full border border-black bg-black text-white py-4 rounded-ui font-medium tracking-wide hover:bg-transparent hover:text-black transition-colors"
        >
          <ShoppingCart size={20} />
          RETURN TO CART
        </Link>

        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full border border-gray-300 text-gray-700 py-4 rounded-ui font-medium tracking-wide hover:border-gray-400 transition-colors"
        >
          <ArrowLeft size={20} />
          BACK TO HOME
        </Link>
      </div>
    </div>
  )
}
