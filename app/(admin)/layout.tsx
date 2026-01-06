import { ReactNode } from "react";
import { IdleLogout } from "@/components/auth/IdleLogout";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-theme min-h-screen bg-background text-foreground">
      {/* Client-only idle logout */}
      <IdleLogout />

      {/* Main content */}
      {children}
    </div>
  );
}
