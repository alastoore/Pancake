"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type PlayerProfileRow = {
  full_name: string | null;
  dojo: string | null;
  instructor: string | null;
  dob: string | null;
};

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [orgName, setOrg] = useState("");
  const [position, setPos] = useState("");
  const [dob, setDob] = useState("");
  const [location, setLoc] = useState("");

  // Updated to match the gray container design from the new image
  const inputStyle =
    "w-full px-5 py-4 rounded-2xl bg-[#f4f6f8] border border-transparent text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all";

  const labelStyle = "block text-sm font-semibold text-gray-800 mb-1 ml-1";

  // 🔥 FETCH EXISTING PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return;

      const { data, error } = await supabase
        .from("player_profiles")
        .select("full_name, dojo, instructor, dob")
        .eq("id", user.id)
        .single<PlayerProfileRow>();

      if (error) {
        console.error(error.message);
        return;
      }

      setUsername(data.full_name || "");
      setOrg(data.dojo || "");
      setPos(data.instructor || "");
      setDob(data.dob || "");
      setLoc("");
    };

    fetchProfile();
  }, [supabase]);

  // 🔥 SAVE TO DATABASE
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      alert("User not found");
      return;
    }

    const { error } = await (supabase as any)
      .from("player_profiles")
      .update({
        full_name: username,
        dojo: orgName,
        dob,
        instructor: position,
      })
      .eq("id", user.id);

    if (error) {
      console.error(error.message);
      alert("Failed to update profile");
      setLoading(false);
      return;
    }

    alert("Profile updated successfully!");

    router.push("/player/profile");
  };

  return (
    <main 
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-4 relative"
      style={{ backgroundImage: "url('/images/bg-arena.png')" }}
    >
      {/* Optional: Add a dark overlay so the white card stands out against the background */}
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="w-full max-w-[480px] bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative z-10 border border-gray-100">
        
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Edit Profile
          </h1>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          
          {/* Full Name */}
          <div className="relative">
            <label className={labelStyle}>Full Name</label>
            <input
              type="text"
              placeholder="e.g. Tester 3"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputStyle}
            />
          </div>

          {/* Dojo / Club */}
          <div className="relative">
            <label className={labelStyle}>Dojo / Club</label>
            <input
              type="text"
              placeholder="e.g. BangBang"
              value={orgName}
              onChange={(e) => setOrg(e.target.value)}
              className={inputStyle}
            />
          </div>

          {/* Position (Kept as text input as per original code) */}
          <div className="relative">
            <label className={labelStyle}>Position</label>
            <input
              type="text"
              placeholder="e.g. Head Coach"
              value={position}
              onChange={(e) => setPos(e.target.value)}
              className={inputStyle}
            />
          </div>

          {/* Date of Birth */}
          <div className="relative">
            <label className={labelStyle}>Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className={`${inputStyle} ${!dob ? "text-gray-400" : "text-gray-900"}`}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-[#c2242b] text-white py-4 rounded-2xl font-bold tracking-wide hover:bg-[#a51e24] disabled:opacity-70 transition-colors shadow-lg"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

        </form>
      </div>
    </main>
  );
}
