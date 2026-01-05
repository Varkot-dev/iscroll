/**
 * SUPABASE CLIENT
 * 
 * This file creates a connection to your Supabase database.
 * Other files import 'supabase' from here to read/write data.
 * 
 * KEY CONCEPTS:
 * - Environment variables: process.env.VARIABLE_NAME reads from .env file
 * - EXPO_PUBLIC_ prefix: Makes the variable available in your app
 * - createClient(): Creates a connection to Supabase
 * 
 * SETUP REQUIRED:
 * 1. Create a Supabase project at supabase.com
 * 2. Create a .env file in your project root with:
 *    EXPO_PUBLIC_SUPABASE_URL=your_url_here
 *    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key_here
 */

import { createClient } from '@supabase/supabase-js';

// Read credentials from environment variables
// These come from the .env file you create
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Check if credentials are missing and show helpful error
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase credentials missing!\n' +
    'Create a .env file in your project root with:\n' +
    'EXPO_PUBLIC_SUPABASE_URL=your_url\n' +
    'EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key\n\n' +
    'Get these from: Supabase Dashboard → Project Settings → API'
  );
}

/**
 * The Supabase client instance
 * 
 * Usage in other files:
 * 
 * import { supabase } from '@/lib/supabase';
 * 
 * // Read data
 * const { data, error } = await supabase
 *   .from('saved_items')
 *   .select('*');
 * 
 * // Insert data
 * const { error } = await supabase
 *   .from('saved_items')
 *   .insert({ title: 'Article Title', wikipedia_id: '12345' });
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

/**
 * Type definitions for our database tables
 * This helps TypeScript know what columns exist
 */
export type SavedItem = {
  id: string;
  wikipedia_id: string;
  title: string;
  extract?: string;        // Short description
  thumbnail_url?: string;  // Image URL
  saved_at: string;        // ISO timestamp
};
