"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"

const navItems = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
]

export function Navbar() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* Logo */}
        <Link href="/" className="text-lg font-semibold">
          Bracuum
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium"
            >
              {item.label}
            </Link>
          ))}
          {/* Theme toggle button */}
        <ThemeToggle />
        </nav>

        {/* Mobile nav */}
<Sheet>
  <SheetTrigger asChild>
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>

  <SheetContent
    side="right"
    className="flex w-80 flex-col p-0"
  >
    {/* Header */}
    <div className="border-b px-6 py-4">
      <SheetTitle className="text-base font-semibold">
        Menu
      </SheetTitle>
    </div>

    {/* Navigation */}
    <nav className="flex flex-col gap-1 px-6 py-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-md px-3 py-2 text-sm font-medium transition hover:bg-muted"
        >
          {item.label}
        </Link>
      ))}
    </nav>

    {/* Footer / Settings */}
    <div className="mt-auto border-t px-6 py-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Theme
        </span>
        <ThemeToggle />
      </div>
    </div>
  </SheetContent>
</Sheet>


      </div>
    </header>
  )
}
