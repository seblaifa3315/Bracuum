"use client";

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function NavbarNew() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="mx-4 my-6">
      <div className="flex items-center justify-between border border-border bg-card px-6 py-4 rounded-full shadow-sm">
        {/* Logo */}
        <a href="/" className="hover:opacity-80 transition-opacity">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="4.706" cy="16" r="4.706" fill="currentColor" className="text-primary" />
            <circle cx="16.001" cy="4.706" r="4.706" fill="currentColor" className="text-primary" />
            <circle cx="16.001" cy="27.294" r="4.706" fill="currentColor" className="text-primary" />
            <circle cx="27.294" cy="16" r="4.706" fill="currentColor" className="text-primary" />
          </svg>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 ml-7">
          {['Products', 'Stories', 'Pricing', 'Docs'].map((item) => (
            <a
              key={item}
              href="#"
              className="relative overflow-hidden h-6 group text-sm font-medium text-foreground"
            >
              <span className="block group-hover:-translate-y-full transition-transform duration-300">
                {item}
              </span>
              <span className="block absolute top-full left-0 group-hover:translate-y-[-100%] transition-transform duration-300 text-primary">
                {item}
              </span>
            </a>
          ))}
        </div>

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center gap-4 ml-auto">
          <button className="border border-border hover:bg-accent px-4 py-2 rounded-full text-sm font-medium transition-colors">
            Contact
          </button>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl hover:shadow-primary/50">
            Get Started
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-foreground hover:text-primary transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute left-0 right-0 mx-4 mt-4 bg-card border border-border rounded-3xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col items-center gap-6 py-8 px-6">
            {['Products', 'Stories', 'Pricing', 'Docs'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-base font-medium text-foreground hover:text-primary transition-colors"
              >
                {item}
              </a>
            ))}
            <div className="w-full h-px bg-border my-2" />
            <button className="w-full border border-border hover:bg-accent px-4 py-2.5 rounded-full text-sm font-medium transition-colors">
              Contact
            </button>
            <button className="w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity shadow-lg">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}