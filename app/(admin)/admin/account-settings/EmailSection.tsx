// ============================================
// 3. components/account/EmailSection.tsx
// ============================================
"use client";

import {useState} from "react";
import {Mail, Save} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {useToast} from "@/hooks/use-toast";
import {createClient} from "@/lib/supabase/client";

interface EmailSectionProps {
    initialEmail: string;
}

export function EmailSection({initialEmail}: EmailSectionProps) {
    const supabase = createClient();
    const {toast} = useToast();
    
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState(initialEmail);

    const hasChanges = email !== initialEmail;

    const handleSubmit = async () => {
        if (!hasChanges) {
            toast({
                variant: "destructive",
                title: "No Changes",
                description: "Please enter a different email address",
            });
            return;
        }

        setLoading(true);

        try {
            const {error} = await supabase.auth.updateUser(
                {email},
                {emailRedirectTo: `${window.location.origin}/auth/email-change`}
            );

            if (error) throw error;

            toast({
                title: "Confirmation Emails Sent",
                description: "We've sent verification links to both your current and new email addresses. Please confirm both to complete the change.",
                duration: 7000,
            });
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Email Update Failed",
                description: err instanceof Error ? err.message : "Failed to update email",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEmail(initialEmail);
    };

    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Mail size={20} className="text-primary" />
                            Email Address
                        </h3>
                        <div className="space-y-4 mb-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="admin@example.com" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    disabled={loading} 
                                />
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-1">Email Change Process:</p>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    Changing your email requires confirmation from both your current and new email addresses. You'll receive verification links at both addresses.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                type="button"
                                onClick={handleCancel}
                                variant="outline"
                                disabled={loading || !hasChanges}
                            >
                                Cancel
                            </Button>
                            <Button type="button" onClick={handleSubmit} disabled={loading || !hasChanges}>
                                <Save size={20} />
                                {loading ? "Sending..." : "Change Email"}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
