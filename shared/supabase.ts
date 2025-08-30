import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

// Validate URL format
if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
  console.error('Invalid or missing Supabase URL. Please check your environment variables.')
}

if (!supabaseAnonKey) {
  console.error('Missing Supabase anon key. Please check your environment variables.')
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