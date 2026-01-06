"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-lg shadow p-6">
        <div className="flex flex-col items-center gap-4">
          {/* Warning icon */}
          <span className="text-4xl text-yellow-500">⚠️</span>

          <h1 className="text-2xl font-semibold text-gray-900 text-center">
            Oops, something went wrong
          </h1>

          <p className="text-sm text-gray-500 text-center">
            {error
              ? `Error code: ${error}`
              : "An unexpected authentication error occurred. Please try again."}
          </p>

          <Link
            href="/auth/login"
            className="mt-4 w-full text-center rounded-md bg-black text-white py-2 px-4 text-sm font-medium hover:bg-gray-900 transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
