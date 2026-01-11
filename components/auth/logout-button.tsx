"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton({ showLabel = false }: { showLabel?: boolean }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Button
      variant="default"
      size={showLabel ? "default" : "icon"}
      onClick={handleLogout}
      title="Logout"
      className={showLabel ? "justify-start items-center w-full" : ""}
    >
      <LogOut className="w-4 h-4" />
      {showLabel && <span className="ml-2 text-sm font-medium">Logout</span>}
    </Button>
  );
}
