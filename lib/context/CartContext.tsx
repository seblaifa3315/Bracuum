'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sku: string | null;
  isActive: boolean;
  preorderEnabled: boolean;
  preorderDepositAmount: number | null;
  createdAt: string;
  updatedAt: string;
}

interface CartContextType {
  product: Product | null;
  quantity: number;
  isLoading: boolean;
  addToCart: () => void;
  updateQuantity: (quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'bracuum-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  // Debug log on every render
  console.log('🛒 Cart state:', { quantity, isLoading, isCartLoaded, product: product?.name });

  // Load cart quantity from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        const parsedQuantity = JSON.parse(stored);
        if (typeof parsedQuantity === 'number') {
          setQuantity(parsedQuantity);
        }
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
    setIsCartLoaded(true);
  }, []);

  // Save cart quantity to localStorage whenever it changes (only after initial load)
  useEffect(() => {
    if (isCartLoaded) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(quantity));
      console.log('Cart quantity:', quantity);
    }
  }, [quantity, isCartLoaded]);

  // Fetch the single product
  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setProduct(data.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, []);

  const addToCart = () => {
    setQuantity((prev) => prev + 1);
  };

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity < 0) return;
    setQuantity(newQuantity);
  };

  const clearCart = () => {
    setQuantity(0);
  };

  const getTotal = () => {
    if (!product) return 0;
    return product.price * quantity;
  };

  return (
    <CartContext.Provider
      value={{
        product,
        quantity,
        isLoading,
        addToCart,
        updateQuantity,
        clearCart,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
