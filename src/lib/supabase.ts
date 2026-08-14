import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ebwwnpyglbjxmdhhcguv.supabase.co/rest/v1/';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_6PBBbms9yIIuoPsDuw09eg_WYtsH3p1';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


