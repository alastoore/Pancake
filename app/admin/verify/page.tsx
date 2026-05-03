"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type VerificationStatus = "pending" | "verified" | "rejected";

type PlayerVerification = {
  id: string;
  name: string;
  dojo: string;
  beltRank: string;
  instructor: string;
  dob: string;
  certificate_url?: string;
  submittedAt?: string;
  status: VerificationStatus;
};

export default function AdminVerifyPage() {
  const supabase = getSupabaseBrowserClient();

  const [players, setPlayers] = useState<PlayerVerification[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH REAL PLAYERS
  useEffect(() => {
    const fetchPlayers = async () => {
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("role", "player")
        .eq("status", "pending");

      if (error) {
        console.error(error.message);
        return;
      }

      const formatted = data.map((p: any) => ({
        id: p.id,
        name: p.full_name,
        dojo: p.dojo,
        beltRank: p.belt_rank,
        instructor: p.instructor,
        dob: p.dob,
        certificate_url: p.certificate_url,
        submittedAt: p.created_at,
        status: p.status,
      }));

      setPlayers(formatted);
      setLoading(false);
    };

    fetchPlayers();
  }, []);

  const pendingCount = useMemo(
    () => players.filter((player) => player.status === "pending").length,
    [players]
  );

  // 🔥 UPDATE STATUS IN DATABASE
  const handleStatusChange = async (
    playerId: string,
    nextStatus: Exclude<VerificationStatus, "pending">
  ) => {
    const { error } = await (supabase as any)
      .from("profiles")
      .update({ status: nextStatus })
      .eq("id", playerId);

    if (error) {
      console.error(error.message);
      alert("Failed to update status");
      return;
    }

    // 🔄 Remove the player from the pending list immediately after approval/rejection
    setPlayers((currentPlayers) =>
      currentPlayers.filter((player) => player.id !== playerId)
    );
  };

  // 🔥 GENERATE SIGNED URL
  const viewCertificate = async (path?: string) => {
    if (!path) return;

    const { data, error } = await supabase.storage
      .from("certificates")
      .createSignedUrl(path, 60);

    if (error) {
      console.error(error.message);
      return;
    }

    window.open(data.signedUrl, "_blank");
  };

  const getStatusClasses = (status: VerificationStatus) => {
    if (status === "verified") {
      return "bg-green-50 text-green-700 border-green-200";
    }

    if (status === "rejected") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  };

  if (loading) {
    return <p className="p-6">Loading players...</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* HEADER */}
        <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
                Admin Verification
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-gray-950">
                Review player belt certificates
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-gray-600">
                Review uploaded certificates and approve or reject players.
              </p>
            </div>

            <div className="rounded-2xl bg-red-50 px-5 py-4 text-right">
              <p className="text-sm text-red-700">Pending reviews</p>
              <p className="text-3xl font-extrabold text-red-600">
                {pendingCount}
              </p>
            </div>
          </div>
        </section>

        {/* PLAYERS */}
        <section className="grid gap-6">
          {players.map((player) => (
            <article
              key={player.id}
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                {/* INFO */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-950">
                      {player.name}
                    </h2>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${getStatusClasses(
                        player.status
                      )}`}
                    >
                      {player.status}
                    </span>
                  </div>

                  <div className="grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-3">
                    <div>
                      <p className="text-gray-500">Dojo / Club</p>
                      <p className="font-semibold">{player.dojo}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Belt Rank</p>
                      <p className="font-semibold">{player.beltRank}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Instructor</p>
                      <p className="font-semibold">{player.instructor}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date of Birth</p>
                      <p className="font-semibold">{player.dob}</p>
                    </div>
                  </div>

                  {/* 🔥 VIEW CERTIFICATE */}
                  {player.certificate_url && (
                    <button
                      onClick={() => viewCertificate(player.certificate_url)}
                      className="text-blue-600 underline text-sm"
                    >
                      View Certificate
                    </button>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="min-w-55 rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-700">
                    Admin Actions
                  </p>

                  <div className="mt-4 flex flex-col gap-3">
                    <button
                      onClick={() =>
                        handleStatusChange(player.id, "verified")
                      }
                      className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      Approve Certificate
                    </button>

                    <button
                      onClick={() =>
                        handleStatusChange(player.id, "rejected")
                      }
                      className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      Reject Submission
                    </button>
                  </div>
                </div>

              </div>
            </article>
          ))}
        </section>

      </div>
    </main>
  );
}

