import { createClient } from "@supabase/supabase-js";

// From Supabase project API settings
const supabaseUrl = "https://capyrajzfcrtcwwewqzu.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcHlyYWp6ZmNydGN3d2V3cXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMjA5MjUsImV4cCI6MjA2NzY5NjkyNX0.9DLtPmpf1z4bNYa5FcFafkGoTt5V50YPJtQQimdwK4Q";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
