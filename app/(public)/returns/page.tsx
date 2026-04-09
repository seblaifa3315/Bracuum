"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Clock, PackageCheck, Truck, ArrowRight } from "lucide-react";
import Link from "next/link";

type ReturnAddress = {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export default function ReturnPolicyPage() {
  const [returnAddress, setReturnAddress] = useState<ReturnAddress | null>(null);
  const [contactEmail, setContactEmail] = useState("contact@bracuum.com");

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        const product = data.data?.[0];
        if (product?.returnShippingAddress) {
          setReturnAddress(product.returnShippingAddress as ReturnAddress);
        }
        if (product?.contactEmail) {
          setContactEmail(product.contactEmail);
        }
      } catch {
        // silently fail — defaults will be used
      }
    }
    fetchProduct();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Return Policy
          </h1>
          <p className="text-muted-foreground">
            We want you to be completely satisfied with your Bracuum purchase.
          </p>
        </div>

        {/* 30-Day Window */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                30-Day Return Window
              </h2>
              <p className="text-sm text-muted-foreground">
                You may request a return within 30 days of your order being delivered.
                Once we receive and inspect the returned product, your refund will be
                processed within 5&ndash;10 business days. Return shipping costs are
                the responsibility of the customer.
              </p>
            </div>
          </div>
        </div>

        {/* Eligibility */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <PackageCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Eligibility
              </h2>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>Your order must have been delivered (status: Shipped or Delivered)</li>
                <li>The return request must be made within 30 days of delivery</li>
                <li>Original packaging is preferred but not strictly required</li>
                <li>The product should be in a condition that allows inspection</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Process */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                How It Works
              </h2>
              <ol className="text-sm text-muted-foreground space-y-3 list-decimal list-inside">
                <li>
                  <strong className="text-foreground">Submit a return request</strong> &mdash; provide
                  your email and order number along with a reason for the return.
                </li>
                <li>
                  <strong className="text-foreground">Pack the product</strong> &mdash; securely pack
                  it in its original packaging if possible and include your order number
                  inside the box.
                </li>
                <li>
                  <strong className="text-foreground">Ship it back</strong> &mdash; send the package
                  to the return address shown below. Return shipping is at the
                  customer&apos;s expense.
                </li>
                <li>
                  <strong className="text-foreground">Receive your refund</strong> &mdash; once we
                  receive and inspect the product, we&apos;ll process a full refund of the
                  product price within 5&ndash;10 business days.
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Return Shipping Address */}
        {returnAddress && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Return Shipping Address
            </h2>
            <div className="text-sm text-muted-foreground space-y-0.5">
              <p>{returnAddress.name}</p>
              <p>{returnAddress.line1}</p>
              {returnAddress.line2 && <p>{returnAddress.line2}</p>}
              <p>
                {returnAddress.city}, {returnAddress.state} {returnAddress.zip}
              </p>
              <p>{returnAddress.country}</p>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <Link href="/returns/request">
            <Button size="lg" className="gap-2">
              Start a Return
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Contact */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            Questions? Contact us at{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="text-foreground hover:underline"
            >
              {contactEmail}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
