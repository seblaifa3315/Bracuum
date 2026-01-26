"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const WARNING_DURATION = 1 * 60 * 1000; // 1 minutes
const MAX_SESSION_AGE = 2 * 24 * 60 * 60 * 1000; // 2 days
const SESSION_KEY = "session_started_at";

export function IdleLogout() {
  const supabase = createClient();
  const router = useRouter();

  const lastActivityRef = useRef(Date.now());
  const [showWarning, setShowWarning] = useState(false);

  const registerActivity = () => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
  };

  const handleLogout = async () => {
    localStorage.removeItem(SESSION_KEY);
    try {
      await supabase.auth.signOut();
    } catch {
      // Network error (e.g., after laptop sleep) - still redirect to login
    }
    router.replace("/auth/login");
  };

  useEffect(() => {
    // Store session start time once
    if (!localStorage.getItem(SESSION_KEY)) {
      localStorage.setItem(SESSION_KEY, Date.now().toString());
    }

    const events = ["mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((event) =>
      window.addEventListener(event, registerActivity)
    );

    // Handle visibility change (laptop wake from sleep)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const idleTime = Date.now() - lastActivityRef.current;
        if (idleTime >= IDLE_TIMEOUT) {
          handleLogout();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const interval = setInterval(async () => {
      const idleTime = Date.now() - lastActivityRef.current;

      // HARD EXPIRATION
      const startedAt = localStorage.getItem(SESSION_KEY);
      if (startedAt && Date.now() - Number(startedAt) > MAX_SESSION_AGE) {
        await handleLogout();
        return;
      }

      // IDLE LOGOUT
      if (idleTime >= IDLE_TIMEOUT) {
        await handleLogout();
      } else if (idleTime >= IDLE_TIMEOUT - WARNING_DURATION) {
        setShowWarning(true);
      }
    }, 30_000);

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, registerActivity)
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, [router, supabase]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold">Session expiring</h2>
        <p className="mt-2 text-sm text-gray-600">
          You've been inactive. You will be logged out in 2 minutes.
        </p>

        <button
          onClick={registerActivity}
          className="mt-4 rounded-md bg-black px-4 py-2 text-white"
        >
          Stay logged in
        </button>
      </div>
    </div>
  );
}
