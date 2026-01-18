"use client";

import {Zap, Feather, Battery, Volume2, Sparkles, FolderClosed} from "lucide-react";
import Image from "next/image";

const features = [
    {
        title: "2-in-1 Design",
        description: "Sweep and vacuum in one seamless motion. No more switching tools.",
        icon: Sparkles,
    },
    {
        title: "Ultra Lightweight",
        description: "Only 2.5 lbs. Clean longer without arm fatigue or strain.",
        icon: Feather,
    },
    {
        title: "Powerful Suction",
        description: "12,000 PA motor captures dust, debris, and pet hair effortlessly.",
        icon: Zap,
    },
    {
        title: "Long Battery Life",
        description: "Up to 45 minutes of runtime on a single charge.",
        icon: Battery,
    },
    {
        title: "Whisper Quiet",
        description: "65dB operation. Clean anytime without disturbing anyone.",
        icon: Volume2,
    },
    {
        title: "Compact Storage",
        description: "Slim profile stands upright or hangs flat. Fits anywhere.",
        icon: FolderClosed,
    },
];

export function FeaturesSection() {
    return (
        <section id="features" className="relative py-20 md:py-32 px-6 bg-background overflow-hidden">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />

            <div className="max-w-7xl mx-auto w-full relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <span className="inline-block text-accent text-sm font-medium tracking-wider uppercase mb-4">
                        Why Bracuum?
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground mb-4">
                        Everything You Need, Nothing You Don't
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Engineered for simplicity. Built for performance.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, i) => {
                        const isAccent2 = i % 2 === 1;
                        return (
                            <div
                                key={i}
                                className={`group relative bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:bg-card/60 transition-all duration-300 hover:shadow-xl ${isAccent2 ? "hover:border-accent2/30" : "hover:border-accent/30"}`}
                            >
                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 ${isAccent2 ? "bg-accent2/10 group-hover:bg-accent2/20" : "bg-accent/10 group-hover:bg-accent/20"}`}>
                                    <feature.icon className={`w-7 h-7 ${isAccent2 ? "text-accent2" : "text-accent"}`} />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-semibold text-foreground mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>

                                {/* Hover accent line */}
                                <div className={`absolute bottom-0 left-8 right-8 h-0.5 transition-all duration-300 rounded-full ${isAccent2 ? "bg-accent2/0 group-hover:bg-accent2/50" : "bg-accent/0 group-hover:bg-accent/50"}`} />
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-16">
                    <p className="text-muted-foreground text-lg">
                        Ready to simplify your cleaning routine?
                    </p>
                </div>
            </div>
        </section>
    );
}
