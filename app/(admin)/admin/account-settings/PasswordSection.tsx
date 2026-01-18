// ============================================
// 4. components/account/PasswordSection.tsx
// ============================================
"use client";

import {useState} from "react";
import {Lock, Save} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {useToast} from "@/hooks/use-toast";
import {createClient} from "@/lib/supabase/client";

export function PasswordSection() {
    const supabase = createClient();
    const {toast} = useToast();
    
    const [loading, setLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const hasChanges = currentPassword || newPassword || confirmNewPassword;

    const handleSubmit = async () => {
        if (!hasChanges) {
            toast({
                variant: "destructive",
                title: "No Changes",
                description: "Please fill in the password fields",
            });
            return;
        }

        setLoading(true);

        try {
            const {data: userData} = await supabase.auth.getUser();
            if (!userData.user) throw new Error("User not found");

            if (!currentPassword) throw new Error("Current password is required");

            const {error: signInError} = await supabase.auth.signInWithPassword({
                email: userData.user.email!,
                password: currentPassword,
            });
            if (signInError) throw new Error("Current password is incorrect");

            if (!newPassword) throw new Error("New password is required");
            if (newPassword !== confirmNewPassword) throw new Error("New passwords do not match");

            const isValidPassword =
                newPassword.length >= 8 &&
                /[A-Z]/.test(newPassword) &&
                /[a-z]/.test(newPassword) &&
                /[0-9]/.test(newPassword) &&
                /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

            if (!isValidPassword) {
                throw new Error("New password must be at least 8 characters, include uppercase, lowercase, number, and special character");
            }

            const {error: updateError} = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) throw updateError;

            toast({
                title: "Success",
                description: "Password changed successfully!",
            });

            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Password Update Failed",
                description: err instanceof Error ? err.message : "Failed to update password",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
    };

    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Lock size={20} className="text-primary" />
                            Change Password
                        </h3>
                        <div className="space-y-4 mb-6">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input 
                                    id="currentPassword" 
                                    type="password" 
                                    placeholder="Enter current password" 
                                    value={currentPassword} 
                                    onChange={(e) => setCurrentPassword(e.target.value)} 
                                    disabled={loading} 
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input 
                                        id="newPassword" 
                                        type="password" 
                                        placeholder="Enter new password" 
                                        value={newPassword} 
                                        onChange={(e) => setNewPassword(e.target.value)} 
                                        disabled={loading} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                                    <Input 
                                        id="confirmNewPassword" 
                                        type="password" 
                                        placeholder="Confirm new password" 
                                        value={confirmNewPassword} 
                                        onChange={(e) => setConfirmNewPassword(e.target.value)} 
                                        disabled={loading} 
                                    />
                                </div>
                            </div>
                            <div className="bg-muted border border-border rounded-lg p-4">
                                <p className="text-sm text-foreground font-medium mb-2">Password Requirements:</p>
                                <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                                    <li>At least 8 characters long</li>
                                    <li>Contains at least one uppercase letter</li>
                                    <li>Contains at least one lowercase letter</li>
                                    <li>Contains at least one number</li>
                                    <li>Contains at least one special character</li>
                                </ul>
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
                                {loading ? "Changing..." : "Change Password"}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
