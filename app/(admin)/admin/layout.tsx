import {ReactNode} from "react";
import {AppSidebar} from "@/components/app-sidebar";
import {SidebarProvider} from "@/components/ui/sidebar";

export default function AdminLayout({children}: {children: ReactNode}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <div className="w-full">{children}</div>
        </SidebarProvider>
    );
}
