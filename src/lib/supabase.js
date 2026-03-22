import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

export const initSupabase = (url, anonKey) => {
  supabaseInstance = createClient(url, anonKey);
  return supabaseInstance;
};

export const getSupabase = () => {
  if (!supabaseInstance) {
    const url = localStorage.getItem('supabaseUrl');
    const anonKey = localStorage.getItem('supabaseAnonKey');
    if (url && anonKey) {
      supabaseInstance = createClient(url, anonKey);
    }
  }
  return supabaseInstance;
};

export const clearSupabase = () => {
  supabaseInstance = null;
  localStorage.removeItem('supabaseUrl');
  localStorage.removeItem('supabaseAnonKey');
};
