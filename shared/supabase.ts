import { createClient } from '@supabase/supabase-js'

// Get environment variables from Secrets
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Secrets.')
  throw new Error('Supabase credentials not configured')
}

console.log('✅ Connected to Supabase database for persistent storage')
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Module {
  id: string;
  name: string;
  description: string;
  clearance_level: 'DELTA' | 'GAMMA' | 'BETA' | 'ALPHA';
  created_at: string;
  updated_at: string;
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  director: string;
  rating: number;
  synopsis: string;
  clearance_level: 'DELTA' | 'GAMMA' | 'BETA' | 'ALPHA';
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: string;
  name: string;
  alias: string;
  description: string;
  clearance_level: 'DELTA' | 'GAMMA' | 'BETA' | 'ALPHA';
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  coordinates: string;
  clearance_level: 'DELTA' | 'GAMMA' | 'BETA' | 'ALPHA';
  created_at: string;
  updated_at: string;
}

export interface Technology {
  id: string;
  name: string;
  description: string;
  specifications: string;
  clearance_level: 'DELTA' | 'GAMMA' | 'BETA' | 'ALPHA';
  created_at: string;
  updated_at: string;
}