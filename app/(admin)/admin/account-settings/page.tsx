"use client";

import {useEffect, useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Camera, User, Mail, Lock, Save, X} from "lucide-react";
import defaultAvatar from "@/assets/defaultAvatar.jpg";
import {useToast} from "@/hooks/use-toast";
import {Toaster} from "@/components/ui/toaster";

interface AccountFormData {
    first_name: string;
    last_name: string;
    email: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export default function AdminAccountSettings() {
    const supabase = createClient();
    const {toast} = useToast();

    const [avatarLoading, setAvatarLoading] = useState(false);
    const [personalInfoLoading, setPersonalInfoLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>(defaultAvatar.src);

    const [originalData, setOriginalData] = useState<AccountFormData | null>(null);
    const [formData, setFormData] = useState<AccountFormData>({
        first_name: "",
        last_name: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    // Fetch user data on mount
    useEffect(() => {
        fetchUser();
    }, []);

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
        const initialData: AccountFormData = {
            first_name: user.user_metadata?.first_name || "",
            last_name: user.user_metadata?.last_name || "",
            email: user.email || "",
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        };

        setFormData(initialData);
        setOriginalData(initialData);

        const avatarUrl = user.user_metadata?.avatar_url || null;
        setCurrentAvatarUrl(avatarUrl);
        setAvatarPreview(avatarUrl || defaultAvatar.src);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    // Generate unique avatar path with timestamp to avoid caching
    const getAvatarPath = (userId: string) => `private/${userId}/avatar-${Date.now()}.jpg`;

    // Get user's avatar folder path
    const getUserAvatarFolder = (userId: string) => `private/${userId}`;

    // Delete all avatars in user's folder
    const deleteAllUserAvatars = async (userId: string) => {
        const folderPath = getUserAvatarFolder(userId);

        const {data: files, error: listError} = await supabase.storage.from("avatars").list(folderPath);

        if (listError) {
            console.log("Error listing files:", listError);
            return;
        }

        if (!files || files.length === 0) {
            console.log("No existing avatars to delete");
            return;
        }

        const filesToDelete = files.map((file) => `${folderPath}/${file.name}`);
        const {error: deleteError} = await supabase.storage.from("avatars").remove(filesToDelete);

        if (deleteError) {
            console.log("Error deleting files:", deleteError);
        } else {
            console.log(`Deleted ${filesToDelete.length} old avatar(s)`);
        }
    };

    // Update user metadata with new avatar URL
    const updateUserAvatar = async (avatarUrl: string | null) => {
        const {error} = await supabase.auth.updateUser({
            data: {avatar_url: avatarUrl},
        });

        if (error) throw error;
    };

    // Handle image upload
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast({
                variant: "destructive",
                title: "Invalid File",
                description: "Please select a valid image file",
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({
                variant: "destructive",
                title: "File Too Large",
                description: "Image size must be less than 5MB",
            });
            return;
        }

        setAvatarLoading(true);

        try {
            const {data: userData} = await supabase.auth.getUser();
            if (!userData.user) throw new Error("User not found");

            const userId = userData.user.id;

            await deleteAllUserAvatars(userId);

            const filePath = getAvatarPath(userId);

            const {error: uploadError} = await supabase.storage.from("avatars").upload(filePath, file, {
                contentType: file.type,
            });

            if (uploadError) {
                console.error("Upload error:", uploadError);
                throw uploadError;
            }

            console.log("New avatar uploaded successfully:", filePath);

            const {data: urlData} = supabase.storage.from("avatars").getPublicUrl(filePath);

            const newAvatarUrl = urlData.publicUrl;

            await updateUserAvatar(newAvatarUrl);

            setCurrentAvatarUrl(newAvatarUrl);
            setAvatarPreview(newAvatarUrl);

            toast({
                title: "Success",
                description: "Avatar updated successfully!",
            });
        } catch (err) {
            console.error("Avatar upload error:", err);
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: err instanceof Error ? err.message : "Failed to upload avatar",
            });
        } finally {
            setAvatarLoading(false);
            e.target.value = "";
        }
    };

    // Handle avatar removal
    const handleRemoveAvatar = async () => {
        setAvatarLoading(true);

        try {
            const {data: userData} = await supabase.auth.getUser();
            if (!userData.user) throw new Error("User not found");

            const userId = userData.user.id;

            await deleteAllUserAvatars(userId);

            await updateUserAvatar(null);

            setCurrentAvatarUrl(null);
            setAvatarPreview(defaultAvatar.src);

            toast({
                title: "Success",
                description: "Avatar removed successfully!",
            });
        } catch (err) {
            console.error("Avatar removal error:", err);
            toast({
                variant: "destructive",
                title: "Removal Failed",
                description: err instanceof Error ? err.message : "Failed to remove avatar",
            });
        } finally {
            setAvatarLoading(false);
        }
    };

    // Handle personal information update
    const handlePersonalInfoSubmit = async () => {
        if (!originalData) return;

        if (formData.first_name === originalData.first_name && formData.last_name === originalData.last_name) {
            toast({
                variant: "destructive",
                title: "No Changes",
                description: "Please modify at least one field before saving",
            });
            return;
        }

        setPersonalInfoLoading(true);

        try {
            const {error: updateError} = await supabase.auth.updateUser({
                data: {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                },
            });

            if (updateError) throw updateError;

            toast({
                title: "Success",
                description: "Personal information updated successfully!",
            });

            setOriginalData({
                ...originalData,
                first_name: formData.first_name,
                last_name: formData.last_name,
            });

            await fetchUser();
        } catch (err) {
            console.error("Personal info update error:", err);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: err instanceof Error ? err.message : "Failed to update personal information",
            });
        } finally {
            setPersonalInfoLoading(false);
        }
    };

