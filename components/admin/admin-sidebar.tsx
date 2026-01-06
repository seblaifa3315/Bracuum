"use client";

import {useEffect, useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {Avatar} from "@/components/admin/avatar";
import {LogoutButton} from "@/components/auth/logout-button";
import {ThemeToggle} from "@/components/common/ThemeToggle";

type SidebarProps = {
    open: boolean;
    onClose: () => void;
};

export function AdminSidebar({open, onClose}: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        async function fetchUser() {
            const {
                data: {user},
            } = await supabase.auth.getUser();

            if (!user) return;

            setEmail(user.email ?? null);

            const meta = user.user_metadata as {
                avatar_url?: string;
                first_name?: string;
                last_name?: string;
            };

            if (meta?.avatar_url) setAvatarUrl(meta.avatar_url);
            setFullName([meta?.first_name, meta?.last_name].filter(Boolean).join(" "));
        }

        fetchUser();
    }, [supabase]);

    return (
        <>
            {/* Backdrop (mobile) */}
            {open && <div onClick={onClose} className="fixed inset-0 z-40 bg-foreground/40 lg:hidden" />}

            {/* Sidebar */}
            <aside
                className={`
          fixed z-50 h-screen transition-transform duration-300
          bg-background text-foreground
          border-r border-foreground/10
          lg:static lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
          ${collapsed ? "w-20" : "w-64"}
        `}
            >
                {/* Top */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-foreground/10">
                    {!collapsed && <span className="text-sm font-semibold tracking-tight">Admin</span>}

                    <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:block text-xs opacity-70 hover:opacity-100 transition" aria-label="Toggle sidebar">
                        {collapsed ? "→" : "←"}
                    </button>

                    <button onClick={onClose} className="lg:hidden text-xs opacity-70 hover:opacity-100 transition" aria-label="Close sidebar">
                        ✕
                    </button>
                </div>

                {/* User */}
                <div className="flex flex-col items-center px-4 py-6 border-b border-foreground/10 gap-3">
                    <Avatar avatarUrl={avatarUrl} email={email} className={collapsed ? "h-10 w-10" : "h-16 w-16"} />

                    {!collapsed && (
                        <>
                            <span className="text-sm font-medium text-center">{fullName}</span>
                            <span className="text-xs opacity-70 truncate max-w-full text-center">{email}</span>
                        </>
                    )}
                </div>

                {/* Nav */}
                <nav className="px-2 py-4 space-y-1">
                    <SidebarItem icon="🏠" label="Dashboard" collapsed={collapsed} />
                    <SidebarItem icon="📦" label="Products" collapsed={collapsed} />
                    <SidebarItem icon="🧾" label="Orders" collapsed={collapsed} />
                    <SidebarItem icon="⚙️" label="Settings" collapsed={collapsed} />
                </nav>

                {/* Footer */}
                <div className="mt-auto px-3 py-4 border-t border-foreground/10 space-y-3">
                    {!collapsed && <ThemeToggle />}
                    <LogoutButton />
                </div>
            </aside>
        </>
    );
}

function SidebarItem({icon, label, collapsed}: {icon: string; label: string; collapsed: boolean}) {
    return (
        <div
            className="
        flex items-center gap-3 rounded-md px-3 py-2
        text-sm font-medium cursor-pointer
        opacity-80 hover:opacity-100
        hover:bg-foreground/5
        transition
      "
        >
            <span className="text-lg">{icon}</span>
            {!collapsed && <span>{label}</span>}
        </div>
    );
}
