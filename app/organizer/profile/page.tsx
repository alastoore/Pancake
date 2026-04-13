import React from "react";
import Link from "next/link";

// Mock data for management overview
const organizerStats = [
  { label: "Active Events", value: "3" },
  { label: "Total Players", value: "482" },
  { label: "Upcoming Bookings", value: "12" },
  { label: "Partner Venues", value: "5" },
];

const managedEvents = [
  { name: "Summer Basketball League", status: "In Progress", registrations: "120/128" },
  { name: "Regional Volleyball Finals", status: "Upcoming", registrations: "45/60" },
];

export default function OrganizerProfilePage() {
  const organizerName = "Coach Roberto";

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans">
      {/* 1. Management Header */}
      <header className="border-b-2 border-red-600 p-6 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-950">
              Organizer <span className="text-red-600">Dashboard</span>
            </h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Management Portal</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{organizerName}</p>
              <p className="text-xs text-red-600 font-medium">Head Coordinator</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold border-b-4 border-red-600">
              {organizerName.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Management Content Area */}
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
        
        {/* 3. Action Hub (The Big Red Button) */}
        <section className="flex flex-wrap gap-4">
          <button className="bg-red-600 text-white font-black uppercase tracking-tight px-8 py-4 rounded-xl hover:bg-red-700 transition shadow-lg active:scale-95 flex items-center gap-2">
            <span className="text-xl">+</span> Create New Event
          </button>
          <button className="bg-white text-gray-900 border-2 border-gray-900 font-bold uppercase tracking-tight px-8 py-4 rounded-xl hover:bg-gray-50 transition active:scale-95">
            Manage Venues
          </button>
        </section>

        {/* 4. Organizer Analytics Grid */}
        <section>
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Operations Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {organizerStats.map((stat) => (
              <div key={stat.label} className="bg-white p-6 rounded-2xl border-2 border-gray-100">
                <p className="text-xs font-bold text-red-600 uppercase tracking-wider">{stat.label}</p>
                <p className="text-4xl font-black text-gray-950 mt-2">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Live Event Tracking */}
        <section className="bg-gray-50 p-8 rounded-3xl border border-gray-200">
          <h2 className="text-xl font-black text-gray-950 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-red-600 rounded-full"></div>
            Active & Upcoming Events
          </h2>
          
          <div className="grid gap-4">
            {managedEvents.map((event) => (
              <div key={event.name} className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${event.status === 'In Progress' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {event.status}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-2">{event.name}</h3>
                  <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
                    <div className="bg-red-600 h-full w-[85%]"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-medium">Registrations: {event.registrations} players</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 transition">Edit</button>
                  <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition">Roster</button>
                </div>
              </div>
            ))}
            <Link href="/login" className="mtext-red-600 text-sm font-medium hover:text-red-700 hover:underline ml-auto">
                Log out
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}