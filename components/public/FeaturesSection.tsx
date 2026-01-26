"use client";

import { Play } from "lucide-react";
import Image from "next/image";

const features = [
    {
        id: "2in1",
        label: "2-in-1 Design",
        headline: "Sweep and vacuum.\nOne seamless motion.",
        description:
            "No more switching between tools. Bracuum combines sweeping and vacuuming into a single, fluid cleaning experience.",
        media: { type: "image" as const, placeholder: "/b.jpg" },
    },
    {
        id: "lightweight",
        label: "Ultra Lightweight",
        headline: "2.5 lbs of\npure freedom.",
        description:
            "Clean your entire home without arm fatigue. So light, you'll forget you're holding it.",
        media: { type: "video" as const, placeholder: "/c.jpg" },
    },
    {
        id: "suction",
        label: "Powerful Suction",
        headline: "12,000 PA.\nNothing escapes.",
        description:
            "Dust, debris, pet hair—our motor captures it all effortlessly. Deep clean without the effort.",
        media: { type: "image" as const, placeholder: "/b.jpg" },
    },
    {
        id: "battery",
        label: "Long Battery Life",
        headline: "45 minutes.\nEvery room covered.",
        description:
            "One charge. Complete cleaning. The lithium-ion battery delivers consistent power from start to finish.",
        media: { type: "image" as const, placeholder: "/c.jpg" },
    },
    {
        id: "quiet",
        label: "Whisper Quiet",
        headline: "65dB.\nBarely there.",
        description:
            "Clean during nap time, early mornings, or late nights. Your family won't even notice.",
        media: { type: "video" as const, placeholder: "/b.jpg" },
    },
    {
        id: "storage",
        label: "Compact Storage",
        headline: "Stands. Hangs.\nDisappears.",
        description:
            "Slim profile fits anywhere. Stand it upright, hang it flat, or tuck it away. Your space, uncluttered.",
        media: { type: "image" as const, placeholder: "/c.jpg" },
    },
];

// Decorative divider between features
function FeatureDivider({ index }: { index: number }) {
    const isEven = index % 2 === 0;
    return (
        <div className="flex items-center justify-center py-4 md:py-8">
            <div className="flex items-center gap-3">
                <div className={`h-px w-12 md:w-20 ${isEven ? "bg-accent/30" : "bg-accent2/30"}`} />
                <div className={`w-2 h-2 rounded-full ${isEven ? "bg-accent/40" : "bg-accent2/40"}`} />
                <div className={`h-px w-12 md:w-20 ${isEven ? "bg-accent/30" : "bg-accent2/30"}`} />
            </div>
        </div>
    );
}

