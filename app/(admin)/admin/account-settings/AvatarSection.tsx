// ============================================
// 1. components/account/AvatarSection.tsx
// ============================================
"use client";

import {useState} from "react";
import {Camera, X} from "lucide-react";
import {Card} from "@/components/ui/card";
import {useToast} from "@/hooks/use-toast";
import {createClient} from "@/lib/supabase/client";
import defaultAvatar from "@/assets/defaultAvatar.jpg";

interface AvatarSectionProps {
    firstName: string;
    lastName: string;
    email: string;
    initialAvatarUrl: string | null;
}

export function AvatarSection({firstName, lastName, email, initialAvatarUrl}: AvatarSectionProps) {
    const supabase = createClient();
    const {toast} = useToast();
    
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(initialAvatarUrl);
    const [avatarPreview, setAvatarPreview] = useState<string>(initialAvatarUrl || defaultAvatar.src);

    const getAvatarPath = (userId: string) => `private/${userId}/avatar-${Date.now()}.jpg`;
    const getUserAvatarFolder = (userId: string) => `private/${userId}`;

    const deleteAllUserAvatars = async (userId: string) => {
        const folderPath = getUserAvatarFolder(userId);
        const {data: files, error: listError} = await supabase.storage.from("avatars").list(folderPath);

        if (listError || !files || files.length === 0) return;

        const filesToDelete = files.map((file) => `${folderPath}/${file.name}`);
        await supabase.storage.from("avatars").remove(filesToDelete);
    };

    const updateUserAvatar = async (avatarUrl: string | null) => {
        const {error} = await supabase.auth.updateUser({
            data: {avatar_url: avatarUrl},
        });
        if (error) throw error;
    };

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

            if (uploadError) throw uploadError;

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

    const handleRemoveAvatar = async () => {
        setAvatarLoading(true);

        try {
            const {data: userData} = await supabase.auth.getUser();
            if (!userData.user) throw new Error("User not found");

            await deleteAllUserAvatars(userData.user.id);
            await updateUserAvatar(null);

            setCurrentAvatarUrl(null);
            setAvatarPreview(defaultAvatar.src);

            toast({
                title: "Success",
                description: "Avatar removed successfully!",
            });
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Removal Failed",
                description: err instanceof Error ? err.message : "Failed to remove avatar",
            });
        } finally {
            setAvatarLoading(false);
        }
    };

    return (
        <Card className="mb-6 border border-border bg-card">
            <div className="p-6">
                <div className="flex items-center gap-5">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-25 h-25 rounded-full overflow-hidden bg-muted">
                            {avatarLoading ? (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-foreground/20 border-t-foreground"></div>
                                </div>
                            ) : (
                                <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                            )}
                        </div>
                    </div>

                    {/* Info + Actions */}
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-semibold text-foreground truncate">
                            {firstName} {lastName}
                        </h2>
                        <p className="text-sm text-muted-foreground truncate mb-3">{email}</p>

                        <div className="flex items-center gap-3">
                            <label className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-accent cursor-pointer transition-colors">
                                <Camera size={15} />
                                <span>{currentAvatarUrl ? "Change" : "Upload"}</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={avatarLoading} />
                            </label>

                            {currentAvatarUrl && (
                                <>
                                    <span className="text-border">|</span>
                                    <button
                                        onClick={handleRemoveAvatar}
                                        disabled={avatarLoading}
                                        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                                    >
                                        <X size={15} />
                                        <span>Remove</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}