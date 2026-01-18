"use client";

import {Sparkles, Wind, CheckCircle} from "lucide-react";

const steps = [
    {
        number: "01",
        title: "Sweep",
        description: "Glide Bracuum across any surface. The bristles gather dust, crumbs, and debris in seconds.",
        icon: Sparkles,
        color: "accent",
    },
    {
        number: "02",
        title: "Vacuum",
        description: "With one click, activate the built-in vacuum. Powerful suction captures everything instantly.",
        icon: Wind,
        color: "accent2",
    },
    {
        number: "03",
        title: "Done",
        description: "That's it. No dustpan, no switching tools. Empty the bin and you're ready for next time.",
        icon: CheckCircle,
        color: "accent",
    },
];

export function HowItWorksSection() {
    return (
        <section id="how-it-works" className="relative py-20 md:py-32 px-6 bg-background overflow-hidden">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent2/5 via-transparent to-accent/5" />

            <div className="max-w-6xl mx-auto w-full relative z-10">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <span className="inline-block text-accent2 text-sm font-medium tracking-wider uppercase mb-4">
                        Simple as 1-2-3
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground mb-6">
                        How It Works
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                        Cleaning has never been this effortless. Three simple steps to a spotless space.
                    </p>
                </div>

                {/* Steps */}
                <div className="relative">
                    {/* Connecting line - hidden on mobile */}
                    <div className="hidden md:block absolute top-24 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-accent via-accent2 to-accent opacity-20" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                        {steps.map((step, i) => {
                            const isAccent2 = step.color === "accent2";
                            return (
                                <div key={i} className="relative flex flex-col items-center text-center">
                                    {/* Step number circle */}
                                    <div className={`relative w-20 h-20 rounded-full flex items-center justify-center mb-8 ${isAccent2 ? "bg-accent2/10" : "bg-accent/10"}`}>
                                        {/* Outer ring */}
                                        <div className={`absolute inset-0 rounded-full border-2 ${isAccent2 ? "border-accent2/30" : "border-accent/30"}`} />

                                        {/* Icon */}
                                        <step.icon className={`w-8 h-8 ${isAccent2 ? "text-accent2" : "text-accent"}`} />

                                        {/* Step number badge */}
                                        <span className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${isAccent2 ? "bg-accent2" : "bg-accent"}`}>
                                            {step.number}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-2xl font-semibold text-foreground mb-4">
                                        {step.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed max-w-xs">
                                        {step.description}
                                    </p>

                                    {/* Arrow indicator - hidden on mobile and last item */}
                                    {i < steps.length - 1 && (
                                        <div className="hidden md:block absolute top-24 -right-4 transform translate-x-1/2">
                                            <svg className="w-8 h-8 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom tagline */}
                <div className="text-center mt-20">
                    <p className="text-lg text-muted-foreground">
                        <span className="text-foreground font-medium">No bending.</span>{" "}
                        <span className="text-foreground font-medium">No switching.</span>{" "}
                        <span className="text-foreground font-medium">No hassle.</span>
                    </p>
                </div>
            </div>
        </section>
    );
}
