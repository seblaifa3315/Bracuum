"use client";

import React, {useState, useEffect} from "react";
import {LayoutDashboard, Package, ShoppingCart, Users, BarChart3, FileWarning, RotateCcw, Settings, ChevronLeft} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ThemeToggle} from "../common/ThemeToggle";
import {LogoutButton} from "../auth/logout-button";
import {createClient} from "@/lib/supabase/client";
import {Avatar} from "./avatar";
import { useRouter, usePathname } from 'next/navigation';

// Sidebar Component
export function Sidebar({activeItem, onItemChange}: {activeItem: string; onItemChange: (item: string) => void}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsExpanded(false);
            } else {
                setIsExpanded(true);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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



    const menuItems = [
        {id: "dashboard", label: "Dashboard", icon: LayoutDashboard, route: ""},
        {id: "product", label: "Product", icon: Package, route: "/product"},
        {id: "order", label: "Order", icon: ShoppingCart, route: "/order"},
        {id: "customers", label: "Customers", icon: Users, route: "/customers"},
        {id: "analytics", label: "Analytics", icon: BarChart3, route: "/analytics"},
        {id: "warranty", label: "Warranty Claim", icon: FileWarning, route: "/warranty"},
        {id: "returns", label: "Returns", icon: RotateCcw, route: "/returns"},
        {id: "settings", label: "Settings", icon: Settings, route: "/settings"},
    ];

    return (
        <div className={`${isExpanded ? "w-64" : "w-20"} bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col relative`}>
            {/* Toggle Button */}
            <Button variant="outline" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="absolute -right-3 top-9 w-6 h-6 rounded-full z-10 shadow-sm">
                <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${!isExpanded ? "rotate-180" : ""}`} />
            </Button>

            {/* Logo/Brand Section */}
            <div className="p-6 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                        <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
                    </div>
                    {isExpanded && <span className="font-semibold text-lg text-sidebar-foreground">Admin Panel</span>}
                </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeItem === item.id;
                        return (
                            <li key={item.id}>
                                <Button
                                    variant={isActive ? "default" : "ghost"}
                                    onClick={() => {
                    onItemChange(item.id);
                    router.push(`/admin/${item.route}`);
                  }}
                                    className={`w-full ${isExpanded ? "justify-start" : "justify-center"} gap-3 ${isActive ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {isExpanded && <span className="font-medium">{item.label}</span>}
                                </Button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-sidebar-border">
                <div className={`flex items-center mb-3 ${isExpanded ? "p-3 rounded-lg bg-sidebar-accent gap-3" : ""}`}>
                    <Avatar avatarUrl={avatarUrl} email={email} size={10} />
                    {isExpanded && (
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-sidebar-foreground truncate">{fullName}</p>
                            <p className="text-xs text-muted-foreground truncate">{email}</p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className={`flex w-full gap-2 ${isExpanded ? "flex-row" : "flex-col"}`}>
                    <div className="flex-1">
                        <ThemeToggle showLabel={isExpanded} />
                    </div>
                    <div className="flex-1">
                        <LogoutButton showLabel={isExpanded} />
                    </div>
                </div>
            </div>
        </div>
    );
}
