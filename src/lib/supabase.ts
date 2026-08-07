import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vmeehkajgihyiwciotfd.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-Y-4HsqRHl8ib38sVFb8gg_kMdc8GzP';

export const supabase = createClient(supabaseUrl, supabaseKey);
