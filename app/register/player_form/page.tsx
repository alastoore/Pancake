"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import Image from "next/image"; // Added Image import for your assets

const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

function calculateAge(dob: string): number { // calculate player's age
  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // If birthday hasn't occurred yet this year, subtract 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // <-- New state for password visibility

  const [fullName, setFullName] = useState("");
  const [dojo, setDojo] = useState("");
  const [beltRank, setBeltRank] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [instructor, setInstructor] = useState("");
  const [certificate, setCertificate] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  // Standardized style for the gray inputs shown in the UI
  const inputStyle = "w-full pl-11 pr-4 py-3.5 bg-gray-100 text-sm text-gray-900 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all placeholder-gray-500";
  // Style for inputs without icons
  const inputStyleNoIcon = "w-full px-4 py-3.5 bg-gray-100 text-sm text-gray-900 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all placeholder-gray-500";

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 🔥 VALIDATION
    if (!email || !password || !fullName || !dob || !instructor || !beltRank || !gender) {
      alert("Please fill in all required fields.");
      setLoading(false);
      return;
    }
    if (!certificate) {
      alert("Please upload your belt certification.");
      setLoading(false);
      return;
    }

    // 🔥 CREATE USER
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "player" },
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

    // 🔥 UPLOAD CERTIFICATE
    let certificatePath = null;

    if (certificate) {
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
      certificatePath = filePath; 
    }

    // 🔥 SAVE TO BASE PROFILES TABLE FIRST
    const { error: baseProfileError } = await (supabase as any)
      .from("profiles")
      .upsert({
        id: user.id,
        email: email,
        role: "player"
      });

    if (baseProfileError) {
      console.error("BASE PROFILE ERROR:", baseProfileError.message);
      alert("Failed to save base profile: " + baseProfileError.message);
      setLoading(false);
      return; // <-- Stop execution here
    }

    const age = calculateAge(dob)

    // 🔥 SAVE PROFILE
    const { error: profileError } = await (supabase as any)
      .from("player_profiles")
      .upsert({
        id: user.id,
        email,
        full_name: fullName,
        dojo,
        dojo,
        belt_rank: beltRank,
        gender,
        age,
        dob,
        instructor,
        certificate_url: certificatePath, 
        status: "pending",
      });

      if (profileError) {
        console.error("PROFILE ERROR:", profileError.message);
        alert("Failed to save player profile: " + profileError.message);
        setLoading(false);
        return;
      }
      
    alert("Account created! Please check your email to confirm.");
    router.push("/player/profile");
    setLoading(false);
  };

  return (
    <main 
      className={`flex min-h-screen items-center justify-center bg-cover bg-center p-4 sm:p-6 ${montserrat.className}`}
      style={{ backgroundImage: "url('/images/bg-arena.png')" }}
    >
      <div className="w-full max-w-[450px] bg-white p-8 md:p-10 rounded-[32px] shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-black tracking-wide uppercase mb-2">
            Create Player Account
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Sign up to find and participate in tournaments
          </p>
        </div>

        <form onSubmit={handleSignUp} className="flex flex-col gap-3">

          {/* Email Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input type="email" placeholder="Email Address" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputStyle} required />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <input 
              type={showPassword ? "text" : "password"} // Toggle input type
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputStyle} pr-12`} // Added pr-12 so text doesn't hide behind the button
              required 
            />

            {/* Password Hide/Unhide Toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                // Replace this with your UNHIDE/OPEN EYE image path
                <Image 
                  src="/images/eye.png" 
                  alt="Hide password" 
                  width={20} 
                  height={20} 
                  className="object-contain" 
                />
              ) : (
                // Replace this with your HIDE/CLOSED EYE image path
                <Image 
                  src="/images/eye-off.png" 
                  alt="Show password" 
                  width={20} 
                  height={20} 
                  className="object-contain" 
                />
              )}
            </button>
          </div>

          {/* Player Specific Fields */}
          <>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <input placeholder="Full Name" value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputStyle} required />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input placeholder="Dojo / Club" value={dojo}
                onChange={(e) => setDojo(e.target.value)}
                className={inputStyle} />
            </div>

            <div className="flex gap-3">
              <input type="date" value={dob}
                onChange={(e) => setDob(e.target.value)}
                className={inputStyleNoIcon} required />

              <input placeholder="Instructor" value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className={inputStyleNoIcon} required />
            </div>

            <div className="flex gap-3">
              <select value={beltRank}
                onChange={(e) => setBeltRank(e.target.value)}
                className={inputStyleNoIcon} required>
                <option value="" disabled>Belt Rank</option>
                <option>White</option>
                <option>Yellow</option>
                <option>Green</option>
                <option>Blue</option>
                <option>Brown</option>
                <option>Black</option>
              </select>

              <select value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={inputStyleNoIcon} required>
                <option value="" disabled>Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Prefer not to say</option>
              </select>
            </div>

            <div className="mt-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">Upload Certificate</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setCertificate(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-all border border-gray-100 rounded-xl bg-gray-50"
                required
              />
            </div>
          </>

          {/* Submit Button */}
          <button type="submit" disabled={loading}
            className="mt-4 w-full bg-[#bd1e24] text-white font-bold text-lg py-3.5 rounded-xl hover:bg-red-800 transition-colors shadow-md">
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-gray-600 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-red-600 hover:text-red-800 font-bold">
              Log in
            </Link>
          </p>
          <p className="text-xs text-gray-400 font-medium px-4 leading-relaxed">
            By signing up you agree to our{" "}
            <Link href="/terms" className="text-red-600 hover:underline">Terms of Service</Link> and{" "}
            <Link href="/privacy" className="text-red-600 hover:underline">Privacy Policy</Link>.
          </p>
        </div>

      </div>
    </main>
  );
}