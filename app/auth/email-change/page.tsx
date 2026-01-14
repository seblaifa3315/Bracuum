"use client";

import {useSearchParams} from "next/navigation";

export default function EmailChangePage() {
    const searchParams = useSearchParams();

    const message = searchParams.get("message");
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorCode = searchParams.get("error_code");

    const isPartial = message?.includes("Please proceed to confirm link sent to the other email");
    const isComplete = !!code;
    const isExpired = error === "access_denied" && errorCode === "otp_expired";

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="max-w-md text-center space-y-4 p-6 border rounded-xl shadow">
                <h1 className="text-2xl font-bold">{isExpired ? "You've already confirmed this email." : isPartial ? "Email Partially Confirmed" : "Email Confirmation"}</h1>

                <p className="text-muted-foreground">
                    {isExpired && (
                        <>
                            This email address is already confirmed or this link has expired.
                            <br />
                            If your email change isn't finished yet, please check your other email or request a new confirmation link from your account settings.
                        </>
                    )}

                    {isPartial && "This email is confirmed. Please check your other email to complete the change."}

                    {isComplete && "Your email has been successfully updated!"}
                </p>

                {(isComplete || isExpired) && (
                    <a href="/admin/account-settings" className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded">
                        Go to Account Settings
                    </a>
                )}
            </div>
        </div>
    );
}
