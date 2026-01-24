'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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

  const scrollToExplore = () => {
    const element = document.getElementById('explore');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setOpen(false);
  };

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="pl-0 sm:pl-4 lg:pl-26 pr-4 sm:pr-6 lg:pr-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button
            onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center cursor-pointer"
          >
            <img
              src={scrolled ? `/logo-no-bg-light.png` : `/logo-no-bg-dark.png`}
              alt="Bracuum logo"
              className="h-20 w-auto"
            />
            <span
              className={`text-2xl md:text-3xl font-bold tracking-wider ${
                scrolled ? 'text-gray-900' : 'text-white'
              }`}
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              BRACUUM
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={scrollToExplore}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                scrolled ? 'text-gray-600' : 'text-white/90'
              }`}
            >
              Explore Bracuum
            </button>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 text-white font-semibold px-6">
                Order Now
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-3">
            <Link href="/buy">
              <button className={`px-4 py-2 text-sm font-semibold rounded-sm transition-all duration-200 ${scrolled ? 'text-black hover:bg-black/10' : 'text-white hover:bg-white/10'}`}>
                Order Now
              </button>
            </Link>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={scrolled ? 'text-gray-900' : 'text-white'}
                >
                  {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <button
                    onClick={scrollToExplore}
                    className="text-lg font-medium text-gray-600 hover:text-primary text-left py-2"
                  >
                    Explore Bracuum
                  </button>
                  <Link
                    href="/buy"
                    className="text-lg font-medium text-gray-600 hover:text-primary py-2"
                    onClick={() => setOpen(false)}
                  >
                    Buy Now
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
