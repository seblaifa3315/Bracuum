'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { label: 'Explore', targetId: 'explore' },
  { label: 'Contact Us', targetId: 'contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setOpen(false);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled || open ? 'bg-white shadow-sm' : 'bg-transparent'
      )}
    >
      <nav className="pl-0 sm:pl-4 lg:pl-26 pr-4 sm:pr-6 lg:pr-8">
        <div className="relative flex items-center justify-between h-16 md:h-20">
          {/* Logo - Left */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center cursor-pointer"
          >
            <img
              src={scrolled || open ? `/logo-no-bg-light.png` : `/logo-no-bg-dark.png`}
              alt="Bracuum logo"
              className="h-16 w-auto"
            />
            <span
              className={cn(
                'text-lg md:text-xl font-bold tracking-wider transition-colors',
                scrolled || open ? 'text-gray-900' : 'text-white'
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
                onClick={() => scrollToId(item.targetId)}
                className={cn(
                  'text-md font-medium transition-colors hover:opacity-70',
                  scrolled ? 'text-gray-600' : 'text-white/90'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Order Now - Right */}
          <div className="hidden md:flex items-center">
            <Link href="/">
              <button className={`cursor-pointer ${scrolled ? 'text-black' : 'text-white'}`}>
                Order Now
              </button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/">
              <button className={`cursor-pointer  px-2 py-1 rounded-sm ${scrolled ? 'text-black hover:bg-black/5' : 'text-white hover:bg-white/20' }`}>
                Order Now
              </button>
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className={cn(
                'p-2 transition-colors cursor-pointer hover:scale-105',
                scrolled || open ? 'text-gray-900' : 'text-white'
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
                    onClick={() => scrollToId(item.targetId)}
                    className="text-base font-medium text-gray-800 text-left py-2 hover:opacity-70 transition-opacity"
                  >
                    {item.label}
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
