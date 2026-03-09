"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

type Step = "lookup" | "request" | "success";

const RETURN_REASONS = [
  { value: "CHANGED_MIND", label: "Changed my mind" },
  { value: "DEFECTIVE", label: "Product is defective" },
  { value: "NOT_AS_DESCRIBED", label: "Not as described" },
  { value: "OTHER", label: "Other" },
];

export default function ReturnRequestPage() {
  const [step, setStep] = useState<Step>("lookup");

  // Lookup form
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  // Request form
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Return address from API
  const [returnAddress, setReturnAddress] = useState<{
    name: string; line1: string; line2?: string;
    city: string; state: string; zip: string; country: string;
  } | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError("");

    if (!email.trim() || !orderNumber.trim()) {
      setLookupError("Please fill in both fields.");
      return;
    }

    // Move to request step — actual validation happens on submit
    setStep("request");
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!reason) {
      setSubmitError("Please select a return reason.");
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await fetch("/api/returns/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          orderNumber: orderNumber.trim(),
          reason,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit return request");
      }

      if (data.returnShippingAddress) {
        setReturnAddress(data.returnShippingAddress);
      }
      setStep("success");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit return request"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Return Request
          </h1>
          <p className="text-muted-foreground">
            {step === "lookup" && "Enter your order details to start a return"}
            {step === "request" && "Tell us why you'd like to return your order"}
            {step === "success" && "Your return request has been submitted"}
          </p>
        </div>

        {/* Step 1: Order Lookup */}
        {step === "lookup" && (
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
              </div>
              <div>
                <label
                  htmlFor="orderNumber"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Order Number
                </label>
                <input
                  id="orderNumber"
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="BRC-0001"
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
              </div>

              {lookupError && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {lookupError}
                </div>
              )}
            </div>

            <Button type="submit" disabled={lookupLoading} className="w-full">
              {lookupLoading ? "Looking up..." : "Look Up Order"}
            </Button>

            <div className="text-center">
              <Link
                href="/returns"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                &larr; Back to Return Policy
              </Link>
            </div>
          </form>
        )}

        {/* Step 2: Return Request Form */}
        {step === "request" && (
          <form onSubmit={handleSubmitReturn} className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p className="text-muted-foreground">
                  Order <strong className="text-foreground">{orderNumber}</strong> &middot;{" "}
                  {email}
                </p>
              </div>

              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Reason for Return <span className="text-destructive">*</span>
                </label>
                <select
                  id="reason"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground appearance-none cursor-pointer"
                >
                  <option value="">Select a reason...</option>
                  {RETURN_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="note"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Additional Details{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </label>
                <textarea
                  id="note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Tell us more about your return..."
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground resize-none"
                />
              </div>

              {submitError && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {submitError}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("lookup")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                type="submit"
                disabled={submitLoading}
                className="flex-1"
              >
                {submitLoading ? "Submitting..." : "Submit Return Request"}
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  Return Request Submitted
                </h2>
                <p className="text-sm text-muted-foreground">
                  We&apos;ve sent a confirmation email to <strong>{email}</strong> with
                  return instructions.
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-foreground">Next Steps</h3>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>Pack the product securely in its original packaging if possible</li>
                <li>
                  Include your order number (<strong className="text-foreground">{orderNumber}</strong>) inside the package
                </li>
                <li>Ship the package to the return address below</li>
                <li>Once we receive and inspect the product, we&apos;ll process your refund within 5-10 business days</li>
              </ol>
            </div>

            {returnAddress && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-1">
                <h3 className="font-semibold text-foreground mb-2">Return Address</h3>
                <p className="text-sm text-muted-foreground">{returnAddress.name}</p>
                <p className="text-sm text-muted-foreground">{returnAddress.line1}</p>
                {returnAddress.line2 && (
                  <p className="text-sm text-muted-foreground">{returnAddress.line2}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {returnAddress.city}, {returnAddress.state} {returnAddress.zip}
                </p>
                <p className="text-sm text-muted-foreground">{returnAddress.country}</p>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setStep("lookup");
                setEmail("");
                setOrderNumber("");
                setReason("");
                setNote("");
                setSubmitError("");
                setLookupError("");
                setReturnAddress(null);
              }}
            >
              Submit Another Return
            </Button>
          </div>
        )}

        {/* Return Policy Info */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            Returns must be initiated within 30 days of delivery.
            <br />
            Questions? Contact us at{" "}
            <a
              href="mailto:support@bracuum.com"
              className="text-foreground hover:underline"
            >
              support@bracuum.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
