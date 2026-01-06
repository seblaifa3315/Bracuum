"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      <aside
        className={`
          fixed z-50 top-0 left-0 h-full w-64
          bg-background text-foreground border-r border-border
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:inset-auto
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-border px-4 font-bold text-lg">
          Admin Logo
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col px-4 py-6 space-y-2">
          <Link
            href="/admin"
            className="block rounded px-3 py-2 hover:bg-primary/10"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/orders"
            className="block rounded px-3 py-2 hover:bg-primary/10"
          >
            Orders
          </Link>
          <Link
            href="/admin/settings"
            className="block rounded px-3 py-2 hover:bg-primary/10"
          >
            Settings
          </Link>
        </nav>

        {/* Bottom actions */}
        <div className="mt-auto flex flex-col gap-2 px-4 pb-4">
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}
