import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────
export interface User {
    id: string;
    email: string;
    display_name: string;
    avatar_url: string | null;
    about: string;
    phone: string;
    links: string[];
    dnd_mode: 'available' | 'be_quiet' | 'get_busy' | 'do_not_disturb';
    quiet_hours_start: string | null;
    quiet_hours_end: string | null;
    top3_contacts: string[];
    is_online: boolean;
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Default profile shape ────────────────────────────────────
const DEFAULT_PROFILE: Omit<User, 'id' | 'email' | 'created_at'> = {
    display_name: 'New User',
    avatar_url: null,
    about: 'Hey there! I am using ndeip.',
    phone: '',
    links: [],
    dnd_mode: 'available',
    quiet_hours_start: '22:00',
    quiet_hours_end: '07:00',
    top3_contacts: [],
    is_online: false,
};

// ─── Fetch profile from Supabase ──────────────────────────────
async function fetchProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error || !data) {
        console.warn('Failed to fetch profile:', error?.message);
        return null;
    }

    return {
        id: data.id,
        email: data.email,
        display_name: data.display_name,
        avatar_url: data.avatar_url,
        about: data.about || 'Hey there! I am using ndeip.',
        phone: data.phone || '',
        links: data.links || [],
        dnd_mode: data.dnd_mode || 'available',
        quiet_hours_start: data.quiet_hours_start,
        quiet_hours_end: data.quiet_hours_end,
        top3_contacts: data.top3_contacts || [],
        is_online: data.is_online || false,
        created_at: data.created_at,
    };
}

// ─── Provider ─────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check existing session
        supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
            setSession(existingSession);
            if (existingSession?.user) {
                fetchProfile(existingSession.user.id).then((profile) => {
                    setUser(profile);
                    setIsLoading(false);
                });
                // Mark user as online
                supabase.from('profiles').update({ is_online: true }).eq('id', existingSession.user.id);
            } else {
                setIsLoading(false);
            }
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                setSession(newSession);

                if (event === 'SIGNED_IN' && newSession?.user) {
                    const profile = await fetchProfile(newSession.user.id);
                    setUser(profile);
                    // Mark online
                    supabase.from('profiles').update({ is_online: true }).eq('id', newSession.user.id);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (email: string, password: string, displayName: string) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { display_name: displayName },
                },
            });
            if (error) throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        if (user) {
            // Mark offline before signing out
            await supabase.from('profiles').update({ is_online: false, last_seen: new Date().toISOString() }).eq('id', user.id);
        }
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    };

    const updateProfile = async (updates: Partial<User>) => {
        if (!user) return;

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (error) {
            console.error('Failed to update profile:', error.message);
            return;
        }

        // Update local state
        setUser({ ...user, ...updates });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                isLoading,
                isAuthenticated: !!session && !!user,
                signIn,
                signUp,
                signOut,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
}

export default AuthContext;
