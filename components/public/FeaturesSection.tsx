"use client";

import { Play } from "lucide-react";
import Image from "next/image";

const features = [
    {
        id: "dustpan-free",
        label: "No Dustpan Needed",
        headline: "Sweep. Lift. Done.\nNo bending over.",
        description:
            "The intake nozzle is hidden within the bristles—perfectly positioned to capture debris when you lift. No dustpan, no hassle.",
        media: { type: "image" as const, placeholder: "/b.jpg" },
    },
    {
        id: "twist-grip",
        label: "Twist-Grip Design",
        headline: "One natural motion.\nIntuitive control.",
        description:
            "A quarter turn of the grip collar lifts the bristles and exposes the vacuum intake. Tactile click-stops at both positions let you feel the shift.",
        media: { type: "video" as const, placeholder: "/c.jpg" },
    },
    {
        id: "vertical-flow",
        label: "Straight Airflow",
        headline: "No bends.\nNo clogs.",
        description:
            "Debris travels straight up the handle into the canister. This elegant vertical design minimizes clog points and maximizes suction efficiency.",
        media: { type: "image" as const, placeholder: "/b.jpg" },
    },
    {
        id: "power",
        label: "Powerful Motor",
        headline: "25.2V lithium-ion.\nSerious suction.",
        description:
            "Based on proven vacuum technology, the motor delivers consistent power with 15-20 minutes of runtime—more than enough for typical sweeping sessions.",
        media: { type: "image" as const, placeholder: "/c.jpg" },
    },
    {
        id: "floor-safe",
        label: "Floor Protection",
        headline: "Any floor.\nZero scratches.",
        description:
            "Multi-point self-stabilizing glides with soft rubber adapt to any floor angle. Hardwood, tile, laminate—all protected.",
        media: { type: "video" as const, placeholder: "/b.jpg" },
    },
    {
        id: "quality",
        label: "Built to Last",
        headline: "Quality first.\nNot disposable.",
        description:
            "Engineered for durability with minimal failure points. This is a quality product designed to create lasting value, not end up in a landfill.",
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
        <div className="relative w-full h-full rounded-ui overflow-hidden group/media">
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
                    <span className="inline-block text-sm uppercase tracking-widest text-muted-foreground mb-3">
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
                                    <div className={`absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 rounded-tl-ui ${isEven ? "border-accent/30" : "border-accent2/30"}`} />
                                    <div className={`absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 rounded-br-ui ${isEven ? "border-accent/30" : "border-accent2/30"}`} />

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
            <div className="border-t border-border/30 bg-muted">
                <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-light text-foreground mb-1">
                                56-57
                                <span className="text-lg md:text-xl text-muted-foreground ml-1">in</span>
                            </div>
                            <div className="text-xs text-muted-foreground tracking-wide">
                                Full-size height
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-light text-foreground mb-1">
                                25.2
                                <span className="text-lg md:text-xl text-muted-foreground ml-1">V</span>
                            </div>
                            <div className="text-xs text-muted-foreground tracking-wide">
                                Li-ion motor
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-light text-foreground mb-1">
                                15-20
                                <span className="text-lg md:text-xl text-muted-foreground ml-1">min</span>
                            </div>
                            <div className="text-xs text-muted-foreground tracking-wide">
                                Runtime
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-light text-foreground mb-1">
                                90°
                                <span className="text-lg md:text-xl text-muted-foreground ml-1">twist</span>
                            </div>
                            <div className="text-xs text-muted-foreground tracking-wide">
                                Grip mechanism
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
