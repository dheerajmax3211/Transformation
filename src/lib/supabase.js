import { createClient } from '@supabase/supabase-js';

// Default credentials — baked in so no setup screen is needed on any device.
const DEFAULT_URL = 'https://wjicbbjgdzntzjldplfy.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqaWNiYmpnZHpudHpqbGRwbGZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NDQzNDksImV4cCI6MjA4OTQyMDM0OX0.GB3C_q3-QPwUoF4tTVihK_40ljMDY34YE7yxFj9FqxE';
export const DEFAULT_GOOGLE_CLIENT_ID = '454595898217-82qa09q2bre58rt3t0k7mohb0iennjr5.apps.googleusercontent.com';

let supabaseInstance = null;

export const initSupabase = (url, anonKey) => {
  supabaseInstance = createClient(url, anonKey);
  return supabaseInstance;
};

export const getSupabase = () => {
  if (!supabaseInstance) {
    // Use localStorage overrides if set, else fall back to built-in defaults.
    const url = localStorage.getItem('supabaseUrl') || DEFAULT_URL;
    const anonKey = localStorage.getItem('supabaseAnonKey') || DEFAULT_ANON_KEY;
    supabaseInstance = createClient(url, anonKey);
  }
  return supabaseInstance;
};

export const clearSupabase = () => {
  supabaseInstance = null;
  localStorage.removeItem('supabaseUrl');
  localStorage.removeItem('supabaseAnonKey');
};
