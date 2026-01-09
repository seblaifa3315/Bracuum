"use client";

import {createClient} from "@/lib/supabase/client";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {LogOut} from "lucide-react";
import {useSidebar} from "@/components/ui/sidebar";

export function LogoutButton() {
    const router = useRouter();
    const {state} = useSidebar();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/auth/login");
    };

    return (
        <Button variant="default" size={state === "collapsed" ? "icon" : "default"} onClick={handleLogout} title="Logout" className={state === "collapsed" ? "" : "justify-start items-center w-3/4"}>
            <LogOut className="w-4 h-4" />
            {state === "expanded" && <span className="ml-2 w-full">Logout</span>}
        </Button>
    );
}
