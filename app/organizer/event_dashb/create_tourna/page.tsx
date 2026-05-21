"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { User } from "@supabase/supabase-js";
import { 
  ChevronDown, 
  CalendarDays, 
  MapPin, 
  Search, 
  PlusCircle, 
  Users, 
  Zap, 
  CircleDollarSign 
} from "lucide-react";

type TournamentData = {
  name: string;
  sport: string;
  type: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  location: string;
  regStartDate: string;
  regEndDate: string;
  maxParticipants: string;
  entryFee: string;
  rules: string;
  allowKata: boolean;
  allowKumite: boolean;
};

const initialData: TournamentData = {
  name: "",
  sport: "",
  type: "",
  category: "",
  description: "",
  startDate: "",
  endDate: "",
  venue: "",
  location: "",
  regStartDate: "",
  regEndDate: "",
  maxParticipants: "",
  entryFee: "",
  rules: "",
  allowKata: true,
  allowKumite: true,
};

type InputFieldProps = {
  label: string;
  name: keyof TournamentData;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
};

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  icon,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="mb-0.5 ml-1 text-xs font-bold uppercase tracking-wider text-gray-600">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-600"
        />
        {icon && (
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

type PreviewItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function PreviewItem({ icon, label, value }: PreviewItemProps) {
  return (
    <div className="group flex items-center justify-between border-b border-dashed border-gray-100 py-3 text-sm last:border-0">
      <div className="flex items-center gap-3 text-gray-500">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-transform group-hover:scale-105">
          {icon}
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
          {label}
        </span>
      </div>
      <span
        className={`max-w-[140px] truncate text-sm font-bold ${
          value === "Not Specified"
            ? "font-normal italic text-gray-400"
            : "text-gray-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
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

export default function CreateTournamentPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  // AUTH & STATE
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TournamentData>(initialData);

  // 1. Fetch User and listen to session updates to prevent "Loading Session..." lock
  useEffect(() => {
    let mounted = true;

    async function checkUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!mounted) return;

        if (error || !user) {
          router.push("/login"); // Redirect if token is missing
        } else {
          setUser(user);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        if (mounted) {
          setLoadingAuth(false); // Fixed direct state update
        }
      }
    }

    checkUser();

    // Alternate listener case if cookie sync is slightly delayed on refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        setLoadingAuth(false);
      } else if (event === "SIGNED_OUT") {
        router.push("/login");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (name: "allowKata" | "allowKumite") => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleCreate = async () => {
    if (!user) return;
    
    setIsSubmitting(true);

    const payload: Record<string, string | number | boolean | null> = {
      tournament_name: formData.name.trim(),
      sport: asNullableString(formData.sport),
      tournament_type: asNullableString(formData.type),
      category: asNullableString(formData.category),
      description: asNullableString(formData.description),
      start_date: asNullableDate(formData.startDate),
      end_date: asNullableDate(formData.endDate),
      venue: asNullableString(formData.venue),
      location: asNullableString(formData.location),
      reg_start_date: asNullableDate(formData.regStartDate),
      reg_end_date: asNullableDate(formData.regEndDate),
      max_participants: asNullableInt(formData.maxParticipants),
      entry_fee: asNullableInt(formData.entryFee),
      rules_guidelines: asNullableString(formData.rules),
      organizer_id: user.id,
      status: "draft",
      allow_kata: formData.allowKata,
      allow_kumite: formData.allowKumite,
    };

    const insertPayload = { ...payload };
    let error: { message: string } | null = null;
    let createdTournamentId: number | null = null;

    // If the local code and Supabase table drift, strip unknown columns one by one
    // so organizers can still create a tournament with the columns that do exist.
    while (Object.keys(insertPayload).length > 0) {
      const result = await (supabase as any)
        .from("tournaments")
        .insert(insertPayload)
        .select("id")
        .single();
      error = result.error;

      if (!error) {
        createdTournamentId =
          typeof result.data?.id === "number" ? result.data.id : null;
        break;
      }

      const missingColumnMatch = error.message.match(/Could not find the '([^']+)' column/i);
      if (!missingColumnMatch) {
        break;
      }

      const missingColumn = missingColumnMatch[1];
      if (!(missingColumn in insertPayload)) {
        break;
      }

      delete insertPayload[missingColumn];
    }

    if (error) {
      alert("Error: " + error.message);
      setIsSubmitting(false);
    } else {
      if (createdTournamentId !== null) {
        const organizerMirrorError = await (supabase as any)
          .from("organizer_tourna")
          .insert({
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            organizer: user.email ?? user.id,
            tourna_name: formData.name.trim(),
            email: user.email ?? null,
            organizer_id: user.id,
            tournament_id: createdTournamentId,
          });

        if (organizerMirrorError.error) {
          console.warn("Organizer mirror insert failed:", organizerMirrorError.error.message);
        }
      }

      alert("Tournament Created Successfully!");
      router.push("/organizer/event_dashb");
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 font-semibold animate-pulse">Loading Session...</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-no-repeat bg-top font-sans pb-16 antialiased text-gray-900"
      style={{ backgroundImage: "url('/images/bg-arena.png')" }}
    >
      {/* HERO BANNER BLOCK CONTAINER */}
      <div className="relative pt-12 pb-24 px-6 overflow-hidden text-white">
        <div className="max-w-7xl mx-auto flex flex-col relative z-10 gap-2">
          <div>
            <button 
              onClick={() => router.back()} 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-100 hover:text-white mb-2 transition-colors bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm"
            >
              ← Back to Tournaments
            </button>
            <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
              Create Tournament
            </h1>
            <p className="text-red-100 text-sm mt-1 font-medium">
              Configure and launch a new competitive event tier
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-14 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* FORM PANEL */}
          <div className="lg:col-span-3 bg-white/95 rounded-[2rem] shadow-xl shadow-gray-200/50 p-6 md:p-10 border border-gray-100/50 backdrop-blur-sm space-y-10">
            
            {/* Basic Information */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight border-b pb-3 border-gray-100">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <InputField
                  label="Tournament Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter Tournament Name"
                />
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-0.5 ml-1">Sport</label>
                  <div className="relative">
                    <select 
                      name="sport" 
                      value={formData.sport}
                      onChange={handleInputChange} 
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm text-sm appearance-none"
                    >
                      <option value="">Select Sport</option>
                      <option value="Shorin-Ryu">Shorin-Ryu Karate</option>
                      <option value="Goju-Ryu">Goju-Ryu Karate</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>

                <InputField
                  label="Tournament Type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  placeholder="e.g. Open Championship"
                />
                <InputField
                  label="Tournament Category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g. Senior Kumite"
                />
                
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-0.5 ml-1">Description</label>
                  <textarea 
                    name="description" 
                    value={formData.description}
                    onChange={handleInputChange} 
                    rows={4} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm text-sm resize-none" 
                    placeholder="Enter tournament details, registration info, or general parameters..." 
                  />
                </div>
              </div>
            </section>

            {/* Date & Location */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight border-b pb-3 border-gray-100">
                Date & Location
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <InputField
                  label="Start Date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  type="date"
                  icon={<CalendarDays size={18} />}
                />
                <InputField
                  label="End Date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  type="date"
                  icon={<CalendarDays size={18} />}
                />
                <InputField
                  label="Venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  placeholder="Enter Venue Location"
                />
                <InputField
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, Country"
                  icon={<MapPin size={18} />}
                />
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight border-b pb-3 border-gray-100">
                Registration & Capacity
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <InputField
                  label="Registration Open"
                  name="regStartDate"
                  value={formData.regStartDate}
                  onChange={handleInputChange}
                  type="date"
                  icon={<CalendarDays size={18} />}
                />
                <InputField
                  label="Registration Close"
                  name="regEndDate"
                  value={formData.regEndDate}
                  onChange={handleInputChange}
                  type="date"
                  icon={<CalendarDays size={18} />}
                />
                <InputField
                  label="Max Capacity"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="Enter max participants"
                  icon={<Users size={18} />}
                />
                <InputField
                  label="Entry Fee (PHP)"
                  name="entryFee"
                  value={formData.entryFee}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="Enter fee amount in PHP"
                  icon={<CircleDollarSign size={18} />}
                />
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight border-b pb-3 border-gray-100">
                Allowed Competition Categories
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleCategoryToggle("allowKata")}
                  className={`rounded-2xl border px-5 py-4 text-left transition ${
                    formData.allowKata
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-gray-200 bg-white text-gray-500"
                  }`}
                >
                  <p className="text-sm font-bold uppercase tracking-wider">Kata</p>
                  <p className="mt-1 text-xs font-medium">
                    {formData.allowKata ? "Players can join Kata." : "Kata is disabled."}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryToggle("allowKumite")}
                  className={`rounded-2xl border px-5 py-4 text-left transition ${
                    formData.allowKumite
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-gray-200 bg-white text-gray-500"
                  }`}
                >
                  <p className="text-sm font-bold uppercase tracking-wider">Kumite</p>
                  <p className="mt-1 text-xs font-medium">
                    {formData.allowKumite ? "Players can join Kumite." : "Kumite is disabled."}
                  </p>
                </button>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight border-b pb-3 border-gray-100">
                Rules & Guidelines
              </h2>
              <div className="grid grid-cols-1 gap-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-0.5 ml-1">
                    Rules
                  </label>
                  <textarea
                    name="rules"
                    value={formData.rules}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm text-sm resize-none"
                    placeholder="Enter tournament rules, match format, safety reminders, and other guidelines..."
                  />
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="flex justify-between items-center gap-4 pt-6 border-t border-gray-100">
              <button 
                onClick={() => router.back()} 
                className="h-12 px-8 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition font-bold text-sm tracking-wide active:scale-[0.99]"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate} 
                disabled={isSubmitting}
                className="h-12 px-8 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all font-bold text-sm tracking-wide shadow-md shadow-red-600/10 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? "Creating Configuration..." : "Create Tournament"}
              </button>
            </div>
          </div>

          {/* PREVIEW PANEL */}
          <aside className="bg-white/95 rounded-[2rem] shadow-xl shadow-gray-200/50 p-6 border border-gray-100/50 backdrop-blur-sm h-fit space-y-6 lg:sticky lg:top-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">
              Live Registry Preview
            </h2>
            
            <div className="flex flex-col items-center gap-4 pb-4">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shadow-sm border border-red-100/50">
                <Zap size={28} />
              </div>
              <div className="text-center w-full px-2">
                <p className={`text-xl font-extrabold tracking-tight truncate ${formData.name ? "text-gray-900" : "text-gray-300 italic font-medium"}`}>
                  {formData.name || "Untitled Tournament"}
                </p>
                <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-500 text-white">
                  Draft Stage
                </span>
              </div>
            </div>

            <div className="pt-2">
              <PreviewItem icon={<Search size={15}/>} label="Sport" value={formData.sport || "Not Specified"} />
              <PreviewItem icon={<CalendarDays size={15}/>} label="Date" value={formData.startDate || "Not Specified"} />
              <PreviewItem icon={<PlusCircle size={15}/>} label="Venue" value={formData.venue || "Not Specified"} />
              <PreviewItem icon={<MapPin size={15}/>} label="Location" value={formData.location || "Not Specified"} />
              <PreviewItem icon={<Users size={15}/>} label="Capacity" value={formData.maxParticipants || "Not Specified"} />
              <PreviewItem
                icon={<CircleDollarSign size={15} />}
                label="Fee"
                value={formData.entryFee ? `PHP ${formData.entryFee}` : "Not Specified"}
              />
              <PreviewItem
                icon={<Search size={15} />}
                label="Allowed"
                value={formatAllowedCategories(formData.allowKata, formData.allowKumite)}
              />
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
