"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Define the shape of the database
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {                  // What a row looks like when you READ it
          id: string;
          email: string;
          role: 'player' | 'organizer' | 'admin'; // Restricts the role to these three strings
          created_at: string;
        };
        Insert: {               // What you provide when you CREATE a row
          id: string;
          email: string;
          role: 'player' | 'organizer';
          created_at?: string;  // Optional because DB handles it
        };
        Update: {               // What you provide when you EDIT a row
          id?: string;
          email?: string;
          role?: 'player' | 'organizer';
          created_at?: string;
        };
      };

      player_profiles: {
        Row: {
          id: string;
          email: string;
          gender: string;
          age: number;
          full_name: string;
          dojo: string | null;
          belt_rank: string;
          dob: string;
          instructor: string;
          certificate_url: string | null;
          status: string | null;
        };
        Insert: {
          id: string;
          email: string;
          gender: string;
          age: number
          full_name: string;
          dojo?: string | null;
          belt_rank: string;
          dob: string;
          instructor: string;
          certificate_url?: string | null;
          status?: string | null;
        };
        Update:{
          id?: string;
          email?: string;
          gender?: string;
          age?: number
          full_name?: string;
          dojo?: string | null;
          belt_rank?: string;
          dob?: string;
          instructor?: string;
          certificate_url?: string | null;
          status?: string | null;
        };
      };

      organizer_profiles: {
        Row: {
          id:string;
          username: string;
          dob: string;
          organization_name: string;
          contact_number: string;
          location: string;
          karate_style: string;
          federation: string;
          position: string;
          organization_certificate: string;
          status: string | null;
        };
        Insert: {
          id:string;
          username: string;
          dob: string;
          organization_name: string;
          contact_number: string;
          location: string;
          karate_style: string;
          federation: string;
          position: string;
          organization_certificate?: string | null;
          status: string | null;
        };
        Update: {
          id?:string;
          username?: string;
          dob?: string;
          organization_name?: string;
          contact_number?: string;
          location?: string;
          karate_style?: string;
          federation?: string;
          position?: string;
          organization_certificate?: string | null;
          status?: string | null;
        };
      };

      organizer_tourna: {
        Row: {
          id: string;
          created_at: string;
          organizer: string | null;
          tourna_name: string | null;
          email: string | null;
          organizer_id: string | null;
          tournament_id: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          organizer?: string | null;
          tourna_name?: string | null;
          email?: string | null;
          organizer_id?: string | null;
          tournament_id?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          organizer?: string | null;
          tourna_name?: string | null;
          email?: string | null;
          organizer_id?: string | null;
          tournament_id?: number | null;
        };
      };

      player_tourna: {
        Row: {
          id: string;
          created_at: string;
          username: string | null;
          email: string | null;
          tourna_name: string | null;
          player_id: string | null;
          tournament_id: number | null;
          selected_category: string | null;
          status: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          username?: string | null;
          email?: string | null;
          tourna_name?: string | null;
          player_id?: string | null;
          tournament_id?: number | null;
          selected_category?: string | null;
          status?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          username?: string | null;
          email?: string | null;
          tourna_name?: string | null;
          player_id?: string | null;
          tournament_id?: number | null;
          selected_category?: string | null;
          status?: string | null;
        };
      };

      tournaments: {
        Row: {
          id: number;
          organizer_id: string;
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
          allow_kata: boolean;
          allow_kumite: boolean;
        };
        Insert: {
          id?: number;
          organizer_id: string;
          tournament_name: string;
          sport?: string | null;
          tournament_type?: string | null;
          category?: string | null;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          venue?: string | null;
          location?: string | null;
          reg_start_date?: string | null;
          reg_end_date?: string | null;
          max_participants?: number | null;
          entry_fee?: number | null;
          rules_guidelines?: string | null;
          status?: string | null;
          allow_kata?: boolean;
          allow_kumite?: boolean;
        };
        Update: {
          id?: number;
          organizer_id?: string;
          tournament_name?: string;
          sport?: string | null;
          tournament_type?: string | null;
          category?: string | null;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          venue?: string | null;
          location?: string | null;
          reg_start_date?: string | null;
          reg_end_date?: string | null;
          max_participants?: number | null;
          entry_fee?: number | null;
          rules_guidelines?: string | null;
          status?: string | null;
          allow_kata?: boolean;
          allow_kumite?: boolean;
        };
      };
    };
  };
};

let client: SupabaseClient<Database> | null = null;

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (client) {
    return client;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return client;
}
