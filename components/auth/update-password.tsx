"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const validatePassword = (pwd: string) =>
    pwd.length >= 8 &&
    /[A-Z]/.test(pwd) &&
    /[a-z]/.test(pwd) &&
    /[0-9]/.test(pwd) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password does not meet the requirements below.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      await supabase.auth.signOut();
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  /* ✅ SUCCESS STATE */
  if (success) {
    return (
      <Card>
  <CardHeader className="text-center">
    <CardTitle>Password updated</CardTitle>
    <CardDescription>
      Your password has been successfully changed.
      <br />
      Please log in again using your new password.
    </CardDescription>
  </CardHeader>

  <CardContent className="space-y-4">
    <p className="text-sm text-muted-foreground text-center">
      For security reasons, you've been signed out.  
      Click below to return to the login page and sign in with your updated
      password.
    </p>

    <Button asChild className="w-full">
      <Link href="/auth/login">Back to login</Link>
    </Button>
  </CardContent>
</Card>
    );
  }

  /* 🔐 FORM STATE */
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          Enter a new password for your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="mb-4 text-sm text-muted-foreground list-disc list-inside space-y-1">
          <li>At least 8 characters</li>
          <li>One uppercase letter</li>
          <li>One lowercase letter</li>
          <li>One number</li>
          <li>One special character</li>
        </ul>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save new password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
