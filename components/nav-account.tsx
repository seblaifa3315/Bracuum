"use client";

import {Folder, Forward, MoreHorizontal, Trash2, type LucideIcon} from "lucide-react";
import {LogOut} from "lucide-react";

import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, useSidebar} from "@/components/ui/sidebar";

export function NavAccount({
    account,
}: {
    account: {
        name: string;
        url: string;
        icon: LucideIcon;
    }[];
}) {
    const {isMobile} = useSidebar();

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarMenu>
                {account.map((item) => (
                    <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton tooltip={item.name} asChild>
                            <a href={item.url}>
                                <item.icon />
                                <span>{item.name}</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
