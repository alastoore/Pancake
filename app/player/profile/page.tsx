"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

const playerStats = [
  { label: "Matches Played", value: "24", icon: "/images/trophy-icon.png" },
  { label: "Win Rate", value: "72%", icon: "/images/medal-icon.png" },
  { label: "Total Points", value: "1,150", icon: "/images/points-icon.png" },
  { label: "Team Ranking", value: "#12", icon: "/images/ranking-icon.png" },
];

const upcomingMatches = [
  {
    event: "City Sports Open - Round 1",
    date: "Oct 15, 2026",
    sport: "Taekwondo",
  },
  {
    event: "Weekly Local Scrimmage",
    date: "Oct 18, 2026",
    sport: "Taekwondo",
  },
];

type Profile = {
  id: string;
  full_name: string;
  dojo: string;
  belt_rank: string;
  age: number;
  gender: string;
  status: string;
  email?: string;
  certificate_url?: string;
  instructor?: string;
};

type JoinedTournament = {
  id: number;
  tournament_name: string | null;
  sport: string | null;
  start_date: string | null;
  max_participants: number | null;
  selected_category: string | null;
};

export default function PlayerProfilePage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [joinedTournaments, setJoinedTournaments] = useState<JoinedTournament[]>([]);
  const [joinedCounts, setJoinedCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    async function fetchProfile() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        return;
      }

      const { data, error } = await (supabase as any)
        .from("player_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("PROFILE FETCH ERROR:", error.message);
        return;
      }

      const typedData = data as Profile;

      setProfile({
        ...typedData,
        email: user.email,
      });

      const joinResult = await (supabase as any)
        .from("player_tourna")
        .select("tournament_id, selected_category, status")
        .eq("player_id", user.id)
        .eq("status", "joined");

      if (!joinResult.error) {
        const joinedRows = joinResult.data ?? [];
        const tournamentIds = joinedRows
          .map((row) => row.tournament_id)
          .filter((id): id is number => typeof id === "number");

        if (tournamentIds.length > 0) {
          const tournamentsResult = await supabase
            .from("tournaments")
            .select("id, tournament_name, sport, start_date, max_participants")
            .in("id", tournamentIds);

          if (!tournamentsResult.error) {
            const merged = tournamentIds.map((tournamentId) => {
              const tournament = (tournamentsResult.data ?? []).find(
                (entry) => entry.id === tournamentId
              );
              const joinRow = joinedRows.find(
                (entry) => entry.tournament_id === tournamentId
              );

              return {
                id: tournamentId,
                tournament_name: tournament?.tournament_name ?? "Untitled Tournament",
                sport: tournament?.sport ?? "General",
                start_date: tournament?.start_date ?? null,
                max_participants: tournament?.max_participants ?? null,
                selected_category:
                  typeof joinRow?.selected_category === "string"
                    ? joinRow.selected_category
                    : null,
              };
            });

            setJoinedTournaments(merged);
          }
        }
      }

      const countResult = await supabase
        .from("player_tourna")
        .select("tournament_id, status");

      if (!countResult.error) {
        const counts = (countResult.data ?? []).reduce<Record<number, number>>(
          (accumulator, row) => {
            const tournamentId =
              typeof row.tournament_id === "number" ? row.tournament_id : null;
            const status = typeof row.status === "string" ? row.status : "joined";

            if (tournamentId !== null && status === "joined") {
              accumulator[tournamentId] = (accumulator[tournamentId] ?? 0) + 1;
            }

            return accumulator;
          },
          {}
        );

        setJoinedCounts(counts);
      }

      if (typedData?.certificate_url) {
        const { data: signedData, error: signedError } = await supabase.storage
          .from("certificates")
          .createSignedUrl(typedData.certificate_url, 3600);

        if (signedError) {
          console.error("SIGNED URL ERROR:", signedError.message);
        } else if (signedData?.signedUrl) {
          setCertificateUrl(signedData.signedUrl);
        }
      }
    }

    void fetchProfile();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const getSlotsLeft = (tournament: JoinedTournament) => {
    if (tournament.max_participants === null) {
      return "Open capacity";
    }

    return `${Math.max(
      tournament.max_participants - (joinedCounts[tournament.id] ?? 0),
      0
    )} left`;
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-700 text-white font-bold">
        Loading profile...
      </div>
    );
  }

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed pb-20 flex flex-col items-center"
      style={{ backgroundImage: "url('/images/bg-arena.png')" }}
    >
      <div className="relative z-10 pt-12 pb-8 text-center text-white">
        <h1 className="text-4xl font-black tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
          Player Profile
        </h1>
        <p className="opacity-100 mt-2 text-lg font-medium drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
          Track your performance and tournaments
        </p>
      </div>

      <div className="relative z-10 w-full max-w-5xl px-4">
        <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-[40px] p-8 md:p-12 mb-12 border border-white/40">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                <img
                  src="/images/player-avatar.png"
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-black text-gray-800">{profile.full_name}</h2>
                <div className="inline-block bg-red-600 text-white text-[10px] font-bold px-4 py-1 rounded-full mt-1 uppercase tracking-widest shadow-sm">
                  {profile.status || "Player"}
                </div>
                <p className="text-gray-500 text-sm mt-3 flex items-center justify-center md:justify-start gap-2 font-medium">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  {profile.email}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-2">
              <Link
                href="/player/event_browsing"
                className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="text-xs text-gray-400 hover:text-red-500 font-semibold transition-colors uppercase tracking-tighter"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12 border-y py-8 border-gray-100">
            <div className="text-center md:text-left">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Dojo</p>
              <p className="font-bold text-gray-800">{profile.dojo || "N/A"}</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Belt Rank</p>
              <p className="font-bold text-gray-800">{profile.belt_rank || "N/A"}</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Age</p>
              <p className="font-bold text-gray-800">{profile.age || "N/A"}</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Gender</p>
              <p className="font-bold text-gray-800">{profile.gender || "N/A"}</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Instructor</p>
              <p className="font-bold text-gray-800">{profile.instructor || "N/A"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {playerStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-gray-50/50 border border-gray-100 p-6 rounded-[24px] text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <img src={stat.icon} alt={stat.label} className="w-8 h-8 mx-auto mb-3" />
                <p className="text-2xl font-black text-gray-800">{stat.value}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-5">
            <Link
              href="/player/profile/edit"
              className="block w-full bg-red-600 hover:bg-red-700 text-white text-center py-4 rounded-2xl text-xl font-bold shadow-lg shadow-red-200 transition-all active:scale-[0.98]"
            >
              Edit Profile
            </Link>

            {certificateUrl && (
              <div className="text-center">
                <a
                  href={certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 font-black text-xs uppercase tracking-widest hover:underline underline-offset-8"
                >
                  View Official Certificate
                </a>
              </div>
            )}
          </div>
        </div>

        <section>
          <h3 className="text-2xl font-black text-white text-center mb-8 uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            Joined Tournaments
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {(joinedTournaments.length > 0 ? joinedTournaments : upcomingMatches).map((match, i) => (
              <div
                key={"id" in match ? match.id : i}
                className="bg-white/95 backdrop-blur-sm rounded-full p-4 pl-8 flex items-center justify-between shadow-2xl border border-white"
              >
                <div className="flex items-center gap-5">
                  <div className="bg-red-50 p-2.5 rounded-full shadow-inner">
                    <img src="/images/kick-icon.png" className="w-8 h-8" alt="sport" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg leading-tight">
                      {"tournament_name" in match ? match.tournament_name : match.event}
                    </h4>
                    <p className="text-xs text-gray-500 font-bold uppercase">
                      {"sport" in match ? match.sport : match.sport} • {"start_date" in match ? match.start_date || "Date not set" : match.date}
                    </p>
                    {"selected_category" in match && (
                      <p className="text-[10px] text-red-600 font-bold uppercase mt-1">
                        {match.selected_category || "Joined"} • {getSlotsLeft(match)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="pr-8">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
