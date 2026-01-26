"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Wind, CheckCircle } from "lucide-react";
import { useRef } from "react";

const steps = [
    {
        number: "01",
        title: "Sweep",
        description: "Glide across any surface. Bristles gather everything in seconds.",
        icon: Sparkles,
        color: "accent",
    },
    {
        number: "02",
        title: "Vacuum",
        description: "One click. Powerful suction captures everything instantly.",
        icon: Wind,
        color: "accent2",
    },
    {
        number: "03",
        title: "Done",
        description: "No dustpan, no switching. Empty and go.",
        icon: CheckCircle,
        color: "accent",
    },
];

export function HowItWorksSection() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    // Parallax for decorative elements
    const floatY1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const floatY2 = useTransform(scrollYProgress, [0, 1], [50, -150]);
    const rotate = useTransform(scrollYProgress, [0, 1], [0, 180]);

    return (
        <section
            ref={ref}
            id="how-it-works"
            className="relative py-16 md:py-24 px-6 bg-background overflow-hidden"
        >
            {/* Parallax floating decorative elements */}
            <motion.div
                style={{ y: floatY1, rotate }}
                className="absolute top-20 right-[10%] w-32 h-32 rounded-full bg-gradient-to-br from-accent/10 to-accent2/5 blur-2xl"
            />
            <motion.div
                style={{ y: floatY2 }}
                className="absolute bottom-20 left-[5%] w-24 h-24 rounded-full bg-gradient-to-tr from-accent2/10 to-accent/5 blur-2xl"
            />

            <div className="max-w-5xl mx-auto w-full relative z-10">
                {/* Compact Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-light text-foreground">
                        How It Works
                    </h2>
                </motion.div>

                {/* Steps - Horizontal cards with stagger animation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {steps.map((step, i) => {
                        const isAccent2 = step.color === "accent2";
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    duration: 0.5,
                                    delay: i * 0.15,
                                    ease: [0.25, 0.46, 0.45, 0.94],
                                }}
                                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                className="group relative"
                            >
                                <div className={`
                                    relative p-6 rounded-2xl bg-white border border-border/50
                                    shadow-sm hover:shadow-lg transition-shadow duration-300
                                    overflow-hidden
                                `}>
                                    {/* Hover gradient overlay */}
                                    <div className={`
                                        absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                        ${isAccent2 ? "bg-gradient-to-br from-accent2/5 to-transparent" : "bg-gradient-to-br from-accent/5 to-transparent"}
                                    `} />

                                    {/* Content */}
                                    <div className="relative z-10">
                                        {/* Number + Icon row */}
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`
                                                text-4xl font-light tracking-tight
                                                ${isAccent2 ? "text-accent2/30" : "text-accent/30"}
                                            `}>
                                                {step.number}
                                            </span>
                                            <motion.div
                                                whileHover={{ rotate: 15, scale: 1.1 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                                className={`
                                                    w-12 h-12 rounded-xl flex items-center justify-center
                                                    ${isAccent2 ? "bg-accent2/10" : "bg-accent/10"}
                                                `}
                                            >
                                                <step.icon className={`w-6 h-6 ${isAccent2 ? "text-accent2" : "text-accent"}`} />
                                            </motion.div>
                                        </div>

                                        <h3 className="text-xl font-semibold text-foreground mb-2">
                                            {step.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>

                                    {/* Animated bottom accent line */}
                                    <motion.div
                                        className={`
                                            absolute bottom-0 left-0 h-0.5
                                            ${isAccent2 ? "bg-accent2" : "bg-accent"}
                                        `}
                                        initial={{ width: "0%" }}
                                        whileHover={{ width: "100%" }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>

                                {/* Connecting dots between cards - desktop only */}
                                {i < steps.length - 1 && (
                                    <div className="hidden md:flex absolute top-1/2 -right-3 transform translate-x-0 -translate-y-1/2 z-20">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.5 + i * 0.15 }}
                                            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"
                                        />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Compact tagline */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-center mt-10 text-sm text-muted-foreground tracking-wide"
                >
                    No bending · No switching · No hassle
                </motion.p>
            </div>
        </section>
    );
}
