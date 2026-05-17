"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { User } from "@supabase/supabase-js";

export default function OrganizerRegisterPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  // AUTH STATES
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // UI Addition for validation

  // ORGANIZER STATES (All original states preserved)
  const [username, setUsername] = useState("");
  const [orgName, setOrgName] = useState("");
  const [dob, setDob] = useState("");
  const [location, setLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [karateStyle, setKarateStyle] = useState("");
  const [federation, setFederation] = useState("");
  const [position, setPosition] = useState("");
  const [orgCertificate, setOrgCertificate] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Updated styles to match the new gray container UI
  const inputWrapperStyle = "relative flex items-center w-full";
  
  // Style for inputs that have an icon on the left
  const inputStyleWithIcon = 
    "w-full px-5 py-4 pl-12 rounded-2xl bg-[#f4f6f8] border border-transparent text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all text-sm";
  
  // Style for inputs without an icon (Dropdowns, Date, etc.)
  const inputStyleNoIcon = 
    "w-full px-5 py-4 rounded-2xl bg-[#f4f6f8] border border-transparent text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all text-sm";

  const labelStyle = "text-xs font-bold text-gray-700 mb-1 ml-1";

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      setLoading(false);
      return;
    }

    // ORIGINAL VALIDATION LOGIC
    if (
      !email || !password || !username || !dob || !orgName || 
      !location || !contactNumber || !karateStyle || !federation || !position
    ) {
      alert("Please fill in all required organizer fields.");
      setLoading(false);
      return;
    }

    if (!orgCertificate) {
      alert("Please upload your organization certificate.");
      setLoading(false);
      return;
    }

    // 1. CREATE AUTH USER
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "organizer" },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    let user: User | null = data.user;
    if (!user) {
      const { data: existing } = await supabase.auth.getUser();
      user = existing?.user;
    }

    if (!user) {
      alert("User not available. Please confirm your email.");
      setLoading(false);
      return;
    }

    // 2. ORGANIZER CERTIFICATE UPLOAD
    let orgCertificatePath = null;
    if (orgCertificate) {
      const fileExt = orgCertificate.name.split(".").pop();
      const filePath = `${user.id}/org-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(filePath, orgCertificate, { upsert: true });

      if (uploadError) {
        alert(uploadError.message);
        setLoading(false);
        return;
      }
      orgCertificatePath = filePath;
    }

    // 3. SAVE ORGANIZER PROFILE
    const { error: orgError } = await supabase
      .from("organizer_profiles")
      .upsert({
        id: user.id,
        email,
        username,
        dob, 
        organization_name: orgName,
        location,
        contact_number: contactNumber,
        karate_style: karateStyle,
        federation,
        position,
        organization_certificate: orgCertificatePath,
        status: "pending",
      });

    if (orgError) {
      alert("Failed to save organizer profile");
      setLoading(false);
      return;
    }

    alert("Account created! Please check your email to confirm.");
    router.push("/organizer/profile");
    setLoading(false);
  };

  return (
    <main 
      className="flex min-h-screen items-center justify-center bg-cover bg-center p-4 relative"
      style={{ backgroundImage: `url('/images/bg-arena.png')` }}
    >
      {/* Dark overlay to make the white card pop against the background */}
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="w-full max-w-[500px] bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl overflow-y-auto max-h-[95vh] relative z-10 border border-gray-100">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Create Organizer Account
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Sign up to manage and host tournaments
          </p>
        </div>

        <form onSubmit={handleSignUp} className="flex flex-col gap-5">
          
          {/* Section: Basic Info */}
          <div className="flex flex-col gap-4">
            <div className={inputWrapperStyle}>
              <img src="/images/org.png" className="absolute left-4 w-5 opacity-50" alt="" />
              <input 
                placeholder="Organization / Dojo Name" 
                value={orgName} 
                onChange={(e) => setOrgName(e.target.value)} 
                className={inputStyleWithIcon} required 
              />
            </div>

            <div className={inputWrapperStyle}>
              <img src="/images/user.png" className="absolute left-4 w-5 opacity-50" alt="" />
              <input 
                placeholder="Full Name / Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className={inputStyleWithIcon} required 
              />
            </div>
          </div>

          {/* Section: Credentials */}
          <div className="flex flex-col gap-4">
            <div className={inputWrapperStyle}>
              <img src="/images/email.png" className="absolute left-4 w-5 opacity-50" alt="" />
              <input 
                type="email" placeholder="Work Email" 
                value={email} onChange={(e) => setEmail(e.target.value)} 
                className={inputStyleWithIcon} required 
              />
            </div>

            <div className={inputWrapperStyle}>
              <img src="/images/lock.png" className="absolute left-4 w-5 opacity-50" alt="" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password} onChange={(e) => setPassword(e.target.value)} 
                className={inputStyleWithIcon} required 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 opacity-40 hover:opacity-70 transition-opacity">
                <img src={showPassword ? "/images/eye.png" : "/images/eye-off.png"} className="w-5" alt="" />
              </button>
            </div>

            <div className={inputWrapperStyle}>
              <img src="/images/lock.png" className="absolute left-4 w-5 opacity-50" alt="" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Confirm Password" 
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} 
                className={inputStyleWithIcon} required 
              />
            </div>
          </div>

          {/* Section: Additional Details */}
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col">
              <label className={labelStyle}>Date of Birth</label>
              <input 
                type="date" 
                value={dob} 
                onChange={(e) => setDob(e.target.value)} 
                className={`${inputStyleNoIcon} ${!dob ? "text-gray-500" : "text-gray-900"}`} 
                required 
              />
            </div>
            <div className="flex flex-col">
              <label className={labelStyle}>Contact Number</label>
              <input 
                placeholder="Contact #" 
                value={contactNumber} 
                onChange={(e) => setContactNumber(e.target.value)} 
                className={inputStyleNoIcon} 
                required 
              />
            </div>
          </div>

          <div className={inputWrapperStyle}>
            <img src="/images/location.png" className="absolute left-4 w-5 opacity-50" alt="" />
            <input 
              placeholder="Location / City" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              className={inputStyleWithIcon} 
              required 
            />
            <img src="/images/chevron.png" className="absolute right-4 w-3 opacity-30" alt="" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select 
              value={karateStyle} 
              onChange={(e) => setKarateStyle(e.target.value)} 
              className={`${inputStyleNoIcon} appearance-none cursor-pointer`} 
              required
            >
              <option value="" disabled className="text-gray-400">Karate Style</option>
              <option value="Shorin-Ryu">Shorin-Ryu</option>
              <option value="Goju-Ryu">Goju-Ryu</option>
              <option value="Shotokan">Shotokan</option>
              <option value="Shito-Ryu">Shito-Ryu</option>
              <option value="Wado-Ryu">Wado-Ryu</option>
              <option value="Others">Others</option>
            </select>

            <select 
              value={federation} 
              onChange={(e) => setFederation(e.target.value)} 
              className={`${inputStyleNoIcon} appearance-none cursor-pointer`} 
              required
            >
              <option value="" disabled className="text-gray-400">Federation</option>
              <option value="OSSA">OSSA</option>
              <option value="PKF">PKF</option>
              <option value="Independent">Independent</option>
            </select>
          </div>

          <input 
            placeholder="Your Role / Position" 
            value={position} 
            onChange={(e) => setPosition(e.target.value)} 
            className={inputStyleNoIcon} 
            required 
          />

          <div className="bg-[#f4f6f8] p-5 rounded-2xl border border-transparent">
            <label className="text-xs font-bold text-gray-600 block mb-2">Organization Certificate</label>
            <input 
              type="file" accept="image/*,.pdf" 
              onChange={(e) => setOrgCertificate(e.target.files?.[0] || null)} 
              className="text-sm text-gray-500 w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 transition-all cursor-pointer" 
              required 
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="mt-4 w-full bg-[#c2242b] text-white py-4 rounded-2xl font-bold tracking-wide hover:bg-[#a51e24] disabled:opacity-70 transition-colors shadow-lg"
          >
            {loading ? "Processing..." : "Sign Up"}
          </button>

          <p className="text-center text-sm text-gray-600 mt-2">
            Already have an account? <span className="text-[#c2242b] font-bold cursor-pointer hover:underline transition-all">Log in</span>
          </p>

          <div className="text-[11px] text-center text-gray-500 mt-2 leading-tight px-4">
            By signing up you agree to our <span className="font-bold text-gray-700 cursor-pointer hover:underline">Terms of Service</span> and <span className="font-bold text-gray-700 cursor-pointer hover:underline">Privacy Policy</span>.
          </div>
        </form>
      </div>
    </main>
  );
}
