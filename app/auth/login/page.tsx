"use client";

import {LoginForm} from "@/components/auth/login-form";

export default function LoginPage() {
    return (
        <>
            <div className="grid min-h-svh lg:grid-cols-2">
                <div className="flex flex-col gap-4 p-6 md:p-10">
                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-xs">
                            <LoginForm />
                        </div>
                    </div>
                </div>
                <div
                    className="relative hidden lg:flex items-center justify-center overflow-hidden"
                >
                    {/* Soft spotlight glow */}
                    {/* <div className="absolute w-[220px] h-[520px] rounded-full
    bg-primary/15 blur-[240px]">
  </div> */}

                    {/* Product Image */}
                    <img
                        src="/logo-no-bg-light.png"
                        alt="Bracuum product"
                        className="relative z-10 w-full object-contain"
                    />

                    {/* Subtle depth overlay */}
                    {/* <div className="pointer-events-none absolute inset-0
    bg-gradient-to-t from-black/30 via-transparent to-transparent" /> */}
                </div>
            </div>
        </>
    );
}
