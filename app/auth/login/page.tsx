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
               <div className="relative hidden lg:flex items-center justify-center overflow-hidden
  bg-gradient-to-br 
  from-background via-accent to-secondary
  dark:from-background dark:via-muted dark:to-secondary">

  {/* Soft spotlight glow */}
  <div className="absolute w-[220px] h-[520px] rounded-full 
    bg-primary/15 blur-[240px]
    dark:bg-primary/10">
  </div>

  {/* Product Image */}
  <img
    src="/bracuum-nobackground.png"
    alt="Bracuum product"
    className="relative z-10 max-h-[90%] max-w-md object-contain
      drop-shadow-[0_25px_40px_rgba(0,0,0,0.15)]
      dark:drop-shadow-[0_25px_40px_rgba(0,0,0,0.5)]"
  />

  {/* Subtle depth overlay */}
  <div className="pointer-events-none absolute inset-0 
    bg-gradient-to-t from-black/30 via-transparent to-transparent
    dark:from-black/50" />
</div>

            </div>
        </>
    );
}
