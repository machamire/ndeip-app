/**
 * Supabase client — NDEIP App
 * 
 * Real Supabase client for authentication, database, and real-time.
 */
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://gubmqxlnoyknkcneesjj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_1NXfHgMZYQGYl-M7ITmP6A_eLs4EGPC';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

export default supabase;
