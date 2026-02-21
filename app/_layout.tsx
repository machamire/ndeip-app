import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import 'react-native-reanimated';
import LoadingScreen from '@/components/LoadingScreen';

import { useColorScheme } from '@/components/useColorScheme';
import { MeshThemeProvider } from '@/hooks/useMeshTheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import CallNotification from '@/components/calls/CallNotification';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/auth/login' as any);
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, isLoading, segments]);

  return null;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      // Show our custom loading screen for a smooth minimum display
      const timer = setTimeout(() => setShowSplash(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <RootLayoutNav />
      <LoadingScreen visible={showSplash} />
    </>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // ─── Resume Loading Overlay ──────────────────────────
  const [showResumeOverlay, setShowResumeOverlay] = useState(false);
  const lastBackgroundTime = useRef<number | null>(null);
  const RESUME_THRESHOLD = 15000; // 15 seconds

  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'background') {
        lastBackgroundTime.current = Date.now();
      } else if (nextState === 'active' && lastBackgroundTime.current) {
        const elapsed = Date.now() - lastBackgroundTime.current;
        if (elapsed > RESUME_THRESHOLD) {
          setShowResumeOverlay(true);
          setTimeout(() => setShowResumeOverlay(false), 800);
        }
        lastBackgroundTime.current = null;
      }
    };
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, []);

  // ─── Simulated incoming call ─────────────────────────
  const [incomingCall, setIncomingCall] = useState<{ name: string; type: string } | null>(null);

  useEffect(() => {
    // Simulate an incoming call after 30s for demo purposes
    const timer = setTimeout(() => {
      setIncomingCall({ name: 'Thandi Nkosi', type: 'voice' });
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  const handleAnswer = useCallback(() => {
    if (incomingCall) {
      setIncomingCall(null);
      router.push({ pathname: '/call', params: { id: '3', name: incomingCall.name, type: incomingCall.type } } as any);
    }
  }, [incomingCall, router]);

  const handleDecline = useCallback(() => {
    setIncomingCall(null);
  }, []);

  return (
    <AuthProvider>
      <MeshThemeProvider>
        <ThemeProvider value={DarkTheme}>
          <AuthGate />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="chat" options={{ headerShown: false }} />
            <Stack.Screen name="call" options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="story" options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen name="features" options={{ headerShown: false }} />
            <Stack.Screen name="gallery" options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="editor" options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="calls" options={{ headerShown: false }} />
            <Stack.Screen name="villages" options={{ headerShown: false }} />
            <Stack.Screen name="legal" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>

          {/* Global Incoming Call Overlay */}
          {incomingCall && (
            <CallNotification
              visible={true}
              caller={{ id: '3', name: incomingCall.name, avatar: null }}
              callType={incomingCall.type}
              onAnswer={handleAnswer}
              onDecline={handleDecline}
              onMessage={() => setIncomingCall(null)}
              onRemindLater={() => setIncomingCall(null)}
            />
          )}

          {/* Resume Loading Overlay */}
          <LoadingScreen visible={showResumeOverlay} />
        </ThemeProvider>
      </MeshThemeProvider>
    </AuthProvider>
  );
}
