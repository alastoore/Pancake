"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';

// Interface for the Supabase Profile table
interface UserProfile {
  full_name: string;
}

// Interface for the Event data structure
interface TournamentEvent {
  id: number;
  title: string;
  type: string;
  date: string;
  location: string;
  teams: string;
  description: string;
}

export default function EventBrowsing() {
  // State for the authenticated user's name
  const [userName, setUserName] = useState<string>("Loading...");
  
  // State for the event preview modal
  const [previewEvent, setPreviewEvent] = useState<TournamentEvent | null>(null);

  // Mock data for the event listings
  const [events] = useState<TournamentEvent[]>([
    { 
      id: 1, 
      title: 'Taekwondo Open', 
      type: 'Taekwondo', 
      date: 'April 10-15, 2026', 
      location: 'Cebu City, Philippines', 
      teams: '32 teams', 
      description: 'Annual regional championship for all belt levels held at the Cebu City Sports Center.' 
    },
    { 
      id: 2, 
      title: 'Summer Basketball League', 
      type: 'Basketball', 
      date: 'May 05-20, 2026', 
      location: 'Mandaue City, Philippines', 
      teams: '16 teams', 
      description: 'Open category tournament for local community teams with a focus on sportsmanship.' 
    },
    { 
      id: 3, 
      title: 'Chess Grandmaster Invite', 
      type: 'Chess', 
      date: 'June 12, 2026', 
      location: 'Online / Cebu IT Park', 
      teams: '64 players', 
      description: 'A strategic battle featuring top-rated local players in a single-elimination format.' 
    }
  ]);

  useEffect(() => {
    // Initialize the browser-specific Supabase client
    const supabase = getSupabaseBrowserClient();

    const fetchUserProfile = async () => {
      // 1. Identify the current session user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setUserName("Guest");
        return;
      }

      // 2. Fetch only the full_name from the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        setUserName("User");
      } else if (data) {
        // 3. Use the Interface to safely cast the data and update state
        const profile = data as unknown as UserProfile;
        setUserName(profile.full_name);
      }
    };

    fetchUserProfile();
  }, []); // Run once on mount

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header Section */}
      <header className="bg-[#D32F2F] text-white p-4 flex justify-between items-center shadow-md">
        <div className="text-xl font-bold tracking-tight text-white">HuddleUp</div>
        
        <div className="flex items-center gap-3">
          <Link 
            href="/player/profile" 
            className="font-medium hover:text-gray-200 transition-colors cursor-pointer"
          >
            {userName}
          </Link>
          <div className="w-10 h-10 bg-gray-300 rounded-full border-2 border-white overflow-hidden shadow-sm">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} 
              alt="User Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#E53935] to-[#C62828] p-10 text-white">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-2 text-white">Find Tournaments</h1>
          <p className="text-lg opacity-90 mb-6 text-white">Discover and join exciting tournaments near you.</p>
          <div className="relative max-w-lg">
            <input 
              type="text" 
              placeholder="Search tournaments, sports, locations..." 
              className="w-full p-4 pl-6 rounded-full text-gray-800 outline-none shadow-lg focus:ring-2 focus:ring-red-300 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Event Listings Section */}
      <main className="p-8 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Upcoming Tournaments</h2>
        
        <div className="flex flex-col gap-4">
          {events.map((event) => (
            <div 
              key={event.id}
              onClick={() => setPreviewEvent(event)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 cursor-pointer hover:border-red-200 hover:shadow-lg transition-all group"
            >
              <div className="bg-red-50 p-5 rounded-full group-hover:bg-red-100 transition-colors">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg text-gray-900">{event.title}</span>
                  <span className="text-red-600 text-sm font-bold uppercase tracking-wider">{event.type}</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <span className="mr-2 text-red-400">📅</span> {event.date}
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <span className="mr-2 text-red-400">📍</span> {event.location}
                </div>
                <div className="flex items-center justify-end text-gray-700 font-semibold">
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-xs">
                    👥 {event.teams}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Event Preview Modal */}
        {previewEvent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
              <h2 className="text-3xl font-black text-gray-900 mb-1">{previewEvent.title}</h2>
              <p className="text-red-600 font-bold mb-4">{previewEvent.type}</p>
              
              <div className="space-y-3 mb-6 border-l-4 border-red-500 pl-4">
                <p className="text-gray-600 italic">{previewEvent.description}</p>
                <div className="text-sm text-gray-500">
                  <p><strong>Date:</strong> {previewEvent.date}</p>
                  <p><strong>Venue:</strong> {previewEvent.location}</p>
                </div>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewEvent(null);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}