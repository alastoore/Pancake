import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
  style: ["normal", "italic"]
});

export default function RegisterChoicePage() {
  return (
    <main 
      className={`flex min-h-screen flex-col items-center justify-center bg-cover bg-center p-6 ${montserrat.className}`}
      style={{ backgroundImage: "url('/images/bg-arena.png')" }}
    >
      
      {/* Top Titles */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight uppercase mb-2">
          Create Account
        </h1>
        <p className="text-gray-500 text-sm md:text-base font-medium">
          Choose how you want to participate.
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl justify-center z-10">
        
        {/* Player */}
        <Link 
          href="/register/player_form"
          className="flex flex-col bg-cover bg-center p-8 w-full md:w-64 rounded-2xl border-2 border-zinc-800 shadow-xl hover:scale-105 hover:border-red-600 transition-all duration-300"
          style={{ backgroundImage: "url('/images/player-bg.png')", backgroundColor: "#111111" }}
        >
          <div className="mb-6 h-16 w-16 relative">
            <Image 
              src="/images/gi-icon.png" 
              alt="Player Icon" 
              fill 
              className="object-contain" 
            />
          </div>

          <span className="text-xl font-extrabold text-white uppercase tracking-wide mb-2">
            Player
          </span>

          <p className="text-gray-300 text-xs font-medium leading-relaxed">
            Compete in tournament and<br /> track your ranking
          </p>
        </Link>

        {/* Organizer */}
        <Link 
          href="/register/organizer_form"
          className="flex flex-col bg-cover bg-center p-8 w-full md:w-64 rounded-2xl border-2 border-zinc-800 shadow-xl hover:scale-105 hover:border-red-600 transition-all duration-300"
          style={{ backgroundImage: "url('/images/organizer-bg.png')", backgroundColor: "#111111" }}
        >
          <div className="mb-6 h-16 w-16 relative">
            <Image 
              src="/images/trophy-icon.png" 
              alt="Organizer Trophy" 
              fill 
              className="object-contain" 
            />
          </div>

          <span className="text-xl font-extrabold text-white uppercase tracking-wide mb-2">
            Organizer
          </span>

          <p className="text-gray-300 text-xs font-medium leading-relaxed">
            Create and manage tournaments<br /> and events
          </p>
        </Link>

      </div>

      {/* Footer */}
      <div className="mt-16 text-center flex flex-col items-center">
        <h2 
          className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-wide mb-3"
          style={{ 
            textShadow: "0px 0px 8px rgba(255, 255, 255, 0.8), 0px 0px 20px rgba(255, 255, 255, 0.5)" 
          }}
        >
          Enter The Arena
        </h2>

        <p className="text-gray-900 font-extrabold italic text-sm md:text-base tracking-wide">
          Compete. Rise. Dominate.
        </p>
      </div>
    </main>
  );
}