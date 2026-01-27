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
        <section className="relative py-10 md:py-14 px-6 bg-muted overflow-hidden">
            <div className="max-w-6xl mx-auto w-full">
                {/* Decorative line with dot */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="h-px w-8 bg-accent2/40" />
                        <div className="w-1.5 h-1.5 rounded-full bg-accent2/60" />
                        <div className="h-px w-8 bg-accent2/40" />
                    </div>
                <div className="flex flex-col items-center gap-8">
                    
                    {/* Headline */}
                    <div className="text-center">
                        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">
                            Sound familiar?
                        </p>
                        <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4 leading-tight">
                            The cleaning struggle is real.
                        </h2>
                    </div>

                    {/* Divider */}
                    <div className="w-16 h-px bg-border/60" />

                    {/* Problem pills */}
                    <div className="flex flex-wrap md:flex-nowrap items-stretch justify-center gap-5">
                        {problems.map((problem, i) => {
                            const isAccent2 = problem.color === "accent2";
                            return (
                                <div
                                    key={i}
                                    className={`group relative flex items-center gap-4 bg-card border-l-4 rounded-lg px-5 py-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-default w-full md:w-52 ${
                                        isAccent2
                                            ? "border-l-accent2/50 hover:shadow-accent2/20"
                                            : "border-l-accent/50 hover:shadow-accent/20"
                                    }`}
                                >
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                            isAccent2
                                                ? "bg-accent2/15 group-hover:bg-accent2/25"
                                                : "bg-accent/15 group-hover:bg-accent/25"
                                        }`}
                                    >
                                        <problem.icon
                                            className={`w-6 h-6 ${isAccent2 ? "text-accent2" : "text-accent"}`}
                                        />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-base font-semibold text-foreground leading-tight">
                                            {problem.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-0.5">
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