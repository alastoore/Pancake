"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [dojo, setDojo] = useState("");
  const [belt, setBelt] = useState("");
  const [category, setCategory] = useState("");
  const [dob, setDob] = useState("");
  const [instructor, setInstructor] = useState("");
  const [status, setStatus] = useState("pending");

  const inputStyle =
    "w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500";

  const labelStyle = "block text-sm font-semibold text-gray-700 mb-1 ml-1";

  // 🔥 FETCH EXISTING PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return;

      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error(error.message);
        return;
      }

      setFullName(data.full_name || "");
      setDojo(data.dojo || "");
      setBelt(data.belt_rank || "");
      setCategory(data.category || "");
      setDob(data.dob || "");
      setInstructor(data.instructor || "");
      setStatus(data.status || "pending");
    };

    fetchProfile();
  }, []);

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
      .from("profiles")
      .update({
        full_name: fullName,
        dojo,
        belt_rank: belt,
        category,
        dob,
        instructor,
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
    router.push("/player/profile");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border">

        <h1 className="text-2xl font-bold text-center mb-6">
          Edit Profile
        </h1>

        <form onSubmit={handleSave} className="flex flex-col gap-4">

          <div>
            <label className={labelStyle}>Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Dojo / Club</label>
            <input
              value={dojo}
              onChange={(e) => setDojo(e.target.value)}
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Belt Rank</label>
            <select
              value={belt}
              onChange={(e) => setBelt(e.target.value)}
              className={inputStyle}
            >
              <option value="">Select Belt Rank</option>
              <option>White</option>
              <option>Yellow</option>
              <option>Green</option>
              <option>Blue</option>
              <option>Purple</option>
              <option>Brown</option>
              <option>Black</option>
            </select>
          </div>

          <div>
            <label className={labelStyle}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputStyle}
            >
              <option value="">Select Category</option>
              <option>Kata</option>
              <option>Kumite</option>
              <option>Both</option>
            </select>
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
            <label className={labelStyle}>Instructor</label>
            <input
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Verification Status</label>
            <input
              value={status.toUpperCase()}
              className={`${inputStyle} bg-gray-100 text-gray-500`}
              readOnly
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

        </form>
      </div>
    </main>
  );
}

