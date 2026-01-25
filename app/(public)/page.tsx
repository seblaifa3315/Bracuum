import {prisma} from "@/lib/prisma/prisma";
import type {ProductModel} from "@/lib/prisma/generated/prisma/models/Product";
import HomeRedirect from "@/components/public/HomeRedirect";
import { HeroSection } from "@/components/public/HeroSection";
import { ProblemSection } from "@/components/public/ProblemSection";
import { FeaturesSection } from "@/components/public/FeaturesSection";
import { HowItWorksSection } from "@/components/public/HowItWorksSection";
import { DemoSection } from "@/components/public/DemoSection";

export default async function Home() {
    let product: ProductModel | null = null;
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
        </>
    );
}
