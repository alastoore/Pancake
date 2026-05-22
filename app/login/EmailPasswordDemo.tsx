"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EmailPasswordDemo() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setStatus(error?.message || "Login failed");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single<{ role: string }>();

    if (profileError || !profile) {
      setStatus("Error fetching profile. Ensure your account is fully set up.");
      setLoading(false);
      return;
    }

    if (profile.role === "admin") {
      router.push("/admin/verify");
    } else if (profile.role === "organizer") {
      router.push("/organizer/profile");
    } else {
      router.push("/player/profile");
    }

    setLoading(false);
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setStatus("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus(error.message);
      setGoogleLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setStatus("Enter your email first so we know where to send the reset link.");
      return;
    }

    setForgotPasswordLoading(true);
    setStatus("");

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });  

    if (error) {
      setStatus(error.message);
      setForgotPasswordLoading(false);
      return;
    }

    setStatus("We sent a password reset link to your email.");
    setForgotPasswordLoading(false);
  }

  const isSuccess = status.toLowerCase().includes("sent");

  return (
    <div className="rounded-[20px] bg-white px-8 py-9 shadow-[0_18px_40px_rgba(0,0,0,0.25)]">
      <h2 className="mb-7 text-center text-[2rem] font-extrabold text-black">
        LOG IN
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-base font-semibold text-black">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="h-12 w-full rounded-xl bg-[#f2f2f2] px-4 text-gray-900 outline-none placeholder:text-gray-400 focus:border focus:border-red-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-base font-semibold text-black">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
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
          disabled={loading}
          className="mt-2 h-12 w-full cursor-pointer rounded-xl bg-[#d62828] text-lg font-bold text-white shadow-md hover:bg-[#bb1f1f]"
        >
          {loading ? "LOGGING IN..." : "LOG IN"}
        </button>
      </form>


      <div className="mt-6 text-center">
        <Link
          href="/register"
          className="cursor-pointer text-sm font-bold text-red-600 underline transition-colors hover:text-red-800"
        >
          Back to Sign Up
        </Link>
      </div>
    </div>
  );
}
