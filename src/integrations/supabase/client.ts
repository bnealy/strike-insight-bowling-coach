// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://yqexanyhkihrppnwljaq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxZXhhbnloa2locnBwbndsamFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NTI2MDksImV4cCI6MjA2MzUyODYwOX0.nZ5V2L27Tygqt-4yL-9surEDziPFsHjJw7nJxBVbRWU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);