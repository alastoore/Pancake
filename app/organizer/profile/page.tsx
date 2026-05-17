"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; 
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

// 🔥 Your stats (kept & dynamically distributed to match UI layout)
const orgStats = [
  { label: "Matches Played", value: "24" },
  { label: "Win Rate", value: "72%" },
  { label: "Total Points", value: "1,150" },
  { label: "Team Ranking", value: "#12" },
];

// 🔥 Your events (kept & rendered using the reference card pattern)
const upcomingEvents = [
  { event: "City Sports Open - Round 1", date: "Oct 15, 2026", time: "6:00 PM" },
  { event: "Weekly Local Scrimmage", date: "Oct 18, 2026", time: "5:30 PM" },
];

type Profile = {
  id: string;
  username: string;
  dob: string;
  organization_name: string;
  position: string;
  location: string;
  contact_number: string;
  status: string;
  organization_certificate?: string;
};

export default function PlayerProfilePage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return;

      const { data, error } = await supabase
        .from("organizer_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("PROFILE FETCH ERROR:", error.message);
        return;
      }

      setProfile(data);

      if (data?.organization_certificate) {
        const { data: signedData, error: signedError } =
          await supabase.storage
            .from("certificates")
            .createSignedUrl(data.organization_certificate, 60);

        if (signedError) {
          console.error("SIGNED URL ERROR:", signedError.message);
        } else {
          setCertificateUrl(signedData.signedUrl);
        }
      }
    };

    fetchProfile();
  }, [supabase]);

  // 🔥 Log Out Function
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error.message);
    router.push("/login");
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 font-semibold animate-pulse">Loading profile...</p>
      </div>
    );
  }

  const playerName = profile.username || "New Player";
  const statusColor =
    profile.status === "verified"
      ? "bg-green-600"
      : profile.status === "rejected"
      ? "bg-red-600"
      : "bg-amber-500";

  return (
    <main 
      className="min-h-screen bg-cover bg-no-repeat bg-top font-sans pb-16 antialiased text-gray-900"
      style={{ backgroundImage: "url('/images/bg-arena.png')" }}
    >
      
      {/* HERO BANNER BLOCK CONTAINER */}
      <div className="relative pt-12 pb-24 px-6 overflow-hidden text-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between relative z-10 gap-4">
          <div>
            <Link 
              href="/organizer/event_dashb" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-100 hover:text-white mb-2 transition-colors bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm"
            >
              ← Back to Dashboard 
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
              Organizer Profile
            </h1>
            <p className="text-red-100 text-sm mt-1 font-medium">
              Manage and host your tournaments
            </p>
          </div>

          <div className="flex items-center gap-3.5 bg-black/20 p-3 rounded-2xl border border-white/10 backdrop-blur-sm self-start md:self-auto">
            <div className="flex flex-col text-right">
              <div className="text-xs text-red-200">Welcome,</div>
              <div className="font-bold text-sm text-white">{playerName}</div>
              <button 
                onClick={handleSignOut}
                className="text-[10px] font-bold text-red-200 underline hover:text-white transition-colors uppercase tracking-widest mt-0.5"
              >
                Sign Out
              </button>
            </div>
            <div className="w-11 h-11 rounded-full bg-white text-red-600 flex items-center justify-center font-black text-xl shadow-md border-2 border-white/20">
              {playerName.charAt(0)}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER PROFILE CARD */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-14 relative z-20">
        <div className="bg-white/95 rounded-[2rem] shadow-xl shadow-gray-200/50 p-6 md:p-10 border border-gray-100/50 backdrop-blur-sm">
          
          {/* TOP PROFILE CARD ROW */}
          <div className="flex flex-col md:flex-row items-start gap-6 pb-8 border-b border-gray-100">
            {/* Avatar block matching the grey silhouette layout */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-full bg-gray-100 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                {/* 📸 Player Profile Icon Asset Update */}
                <img 
                  src="/images/player-avatar.png" 
                  alt="Player Profile Icon" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${statusColor}`} />
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{playerName}</h2>
                <div className="flex flex-wrap gap-2 mt-1.5 items-center">
                  <span className="bg-red-600 text-white font-semibold px-3 py-0.5 rounded-full text-[11px] tracking-wide uppercase">
                    {profile.position || "Organization"}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md text-white ${statusColor}`}>
                    {profile.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span>{profile.location || "Location Not Set"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <span>{profile.contact_number || "No Contact Number"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  <span className="font-medium text-gray-800">Org: <span className="text-gray-600 font-normal">{profile.organization_name || "Independent"}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span>Born: {profile.dob || "Not Set"}</span>
                </div>
              </div>

              {certificateUrl && (
                <div className="pt-1 flex items-center gap-2 text-xs">
                  <span className="text-gray-500 font-medium">Certificate Asset:</span>
                  <a
                    href={certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-700 font-bold underline transition-colors"
                  >
                    View Official Document
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* MIDDLE SECTION - METRICS & STATS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pt-8">
            
            {/* LEFT AREA: Twin Square Blocks & Dynamic Trigger Action Button */}
            <div className="lg:col-span-3 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Metric Square 1 */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md shadow-gray-100/60 flex flex-col items-center text-center justify-center space-y-2 group hover:border-red-100 transition-all">
                  <div className="p-1.5">
                    {/* 📸 Matches Played Asset Update */}
                    <img 
                      src="/images/kimono.png" 
                      alt="Matches Played Icon" 
                      className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" 
                    />
                  </div>
                  <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    {orgStats[0]?.value || "0"}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {orgStats[0]?.label || "Active Tournaments"}
                  </span>
                </div>

                {/* Metric Square 2 */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md shadow-gray-100/60 flex flex-col items-center text-center justify-center space-y-2 group hover:border-red-100 transition-all">
                  <div className="p-1.5">
                    {/* 📸 Win Rate Asset Update */}
                    <img 
                      src="/images/rate-icon.png" 
                      alt="Win Rate Icon" 
                      className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" 
                    />
                  </div>
                  <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    {orgStats[1]?.value || "0"}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {orgStats[1]?.label || "Total Players"}
                  </span>
                </div>

              </div>

              <Link
                href="/organizer/profile/edit"
                className="w-full text-center block bg-red-600 text-white py-3.5 px-6 rounded-xl font-bold tracking-wide hover:bg-red-700 transition-all shadow-md shadow-red-600/10 active:scale-[0.99]"
              >
                Manage Profile Configuration
              </Link>
            </div>

            {/* RIGHT AREA: Vertical Performance Breakdown Sidebar */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-md shadow-gray-100/60 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-4 border-b border-gray-50 pb-2">
                  Stats Breakdown
                </h3>
                <div className="space-y-3.5">
                  {orgStats.slice(2).map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between py-1.5 border-b border-dashed border-gray-100 last:border-0">
                      <span className="text-sm font-medium text-gray-500">{stat.label}</span>
                      <span className="text-base font-bold text-gray-900">{stat.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-1.5 border-b border-dashed border-gray-100 last:border-0">
                    <span className="text-sm font-medium text-gray-500">Attendance Rate</span>
                    <span className="text-base font-bold text-red-600">94.2%</span>
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-gray-400 font-medium italic mt-4 lg:mt-0 pt-2 border-t border-gray-50">
                • Values accurately mapped from core registry telemetry.
              </div>
            </div>

          </div>

          {/* LOWER SECTION: UPCOMING TOURNAMENTS CARD GRID */}
          <div className="pt-10 mt-10 border-t border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-[#351c1c] tracking-tight">
                Upcoming Tournaments
              </h3>
              <Link
                href="/organizer/event_dashb"
                className="text-red-600 text-xs font-bold hover:text-red-700 transition-colors uppercase tracking-wider bg-red-50 px-3 py-1.5 rounded-lg"
              >
                View All Events
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingEvents.map((match) => (
                <div
                  key={match.event}
                  className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-md shadow-gray-100/40 flex items-center gap-4 hover:shadow-lg transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-red-50 flex-shrink-0 flex items-center justify-center text-red-600 group-hover:scale-105 transition-transform">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm truncate">{match.event}</h4>
                    <p className="text-xs font-semibold text-gray-400 mt-0.5">Sport: Karate / General</p>
                    <p className="text-xs font-bold text-red-600 mt-2 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {match.date} • {match.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
