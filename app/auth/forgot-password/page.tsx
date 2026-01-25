import ForgotPasswordForm from "@/components/auth/forgot-password-form";

export default function Page() {
    return (
        <div className="min-h-screen relative flex items-center justify-center">
            <div className="w-full max-w-sm">
                <ForgotPasswordForm />
            </div>
        </div>
    );
}
