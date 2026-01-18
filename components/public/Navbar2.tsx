"use client";

import {useState, useEffect} from "react";
import Link from "next/link";
import {Menu, X} from "lucide-react";
import {ThemeToggle} from "@/components/common/ThemeToggle";
import {Button} from "@/components/ui/button";
import {useTheme} from "next-themes";

export function Navbar2() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const {theme} = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    const isDark = theme === "dark";

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const navLinks = [
        {href: "#features", label: "Features"},
        {href: "#how-it-works", label: "How It Works"},
        {href: "#reviews", label: "Reviews"},
        {href: "#faq", label: "FAQ"},
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <img src={isDark ? `/logo-no-bg-dark.png` : `/logo-no-bg-light.png`} alt="Bracuum Logo" className="h-32 w-32 mt-2 object-contain hover:scale-105 transition-transform" />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className=" font-medium text-muted-foreground transition-colors hover:text-foreground hover:scale-105">
                            {link.label}
                        </Link>
                        // <Link
                        //   key={link.href}
                        //   href={link.href}
                        //   className=" relative overflow-hidden h-6 group "
                        // >
                        //   <span className="block group-hover:-translate-y-full transition-transform duration-300">{link.label}</span>
                        // <span
                        //     className="block absolute top-full left-0 group-hover:translate-y-[-100%] transition-transform duration-300">{link.label}</span>
                        //   {link.label}
                        // </Link>
                    ))}
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-6">
                    <ThemeToggle />
                    <Button asChild variant="accent" className="px-6 hover:opacity-90 transition-all hover:scale-105 hover:shadow-lg inline-block font-bold">
                        <Link href="/">Buy Now</Link>
                    </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex items-center gap-2 md:hidden">
                    <ThemeToggle />
                    <button onClick={toggleMenu} className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle menu">
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-border bg-background">
                    <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="font-medium text-muted-foreground hover:text-foreground transition-colors py-2 " onClick={toggleMenu}>
                                {link.label}
                            </Link>
                        ))}
                        <Button asChild variant="accent" className="w-full text-center mt-2 hover:scale-101 transition-all hover:shadow-lg inline-block font-bold">
                            <Link href="/" onClick={toggleMenu}>
                                Buy Now
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
}
