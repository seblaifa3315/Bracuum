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
        <Card className="mb-6 bg-primary border border-foreground/40">
            <div className="p-8 text-primary-foreground rounded-t-2xl">
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

                        {currentAvatarUrl && (
                            <button 
                                onClick={handleRemoveAvatar} 
                                disabled={avatarLoading} 
                                className="absolute top-0 right-0 bg-destructive text-white rounded-full p-2 shadow-lg hover:bg-destructive/90 transition-colors disabled:opacity-50" 
                                title="Remove avatar"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold mb-1">
                            {firstName} {lastName}
                        </h2>
                        <p className="text-primary-foreground/80">{email}</p>
                    </div>
                </div>
            </div>
        </Card>
    );
}