"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type OrganizerProfileRow = {
  username: string | null;
  organization_name: string | null;
  position: string | null;
  dob: string | null;
  location: string | null;
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

  const inputStyle =
    "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm";

  const labelStyle = "block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 ml-1";

  // 🔥 FETCH EXISTING PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return;

      const { data, error } = await supabase
        .from("organizer_profiles")
        .select("username, organization_name, position, dob, location")
        .eq("id", user.id)
        .single<OrganizerProfileRow>();

      if (error) {
        console.error(error.message);
        return;
      }

      setUsername(data.username || "");
      setOrg(data.organization_name || "");
      setPos(data.position || "");
      setDob(data.dob || "");
      setLoc(data.location || "");
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

    const { error } = await supabase
      .from("organizer_profiles")
      .update({
        username,
        organization_name: orgName,
        dob,
        position,
        location,
      })
      .eq("id", user.id);

    if (error) {
      console.error(error.message);
      alert("Failed to update profile");
      setLoading(false);
      return;
    }

    alert("Profile updated successfully!");

    // 🔥 Redirect back to profile (will refetch updated data)
    router.push("/organizer/profile");
  };

  return (
    <main 
      className="min-h-screen bg-cover bg-no-repeat bg-top font-sans flex flex-col items-center justify-center p-4 antialiased text-gray-900"
      style={{ backgroundImage: "url('/images/bg-arena.png')" }}
    >
      {/* Container wrapper adjusting matching configuration cards */}
      <div className="w-full max-w-lg bg-white/95 rounded-[2rem] shadow-2xl shadow-gray-900/20 p-6 md:p-10 border border-gray-100/50 backdrop-blur-sm relative z-10">
        
        {/* Top Navigation Row */}
        <div className="mb-6">
          <Link 
            href="/organizer/profile" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors uppercase tracking-wider bg-red-50 px-3 py-1.5 rounded-lg"
          >
            ← Cancel & Return
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Edit Configuration
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            Update your operational manager settings
          </p>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-5">

          <div>
            <label className={labelStyle}>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputStyle}
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className={labelStyle}>Organization</label>
            <input
              value={orgName}
              onChange={(e) => setOrg(e.target.value)}
              className={inputStyle}
              placeholder="Enter organization name"
            />
          </div>

          <div>
            <label className={labelStyle}>Position</label>
            <input
              value={position}
              onChange={(e) => setPos(e.target.value)}
              className={inputStyle}
              placeholder="e.g. Tournament Director"
            />
          </div>

          <div>
            <label className={labelStyle}>Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Location</label>
            <input
              value={location}
              onChange={(e) => setLoc(e.target.value)}
              className={inputStyle}
              placeholder="City, Country"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 text-center bg-red-600 text-white py-3.5 px-6 rounded-xl font-bold tracking-wide hover:bg-red-700 transition-all shadow-md shadow-red-600/10 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Saving Changes..." : "Save Changes"}
          </button>

        </form>
      </div>
    </main>
  );
}
