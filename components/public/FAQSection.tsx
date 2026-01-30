"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

const faqs = [
    {
        question: "How does the 2-in-1 system work?",
        answer: "Bracuum combines a broom and vacuum in one device. Simply sweep debris into the built-in vacuum chamber, then press the button to activate suction. No dustpan needed, no switching between tools.",
        color: "accent",
    },
    {
        question: "What surfaces can I use it on?",
        answer: "Bracuum works on all hard floors including hardwood, tile, laminate, and vinyl. The soft bristles are gentle enough to protect delicate surfaces while still being effective on textured tiles.",
        color: "accent2",
    },
    {
        question: "How long does the battery last?",
        answer: "A full charge provides up to 45 minutes of continuous vacuuming. For typical daily use (sweeping with occasional vacuum bursts), you can go several days between charges.",
        color: "accent",
    },
    {
        question: "Is it really that quiet?",
        answer: "Yes! Bracuum operates at just 65 dB, quieter than a normal conversation. You can clean early in the morning or late at night without disturbing anyone.",
        color: "accent2",
    },
    {
        question: "What's included with my order?",
        answer: "Every Bracuum comes with the main unit, charging dock, USB-C charging cable, extra filter, and a quick-start guide. Everything you need to start cleaning smarter.",
        color: "accent",
    },
    {
        question: "What is your return policy?",
        answer: "We offer a 30-day satisfaction guarantee. If you're not completely happy with your Bracuum, return it for a full refund. We also provide a 2-year warranty covering manufacturing defects.",
        color: "accent2",
    },
];

function FAQItem({
    faq,
    isOpen,
    onToggle,
    index
}: {
    faq: typeof faqs[0];
    isOpen: boolean;
    onToggle: () => void;
    index: number;
}) {
    const isAccent2 = faq.color === "accent2";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
        >
            <div
                className={`
                    relative bg-white border border-border/50 rounded-ui overflow-hidden
                    shadow-sm hover:shadow-md transition-all duration-300
                    ${isOpen ? "shadow-md" : ""}
                `}
            >
                {/* Accent bar */}
                <div className={`
                    absolute left-0 top-0 bottom-0 w-1
                    ${isAccent2 ? "bg-accent2" : "bg-accent"}
                    ${isOpen ? "opacity-100" : "opacity-0"}
                    transition-opacity duration-300
                `} />

                <button
                    onClick={onToggle}
                    className="w-full px-6 py-5 flex items-center justify-between text-left group"
                >
                    <span className="text-foreground font-medium pr-4 group-hover:text-foreground/80 transition-colors">
                        {faq.question}
                    </span>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className={`
                            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                            ${isAccent2 ? "bg-accent2/10" : "bg-accent/10"}
                            transition-colors duration-300
                        `}
                    >
                        {isOpen ? (
                            <Minus className={`w-4 h-4 ${isAccent2 ? "text-accent2" : "text-accent"}`} />
                        ) : (
                            <Plus className={`w-4 h-4 ${isAccent2 ? "text-accent2" : "text-accent"}`} />
                        )}
                    </motion.div>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            <div className="px-6 pb-5">
                                <p className="text-muted-foreground leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section
            id="faq"
            className="relative py-16 md:py-24 px-6 bg-muted/30 overflow-hidden"
        >
            <div className="max-w-3xl mx-auto w-full relative z-10">
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

                    <span className="block text-sm uppercase tracking-widest text-muted-foreground mb-3">
                        Got Questions?
                    </span>
                    <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4 leading-tight">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                        Everything you need to know about Bracuum.
                    </p>
                </motion.div>

                {/* FAQ Items */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            faq={faq}
                            isOpen={openIndex === index}
                            onToggle={() => handleToggle(index)}
                            index={index}
                        />
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-center mt-12"
                >
                    <p className="text-sm text-muted-foreground">
                        Still have questions?{" "}
                        <a
                            href="#contact"
                            className="text-accent hover:text-accent/80 underline underline-offset-4 transition-colors"
                        >
                            Get in touch
                        </a>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
