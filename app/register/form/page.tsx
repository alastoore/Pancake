"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const role = searchParams.get("role") || "player";

  const supabase = getSupabaseBrowserClient();

  // 🔐 Auth fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🥋 Player fields
  const [fullName, setFullName] = useState("");
  const [dojo, setDojo] = useState("");
  const [beltRank, setBeltRank] = useState("");
  const [category, setCategory] = useState("");

  // 🏢 Organizer fields (optional for now)
  const [orgName, setOrgName] = useState("");
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(false);

  const inputStyle =
    "w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-900";

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    alert("Success! Please check your email to confirm your account.");

    // 🚀 Pass data to profile page
    if (role === "player") {
      router.push(
        `/player/profile?name=${encodeURIComponent(
          fullName
        )}&dojo=${encodeURIComponent(dojo)}&belt=${beltRank}&category=${category}`
      );
    } else {
      router.push("/organizer/profile");
    }

    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-md border">
        
        {/* HEADER */}
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Create Account
        </h1>

        <p className="text-center text-sm text-gray-500 mt-1 mb-6">
          Registering as a{" "}
          <span className="font-bold text-red-600 capitalize">
            {role}
          </span>
        </p>

        {/* FORM */}
        <form onSubmit={handleSignUp} className="flex flex-col gap-4">

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputStyle}
            required
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputStyle}
            required
          />

          {/* 🥋 PLAYER FIELDS */}
          {role === "player" && (
            <>
              <input
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputStyle}
                required
              />

              <input
                placeholder="Dojo / Club"
                value={dojo}
                onChange={(e) => setDojo(e.target.value)}
                className={inputStyle}
              />

              <select
                value={beltRank}
                onChange={(e) => setBeltRank(e.target.value)}
                className={inputStyle}
                required
              >
                <option value="">Belt Rank</option>
                <option>White</option>
                <option>Yellow</option>
                <option>Green</option>
                <option>Blue</option>
                <option>Brown</option>
                <option>Black</option>
              </select>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputStyle}
                required
              >
                <option value="">Category</option>
                <option>Kata</option>
                <option>Kumite</option>
                <option>Both</option>
              </select>
            </>
          )}

          {/* 🏢 ORGANIZER FIELDS */}
          {role === "organizer" && (
            <>
              <input
                placeholder="Organization Name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className={inputStyle}
                required
              />

              <input
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputStyle}
              />
            </>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-red-600 text-white font-semibold py-4 rounded-xl hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

        </form>
      </div>
    </main>
  );
}

