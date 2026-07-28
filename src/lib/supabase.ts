import { createClient } from '@supabase/supabase-js';

// Supabase configuration for Campus2Career
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Database operations via Supabase will fail.');
}

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
