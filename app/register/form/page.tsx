"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const role = searchParams.get("role") || "player";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [dojo, setDojo] = useState("");
  const [beltRank, setBeltRank] = useState("");
  const [dob, setDob] = useState("");
  const [instructor, setInstructor] = useState("");
  const [certificate, setCertificate] = useState<File | null>(null);

  const [orgName, setOrgName] = useState("");
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(false);

  const inputStyle =
    "w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-900";


  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 🔥 VALIDATION
    if (role === "player") {
      if (
        !email ||
        !password ||
        !fullName ||
        !dob ||
        !instructor ||
        !beltRank 
      ) {
        alert("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      if (!certificate) {
        alert("Please upload your belt certification.");
        setLoading(false);
        return;
      }
    }

    if (role === "organizer") {
      if (!email || !password || !orgName) {
        alert("Please fill in all required fields.");
        setLoading(false);
        return;
      }
    }

    // 🔥 CREATE USER
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // 🔥 GET USER
    let user = data.user;

    if (!user) {
      const { data: existing } = await supabase.auth.getUser();
      user = existing?.user;
    }

    if (!user) {
      alert("User not available. Please confirm your email.");
      setLoading(false);
      return;
    }

    // 🔥 UPLOAD CERTIFICATE (NEW)
    let certificatePath = null;

    if (role === "player" && certificate) {
      const fileExt = certificate.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(filePath, certificate, { upsert: true });

      if (uploadError) {
        console.error("UPLOAD ERROR FULL:", uploadError);
        alert(uploadError.message);
        setLoading(false);
        return;
      }

      certificatePath = filePath; // 🔥 STORE PATH ONLY (PRIVATE BUCKET)
    }

    // 🔥 SAVE PROFILE
    if (role === "player") {
      const { error: profileError } = await (supabase as any)
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName,
          dojo,
          belt_rank: beltRank,
          dob,
          instructor,
          certificate_url: certificatePath, // 🔥 NEW
          role: "player",
          status: "pending",
        });

      if (profileError) {
        console.error("PROFILE ERROR:", profileError.message);
        alert("Failed to save player profile");
      }
    }

    if (role === "organizer") {
      const { error: orgError } = await (supabase as any)
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: orgName,
          dojo: location,
          role: "organizer",
          status: "verified",
        });

      if (orgError) {
        console.error("ORG ERROR:", orgError.message);
        alert("Failed to save organizer profile");
      }
    }

    alert("Account created! Please check your email to confirm.");

    if (role === "organizer") {
      router.push("/organizer/profile");
    } else {
      router.push("/player/profile");
    }

    setLoading(false);
  };



  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-md border">
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Create Account
        </h1>

        <p className="text-center text-sm text-gray-500 mt-1 mb-6">
          Registering as a{" "}
          <span className="font-bold text-red-600 capitalize">{role}</span>
        </p>

        <form onSubmit={handleSignUp} className="flex flex-col gap-4">

          <input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputStyle} required />

          <input type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputStyle} required />

          {role === "player" && (
            <>
              <input placeholder="Full Name" value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputStyle} required />

              <input placeholder="Dojo / Club" value={dojo}
                onChange={(e) => setDojo(e.target.value)}
                className={inputStyle} />

              <input type="date" value={dob}
                onChange={(e) => setDob(e.target.value)}
                className={inputStyle} required />

              <input placeholder="Instructor" value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className={inputStyle} required />

              <select value={beltRank}
                onChange={(e) => setBeltRank(e.target.value)}
                className={inputStyle} required>
                <option value="">Belt Rank</option>
                <option>White</option>
                <option>Yellow</option>
                <option>Green</option>
                <option>Blue</option>
                <option>Purple</option>
                <option>Brown</option>
                <option>Black</option>
              </select>

              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setCertificate(e.target.files?.[0] || null)}
                className="w-full border p-2 rounded"
                required
              />
            </>
          )}

          {role === "organizer" && (
            <>
              <input placeholder="Organization Name" value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className={inputStyle} required />

              <input placeholder="Location" value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputStyle} />
            </>
          )}

          <button type="submit" disabled={loading}
            className="mt-2 w-full bg-red-600 text-white font-semibold py-4 rounded-xl hover:bg-red-700 transition">
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

        </form>
      </div>
    </main>
  );
}

