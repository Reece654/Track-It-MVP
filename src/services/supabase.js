/*
  supabase.js — Supabase client for Track It.

  Creates one shared Supabase client that the rest of the app can import whenever it needs authentication or database access.

  We need this for Track It for other files (for example login screens) import { supabase } from this module.
  This way we keep URL/key setup in one place and avoids mixed configurations.

  Vite only exposes environment variables that start with VITE_ to the browser. We read those here and pass them into createClient from the official @supabase/supabase-js package. 
  We use the publishable/anon key only, never the secret/service role key, because this code runs in the browser. Real security still comes from Supabase Row Level Security.
*/

import { createClient } from '@supabase/supabase-js'

/*
  Pull the project URL and browser-safe key from the local .env file.
*/

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/*
  Fail early with a clear message if .env is missing or incomplete.
  This saves time when someone clones the repo and forgets to add keys.
*/

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Add a local .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  )
}

/*
  createClient builds the object we use for Auth and database calls.
  Exporting it lets any Track It file reuse the same connection.
*/

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
