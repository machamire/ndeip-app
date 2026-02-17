/**
 * Supabase client placeholder
 * 
 * The @supabase/supabase-js package is not installed yet.
 * Install it before enabling real Supabase integration:
 *   npx expo install @supabase/supabase-js
 * 
 * Then uncomment the real client below and add your credentials.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace with your Supabase project credentials
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Placeholder client — replace with real `createClient` from @supabase/supabase-js
export const supabase = {
    auth: {
        signInWithPassword: async (_creds: any) => ({ data: null, error: new Error('Supabase not configured') }),
        signUp: async (_creds: any) => ({ data: null, error: new Error('Supabase not configured') }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => { } } } }),
    },
    from: (_table: string) => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
    }),
} as any;
