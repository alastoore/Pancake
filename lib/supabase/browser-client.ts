"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Define the shape of your database
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {                  // What a row looks like when you READ it
          id: string;
          email: string;
          role: 'player' | 'organizer'; // Restricts the role to these two strings
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
