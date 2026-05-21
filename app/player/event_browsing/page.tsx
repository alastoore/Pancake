"use client";

import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Montserrat } from "next/font/google";
import { useEffect, useMemo, useState } from "react";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

type PlayerTournament = {
  id: number;
  tournament_name: string;
  sport: string | null;
  category: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  venue: string | null;
  location: string | null;
  reg_start_date: string | null;
  reg_end_date: string | null;
  max_participants: number | null;
  entry_fee: number | null;
  status: string | null;
  allow_kata: boolean;
  allow_kumite: boolean;
};

type PlayerTournamentJoin = {
  tournament_id: number;
  selected_category: string;
  status: string | null;
};

type PlayerIdentity = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type TournamentJoinCountRow = {
  tournament_id: number | null;
  status: string | null;
};

function asText(value: unknown) {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : null;
}

function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

function normalizeTournament(row: Record<string, unknown>): PlayerTournament {
  return {
    id: asNumber(row.id) ?? 0,
    tournament_name: asText(row.tournament_name) ?? "Untitled Tournament",
    sport: asText(row.sport),
    category: asText(row.category),
    description: asText(row.description),
    start_date: asText(row.start_date),
    end_date: asText(row.end_date),
    venue: asText(row.venue),
    location: asText(row.location),
    reg_start_date: asText(row.reg_start_date),
    reg_end_date: asText(row.reg_end_date),
    max_participants: asNumber(row.max_participants),
    entry_fee: asNumber(row.entry_fee),
    status: asText(row.status),
    allow_kata: asBoolean(row.allow_kata),
    allow_kumite: asBoolean(row.allow_kumite),
  };
}

function formatDateRange(startDate: string | null, endDate: string | null) {
  if (!startDate && !endDate) {
    return "Date not set";
  }

  if (startDate && endDate) {
    return `${startDate} to ${endDate}`;
  }

  return startDate ?? endDate ?? "Date not set";
}

function formatFee(value: number | null) {
  if (value === null) {
    return "Free / Not specified";
  }

  return `PHP ${value}`;
}

function formatCapacity(value: number | null) {
  if (value === null) {
    return "Open capacity";
  }

  return `${value} participants`;
}

