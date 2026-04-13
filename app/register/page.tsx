import React from "react";
import Link from "next/link";

export default function RegisterChoicePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-6">
      {/* Top Caption */}
      <h2 className="text-xl md:text-2xl font-medium text-gray-700 mb-10">
        I am creating this account as a/an
      </h2>

      {/* Cards Container */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl justify-center">
        
        {/* Player Card */}
        <Link 
          href="/register/form?role=player"
          className="flex-1 bg-gray-100 p-10 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md hover:scale-105 transition-all group text-center"
        >
          <span className="text-3xl font-bold text-red-600 group-hover:text-red-700">
            Player
          </span>
          <p className="text-gray-500 mt-2 text-sm">Join games and track your stats</p>
        </Link>

        {/* Organizer Card */}
        <Link 
          href="/register/form?role=organizer"
          className="flex-1 bg-gray-100 p-10 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md hover:scale-105 transition-all group text-center"
        >
          <span className="text-3xl font-bold text-red-600 group-hover:text-red-700">
            Organizer
          </span>
          <p className="text-gray-500 mt-2 text-sm">Host events and manage players</p>
        </Link>

      </div>

      {/* Back to Login */}
      <Link href="/login" className="mt-12 text-gray-400 hover:text-gray-600 text-sm underline underline-offset-4">
        Back to login
      </Link>
    </main>
  );
}