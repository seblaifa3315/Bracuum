'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, ArrowRight } from 'lucide-react';
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
      <nav className="pl-0 sm:pl-4 lg:pl-26 pr-2 sm:pr-6 lg:pr-8">
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
              className="h-12 sm:h-16 w-auto"
            />
            <span
              className={cn(
                'text-xs min-[400px]:text-sm sm:text-lg md:text-xl font-bold tracking-wider transition-colors',
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
            {quantity > 0 ? (
              <button
                onClick={handleOrderClick}
                className={cn(
                  'group cursor-pointer px-4 py-2 rounded-ui font-medium',
                  'transition-all duration-200 ease-out',
                  'hover:scale-[1.02] active:scale-[0.98]',
                  baseTextStyle,
                  hoverStyle
                )}
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart
                    size={18}
                    className="transition-transform duration-200 group-hover:-translate-y-0.5"
                  />
                  <span>Cart</span>
                  <span className={cn(
                    'px-2.5 py-0.5 rounded-ui text-sm font-bold',
                    'transition-all duration-200',
                    'group-hover:scale-110',
                    scrolled || open || !isHomepage
                      ? 'bg-black text-white'
                      : 'bg-white text-black'
                  )}>
                    {quantity}
                  </span>
                </span>
              </button>
            ) : (
              <button
                onClick={handleOrderClick}
                className={cn(
                  'group cursor-pointer px-5 py-2 rounded-ui font-medium',
                  'transition-all duration-200 ease-out',
                  'hover:scale-[1.02] active:scale-[0.98]',
                  scrolled || open || !isHomepage
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-white text-black hover:bg-gray-100'
                )}
              >
                <span className="flex items-center gap-1">
                  <span>Order Now</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </span>
              </button>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-1 sm:gap-2">
            {quantity > 0 ? (
              <button
                onClick={handleOrderClick}
                className={cn(
                  'group cursor-pointer px-2 sm:px-3 py-1.5 rounded-ui font-medium text-sm sm:text-base',
                  'transition-all duration-200 ease-out',
                  'active:scale-[0.98]',
                  baseTextStyle,
                  hoverStyle
                )}
              >
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <ShoppingCart size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden min-[400px]:inline">Cart</span>
                  <span className={cn(
                    'px-1.5 sm:px-2.5 py-0.5 rounded-ui text-xs sm:text-sm font-bold',
                    scrolled || open || !isHomepage
                      ? 'bg-black text-white'
                      : 'bg-white text-black'
                  )}>
                    {quantity}
                  </span>
                </span>
              </button>
            ) : (
              <button
                onClick={handleOrderClick}
                className={cn(
                  'group cursor-pointer px-2.5 sm:px-4 py-1.5 rounded-ui font-medium text-sm sm:text-base',
                  'transition-all duration-200 ease-out',
                  'active:scale-[0.98]',
                  scrolled || open || !isHomepage
                    ? 'bg-black text-white'
                    : 'bg-white text-black'
                )}
              >
                <span className="flex items-center gap-1">
                  <span>Order</span>
                  <ArrowRight size={14} />
                </span>
              </button>
            )}
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
