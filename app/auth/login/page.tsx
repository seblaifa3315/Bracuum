"use client";

import {ThemeToggle} from "@/components/common/ThemeToggle";
import {LoginForm} from "@/components/auth/login-form";
import {LoginForm2} from "@/components/auth/login-form2";

export default function LoginPage() {
    return (
        <>
            <div className="grid min-h-svh lg:grid-cols-2">
                <div className="flex flex-col gap-4 p-6 md:p-10">
                    <div className="flex justify-center gap-2 md:justify-start">
                        <ThemeToggle />
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-xs">
                            <LoginForm />
                        </div>
                    </div>
                </div>
                <div className="bg-muted relative hidden lg:block">
                    <img src="/bracuum-angle.png" alt="Image" className="absolute inset-0 h-full w-full object-cover brightness-[0.7] dark:brightness-[0.5] dark:grayscale" />
                </div>
            </div>

            <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm md:max-w-4xl">
                    <LoginForm2 />
                </div>
            </div>
        </>
    );
}