    // Handle email change
    const handleEmailChange = async () => {
        if (!originalData) return;

        if (formData.email === originalData.email) {
            toast({
                variant: "destructive",
                title: "No Changes",
                description: "Please enter a different email address",
            });
            return;
        }

        setEmailLoading(true);

        try {
            const {error: updateError} = await supabase.auth.updateUser(
                {
                    email: formData.email,
                },
                {
                    emailRedirectTo: `${window.location.origin}/auth/email-change`,
                }
            );

            if (updateError) throw updateError;

            toast({
                title: "Confirmation Emails Sent",
                description:
                    "We've sent verification links to both your current and new email addresses. Please confirm both to complete the change.",
                duration: 7000,
            });
        } catch (err) {
            console.error("Email update error:", err);
            toast({
                variant: "destructive",
                title: "Email Update Failed",
                description: err instanceof Error ? err.message : "Failed to update email",
            });
        } finally {
            setEmailLoading(false);
        }
    };

    // Handle password change
    const handlePasswordChange = async () => {
        if (!originalData) return;

        if (!formData.currentPassword && !formData.newPassword && !formData.confirmNewPassword) {
            toast({
                variant: "destructive",
                title: "No Changes",
                description: "Please fill in the password fields",
            });
            return;
        }

        setPasswordLoading(true);

        try {
            const {data: userData} = await supabase.auth.getUser();
            if (!userData.user) throw new Error("User not found");

            if (!formData.currentPassword) {
                throw new Error("Current password is required");
            }

            const {error: signInError} = await supabase.auth.signInWithPassword({
                email: userData.user.email!,
                password: formData.currentPassword,
            });
            if (signInError) throw new Error("Current password is incorrect");

            if (!formData.newPassword) {
                throw new Error("New password is required");
            }

            if (formData.newPassword !== formData.confirmNewPassword) {
                throw new Error("New passwords do not match");
            }

            if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(formData.newPassword)) {
                throw new Error(
                    "New password must be at least 8 characters, include uppercase, number, and special character"
                );
            }

            const {error: updateError} = await supabase.auth.updateUser({
                password: formData.newPassword,
            });

            if (updateError) throw updateError;

            toast({
                title: "Success",
                description: "Password changed successfully!",
            });

            setFormData({
                ...formData,
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: "",
            });
        } catch (err) {
            console.error("Password update error:", err);
            toast({
                variant: "destructive",
                title: "Password Update Failed",
                description: err instanceof Error ? err.message : "Failed to update password",
            });
        } finally {
            setPasswordLoading(false);
        }
    };

    if (!originalData) {
        return (
            <div className="flex items-center justify-center h-full min-h-screen">
                <p className="text-muted-foreground">Loading account...</p>
            </div>
        );
    }

    const hasCustomAvatar = currentAvatarUrl !== null;
    const hasPersonalInfoChanges = formData.first_name !== originalData.first_name || formData.last_name !== originalData.last_name;
    const hasEmailChanges = formData.email !== originalData.email;
    const hasPasswordChanges = formData.currentPassword || formData.newPassword || formData.confirmNewPassword;

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <Toaster />
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
                    <p className="text-muted-foreground">Manage your account information and preferences</p>
                </div>

                {/* Avatar Section */}
                <Card className="mb-6">
                    <div className="bg-primary p-8 text-primary-foreground rounded-t-2xl">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-foreground shadow-xl">
                                    {avatarLoading ? (
                                        <div className="w-full h-full flex items-center justify-center bg-muted">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                    ) : (
                                        <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                                    )}
                                </div>

                                <label className="absolute bottom-0 right-0 bg-card text-primary rounded-full p-3 shadow-lg cursor-pointer hover:bg-accent transition-colors">
                                    <Camera size={20} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={avatarLoading} />
                                </label>

                                {hasCustomAvatar && (
                                    <button onClick={handleRemoveAvatar} disabled={avatarLoading} className="absolute top-0 right-0 bg-destructive text-white rounded-full p-2 shadow-lg hover:bg-destructive/90 transition-colors disabled:opacity-50" title="Remove avatar">
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="text-center md:text-left">
                                <h2 className="text-2xl font-bold mb-1">
                                    {formData.first_name} {formData.last_name}
                                </h2>
                                <p className="text-primary-foreground/80">{formData.email}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Personal Information Section */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <User size={20} className="text-primary" />
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name">First Name</Label>
                                        <Input id="first_name" name="first_name" type="text" placeholder="Enter first name" value={formData.first_name} onChange={handleInputChange} disabled={personalInfoLoading} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last_name">Last Name</Label>
                                        <Input id="last_name" name="last_name" type="text" placeholder="Enter last name" value={formData.last_name} onChange={handleInputChange} disabled={personalInfoLoading} />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setFormData({
                                                ...formData,
                                                first_name: originalData.first_name,
                                                last_name: originalData.last_name,
                                            });
                                        }}
                                        variant="outline"
                                        disabled={personalInfoLoading || !hasPersonalInfoChanges}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="button" onClick={handlePersonalInfoSubmit} disabled={personalInfoLoading || !hasPersonalInfoChanges}>
                                        <Save size={20} />
                                        {personalInfoLoading ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Email Section */}
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
                                        <Input id="email" name="email" type="email" placeholder="admin@example.com" value={formData.email} onChange={handleInputChange} disabled={emailLoading} />
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
                                        onClick={() => setFormData({ ...formData, email: originalData.email })}
                                        variant="outline"
                                        disabled={emailLoading || !hasEmailChanges}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleEmailChange}
                                        disabled={emailLoading || !hasEmailChanges}
                                    >
                                        <Save size={20} />
                                        {emailLoading ? "Sending..." : "Change Email"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Password Section */}
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
                                        <Input id="currentPassword" name="currentPassword" type="password" placeholder="Enter current password" value={formData.currentPassword} onChange={handleInputChange} disabled={passwordLoading} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <Input id="newPassword" name="newPassword" type="password" placeholder="Enter new password" value={formData.newPassword} onChange={handleInputChange} disabled={passwordLoading} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                                            <Input id="confirmNewPassword" name="confirmNewPassword" type="password" placeholder="Confirm new password" value={formData.confirmNewPassword} onChange={handleInputChange} disabled={passwordLoading} />
                                        </div>
                                    </div>
                                    <div className="bg-muted border border-border rounded-lg p-4">
                                        <p className="text-sm text-foreground font-medium mb-2">Password Requirements:</p>
                                        <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                                            <li>At least 8 characters long</li>
                                            <li>Contains at least one uppercase letter</li>
                                            <li>Contains at least one number</li>
                                            <li>Contains at least one special character</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setFormData({
                                                ...formData,
                                                currentPassword: "",
                                                newPassword: "",
                                                confirmNewPassword: "",
                                            });
                                        }}
                                        variant="outline"
                                        disabled={passwordLoading || !hasPasswordChanges}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="button" onClick={handlePasswordChange} disabled={passwordLoading || !hasPasswordChanges}>
                                        <Save size={20} />
                                        {passwordLoading ? "Changing..." : "Change Password"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}