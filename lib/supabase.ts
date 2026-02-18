/**
 * Supabase client — NDEIP App
 * 
 * Real Supabase client for authentication, database, and real-time.
 * Uses a safe storage adapter that falls back to no-op during SSR.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gubmqxlnoyknkcneesjj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_1NXfHgMZYQGYl-M7ITmP6A_eLs4EGPC';

// ─── SSR-safe storage adapter ─────────────────────────────────
// AsyncStorage accesses `window` on import, which crashes during
// Expo's static rendering (Node.js). We lazily load it only when
// a browser/native runtime is detected.
const noopStorage = {
    getItem: (_key: string) => Promise.resolve(null),
    setItem: (_key: string, _value: string) => Promise.resolve(),
    removeItem: (_key: string) => Promise.resolve(),
};

function getStorage() {
    if (typeof window === 'undefined') return noopStorage;
    try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        return AsyncStorage;
    } catch {
        return noopStorage;
    }
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: getStorage(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

export default supabase;
