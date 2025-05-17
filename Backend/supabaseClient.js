// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Correct Supabase URL and anon key
const supabaseUrl = "https://yonnwhmecpcuvyyxajma.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvbm53aG1lY3BjdXZ5eXhham1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTk5MTQsImV4cCI6MjA1ODE5NTkxNH0.p3vYYQoEVQ11AQQ4YiN7BOt4jnEzVgJt-bezQkoImV4";

// Create Supabase client with correct parameter structure
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;