"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { adminLogin, type LoginState } from "@/lib/reviews/actions";

export function AdminLogin() {
  const router = useRouter();
  const [state, action, pending] = useActionState<LoginState, FormData>(adminLogin, { status: "idle" });
  // A good password sets the cookie; re-read the page to show the reviews.
  useEffect(() => {
    if (state.status === "idle") router.refresh();
  }, [state, router]);
  return (
    <form action={action} className="mt-6 max-w-[360px] space-y-4">
      <div>
        <label htmlFor="pw" className="mb-1 block t-label text-ink">
          Password
        </label>
        <input id="pw" name="password" type="password" required autoComplete="current-password" className="h-12 w-full rounded-ctl border border-field bg-surface px-3 text-[16px] text-ink" />
        {state.status === "error" && (
          <p role="alert" className="mt-1 t-small text-error">
            {state.message}
          </p>
        )}
      </div>
      <Button type="submit" loading={pending}>
        Sign in
      </Button>
    </form>
  );
}