function getStatusBadgeClasses(status: string | null) {
  switch (normalizeStatus(status)) {
    case "open":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    case "close":
    case "closed":
      return "bg-orange-100 text-orange-700 border border-orange-200";
    case "completed":
      return "bg-blue-100 text-blue-700 border border-blue-200";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
}

function normalizeStatus(status: string | null) {
  const normalized = (status ?? "").toLowerCase();
  return normalized === "closed" ? "close" : normalized;
}

function getStatusLabel(status: string | null) {
  switch (normalizeStatus(status)) {
    case "open":
      return "Open";
    case "close":
      return "Closed";
    case "completed":
      return "Completed";
    default:
      return "Unknown";
  }
}

function getAllowedCategories(allowKata: boolean, allowKumite: boolean) {
  const categories: Array<"kata" | "kumite"> = [];

  if (allowKata) {
    categories.push("kata");
  }

  if (allowKumite) {
    categories.push("kumite");
  }

  return categories;
}

function formatAllowedCategories(allowKata: boolean, allowKumite: boolean) {
  const categories = getAllowedCategories(allowKata, allowKumite);

  if (categories.length === 0) {
    return "Not specified";
  }

  return categories
    .map((category) => category.charAt(0).toUpperCase() + category.slice(1))
    .join(", ");
}

export default function EventBrowsing() {
  const supabase = getSupabaseBrowserClient();

  const [userName, setUserName] = useState("Loading...");
  const [playerIdentity, setPlayerIdentity] = useState<PlayerIdentity | null>(null);
  const [previewEvent, setPreviewEvent] = useState<PlayerTournament | null>(null);
  const [events, setEvents] = useState<PlayerTournament[]>([]);
  const [search, setSearch] = useState("");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [joinedCategories, setJoinedCategories] = useState<Record<number, string[]>>({});
  const [joinedCounts, setJoinedCounts] = useState<Record<number, number>>({});
  const [joiningCategory, setJoiningCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUserName("Player");
        return;
      }

      const { data } = await (supabase as any)
        .from("player_profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();

      setUserName(data?.full_name || "Player");
      setPlayerIdentity({
        id: user.id,
        full_name: data?.full_name || "Player",
        email: data?.email || user.email || null,
      });

      const { data: joinData, error: joinError } = await supabase
        .from("player_tourna")
        .select("tournament_id, selected_category, status")
        .eq("player_id", user.id);

      if (!joinError) {
        const grouped = (joinData as PlayerTournamentJoin[]).reduce<Record<number, string[]>>(
          (accumulator, joinRow) => {
            if (
              typeof joinRow.tournament_id === "number" &&
              joinRow.selected_category &&
              (joinRow.status ?? "joined") === "joined"
            ) {
              const current = accumulator[joinRow.tournament_id] ?? [];
              accumulator[joinRow.tournament_id] = [...current, joinRow.selected_category];
            }

            return accumulator;
          },
          {}
        );

        setJoinedCategories(grouped);
      }
    }

    async function fetchTournaments() {
      setLoadingEvents(true);
      setErrorMessage("");

      let { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .in("status", ["open", "close", "closed", "completed"])
        .order("start_date", { ascending: true, nullsFirst: false });

      // Soft fallback for deployments where the status column has not been added yet.
      // We still show tournaments instead of hard-failing the whole page.
      if (error?.message.includes('column "status" does not exist')) {
        const fallback = await supabase
          .from("tournaments")
          .select("*")
          .order("start_date", { ascending: true, nullsFirst: false });

        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        setEvents([]);
        setErrorMessage(error.message);
        setLoadingEvents(false);
        return;
      }

      const normalized = (data ?? [])
        .map((row) => normalizeTournament(row as Record<string, unknown>))
        .filter((event) => normalizeStatus(event.status) !== "draft");

      setEvents(normalized);
      setLoadingEvents(false);
    }

    async function fetchJoinCounts() {
      const { data, error } = await supabase
        .from("player_tourna")
        .select("tournament_id, status");

      if (error) {
        console.error("Failed to load tournament join counts:", error.message);
        return;
      }

      const counts = (data as TournamentJoinCountRow[]).reduce<Record<number, number>>(
        (accumulator, row) => {
          if (
            typeof row.tournament_id === "number" &&
            (row.status ?? "joined") === "joined"
          ) {
            accumulator[row.tournament_id] = (accumulator[row.tournament_id] ?? 0) + 1;
          }

          return accumulator;
        },
        {}
      );

      setJoinedCounts(counts);
    }

    void fetchUserProfile();
    void fetchTournaments();
    void fetchJoinCounts();
  }, [supabase]);

  function getRemainingSlots(tournament: PlayerTournament) {
    if (tournament.max_participants === null) {
      return null;
    }

    return tournament.max_participants - (joinedCounts[tournament.id] ?? 0);
  }

  function isTournamentFull(tournament: PlayerTournament) {
    const remainingSlots = getRemainingSlots(tournament);
    return remainingSlots !== null && remainingSlots <= 0;
  }

  async function handleJoinTournament(
    tournament: PlayerTournament,
    selectedCategory: "kata" | "kumite"
  ) {
    if (!playerIdentity) {
      alert("Please log in as a player first.");
      return;
    }

    if (isTournamentFull(tournament)) {
      alert("Tournament Full");
      return;
    }

    setJoiningCategory(selectedCategory);

    const { error } = await (supabase.from("player_tourna") as any).insert({
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      username: playerIdentity.full_name || userName,
      email: playerIdentity.email,
      tourna_name: tournament.tournament_name,
      player_id: playerIdentity.id,
      tournament_id: tournament.id,
      selected_category: selectedCategory,
      status: "joined",
    });

    if (error) {
      alert(error.message);
      setJoiningCategory(null);
      return;
    }

    setJoinedCategories((current) => ({
      ...current,
      [tournament.id]: [...(current[tournament.id] ?? []), selectedCategory],
    }));
    setJoinedCounts((current) => ({
      ...current,
      [tournament.id]: (current[tournament.id] ?? 0) + 1,
    }));

    alert(`Joined ${tournament.tournament_name} for ${selectedCategory.toUpperCase()}.`);
    setJoiningCategory(null);
  }

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return events;
    }

    return events.filter((event) =>
      [
        event.tournament_name,
        event.sport,
        event.category,
        event.location,
        event.venue,
        event.description,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [events, search]);

  return (
    <div className={`min-h-screen bg-gray-50 font-sans ${montserrat.className}`}>
      <div
        className="relative bg-cover bg-center bg-no-repeat text-white"
        style={{ backgroundImage: "url('/welcome-bg.png')" }}
      >
        <header className="relative z-10 flex items-center justify-between p-4">
          <div className="text-xl font-bold tracking-tight text-white">HuddleUp</div>

          <div className="flex items-center gap-3">
            <Link
              href="/player/profile"
              className="cursor-pointer font-medium transition-colors hover:text-gray-200"
            >
              {userName}
            </Link>

            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-gray-300 shadow-sm">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
                alt="User Avatar"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </header>

        <div className="relative z-10 p-10">
          <div className="mx-auto max-w-5xl">
            <h1 className="mb-2 text-4xl font-extrabold text-white">
              Find Tournaments
            </h1>

            <p className="mb-6 text-lg text-white/90">
              Discover and join exciting tournaments near you.
            </p>

            <div className="relative max-w-lg">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tournaments, sports, locations..."
                className="w-full rounded-full border border-white/30 bg-white/10 p-4 pl-6 text-white shadow-lg outline-none backdrop-blur-sm transition-all placeholder:text-white/70 focus:ring-2 focus:ring-red-300"
              />
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl p-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">Available Tournaments</h2>

        {errorMessage && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            Failed to load tournaments: {errorMessage}
          </div>
        )}

        {loadingEvents ? (
          <div className="rounded-[32px] border border-gray-100 bg-white p-8 text-center shadow-sm">
            <p className="font-semibold text-gray-500">Loading tournaments...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-xl font-bold text-gray-800">No visible tournaments yet</p>
            <p className="mt-2 text-sm text-gray-500">
              Organizers need to mark tournaments as open, close, or completed before players can see them.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => setPreviewEvent(event)}
                className={`group relative flex cursor-pointer flex-col gap-6 overflow-hidden rounded-[32px] border bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${
                  isTournamentFull(event) ? "border-orange-200" : "border-gray-100"
                }`}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.04] grayscale"
                  style={{ backgroundImage: "url('/images/image_b0a65a.jpg')", backgroundSize: "cover" }}
                />

                <div className="relative z-10 flex items-start gap-5">
                  <div className="flex-shrink-0 rounded-2xl bg-red-50 p-5 transition-colors duration-300 group-hover:bg-[#bd1e24]">
                    <img
                      src="/images/gi-icon.png"
                      alt="Icon"
                      className="h-10 w-10 transition-all group-hover:invert"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bd1e24]">
                        {event.sport || "Tournament"}
                      </p>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {isTournamentFull(event) && (
                          <span className="rounded-full border border-orange-200 bg-orange-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-700">
                            Tournament Full
                          </span>
                        )}
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClasses(
                            event.status
                          )}`}
                        >
                          {getStatusLabel(event.status)}
                        </span>
                      </div>
                    </div>

                    <h3 className="mb-4 text-2xl font-black uppercase italic leading-tight tracking-tighter text-gray-900 transition-colors group-hover:text-[#bd1e24]">
                      {event.tournament_name}
                    </h3>

                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      <div className="text-xs font-bold text-gray-500">
                        <span className="mr-2 text-base text-[#bd1e24]">Date</span>
                        {formatDateRange(event.start_date, event.end_date)}
                      </div>
                      <div className="text-xs font-bold text-gray-500">
                        <span className="mr-2 text-base text-[#bd1e24]">Place</span>
                        {event.location || event.venue || "Not specified"}
                      </div>
                      <div className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black uppercase tracking-tighter text-gray-600 transition-colors group-hover:bg-red-50">
                        {formatCapacity(event.max_participants)}
                      </div>
                      <div className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black uppercase tracking-tighter text-gray-600 transition-colors group-hover:bg-red-50">
                        {formatAllowedCategories(event.allow_kata, event.allow_kumite)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-1 gap-2 border-t border-gray-100 pt-4 text-xs font-semibold text-gray-600">
                  <div>
                    <span className="text-gray-800">Registration:</span>{" "}
                    {formatDateRange(event.reg_start_date, event.reg_end_date)}
                  </div>
                  <div>
                    <span className="text-gray-800">Entry Fee:</span> {formatFee(event.entry_fee)}
                  </div>
                  <div>
                    <span className="text-gray-800">Slots:</span>{" "}
                    {event.max_participants === null
                      ? "Open capacity"
                      : `${Math.max(getRemainingSlots(event) ?? 0, 0)} left`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {previewEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-xl overflow-hidden rounded-[40px] border border-white/10 bg-[#0f0f0f] p-10 shadow-2xl">
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{ backgroundImage: "url('/images/image_b0a65a.jpg')", backgroundSize: "cover" }}
            />

            <div className="relative z-10 text-white">
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#bd1e24]">
                    Tournament Entry
                  </p>
                  <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter">
                    {previewEvent.tournament_name}
                  </h2>
                </div>
                <button
                  onClick={() => setPreviewEvent(null)}
                  className="rounded-full bg-white/5 p-2 text-gray-400 transition-all hover:bg-white/10 hover:text-white"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="mb-5 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClasses(
                    previewEvent.status
                  )}`}
                >
                  {getStatusLabel(previewEvent.status)}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-200">
                  {previewEvent.sport || "Tournament"}
                </span>
                {previewEvent.category && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-200">
                    {previewEvent.category}
                  </span>
                )}
              </div>

              <div className="mb-6 rounded-3xl border border-white/5 bg-white/5 p-6">
                <p className="text-base font-medium leading-relaxed text-gray-300">
                  {previewEvent.description || "No description has been added yet."}
                </p>
              </div>

              <div className="mb-8 grid grid-cols-1 gap-3 text-sm text-gray-300">
                <p><strong>Date:</strong> {formatDateRange(previewEvent.start_date, previewEvent.end_date)}</p>
                <p><strong>Location:</strong> {previewEvent.location || previewEvent.venue || "Not specified"}</p>
                <p><strong>Registration:</strong> {formatDateRange(previewEvent.reg_start_date, previewEvent.reg_end_date)}</p>
                <p><strong>Entry Fee:</strong> {formatFee(previewEvent.entry_fee)}</p>
                <p><strong>Max Participants:</strong> {formatCapacity(previewEvent.max_participants)}</p>
                <p><strong>Allowed Categories:</strong> {formatAllowedCategories(previewEvent.allow_kata, previewEvent.allow_kumite)}</p>
                <p>
                  <strong>Slots Left:</strong>{" "}
                  {previewEvent.max_participants === null
                    ? "Open capacity"
                    : Math.max(getRemainingSlots(previewEvent) ?? 0, 0)}
                </p>
              </div>

              <div className="space-y-3">
                {normalizeStatus(previewEvent.status) !== "open" ? (
                  <button
                    disabled
                    className="w-full rounded-2xl bg-gray-700 py-5 text-xl font-black uppercase italic tracking-tighter text-gray-300"
                  >
                    Tournament Not Open
                  </button>
                ) : isTournamentFull(previewEvent) ? (
                  <button
                    disabled
                    className="w-full rounded-2xl bg-orange-700 py-5 text-xl font-black uppercase italic tracking-tighter text-orange-100"
                  >
                    Tournament Full
                  </button>
                ) : (
                  getAllowedCategories(previewEvent.allow_kata, previewEvent.allow_kumite).map(
                    (category) => {
                      const alreadyJoined =
                        joinedCategories[previewEvent.id]?.includes(category) ?? false;

                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => void handleJoinTournament(previewEvent, category)}
                          disabled={alreadyJoined || joiningCategory !== null}
                          className="w-full rounded-2xl bg-[#bd1e24] py-5 text-xl font-black uppercase italic tracking-tighter shadow-[0_10px_20px_rgba(189,30,36,0.3)] transition-all hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-300"
                        >
                          {alreadyJoined
                            ? `Joined ${category.toUpperCase()}`
                            : joiningCategory === category
                            ? `Joining ${category.toUpperCase()}...`
                            : `Join ${category.toUpperCase()}`}
                        </button>
                      );
                    }
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
