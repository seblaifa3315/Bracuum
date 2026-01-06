"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_DURATION = 2 * 60 * 1000; // 2 minutes

export function IdleLogout() {
  const supabase = createClient();
  const router = useRouter();

  const lastActivityRef = useRef(Date.now());
  const [showWarning, setShowWarning] = useState(false);

  // Update activity timestamp
  const registerActivity = () => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "touchstart"];

    events.forEach((event) =>
      window.addEventListener(event, registerActivity)
    );

    const interval = setInterval(async () => {
      const idleTime = Date.now() - lastActivityRef.current;

      if (idleTime >= IDLE_TIMEOUT) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
      } else if (idleTime >= IDLE_TIMEOUT - WARNING_DURATION) {
        setShowWarning(true);
      }
    }, 30_000); // check every 30s (not every second)

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, registerActivity)
      );
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
