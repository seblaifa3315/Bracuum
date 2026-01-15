import {LandingPage} from "@/components/public/LandingPage";
import {prisma} from "@/lib/prisma/prisma";
import type {ProductModel} from "@/lib/prisma/generated/prisma/models/Product";
import HomeRedirect from "@/components/public/HomeRedirect";

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
            <h1>HELLO WORLD</h1>
        </>
    );
}
