// ============================================
// 5. app/admin/account-settings/page.tsx (Main Component)
// ============================================
"use client";

import {useEffect, useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {useToast} from "@/hooks/use-toast";
import {Toaster} from "@/components/ui/toaster";
import {AvatarSection} from "./AvatarSection";
import {PersonalInfoSection} from "./PersonalInfoSection";
import {EmailSection} from "./EmailSection";
import {PasswordSection} from "./PasswordSection";

interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
}

export default function AdminAccountSettings() {
    const supabase = createClient();
    const {toast} = useToast();
    const [userData, setUserData] = useState<UserData | null>(null);

    const fetchUser = async () => {
        const {data, error} = await supabase.auth.getUser();
        if (error || !data.user) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load user data",
            });
            return;
        }

        const user = data.user;
        setUserData({
            firstName: user.user_metadata?.first_name || "",
            lastName: user.user_metadata?.last_name || "",
            email: user.email || "",
            avatarUrl: user.user_metadata?.avatar_url || null,
        });
    };

    useEffect(() => {
        fetchUser();
    }, []);

    if (!userData) {
        return (
            <div className="flex items-center justify-center h-full min-h-screen">
                <p className="text-muted-foreground">Loading account...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <Toaster />
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Account Settings</h1>
                    <p className="text-muted-foreground">Manage your account information and preferences</p>
                </div>

                <AvatarSection
                    firstName={userData.firstName}
                    lastName={userData.lastName}
                    email={userData.email}
                    initialAvatarUrl={userData.avatarUrl}
                />

                <PersonalInfoSection
                    initialFirstName={userData.firstName}
                    initialLastName={userData.lastName}
                    onUpdate={fetchUser}
                />

                <EmailSection initialEmail={userData.email} />

                <PasswordSection />
            </div>
        </div>
    );
}