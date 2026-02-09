import {prisma} from "@/lib/prisma/prisma";
import type { Product } from "@/generated/prisma/client";
import HomeRedirect from "@/components/public/HomeRedirect";
import { HeroSection } from "@/components/public/HeroSection";
import { ProblemSection } from "@/components/public/ProblemSection";
import { FeaturesSection } from "@/components/public/FeaturesSection";
import { HowItWorksSection } from "@/components/public/HowItWorksSection";
import { DemoSection } from "@/components/public/DemoSection";
import { ContactSection } from "@/components/public/ContactSection";
import { FAQSection } from "@/components/public/FAQSection";
import { Footer } from "@/components/public/Footer";

export default async function Home() {
    let product: Product | null = null;
    try {
        product = await prisma.product.findFirst();
    } catch (error) {
        console.error("Failed to fetch product:", error);
    }

    return (
        <>
            <HomeRedirect />
            <HeroSection  />
            <ProblemSection />
            <FeaturesSection />
            <HowItWorksSection />
            <DemoSection />
            <FAQSection />
            <ContactSection />
            <Footer />
        </>
    );
}
