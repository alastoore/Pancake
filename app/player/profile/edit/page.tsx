"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function EditProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 🔥 Get existing data
  const [fullName, setFullName] = useState(searchParams.get("name") || "");
  const [dojo, setDojo] = useState(searchParams.get("dojo") || "");
  const [belt, setBelt] = useState(searchParams.get("belt") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");

  // ✅ Improved input style (better visibility)
  const inputStyle =
    "w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500";

  const labelStyle = "block text-sm font-semibold text-gray-700 mb-1 ml-1";

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    router.push(
      `/player/profile?name=${encodeURIComponent(
        fullName
      )}&dojo=${encodeURIComponent(dojo)}&belt=${belt}&category=${category}`
    );
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border border-gray-200">
        
        {/* HEADER */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Edit Profile
        </h1>

        <form onSubmit={handleSave} className="flex flex-col gap-4">

          {/* FULL NAME */}
          <div>
            <label className={labelStyle}>Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className={inputStyle}
            />
          </div>

          {/* DOJO */}
          <div>
            <label className={labelStyle}>Dojo / Club</label>
            <input
              value={dojo}
              onChange={(e) => setDojo(e.target.value)}
              placeholder="Enter your dojo"
              className={inputStyle}
            />
          </div>

          {/* BELT */}
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
              <option>Brown</option>
              <option>Black</option>
            </select>
          </div>

          {/* CATEGORY */}
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

          {/* BUTTON */}
          <button
            type="submit"
            className="mt-4 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition shadow-md active:scale-95"
          >
            Save Changes
          </button>

        </form>
      </div>
    </main>
  );
}

