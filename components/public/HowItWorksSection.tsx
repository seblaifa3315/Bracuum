"use client";

import { motion, useInView } from "framer-motion";
import { Sparkles, Wind, CheckCircle } from "lucide-react";
import { useRef } from "react";

// Particle component for dust effect
function DustParticle({ delay, x, y, size, duration }: {
    delay: number;
    x: number;
    y: number;
    size: number;
    duration: number;
}) {
    return (
        <motion.div
            className="absolute rounded-full bg-foreground/20"
            style={{ width: size, height: size }}
            initial={{ x, y, opacity: 0, scale: 0 }}
            animate={{
                x: [x, x + 10, x - 5, x],
                y: [y, y - 15, y + 5, y],
                opacity: [0, 0.6, 0.6, 0],
                scale: [0, 1, 1, 0],
            }}
            transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        />
    );
}

// Sweep animation - particles being gathered
function SweepAnimation({ isActive }: { isActive: boolean }) {
    const particles = [
        { x: 20, y: 10, size: 4, delay: 0 },
        { x: 60, y: 25, size: 3, delay: 0.3 },
        { x: 40, y: 45, size: 5, delay: 0.6 },
        { x: 70, y: 15, size: 3, delay: 0.9 },
        { x: 30, y: 35, size: 4, delay: 1.2 },
        { x: 55, y: 50, size: 3, delay: 0.4 },
    ];

    return (
        <div className="relative w-20 h-20">
            {/* Broom/sweep icon */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={isActive ? {
                    x: [0, 8, -8, 0],
                    rotate: [0, 5, -5, 0],
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-accent" />
                </div>
            </motion.div>

            {/* Dust particles */}
            {isActive && particles.map((p, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-accent/40"
                    style={{ width: p.size, height: p.size }}
                    initial={{ x: p.x, y: p.y, opacity: 0 }}
                    animate={{
                        x: [p.x, 40, 40],
                        y: [p.y, 40, 60],
                        opacity: [0.8, 0.6, 0],
                        scale: [1, 0.8, 0],
                    }}
                    transition={{
                        duration: 2,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: "easeIn",
                    }}
                />
            ))}
        </div>
    );
}

// Vacuum animation - particles being sucked in
function VacuumAnimation({ isActive }: { isActive: boolean }) {
    const particles = [
        { x: 0, y: 0, size: 4, delay: 0 },
        { x: 70, y: 10, size: 3, delay: 0.2 },
        { x: 10, y: 60, size: 5, delay: 0.4 },
        { x: 65, y: 55, size: 3, delay: 0.6 },
        { x: 5, y: 30, size: 4, delay: 0.8 },
        { x: 75, y: 35, size: 3, delay: 1.0 },
        { x: 35, y: 5, size: 4, delay: 0.3 },
        { x: 45, y: 70, size: 3, delay: 0.7 },
    ];

    return (
        <div className="relative w-20 h-20">
            {/* Vacuum icon with pulse */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
            >
                <div className="w-14 h-14 rounded-2xl bg-accent2/10 flex items-center justify-center relative overflow-hidden">
                    <Wind className="w-7 h-7 text-accent2" />
                    {/* Suction lines */}
                    {isActive && (
                        <>
                            <motion.div
                                className="absolute w-full h-0.5 bg-accent2/30"
                                initial={{ x: -60 }}
                                animate={{ x: 60 }}
                                transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                            />
                            <motion.div
                                className="absolute w-full h-0.5 bg-accent2/20"
                                style={{ top: "35%" }}
                                initial={{ x: -60 }}
                                animate={{ x: 60 }}
                                transition={{ duration: 0.6, repeat: Infinity, ease: "linear", delay: 0.2 }}
                            />
                            <motion.div
                                className="absolute w-full h-0.5 bg-accent2/30"
                                style={{ bottom: "35%" }}
                                initial={{ x: -60 }}
                                animate={{ x: 60 }}
                                transition={{ duration: 0.6, repeat: Infinity, ease: "linear", delay: 0.4 }}
                            />
                        </>
                    )}
                </div>
            </motion.div>

            {/* Particles being sucked in */}
            {isActive && particles.map((p, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-accent2/50"
                    style={{ width: p.size, height: p.size }}
                    initial={{ x: p.x, y: p.y, opacity: 0, scale: 1 }}
                    animate={{
                        x: [p.x, 40],
                        y: [p.y, 40],
                        opacity: [0.8, 0],
                        scale: [1, 0],
                    }}
                    transition={{
                        duration: 0.8,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: "easeIn",
                    }}
                />
            ))}
        </div>
    );
}

// Done animation - sparkles/clean
function DoneAnimation({ isActive }: { isActive: boolean }) {
    const sparkles = [
        { x: 15, y: 15, delay: 0 },
        { x: 55, y: 10, delay: 0.3 },
        { x: 10, y: 50, delay: 0.6 },
        { x: 60, y: 55, delay: 0.9 },
        { x: 35, y: 5, delay: 0.4 },
        { x: 40, y: 65, delay: 0.7 },
    ];

    return (
        <div className="relative w-20 h-20">
            {/* Checkmark with bounce */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={isActive ? {
                    scale: [1, 1.1, 1],
                } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-accent" />
                </div>
            </motion.div>

            {/* Sparkle particles */}
            {isActive && sparkles.map((s, i) => (
                <motion.div
                    key={i}
                    className="absolute"
                    style={{ left: s.x, top: s.y }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        rotate: [0, 180],
                    }}
                    transition={{
                        duration: 1.5,
                        delay: s.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" className="text-accent">
                        <path
                            fill="currentColor"
                            d="M6 0L7 4.5L12 6L7 7.5L6 12L5 7.5L0 6L5 4.5Z"
                        />
                    </svg>
                </motion.div>
            ))}
        </div>
    );
}

const steps = [
    {
        number: "01",
        title: "Sweep",
        description: "Glide across any surface. Bristles gather everything in seconds.",
        Animation: SweepAnimation,
        color: "accent",
    },
    {
        number: "02",
        title: "Vacuum",
        description: "One click. Powerful suction captures everything instantly.",
        Animation: VacuumAnimation,
        color: "accent2",
    },
    {
        number: "03",
        title: "Done",
        description: "No dustpan, no switching. Empty and go.",
        Animation: DoneAnimation,
        color: "accent",
    },
];

export function HowItWorksSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-20%" });

    return (
        <section
            id="how-it-works"
            className="relative py-16 md:py-24 px-6 bg-muted/30 overflow-hidden"
        >
            <div ref={ref} className="max-w-5xl mx-auto w-full relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-14"
                >
                    {/* Decorative line with dot */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="h-px w-8 bg-accent/40" />
                        <div className="w-1.5 h-1.5 rounded-full bg-accent/60" />
                        <div className="h-px w-8 bg-accent/40" />
                    </div>
                    {/* Section Header */}
                <div className="text-center mb-20">
                    <span className="text-sm uppercase tracking-widest text-muted-foreground mb-3">
                        Simple as 1-2-3
                    </span>
                    <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4 leading-tight">
                        How It Works
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                        Cleaning has never been this effortless. Three simple steps to a spotless space.
                    </p>
                </div>
                </motion.div>

                

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {steps.map((step, i) => {
                        const isAccent2 = step.color === "accent2";
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: i * 0.15 }}
                                whileHover={{ y: -6 }}
                                className="group"
                            >
                                <div className={`
                                    relative p-8 rounded-ui bg-white border border-border/50
                                    shadow-sm hover:shadow-xl transition-all duration-300
                                    overflow-hidden h-full
                                `}>
                                    {/* Step number badge */}
                                    <span className={`
                                        absolute top-4 right-4 text-5xl font-light
                                        ${isAccent2 ? "text-accent2/15" : "text-accent/15"}
                                    `}>
                                        {step.number}
                                    </span>

                                    {/* Animated icon */}
                                    <div className="mb-6">
                                        <step.Animation isActive={isInView} />
                                    </div>

                                    <h3 className="text-2xl font-semibold text-foreground mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {step.description}
                                    </p>

                                    {/* Hover accent line */}
                                    <div className={`
                                        absolute bottom-0 left-0 h-1 w-0 group-hover:w-full
                                        transition-all duration-500 ease-out
                                        ${isAccent2 ? "bg-accent2" : "bg-accent"}
                                    `} />
                                </div>

                                {/* Connector arrow - desktop only */}
                                {i < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 transform translate-x-1/2 -translate-y-1/2 z-10">
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.5 + i * 0.2 }}
                                        >
                                            <svg
                                                className="w-6 h-6 text-muted-foreground/40"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </motion.div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Tagline */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-center mt-12 text-sm text-muted-foreground tracking-wide"
                >
                    No bending · No switching · No hassle
                </motion.p>
            </div>
        </section>
    );
}
