import { LandingPage } from "@/components/public/LandingPage";
import { prisma } from '@/lib/prisma/prisma';
import type { ProductModel } from '@/lib/prisma/generated/prisma/models/Product';
import HomeRedirect  from "@/components/public/HomeRedirect";


export default async function Home() {

  let product: ProductModel | null = null;
  try {
    product = await prisma.product.findFirst();
  } catch (error) {
    console.error('Failed to fetch product:', error);
  }

  return (
    <>
      <HomeRedirect />
      <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">API Test Page (Server)</h1>

      {!product && (
        <p>No product found.</p>
      )}

      {product && (
        <div className="border p-4 rounded shadow">
          <h2 className="text-xl font-semibold text-primary">{product.name}</h2>
          <p>{product.description}</p>
          <p className="font-bold">Price: ${(product.price/100).toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">
            Created at: {new Date(product.createdAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>

      <LandingPage />
    </>
  );
}
