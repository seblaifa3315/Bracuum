"use client";

import { Clock, Package, Frown } from "lucide-react";

const problems = [
    {
        title: "Time Wasted",
        description: "Switching tools constantly",
        icon: Clock,
        color: "accent",
    },
    {
        title: "Cluttered Space",
        description: "Too many tools stored",
        icon: Package,
        color: "accent2",
    },
    {
        title: "Back Pain",
        description: "Heavy lifting & bending",
        icon: Frown,
        color: "accent",
    },
];

export function ProblemSection() {
    return (
        <section className="relative py-10 md:py-14 px-6 bg-gradient-to-r from-primary/5 via-background to-accent/5 overflow-hidden">
            <div className="max-w-6xl mx-auto w-full">
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    {/* Left side - Headline */}
                    <div className="md:w-1/3 text-center md:text-left shrink-0">
                        <p className="text-accent2 text-xs font-semibold tracking-widest uppercase mb-2">
                            Sound familiar?
                        </p>
                        <h2 className="text-2xl md:text-3xl font-light text-foreground leading-tight">
                            The cleaning struggle is real.
                        </h2>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-16 bg-border/60" />

                    {/* Right side - Problem pills */}
                    <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-4 md:gap-6">
                        {problems.map((problem, i) => {
                            const isAccent2 = problem.color === "accent2";
                            return (
                                <div
                                    key={i}
                                    className="group flex items-center gap-3 bg-card/60 backdrop-blur-sm border border-border/40 rounded-full px-5 py-3 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-default"
                                >
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                                            isAccent2
                                                ? "bg-accent2/10 group-hover:bg-accent2/20"
                                                : "bg-accent/10 group-hover:bg-accent/20"
                                        }`}
                                    >
                                        <problem.icon
                                            className={`w-5 h-5 ${isAccent2 ? "text-accent2" : "text-accent"}`}
                                        />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-foreground leading-tight">
                                            {problem.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {problem.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}