function FeatureMedia({
    type,
    src,
    alt,
}: {
    type: "image" | "video";
    src: string;
    alt: string;
}) {
    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden group/media">
            <Image
                src={src}
                alt={alt}
                fill
                className="object-cover"
            />

            {/* Video play button overlay */}
            {type === "video" && (
                <>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover/media:bg-white/30 group-hover/media:scale-110 transition-all duration-300 cursor-pointer">
                            <Play className="w-5 h-5 md:w-6 md:h-6 text-white ml-0.5" />
                        </div>
                    </div>
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/20 backdrop-blur-sm rounded-full">
                        <span className="text-[10px] font-medium text-white tracking-wide uppercase">
                            Video
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}

export function FeaturesSection() {
    return (
        <section id="features" className="relative bg-background">
            {/* Section Header */}
            <div className="py-16 md:py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Decorative line with dot */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="h-px w-8 bg-accent/40" />
                        <div className="w-1.5 h-1.5 rounded-full bg-accent/60" />
                        <div className="h-px w-8 bg-accent/40" />
                    </div>
                    <span className="inline-block text-accent text-xs font-medium tracking-wider uppercase mb-4">
                        Why Bracuum?
                    </span>
                    <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4 leading-tight">
                        Everything you need.
                        <br />
                        <span className="text-muted-foreground">Nothing you don't.</span>
                    </h2>
                    <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
                        Engineered for simplicity. Built for performance.
                    </p>
                    {/* Bottom decorative element */}
                    <div className="flex items-center justify-center mt-8">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-accent2/40" />
                            <div className="w-1.5 h-1.5 rounded-full bg-accent/50" />
                            <div className="w-2 h-2 rounded-full bg-accent/30" />
                            <div className="w-1.5 h-1.5 rounded-full bg-accent/50" />
                            <div className="w-1 h-1 rounded-full bg-accent2/40" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Blocks */}
            <div className="max-w-6xl mx-auto px-6 pb-20 md:pb-32">
                {features.map((feature, index) => {
                    const isReversed = index % 2 === 1;
                    const isEven = index % 2 === 0;
                    const featureNumber = String(index + 1).padStart(2, "0");

                    return (
                        <div key={feature.id} className="relative">
                            {/* Divider (not before first item) */}
                            {index > 0 && <FeatureDivider index={index} />}

                            <div
                                className={`relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center py-8 md:py-12 ${
                                    isReversed ? "lg:direction-rtl" : ""
                                }`}
                            >

                                {/* Text Content */}
                                <div
                                    className={`relative ${
                                        isReversed ? "lg:order-2 lg:direction-ltr" : "lg:order-1"
                                    }`}
                                >
                                    {/* Large decorative number */}
                                    <div
                                        className={`absolute -top-16 md:-top-20 -right-4 text-[120px] md:text-[180px] font-bold leading-none select-none pointer-events-none z-0 ${
                                            isEven ? "text-accent/[0.07]" : "text-accent2/[0.07]"
                                        }`}
                                        style={{ fontFamily: "var(--font-orbitron)" }}
                                    >
                                        {featureNumber}
                                    </div>

                                    {/* Small number badge */}
                                    <div className={`relative z-10 inline-flex items-center gap-2 mb-4`}>
                                        <span className={`text-xs font-semibold ${isEven ? "text-accent" : "text-accent2"}`}>
                                            {featureNumber}
                                        </span>
                                        <span className={`h-px w-6 ${isEven ? "bg-accent/50" : "bg-accent2/50"}`} />
                                        <span className={`text-xs font-medium tracking-wider uppercase ${isEven ? "text-accent" : "text-accent2"}`}>
                                            {feature.label}
                                        </span>
                                    </div>
                                    <h3 className="relative z-10 text-2xl md:text-3xl font-light text-foreground mb-4 leading-tight whitespace-pre-line">
                                        {feature.headline}
                                    </h3>
                                    <p className="relative z-10 text-muted-foreground text-base leading-relaxed max-w-sm">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* Media with decorative frame */}
                                <div
                                    className={`relative z-10 ${
                                        isReversed ? "lg:order-1 lg:direction-ltr" : "lg:order-2"
                                    }`}
                                >
                                    {/* Decorative corner accents */}
                                    <div className={`absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg ${isEven ? "border-accent/30" : "border-accent2/30"}`} />
                                    <div className={`absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 rounded-br-lg ${isEven ? "border-accent/30" : "border-accent2/30"}`} />

                                    <div className="relative h-[280px] md:h-[320px]">
                                        <FeatureMedia
                                            type={feature.media.type}
                                            src={feature.media.placeholder}
                                            alt={feature.label}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Stats Bar */}
            <div className="border-t border-border/30 bg-muted/20">
                {/* Top decorative accent */}
                <div className="flex justify-center -mt-px">
                    <div className="flex items-center">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-accent/40" />
                        <div className="w-2 h-2 rounded-full bg-accent/50 -mt-px" />
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent/40" />
                    </div>
                </div>
                <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-light text-foreground mb-1">
                                2.5
                                <span className="text-lg md:text-xl text-muted-foreground ml-1">lbs</span>
                            </div>
                            <div className="text-xs text-muted-foreground tracking-wide">
                                Ultra lightweight
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-light text-foreground mb-1">
                                12K
                                <span className="text-lg md:text-xl text-muted-foreground ml-1">PA</span>
                            </div>
                            <div className="text-xs text-muted-foreground tracking-wide">
                                Suction power
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-light text-foreground mb-1">
                                45
                                <span className="text-lg md:text-xl text-muted-foreground ml-1">min</span>
                            </div>
                            <div className="text-xs text-muted-foreground tracking-wide">
                                Battery life
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-light text-foreground mb-1">
                                65
                                <span className="text-lg md:text-xl text-muted-foreground ml-1">dB</span>
                            </div>
                            <div className="text-xs text-muted-foreground tracking-wide">
                                Whisper quiet
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
