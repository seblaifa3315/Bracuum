"use client";

import {Suspense} from "react";
import {useSearchParams} from "next/navigation";

function EmailChangeContent() {
    const searchParams = useSearchParams();

    const success = searchParams.get("success") === "true";
    const error = searchParams.get("error");

    return (
        <div className="max-w-md text-center space-y-4 p-6 border rounded-xl shadow">
            <h1 className="text-2xl font-bold">
                {success ? "Email Updated Successfully" : "Email Change Failed"}
            </h1>

            <p className="text-muted-foreground">
                {success
                    ? "Your email has been changed. Please log in again with your new email address."
                    : error || "Something went wrong during the email change process."}
            </p>

            <a
                href="/auth/login"
                className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded"
            >
                Go to Login
            </a>
        </div>
    );
}

export default function EmailChangeResultPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Suspense fallback={<div className="max-w-md text-center p-6">Loading...</div>}>
                <EmailChangeContent />
            </Suspense>
        </div>
    );
}
