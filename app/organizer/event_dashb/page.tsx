"use client";

import Link from "next/link";
import { getSupabaseBrowserClient, Database } from "@/lib/supabase/browser-client";
import { useEffect, useState } from "react";

type UserProfile = {
  username: string;
};

type TournamentRecord = {
  id: number;
  tournament_name: string;
  sport: string | null;
  tournament_type: string | null;
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
  rules_guidelines: string | null;
  status: string | null;
  organizer_id: string;
  allow_kata: boolean;
  allow_kumite: boolean;
};

type EditableTournament = {
  tournament_name: string;
  sport: string;
  tournament_type: string;
  category: string;
  description: string;
  start_date: string;
  end_date: string;
  venue: string;
  location: string;
  reg_start_date: string;
  reg_end_date: string;
  max_participants: string;
  entry_fee: string;
  rules_guidelines: string;
  status: string;
  allow_kata: boolean;
  allow_kumite: boolean;
};

interface PlayerTournaRow { //for properties on type "never"
  tournament_id: number;
  status: string;
}

function asText(value: unknown) {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : null;
}

function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

function normalizeTournamentRecord(row: Record<string, unknown>): TournamentRecord {
  return {
    id: asNumber(row.id) ?? 0,
    tournament_name: asText(row.tournament_name) ?? "Untitled Tournament",
    sport: asText(row.sport),
    tournament_type: asText(row.tournament_type),
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
    rules_guidelines: asText(row.rules_guidelines),
    status: asText(row.status),
    organizer_id: String(row.organizer_id ?? ""),
    allow_kata: asBoolean(row.allow_kata),
    allow_kumite: asBoolean(row.allow_kumite),
  };
}

function toEditableTournament(tournament: TournamentRecord): EditableTournament {
  return {
    tournament_name: tournament.tournament_name,
    sport: tournament.sport ?? "",
    tournament_type: tournament.tournament_type ?? "",
    category: tournament.category ?? "",
    description: tournament.description ?? "",
    start_date: tournament.start_date ?? "",
    end_date: tournament.end_date ?? "",
    venue: tournament.venue ?? "",
    location: tournament.location ?? "",
    reg_start_date: tournament.reg_start_date ?? "",
    reg_end_date: tournament.reg_end_date ?? "",
    max_participants:
      tournament.max_participants === null ? "" : String(tournament.max_participants),
    entry_fee: tournament.entry_fee === null ? "" : String(tournament.entry_fee),
    rules_guidelines: tournament.rules_guidelines ?? "",
    status: tournament.status ?? "draft",
    allow_kata: tournament.allow_kata,
    allow_kumite: tournament.allow_kumite,
  };
}

function asNullableString(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function asNullableDate(value: string) {
  return value === "" ? null : value;
}

function asNullableInt(value: string) {
  if (value.trim() === "") {
    return null;
  }

  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
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

function formatCapacity(value: number | null) {
  if (value === null) {
    return "Not specified";
  }

  return `${value} participants`;
}

function formatFee(value: number | null) {
  if (value === null) {
    return "Not specified";
  }

  return `PHP ${value}`;
}

function formatRegistrationWindow(startDate: string | null, endDate: string | null) {
  if (!startDate && !endDate) {
    return "Not set";
  }

  if (startDate && endDate) {
    return `${startDate} to ${endDate}`;
  }

  return startDate ?? endDate ?? "Not set";
}

function formatAllowedCategories(allowKata: boolean, allowKumite: boolean) {
  if (allowKata && allowKumite) {
    return "Kata, Kumite";
  }

  if (allowKata) {
    return "Kata";
  }

  if (allowKumite) {
    return "Kumite";
  }

  return "Not specified";
}

function normalizeStatus(status: string | null) {
  const normalized = (status ?? "draft").toLowerCase();
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
      return "Draft";
  }
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
      return "bg-amber-100 text-amber-700 border border-amber-200";
  }
}

