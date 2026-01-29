'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/context/CartContext';

const menuItems = [
  { label: 'Explore', targetId: 'features' },
  { label: 'Contact Us', targetId: 'contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHomepage = pathname === '/';
  const { quantity, addToCart } = useCart();

  const baseTextStyle = scrolled || open || !isHomepage ? 'text-black' : 'text-white';
  const hoverStyle = scrolled || open || !isHomepage ? 'hover:bg-black/5' : 'hover:bg-white/20';

  const handleOrderClick = () => {
    if (quantity === 0) {
      addToCart();
    }
    router.push('/cart');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (targetId: string) => {
    setOpen(false);
    if (isHomepage) {
      // Small delay to let menu close animation start
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      router.push(`/#${targetId}`);
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled || open || !isHomepage ? 'bg-white shadow-sm' : 'bg-transparent'
      )}
    >
      <nav className="pl-0 sm:pl-4 lg:pl-26 pr-4 sm:pr-6 lg:pr-8">
        <div className="relative flex items-center justify-between h-16 md:h-20">
          {/* Logo - Left */}
          <button
            onClick={() => {
              if (isHomepage) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                router.push('/');
              }
            }}
            className="flex items-center cursor-pointer"
          >
            <img
              src={scrolled || open || !isHomepage ? `/logo-no-bg-light.png` : `/logo-no-bg-dark.png`}
              alt="Bracuum logo"
              className="h-16 w-auto"
            />
            <span
              className={cn(
                'text-lg md:text-xl font-bold tracking-wider transition-colors',
                scrolled || open || !isHomepage ? 'text-gray-900' : 'text-white'
              )}
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              BRACUUM
            </span>
          </button>

          {/* Menu Items - Center */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {menuItems.map((item) => (
              <button
                key={item.targetId}
                onClick={() => handleNavClick(item.targetId)}
                className={cn(
                  'relative text-md font-medium cursor-pointer group',
                  scrolled || open || !isHomepage ? 'text-gray-600' : 'text-white/90'
                )}
              >
                {item.label}
                <span
                  className={cn(
                    'absolute left-0 -bottom-1 h-0.5 w-0 group-hover:w-full transition-all duration-300',
                    scrolled || open || !isHomepage ? 'bg-gray-600' : 'bg-white/90'
                  )}
                />
              </button>
            ))}
          </div>

          {/* Cart Button - Right */}
          <div className="hidden md:flex items-center">
            <button
              onClick={handleOrderClick}
              className={`cursor-pointer px-3 py-1.5 rounded-sm transition-colors ${baseTextStyle}`}
            >
              {quantity > 0 ? (
                <span className="flex items-center gap-2">
                  <ShoppingCart size={18} />
                  Cart
                  <span className="bg-black text-white px-2.5 py-0.5 rounded-sm text-sm font-bold">
                    {quantity}
                  </span>
                </span>
              ) : (
                <span className={`cursor-pointer px-3 py-1.5 rounded-sm transition-colors ${hoverStyle}`}>
                  Order Now
                </span>
                
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={handleOrderClick}
              className={`cursor-pointer px-3 py-1.5 rounded-sm transition-colors ${baseTextStyle}`}
            >
              {quantity > 0 ? (
                <span className="flex items-center gap-2">
                  <ShoppingCart size={18} />
                  Cart
                  <span className="bg-black text-white px-2.5 py-0.5 rounded-sm text-sm font-bold">
                    {quantity}
                  </span>
                </span>
              ) : (
                <span className={`cursor-pointer px-3 py-1.5 rounded-sm transition-colors ${hoverStyle}`}>
                  Order Now
                </span>
              )}
            </button>
            <button
              onClick={() => setOpen(!open)}
              className={cn(
                'p-2 transition-colors cursor-pointer hover:scale-105',
                scrolled || open || !isHomepage ? 'text-gray-900' : 'text-white'
              )}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4">
              <div className="flex flex-col gap-4">
                {menuItems.map((item) => (
                  <button
                    key={item.targetId}
                    onClick={() => handleNavClick(item.targetId)}
                    className="relative text-base font-medium text-gray-800 text-left py-2 cursor-pointer group w-fit"
                  >
                    {item.label}
                    <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 group-hover:w-full transition-all duration-300 bg-gray-800" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
