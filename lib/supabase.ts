import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_BOLT_DATABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_BOLT_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
