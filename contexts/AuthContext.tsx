import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock user type for local development
interface User {
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
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo user for local testing
const DEMO_USER: User = {
    id: 'demo-user-001',
    email: 'demo@ndeip.com',
    display_name: 'Roy M',
    avatar_url: null,
    about: 'Hey there! I am using ndeip.',
    phone: '+1 (555) 234-5678',
    links: [],
    dnd_mode: 'available',
    quiet_hours_start: '22:00',
    quiet_hours_end: '07:00',
    top3_contacts: [],
    created_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const stored = await AsyncStorage.getItem('ndeip_user');
            if (stored) {
                setUser(JSON.parse(stored));
            }
        } catch (e) {
            console.warn('Failed to load session:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (email: string, _password: string) => {
        setIsLoading(true);
        try {
            // For local dev, use demo user
            const u = { ...DEMO_USER, email };
            await AsyncStorage.setItem('ndeip_user', JSON.stringify(u));
            setUser(u);
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (email: string, _password: string, displayName: string) => {
        setIsLoading(true);
        try {
            const u: User = {
                ...DEMO_USER,
                id: `user-${Date.now()}`,
                email,
                display_name: displayName,
            };
            await AsyncStorage.setItem('ndeip_user', JSON.stringify(u));
            setUser(u);
        } finally {
            setIsLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        setIsLoading(true);
        try {
            // Placeholder for Google OAuth via Supabase
            const u = { ...DEMO_USER, email: 'google@ndeip.com' };
            await AsyncStorage.setItem('ndeip_user', JSON.stringify(u));
            setUser(u);
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        await AsyncStorage.removeItem('ndeip_user');
        setUser(null);
    };

    const updateProfile = async (updates: Partial<User>) => {
        if (!user) return;
        const updated = { ...user, ...updates };
        await AsyncStorage.setItem('ndeip_user', JSON.stringify(updated));
        setUser(updated);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                signIn,
                signUp,
                signInWithGoogle,
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
