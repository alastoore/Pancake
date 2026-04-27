"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

// 🔥 Your stats (kept)
const playerStats = [
  { label: "Matches Played", value: "24" },
  { label: "Win Rate", value: "72%" },
  { label: "Total Points", value: "1,150" },
  { label: "Team Ranking", value: "#12" },
];

// 🔥 Your events (kept)
const upcomingMatches = [
  { event: "City Sports Open - Round 1", date: "Oct 15, 2026", time: "6:00 PM" },
  { event: "Weekly Local Scrimmage", date: "Oct 18, 2026", time: "5:30 PM" },
];

type Profile = {
  id: string;
  full_name: string;
  dojo: string;
  belt_rank: string;
  dob: string;
  instructor: string;
  status: string;
  certificate_url?: string;
};

export default function PlayerProfilePage() {
  const supabase = getSupabaseBrowserClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);

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
        console.error("PROFILE FETCH ERROR:", error.message);
        return;
      }

      setProfile(data);

      // 🔥 Generate signed URL for certificate
      if (data?.certificate_url) {
        const { data: signedData, error: signedError } =
          await supabase.storage
            .from("certificates")
            .createSignedUrl(data.certificate_url, 60);

        if (signedError) {
          console.error("SIGNED URL ERROR:", signedError.message);
        } else {
          setCertificateUrl(signedData.signedUrl);
        }
      }
    };

    fetchProfile();
  }, []);

  if (!profile) {
    return <p className="p-6">Loading profile...</p>;
  }

  const playerName = profile.full_name || "New Player";
  const dojo = profile.dojo || "Independent";
  const belt = profile.belt_rank || "Not Set";
  const dob = profile.dob || "Not Set";
  const instructor = profile.instructor || "Not Set";
  const status = profile.status || "pending";

  const statusColor =
    status === "verified"
      ? "text-green-600"
      : status === "rejected"
      ? "text-red-600"
      : "text-yellow-600";

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans">

      {/* HEADER */}
      <header className="border-b border-gray-100 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">
            Player <span className="text-red-600">Profile</span>
          </h1>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Welcome,</span>
            <span className="font-semibold text-gray-800">{playerName}</span>

            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xl">
              {playerName.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">

        {/* PROFILE */}
        <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Karate Profile 🥋
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Dojo</p>
              <p className="font-semibold">{dojo}</p>
            </div>

            <div>
              <p className="text-gray-500">Belt Rank</p>
              <p className="font-semibold">{belt}</p>
            </div>

            <div>
              <p className="text-gray-500">Date of Birth</p>
              <p className="font-semibold">{dob}</p>
            </div>

            <div>
              <p className="text-gray-500">Instructor</p>
              <p className="font-semibold">{instructor}</p>
            </div>

            <div>
              <p className="text-gray-500">Status</p>
              <p className={`font-semibold ${statusColor}`}>
                {status.toUpperCase()}
              </p>
            </div>
          </div>

          {/* CERTIFICATE */}
          {certificateUrl && (
            <div className="mt-4">
              <p className="text-gray-500 text-sm mb-1">Certificate</p>

              <a
                href={certificateUrl}
                target="_blank"
                className="text-blue-600 underline"
              >
                View Certificate
              </a>
            </div>
          )}

          {/* 🔥 EDIT BUTTON */}
          <div className="mt-6">
            <Link
              href="/player/profile/edit"
              className="inline-block bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-red-700 transition"
            >
              Edit Profile
            </Link>
          </div>
        </section>

        {/* STATS */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Key Performance
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {playerStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm"
              >
                <p className="text-sm font-medium text-gray-500">
                  {stat.label}
                </p>
                <p className="text-4xl font-extrabold text-gray-950 mt-1">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* EVENTS */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Upcoming Events
            </h2>

            <Link
              href="/player/events"
              className="text-red-600 text-sm font-medium hover:text-red-700 hover:underline"
            >
              View All Events
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingMatches.map((match) => (
              <div
                key={match.event}
                className="bg-gray-50 p-6 rounded-2xl border flex justify-between shadow-sm"
              >
                <div>
                  <p className="font-semibold">{match.event}</p>
                  <p className="text-sm text-gray-500">
                    {match.date} • {match.time}
                  </p>
                </div>
                <button className="bg-red-600 text-white px-6 py-3 rounded-xl text-sm">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
