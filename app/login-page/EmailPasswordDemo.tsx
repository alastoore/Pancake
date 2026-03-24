"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

type EmailPasswordDemoProps = {
  user?: User | null;
};

export default function EmailPasswordDemo({
  user = null,
}: EmailPasswordDemoProps) {
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(user);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Signed in successfully.");
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

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setStatus(error.message);
      return;
    }

    setCurrentUser(null);
    setStatus("Signed out successfully.");
  }

  // ✅ IF LOGGED IN
  if (currentUser) {
    return (
      <div className="rounded-[20px] bg-white px-8 py-9 shadow-[0_18px_40px_rgba(0,0,0,0.25)]">
        <h2 className="mb-4 text-center text-[2rem] font-extrabold text-black">
          WELCOME
        </h2>

        <p className="text-sm text-gray-700">{currentUser.email}</p>

        <button
          onClick={handleSignOut}
          className="mt-6 h-12 w-full rounded-xl bg-[#d62828] text-lg font-bold text-white hover:bg-[#bb1f1f]"
        >
          SIGN OUT
        </button>
      </div>
    );
  }

  // ✅ LOGIN UI
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
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 w-full rounded-xl bg-[#f2f2f2] px-4 outline-none focus:border focus:border-red-500"
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
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 w-full rounded-xl bg-[#f2f2f2] px-4 outline-none focus:border focus:border-red-500"
          />
        </div>

        {status && (
          <p className="text-sm font-medium text-red-600">{status}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 h-12 w-full rounded-xl bg-[#d62828] text-lg font-bold text-white shadow-md hover:bg-[#bb1f1f]"
        >
          {loading ? "LOGGING IN..." : "LOG IN"}
        </button>
      </form>

      {/* 🔥 GOOGLE BUTTON WITH REAL ICON */}
      <button
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#d62828] text-lg font-medium text-white shadow-md hover:bg-[#bb1f1f]"
      >
        <img
          src="/images/google.png"
          alt="Google"
          className="h-5 w-5"
        />

        {googleLoading ? "Loading..." : "Log In with Google"}
      </button>
    </div>
  );
}