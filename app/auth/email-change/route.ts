import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    redirect("/auth/email-change/result?error=missing_code");
  }

  const supabase = await createClient();

  // Exchange the code to finalize the email change
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    redirect(`/auth/email-change/result?error=${encodeURIComponent(error.message)}`);
  }

  // Sign out globally to invalidate all sessions (including other browsers)
  await supabase.auth.signOut({ scope: "global" });

  redirect("/auth/email-change/result?success=true");
}
