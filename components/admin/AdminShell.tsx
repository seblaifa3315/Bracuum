"use client";

import { useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { MainContentHeader } from "@/components/admin/MainContentHeader";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [activeItem, setActiveItem] = useState("dashboard");

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeItem={activeItem} onItemChange={setActiveItem} />
      <MainContentHeader activeItem={activeItem}>
        {children}
      </MainContentHeader>
    </div>
  );
}
