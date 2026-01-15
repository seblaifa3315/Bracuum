// ============================================
// 2. components/account/PersonalInfoSection.tsx
// ============================================
"use client";

import {useState} from "react";
import {User, Save} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {useToast} from "@/hooks/use-toast";
import {createClient} from "@/lib/supabase/client";

interface PersonalInfoSectionProps {
    initialFirstName: string;
    initialLastName: string;
    onUpdate: () => void;
}

export function PersonalInfoSection({initialFirstName, initialLastName, onUpdate}: PersonalInfoSectionProps) {
    const supabase = createClient();
    const {toast} = useToast();
    
    const [loading, setLoading] = useState(false);
    const [firstName, setFirstName] = useState(initialFirstName);
    const [lastName, setLastName] = useState(initialLastName);

    const hasChanges = firstName !== initialFirstName || lastName !== initialLastName;

    const handleSubmit = async () => {
        if (!hasChanges) {
            toast({
                variant: "destructive",
                title: "No Changes",
                description: "Please modify at least one field before saving",
            });
            return;
        }

        setLoading(true);

        try {
            const {error} = await supabase.auth.updateUser({
                data: {
                    first_name: firstName,
                    last_name: lastName,
                },
            });

            if (error) throw error;

            toast({
                title: "Success",
                description: "Personal information updated successfully!",
            });

            onUpdate();
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: err instanceof Error ? err.message : "Failed to update personal information",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFirstName(initialFirstName);
        setLastName(initialLastName);
    };

    return (
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
                                <Input 
                                    id="first_name" 
                                    type="text" 
                                    placeholder="Enter first name" 
                                    value={firstName} 
                                    onChange={(e) => setFirstName(e.target.value)} 
                                    disabled={loading} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input 
                                    id="last_name" 
                                    type="text" 
                                    placeholder="Enter last name" 
                                    value={lastName} 
                                    onChange={(e) => setLastName(e.target.value)} 
                                    disabled={loading} 
                                />
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
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
