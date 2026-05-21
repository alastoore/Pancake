"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { AuthChangeEvent } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResetPasswordPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(
    "Open the reset link from your email, then choose a new password here."
  );
  const [submitting, setSubmitting] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (error) {
        setStatus(error.message);
        return;
      }

      if (data.session) {
        setRecoveryReady(true);
        setStatus("Choose a new password for your account.");
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
      if (!mounted) {
        return;
      }

      if (event === "PASSWORD_RECOVERY" || session) {
        setRecoveryReady(true);
        setStatus("Choose a new password for your account.");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!recoveryReady) {
      setStatus("Open the password reset link from your email before saving a new password.");
      return;
    }

    if (password.length < 6) {
      setStatus("Your new password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setStatus("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus(error.message);
      setSubmitting(false);
      return;
    }

    setStatus("Password updated. Redirecting you to login...");
    setSubmitting(false);
    router.push("/login");
  }

  const isSuccess = status.toLowerCase().includes("password updated");

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/login-bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <section className="w-full max-w-[460px] rounded-[20px] bg-white px-8 py-9 shadow-[0_18px_40px_rgba(0,0,0,0.25)]">
          <h1 className="text-center text-[2rem] font-extrabold text-black">
            RESET PASSWORD
          </h1>

          <p className="mt-3 text-center text-sm font-medium text-gray-600">
            Create a new password for your account.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label className="mb-2 block text-base font-semibold text-black">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="h-12 w-full rounded-xl bg-[#f2f2f2] px-4 text-gray-900 outline-none placeholder:text-gray-400 focus:border focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-base font-semibold text-black">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className="h-12 w-full rounded-xl bg-[#f2f2f2] px-4 text-gray-900 outline-none placeholder:text-gray-400 focus:border focus:border-red-500"
              />
            </div>

            {status && (
              <p
                className={`text-sm font-medium ${
                  isSuccess ? "text-green-600" : "text-red-600"
                }`}
              >
                {status}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="h-12 w-full rounded-xl bg-[#d62828] text-lg font-bold text-white shadow-md transition-colors hover:bg-[#bb1f1f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "UPDATING..." : "SAVE NEW PASSWORD"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-bold text-red-600 underline transition-colors hover:text-red-800"
            >
              Back to Login
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
