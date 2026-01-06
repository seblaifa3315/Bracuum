"use client";

import * as React from "react";
import {AudioWaveform, BookOpen, Bot, Command, Frame, GalleryVerticalEnd, Map, PieChart, Settings, Settings2, SquareTerminal} from "lucide-react";

import {NavMain} from "@/components/nav-main";
import {NavAccount} from "@/components/nav-account";
import {NavUser} from "@/components/nav-user";
import {TeamSwitcher} from "@/components/team-switcher";
import {Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar} from "@/components/ui/sidebar";

import {SidebarTrigger} from "@/components/ui/sidebar";

import {BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles} from "lucide-react";
import {ThemeToggle} from "./common/ThemeToggle";

import {useEffect, useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {LogoutButton} from "./auth/logout-button";
import {Button} from "./ui/button";
import { FieldSeparator } from "./ui/field";

// This is sample data.
const data = {
    navMain: [
        {
            title: "Dashboard",
            url: "#",
            icon: SquareTerminal,
            isActive: true,
            items: [
                {
                    title: "General",
                    url: "#",
                },
                {
                    title: "History",
                    url: "#",
                },
                {
                    title: "Settings",
                    url: "#",
                },
            ],
        },
        {
            title: "Clients",
            url: "#",
            icon: Bot,
            items: [
                {
                    title: "Billing",
                    url: "#",
                },
                {
                    title: "Explorer",
                    url: "#",
                },
                {
                    title: "Quantum",
                    url: "#",
                },
            ],
        },
        {
            title: "Activity",
            url: "#",
            icon: BookOpen,
            items: [
                {
                    title: "Introduction",
                    url: "#",
                },
                {
                    title: "Get Started",
                    url: "#",
                },
                {
                    title: "Tutorials",
                    url: "#",
                },
                {
                    title: "Changelog",
                    url: "#",
                },
            ],
        },
        {
            title: "Stats",
            url: "#",
            icon: Settings2,
            items: [
                {
                    title: "General",
                    url: "#",
                },
                {
                    title: "Team",
                    url: "#",
                },
                {
                    title: "Billing",
                    url: "#",
                },
                {
                    title: "Limits",
                    url: "#",
                },
            ],
        },
    ],
    account: [
        {
            name: "Setting",
            url: "#",
            icon: Settings,
        },
        {
            name: "Other",
            url: "#",
            icon: PieChart,
        },
    ],
};

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const {state} = useSidebar();
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

    const user = {
        name: fullName || "Unknown",
        email: email || "no-email@example.com",
        avatar: avatarUrl || "/default-avatar.png",
    };

    return (
        <Sidebar collapsible="icon" {...props}>


            <SidebarHeader>
                <div className={`flex ${state === "expanded" ? "justify-between items-center" : "flex-col items-center gap-2"}`}>
                  
                    <NavUser user={user} />
                    <SidebarTrigger className="-ml-6" />
                    
                </div>
            </SidebarHeader>


            <FieldSeparator></FieldSeparator>

            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavAccount account={data.account} />
                <LogoutButton />
            </SidebarContent>

                      <SidebarFooter>
<ThemeToggle />
          </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
