"use client";

import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Video, Truck, ShieldCheck, BadgeCheck, Star} from "lucide-react";
import Image from "next/image";
import {useState, useEffect} from "react";
import {useTheme} from "next-themes";

const trustBadges = [
    {text: "Free Shipping", icon: Truck},
    {text: "30-Day Guarantee", icon: ShieldCheck},
    {text: "1-Year Warranty", icon: BadgeCheck},
];

export function HeroSection() {
    const {theme} = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    const isDark = theme === "dark";
    return (
        <>
        {/* Spacer to account for fixed hero */}
        <div className="h-screen" />
        <section className="fixed inset-0 bg-background min-h-screen flex items-center px-6 overflow-hidden -z-10">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />

            {/* Decorative grid pattern */}
            {/* <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" /> */}

            <div className="max-w-7xl mx-auto w-full flex flex-col-reverse lg:grid lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Left Content */}
                <div className="space-y-8">
                    {/* Social proof */}
                    <div className="flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: "0s" }}>
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="size-4 fill-accent2 text-accent2" />
                            ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                            Loved by <span className="font-semibold text-foreground">2,500+</span> happy customers
                        </span>
                    </div>

                    {/* Animated Headline */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-light leading-tight overflow-hidden">
                        <span className="block animate-text-reveal" style={{ animationDelay: "0.1s" }}>
                            <span className="text-foreground">Stop Switching,</span>
                        </span>
                        <span className="block animate-text-reveal" style={{ animationDelay: "0.3s" }}>
                            <span className="text-foreground">Start Cleaning.</span>
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
                        Tired of juggling a broom and vacuum? Bracuum does both in one sleek tool—saving you time, space, and effort.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-row gap-4 animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
                        <Link href="#buy">
                            <Button
                                variant="accent"
                                className="relative py-6 font-medium text-sm overflow-hidden group hover:scale-105 hover:shadow-lg transition-all duration-300"
                            >
                                <span className="relative z-10">Get Yours Now</span>
                                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-shimmer transition-opacity duration-300" />
                            </Button>
                        </Link>

                        <Button
                            variant="outlineAccent"
                            className="py-6 font-medium text-sm gap-3 hover:scale-105 hover:shadow-md transition-all duration-300"
                            onClick={() => alert("Video modal would open here")}
                        >
                            <Video className="size-5 stroke-1" />
                            Watch demo
                        </Button>
                    </div>

                    {/* Trust Badges with staggered animation */}
                    <div className="flex flex-col sm:flex-row gap-6 pt-4">
                        {trustBadges.map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 text-muted-foreground font-medium text-sm animate-fade-in-up"
                                style={{ animationDelay: `${0.9 + i * 0.15}s` }}
                            >
                                <item.icon className="size-4 text-accent2" />
                                {item.text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Visual with gentle float */}
                <div className="relative w-full h-100 lg:h-150 animate-slide-right">
                    <div className="animate-gentle-float w-full h-full">
                        <Image
                            src={isDark ? `/bracuum-nobackground.png` : `/bracuum-nobackground.png`}
                            alt="Bracuum product"
                            fill
                            className="object-contain drop-shadow-[0_0_150px_var(--accent)]"
                            priority
                        />
                    </div>
                </div>
            </div>
        </section>
        </>
    );
}
