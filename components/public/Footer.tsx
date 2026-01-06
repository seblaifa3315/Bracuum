import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t py-6 bg-background">
  <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">

    {/* Copyright */}
    <p className="text-sm text-muted-foreground">
      &copy; {new Date().getFullYear()} VacuumCo. All rights reserved.
    </p>

    {/* Links */}
    <div className="flex flex-wrap justify-center gap-6 text-sm">
      <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
      <Link href="/terms" className="hover:underline">Terms</Link>
      <Link href="/contact" className="hover:underline">Contact</Link>
    </div>

  </div>
</footer>
  )
}