type FieldProps = {
  label: string;
  name: keyof EditableTournament;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  type?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
};

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  inputMode,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
        className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-600"
      />
    </div>
  );
}

export default function EventDashboardPage() {
  const supabase = getSupabaseBrowserClient();

  const [userName, setUserName] = useState("Loading...");
  const [organizerId, setOrganizerId] = useState<string | null>(null);
  const [events, setEvents] = useState<TournamentRecord[]>([]);
  const [previewEvent, setPreviewEvent] = useState<TournamentRecord | null>(null);
  const [editingEvent, setEditingEvent] = useState<TournamentRecord | null>(null);
  const [editForm, setEditForm] = useState<EditableTournament | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [joinedCounts, setJoinedCounts] = useState<Record<number, number>>({});

  async function loadJoinCounts() {
    const { data, error } = await supabase
      .from("player_tourna")
      .select("tournament_id, status");

    if (error) {
      console.error("Failed to load join counts:", error.message);
      return;
    }

    // Explicitly cast data as PlayerTournaRow[] to clear the 'never' type error
    const rows = (data as PlayerTournaRow[]) ?? [];

    const counts = rows.reduce<Record<number, number>>((accumulator, row) => {
      const tournamentId =
        typeof row.tournament_id === "number" ? row.tournament_id : null;
      const status = typeof row.status === "string" ? row.status : "joined";

      if (tournamentId !== null && status === "joined") {
        accumulator[tournamentId] = (accumulator[tournamentId] ?? 0) + 1;
      }

      return accumulator;
    }, {});

    setJoinedCounts(counts);
  }

  function getRemainingSlots(tournament: TournamentRecord) {
    if (tournament.max_participants === null) {
      return null;
    }

    return Math.max(
      tournament.max_participants - (joinedCounts[tournament.id] ?? 0),
      0
    );
  }

  async function loadTournaments(userId: string) {
    setLoadingEvents(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .eq("organizer_id", userId)
      .order("start_date", { ascending: true, nullsFirst: false });

    if (error) {
      setErrorMessage(error.message);
      setEvents([]);
      setLoadingEvents(false);
      return;
    }

    const normalized = (data ?? []).map((row) =>
      normalizeTournamentRecord(row as Record<string, unknown>)
    );

    setEvents(normalized);
    setLoadingEvents(false);
    await loadJoinCounts();
  }

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setUserName("Guest");
        setLoadingEvents(false);
        return;
      }

      setOrganizerId(user.id);

      const { data: profileData, error: profileError } = await supabase
        .from("organizer_profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setUserName("User");
      } else if (profileData) {
        const profile = profileData as unknown as UserProfile;
        setUserName(profile.username);
      }

      await loadTournaments(user.id);
    }

    loadDashboard();
  }, [supabase]);

  function openEditModal(event: TournamentRecord) {
    setEditingEvent(event);
    setEditForm(toEditableTournament(event));
  }

  function closeEditModal() {
    setEditingEvent(null);
    setEditForm(null);
  }

  function handleEditChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name } = event.target;
    let { value } = event.target;

    if (name === "max_participants" || name === "entry_fee") {
      value = value.replace(/\D/g, "");
    }

    setEditForm((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  }

  async function handleSaveEdit() {
    if (!editingEvent || !editForm || !organizerId) {
      return;
    }

    setSavingEdit(true);

    // 1. Maintain the precise Supabase Update type definition
    type TournamentUpdatePayload = Database["public"]["Tables"]["tournaments"]["Update"];

    const payload: TournamentUpdatePayload = {
      tournament_name: editForm.tournament_name.trim(),
      sport: asNullableString(editForm.sport),
      tournament_type: asNullableString(editForm.tournament_type),
      category: asNullableString(editForm.category),
      description: asNullableString(editForm.description),
      start_date: asNullableDate(editForm.start_date),
      end_date: asNullableDate(editForm.end_date),
      venue: asNullableString(editForm.venue),
      location: asNullableString(editForm.location),
      reg_start_date: asNullableDate(editForm.reg_start_date),
      reg_end_date: asNullableDate(editForm.reg_end_date),
      max_participants: asNullableInt(editForm.max_participants),
      entry_fee: asNullableInt(editForm.entry_fee),
      rules_guidelines: asNullableString(editForm.rules_guidelines),
      status: asNullableString(editForm.status) ?? "draft",
      allow_kata: editForm.allow_kata,
      allow_kumite: editForm.allow_kumite,
    };

    const updatePayload = { ...payload } as TournamentUpdatePayload;
    let error: { message: string } | null = null;

    while (Object.keys(updatePayload).length > 0) {
      const result = await (supabase.from("tournaments") as any)
        .update(updatePayload)
        .eq("id", editingEvent.id)
        .eq("organizer_id", organizerId);

      error = result.error;

      if (!error) {
        break;
      }

      const missingColumnMatch = error.message.match(/Could not find the '([^']+)' column/i);
      if (!missingColumnMatch) {
        break;
      }

      const missingColumn = missingColumnMatch[1];
      if (!(missingColumn in updatePayload)) {
        break;
      }

      delete updatePayload[missingColumn as keyof TournamentUpdatePayload];
    }

    if (error) {
      alert(`Error updating tournament: ${error.message}`);
      setSavingEdit(false);
      return;
    }

    const organizerMirrorUpdate = await (supabase as any)
      .from("organizer_tourna")
      .update({
        tourna_name: editForm.tournament_name.trim(),
        organizer: userName,
      })
      .eq("organizer_id", organizerId)
      .eq("tournament_id", editingEvent.id);

    if (organizerMirrorUpdate.error) {
      console.warn("Organizer mirror update failed:", organizerMirrorUpdate.error.message);
    }

    await loadTournaments(organizerId);
    closeEditModal();
    setSavingEdit(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div
        className="relative bg-cover bg-center bg-no-repeat text-white"
        style={{ backgroundImage: "url('/welcome-bg.png')" }}
      >
        <header className="relative z-10 flex items-center justify-between p-4">
          <div className="text-xl font-bold tracking-tight text-white">HuddleUp</div>

          <div className="flex items-center gap-3">
            <Link
              href="/organizer/profile"
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
              Manage Tournaments
            </h1>

            <p className="mb-6 text-lg text-white/90">
              Manage and facilitate exciting tournaments for everyone.
            </p>

            <div className="relative max-w-lg">
              <Link
                href="/organizer/event_dashb/create_tourna"
                className="group inline-flex items-center gap-3 rounded-full border-2 border-white/80 bg-white px-7 py-4 text-base font-bold tracking-wide text-red-600 shadow-xl transition-all duration-300 hover:scale-105 hover:border-red-400 hover:bg-red-600 hover:text-white hover:shadow-red-500/40 active:scale-95"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-lg leading-none text-white transition-all duration-300 group-hover:bg-white group-hover:text-red-600">
                  +
                </span>
                Create Tournament
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Managed Tournaments</h2>
          <button
            type="button"
            onClick={() => {
              if (organizerId) {
                void loadTournaments(organizerId);
              }
            }}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:text-red-600"
          >
            Refresh
          </button>
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            Failed to load tournaments: {errorMessage}
          </div>
        )}

        {loadingEvents ? (
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-10 text-center shadow-sm">
            <p className="font-semibold text-gray-500">Loading tournaments...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
            <p className="text-xl font-bold text-gray-800">No tournaments yet</p>
            <p className="mt-2 text-sm text-gray-500">
              Create your first tournament and it will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-red-200 hover:shadow-lg"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-center">
                  <button
                    type="button"
                    onClick={() => setPreviewEvent(event)}
                    className="flex flex-1 flex-col gap-4 text-left md:flex-row md:items-center"
                  >
                    <div className="rounded-full bg-red-50 p-5 transition-colors group-hover:bg-red-100">
                      <svg
                        className="h-8 w-8 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>

                    <div className="grid w-full flex-1 grid-cols-1 gap-4 md:grid-cols-4">
                      <div className="flex flex-col">
                        <span className="text-lg font-extrabold text-gray-900">
                          {event.tournament_name}
                        </span>
                        <span className="text-sm font-bold uppercase tracking-wider text-red-600">
                          {event.sport || "Sport not set"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="mr-2 text-red-400">Date</span>
                        {formatDateRange(event.start_date, event.end_date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="mr-2 text-red-400">Location</span>
                        {event.location || event.venue || "Not specified"}
                      </div>
                      <div className="flex items-center justify-start md:justify-end">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusBadgeClasses(
                            event.status
                          )}`}
                        >
                          {getStatusLabel(event.status)}
                        </span>
                      </div>
                    </div>
                  </button>

                  <div className="flex gap-3 md:self-start">
                    <button
                      type="button"
                      onClick={() => setPreviewEvent(event)}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:text-red-600"
                    >
                      Read
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(event)}
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 border-t border-gray-100 pt-4 text-sm text-gray-600 md:grid-cols-3">
                  <div>
                    <span className="font-semibold text-gray-800">Registration:</span>{" "}
                    {formatRegistrationWindow(event.reg_start_date, event.reg_end_date)}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Entry Fee:</span>{" "}
                    {formatFee(event.entry_fee)}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Max Participants:</span>{" "}
                    {formatCapacity(event.max_participants)}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Slots Left:</span>{" "}
                    {getRemainingSlots(event) === null ? "Open capacity" : getRemainingSlots(event)}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Allowed:</span>{" "}
                    {formatAllowedCategories(event.allow_kata, event.allow_kumite)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {previewEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="mb-1 text-3xl font-black text-gray-900">
                    {previewEvent.tournament_name}
                  </h2>
                  <p className="font-bold text-red-600">
                    {previewEvent.sport || "Sport not set"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusBadgeClasses(
                    previewEvent.status
                  )}`}
                >
                  {getStatusLabel(previewEvent.status)}
                </span>
              </div>

              <div className="mt-6 space-y-4 rounded-2xl border-l-4 border-red-500 bg-gray-50 p-5">
                <p className="text-gray-700">
                  {previewEvent.description || "No description provided yet."}
                </p>
                <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2">
                  <p><strong>Date:</strong> {formatDateRange(previewEvent.start_date, previewEvent.end_date)}</p>
                  <p><strong>Venue:</strong> {previewEvent.venue || "Not specified"}</p>
                  <p><strong>Location:</strong> {previewEvent.location || "Not specified"}</p>
                  <p><strong>Type:</strong> {previewEvent.tournament_type || "Not specified"}</p>
                  <p><strong>Category:</strong> {previewEvent.category || "Not specified"}</p>
                  <p><strong>Capacity:</strong> {formatCapacity(previewEvent.max_participants)}</p>
                  <p><strong>Entry Fee:</strong> {formatFee(previewEvent.entry_fee)}</p>
                  <p><strong>Registration:</strong> {formatDateRange(previewEvent.reg_start_date, previewEvent.reg_end_date)}</p>
                  <p><strong>Slots Left:</strong> {getRemainingSlots(previewEvent) === null ? "Open capacity" : getRemainingSlots(previewEvent)}</p>
                  <p><strong>Allowed Categories:</strong> {formatAllowedCategories(previewEvent.allow_kata, previewEvent.allow_kumite)}</p>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-semibold text-gray-800">Rules and Guidelines</p>
                  <p>{previewEvent.rules_guidelines || "No rules uploaded yet."}</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewEvent(null);
                    openEditModal(previewEvent);
                  }}
                  className="flex-1 rounded-xl bg-red-600 py-3 font-bold text-white transition hover:bg-red-700"
                >
                  Edit Tournament
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewEvent(null)}
                  className="flex-1 rounded-xl border border-gray-200 py-3 font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {editingEvent && editForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl">
              <div className="mb-0 flex items-start justify-between gap-4 border-b border-gray-100 px-8 py-6">
                <div>
                  <h2 className="text-3xl font-black text-gray-900">Edit Tournament</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Update the tournament details for {editingEvent.tournament_name}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-full border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Close
                </button>
              </div>

              <div className="overflow-y-auto px-8 py-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field
                    label="Tournament Name"
                    name="tournament_name"
                    value={editForm.tournament_name}
                    onChange={handleEditChange}
                    placeholder="Enter tournament name"
                  />
                  <Field
                    label="Sport"
                    name="sport"
                    value={editForm.sport}
                    onChange={handleEditChange}
                    placeholder="Enter sport"
                  />
                  <Field
                    label="Tournament Type"
                    name="tournament_type"
                    value={editForm.tournament_type}
                    onChange={handleEditChange}
                    placeholder="e.g. Open Championship"
                  />
                  <Field
                    label="Category"
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    placeholder="e.g. Senior Kumite"
                  />
                  <Field
                    label="Start Date"
                    name="start_date"
                    type="date"
                    value={editForm.start_date}
                    onChange={handleEditChange}
                  />
                  <Field
                    label="End Date"
                    name="end_date"
                    type="date"
                    value={editForm.end_date}
                    onChange={handleEditChange}
                  />
                  <Field
                    label="Venue"
                    name="venue"
                    value={editForm.venue}
                    onChange={handleEditChange}
                    placeholder="Enter venue"
                  />
                  <Field
                    label="Location"
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                    placeholder="City, Country"
                  />
                  <Field
                    label="Registration Start"
                    name="reg_start_date"
                    type="date"
                    value={editForm.reg_start_date}
                    onChange={handleEditChange}
                  />
                  <Field
                    label="Registration End"
                    name="reg_end_date"
                    type="date"
                    value={editForm.reg_end_date}
                    onChange={handleEditChange}
                  />
                  <Field
                    label="Max Participants"
                    name="max_participants"
                    value={editForm.max_participants}
                    onChange={handleEditChange}
                    inputMode="numeric"
                    placeholder="Enter capacity"
                  />
                  <Field
                    label="Entry Fee"
                    name="entry_fee"
                    value={editForm.entry_fee}
                    onChange={handleEditChange}
                    inputMode="numeric"
                    placeholder="Enter fee"
                  />
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      rows={4}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-600"
                      placeholder="Enter tournament description"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      Rules and Guidelines
                    </label>
                    <textarea
                      name="rules_guidelines"
                      value={editForm.rules_guidelines}
                      onChange={handleEditChange}
                      rows={4}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-600"
                      placeholder="Enter rules and guidelines"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      Allowed Competition Categories
                    </label>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditForm((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  allow_kata: !prev.allow_kata,
                                }
                              : prev
                          )
                        }
                        className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                          editForm.allow_kata
                            ? "border-red-200 bg-red-50 text-red-700"
                            : "border-gray-200 bg-white text-gray-500"
                        }`}
                      >
                        Kata
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEditForm((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  allow_kumite: !prev.allow_kumite,
                                }
                              : prev
                          )
                        }
                        className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                          editForm.allow_kumite
                            ? "border-red-200 bg-red-50 text-red-700"
                            : "border-gray-200 bg-white text-gray-500"
                        }`}
                      >
                        Kumite
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      Status
                    </label>
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleEditChange}
                      className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                      <option value="draft">Draft</option>
                      <option value="open">Open</option>
                      <option value="close">Close</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-0 flex gap-3 border-t border-gray-100 px-8 py-6">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="flex-1 rounded-xl bg-red-600 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingEdit ? "Saving Changes..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 rounded-xl border border-gray-200 py-3 font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
