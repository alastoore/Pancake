"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client"; // Adjust path as needed

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Use YOUR specific client function here
  const supabase = getSupabaseBrowserClient();

  // Grab the role from the URL (?role=player or ?role=organizer)
  const role = searchParams.get("role") || "player"; 

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role, // Saves to auth.users metadata
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Success! Please check your email to confirm your account.");
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md bg-gray-100 p-8 rounded-3xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Create Account
        </h1>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Registering as a <span className="font-bold text-red-600 capitalize">{role}</span>
        </p>

        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
          {/* Email Field with Label */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white text-gray-900 placeholder: text-gray-400"
              required
            />
          </div>

          {/* Password Field with Label */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white text-gray-900 placeholder: text-gray-400"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-gray-800 text-white font-semibold py-4 rounded-xl hover:bg-gray-700 transition disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </main>
  );
}