import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import {ThemeToggle} from "@/components/common/ThemeToggle";

export default function Page() {
    return (
        <div className="min-h-screen relative flex items-center justify-center">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-sm">
                <ForgotPasswordForm />
            </div>
        </div>
    );
}
