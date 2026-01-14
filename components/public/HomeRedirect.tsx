/**
 * HomeRedirect
 * -------------
 * This client-side component handles Supabase email change confirmation redirects.
 *
 * Supabase always redirects users to the Site URL ("/") after confirming an email
 * change, even when a custom `emailRedirectTo` is provided.
 *
 * When a user clicks the confirmation link in their email, Supabase appends either:
 *   - `?message=...`  → partial confirmation (one email confirmed)
 *   - `?code=...`     → final confirmation (email change completed)
 *
 * This component detects those query parameters on the homepage and immediately
 * redirects the user to the dedicated confirmation page:
 *
 *   /auth/email-change
 *
 * This allows us to:
 *   - Keep the homepage as a Server Component for SEO
 *   - Still provide a clean, user-friendly confirmation flow
 *   - Avoid modifying Supabase's built-in redirect behavior
 *
 * The component renders nothing and only runs in the browser.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.has("message") || params.has("code") || params.has("error")) {
      router.replace("/auth/email-change" + window.location.search);
    }
  }, [router]);

  return null;
}
