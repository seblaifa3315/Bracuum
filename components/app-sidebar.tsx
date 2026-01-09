"use client";

import * as React from "react";
import {SquareTerminal, ShoppingCart, Users, TrendingUp, Package, AlertCircle, Settings, BarChart3} from "lucide-react";

import {NavMain} from "@/components/nav-main";
import {NavUser} from "@/components/nav-user";
import {Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar} from "@/components/ui/sidebar";

import {SidebarTrigger, SidebarMenuButton} from "@/components/ui/sidebar";
import {ThemeToggle} from "./common/ThemeToggle";

import {useEffect, useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {LogoutButton} from "./auth/logout-button";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Separator} from "@/components/ui/separator";

// Navigation data for single-product ecommerce store
const data = {
    navMain: [
        {
            title: "Dashboard",
            url: "/admin",
            icon: SquareTerminal,
            isActive: true,
        },
        {
            title: "Product",
            url: "/admin/products",
            icon: Package,
        },
        {
            title: "Orders",
            url: "/admin/orders",
            icon: ShoppingCart,
        },
        {
            title: "Customers",
            url: "/admin/customers",
            icon: Users,
        },
        {
            title: "Analytics",
            url: "/admin/analytics",
            icon: BarChart3,
        },
        {
            title: "Warranty Claims",
            url: "/admin/warranty",
            icon: AlertCircle,
        },
        {
            title: "Settings",
            url: "/admin/settings",
            icon: Settings,
        },
    ],
};

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const {state} = useSidebar();
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

    const user = {
        name: fullName || "Unknown",
        email: email || "no-email@example.com",
        avatar: avatarUrl || null,
        initials: fullName
            ? fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
            : "?",
    };

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className={`flex items-center justify-between px-2 py-4 ${state === "collapsed" ? "flex-col gap-3" : ""}`}>
                    <NavUser user={user} />
                    <SidebarTrigger className="-ml-2" />
                </div>
            </SidebarHeader>

            <Separator />

            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>

            <Separator />

            <SidebarFooter>
                <TooltipProvider>
                    <div className={`flex gap-4 w-full ${state === "collapsed" ? "flex-col items-center" : "flex-row items-start justify-between"}`}>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <LogoutButton />
                            </TooltipTrigger>
                            <TooltipContent side="right">Logout</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ThemeToggle />
                            </TooltipTrigger>
                            <TooltipContent side="right">Toggle theme</TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
