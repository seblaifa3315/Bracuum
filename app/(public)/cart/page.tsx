'use client';

import { useState } from 'react';
import { useCart } from '@/lib/context/CartContext';
import { Minus, Plus, Trash2, Truck, Calendar, Check, ShoppingBag } from 'lucide-react';

const MAX_QUANTITY = 10;

export default function Cart() {
  const { product, quantity, addToCart, updateQuantity, clearCart, getTotal, isLoading } = useCart();
  const [showMaxWarning, setShowMaxWarning] = useState(false);

  const handleIncrease = () => {
    if (quantity >= MAX_QUANTITY) {
      setShowMaxWarning(true);
      setTimeout(() => setShowMaxWarning(false), 3000);
      return;
    }
    updateQuantity(quantity + 1);
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <div className="pt-24 lg:pt-32 px-4 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-light mb-8">Cart</h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (quantity === 0 || !product) {
    return (
      <div className="pt-24 lg:pt-32 px-4 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-light mb-8">Cart</h1>
        <div className="border border-gray-200 rounded-md p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingBag size={32} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
          <button
            onClick={addToCart}
            className="inline-block bg-black text-white px-8 py-3 rounded-sm font-medium tracking-wide hover:bg-transparent hover:text-black border border-black transition-colors cursor-pointer"
          >
            Order Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 lg:pt-32 px-4 max-w-3xl mx-auto pb-12">
      <h1 className="text-4xl md:text-5xl font-light mb-8">Cart</h1>

      {/* Product Card */}
      <div className="border border-gray-200 rounded-md overflow-hidden">
        <div className="p-6">
          {/* Product Info */}
          <div className="flex gap-4 mb-4">
            {/* Product Image */}
            <img
              src="/a.jpg"
              alt={product.name}
              className="w-24 h-24 object-cover rounded-md flex-shrink-0"
            />

            {/* Product Details */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">{product.name}</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            </div>
          </div>

          {/* Max Quantity Warning */}
          {showMaxWarning && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              You can't order more than {MAX_QUANTITY} items at a time.
            </div>
          )}

          {/* Quantity and Price Row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {/* Quantity Controls */}
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => updateQuantity(quantity - 1)}
                  className="px-3 py-2 hover:bg-gray-50 transition-colors text-gray-500 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="px-3 py-2 font-medium min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  className={`px-3 py-2 transition-colors cursor-pointer ${
                    quantity >= MAX_QUANTITY
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Delete Button */}
              <button
                onClick={clearCart}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Remove item"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Price */}
            <span className="text-xl font-medium">
              {formatPrice(product.price * quantity)}
            </span>
          </div>

          {/* Info Box */}
          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Truck size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <span className="font-semibold">Ships in 2-3 days,</span>
                <span className="text-gray-600"> with free delivery and returns (contiguous US only).</span>
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <span className="font-semibold">60 Day Risk-Free Trial:</span>
                <span className="text-gray-600"> Return within 60 days for a full refund.</span>
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Check size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-semibold">1 Year Warranty</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bg-[#f5f1eb] px-6 py-5">
          {/* Total */}
          <div className="flex justify-between items-center mb-1">
            <span className="text-xl font-medium">Total</span>
            <span className="text-xl font-medium">{formatPrice(getTotal())}</span>
          </div>
          <p className="text-right text-sm text-gray-500">
            Taxes and shipping calculated at checkout.
          </p>
        </div>
      </div>

      {/* Checkout Button */}
      <button className="w-full mt-6 border border-black bg-black text-white py-4 rounded-sm font-medium tracking-wide hover:bg-transparent hover:text-black transition-colors cursor-pointer">
        CONTINUE TO CHECKOUT
      </button>
    </div>
  );
}
