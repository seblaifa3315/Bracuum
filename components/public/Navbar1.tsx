"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function Navbar1() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="relative flex items-center border mx-4 md:mx-auto w-[calc(100%-2rem)] md:w-auto md:max-w-4xl justify-between border-slate-700 px-6 py-4 rounded-full text-white text-sm mt-8">
      {/* Logo */}
      <Link href="/">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="4.706" cy="16" r="4.706" fill="#D9D9D9" />
          <circle cx="16.001" cy="4.706" r="4.706" fill="#D9D9D9" />
          <circle cx="16.001" cy="27.294" r="4.706" fill="#D9D9D9" />
          <circle cx="27.294" cy="16" r="4.706" fill="#D9D9D9" />
        </svg>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6 ml-7">
        <Link href="#products" className="relative overflow-hidden h-6 group">
          <span className="block group-hover:-translate-y-full transition-transform duration-300">
            Products
          </span>
          <span className="block absolute top-full left-0 group-hover:translate-y-[-100%] transition-transform duration-300">
            Products
          </span>
        </Link>
        <Link href="#stories" className="relative overflow-hidden h-6 group">
          <span className="block group-hover:-translate-y-full transition-transform duration-300">
            Stories
          </span>
          <span className="block absolute top-full left-0 group-hover:translate-y-[-100%] transition-transform duration-300">
            Stories
          </span>
        </Link>
        <Link href="#pricing" className="relative overflow-hidden h-6 group">
          <span className="block group-hover:-translate-y-full transition-transform duration-300">
            Pricing
          </span>
          <span className="block absolute top-full left-0 group-hover:translate-y-[-100%] transition-transform duration-300">
            Pricing
          </span>
        </Link>
        <Link href="#docs" className="relative overflow-hidden h-6 group">
          <span className="block group-hover:-translate-y-full transition-transform duration-300">
            Docs
          </span>
          <span className="block absolute top-full left-0 group-hover:translate-y-[-100%] transition-transform duration-300">
            Docs
          </span>
        </Link>
      </div>

      {/* Desktop Actions */}
      <div className="hidden ml-14 md:flex items-center gap-4">
        <button className="border border-slate-600 hover:bg-slate-800 px-4 py-2 rounded-full text-sm font-medium transition">
          Contact
        </button>
        <button className="bg-white hover:shadow-[0px_0px_30px_14px] shadow-[0px_0px_30px_7px] hover:shadow-white/50 shadow-white/50 text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-100 transition duration-300">
          Get Started
        </button>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={toggleMenu}
        className="md:hidden text-gray-600"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 bg-black w-full flex flex-col items-center gap-4 py-6 md:hidden z-50">
          <Link
            href="#products"
            className="hover:text-indigo-600 text-base"
            onClick={toggleMenu}
          >
            Products
          </Link>
          <Link
            href="#stories"
            className="hover:text-indigo-600 text-base"
            onClick={toggleMenu}
          >
            Customer Stories
          </Link>
          <Link
            href="#pricing"
            className="hover:text-indigo-600 text-base"
            onClick={toggleMenu}
          >
            Pricing
          </Link>
          <Link
            href="#docs"
            className="hover:text-indigo-600 text-base"
            onClick={toggleMenu}
          >
            Docs
          </Link>
          <button className="border border-slate-600 hover:bg-slate-800 px-4 py-2 rounded-full text-sm font-medium transition">
            Contact
          </button>
          <button className="bg-white hover:shadow-[0px_0px_30px_14px] shadow-[0px_0px_30px_7px] hover:shadow-white/50 shadow-white/50 text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-100 transition duration-300">
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
}
