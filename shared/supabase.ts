import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key'

// Only warn if using placeholder values
if (supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn('Using placeholder Supabase URL. Set VITE_SUPABASE_URL for real database access.')
}

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