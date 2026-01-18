"use client";

import {Clock, Package, Frown, ArrowDown, AlertTriangle} from "lucide-react";

const problems = [
    {
        title: "Wasting Time",
        description: "Switching between broom and vacuum doubles your cleaning effort.",
        icon: Clock,
        color: "accent",
    },
    {
        title: "Cluttered Storage",
        description: "Multiple tools eating up valuable closet and garage space.",
        icon: Package,
        color: "accent2",
    },
    {
        title: "Back Pain",
        description: "Bending with dustpans and lugging heavy vacuums hurts.",
        icon: Frown,
        color: "accent",
    },
];

export function ProblemSection() {
    return (
        <section className="relative py-20 md:py-28 px-6 bg-background overflow-hidden">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

            <div className="max-w-6xl mx-auto w-full relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 text-accent2 text-sm font-medium tracking-wider uppercase mb-4">
                        <AlertTriangle className="w-4 h-4" />
                        The Problem
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground mb-6">
                        Tired of Juggling Multiple Tools?
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                        Traditional cleaning means constant switching, wasted space, and unnecessary hassle.
                    </p>
                </div>

                {/* Problem Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-14">
                    {problems.map((problem, i) => {
                        const isAccent2 = problem.color === "accent2";
                        return (
                            <div
                                key={i}
                                className={`group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${isAccent2 ? "hover:border-accent2/40" : "hover:border-accent/40"}`}
                            >
                                {/* Decorative number */}
                                <span className={`absolute top-4 right-4 text-6xl font-bold opacity-5 ${isAccent2 ? "text-accent2" : "text-accent"}`}>
                                    {i + 1}
                                </span>

                                <div className="flex flex-col items-center text-center gap-5 relative z-10">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 ${isAccent2 ? "bg-accent2/10 group-hover:bg-accent2/20" : "bg-accent/10 group-hover:bg-accent/20"}`}>
                                        <problem.icon className={`w-8 h-8 ${isAccent2 ? "text-accent2" : "text-accent"}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-foreground mb-3">
                                            {problem.title}
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {problem.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Bottom accent line */}
                                <div className={`absolute bottom-0 left-6 right-6 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 ${isAccent2 ? "bg-accent2/50" : "bg-accent/50"}`} />
                            </div>
                        );
                    })}
                </div>

                {/* Scroll indicator */}
                <div className="text-center flex flex-col items-center gap-3">
                    <span className="text-muted-foreground text-sm font-medium">
                        There's a smarter way to clean
                    </span>
                    <ArrowDown className="w-5 h-5 text-accent animate-bounce" />
                </div>
            </div>
        </section>
    );
}