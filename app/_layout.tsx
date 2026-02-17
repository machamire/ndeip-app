import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState, useCallback } from 'react';
import 'react-native-reanimated';

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

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();

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
        </ThemeProvider>
      </MeshThemeProvider>
    </AuthProvider>
  );
}
