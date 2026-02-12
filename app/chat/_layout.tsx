import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// ─── Error Boundary ────────────────────────────────────────
class ChatErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <ChatErrorFallback
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}

function ChatErrorFallback({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  const router = useRouter();
  const bg = NDEIP_COLORS.gray[950];
  const card = Glass.dark.background;
  const border = Glass.dark.border;
  const txt = '#E8EFED';
  const sub = NDEIP_COLORS.gray[400];
  const accent = NDEIP_COLORS.primaryTeal;

  return (
    <View style={[styles.errorContainer, { backgroundColor: bg }]}>
      <View style={[styles.errorCard, { backgroundColor: card, borderColor: border }]}>
        <FontAwesome name="exclamation-triangle" size={40} color={accent} />
        <Text style={[styles.errorTitle, { color: txt }]}>Something went wrong</Text>
        <Text style={[styles.errorMessage, { color: sub }]}>
          {error?.message || 'An unexpected error occurred in the chat.'}
        </Text>

        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: accent }]}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <FontAwesome name="refresh" size={16} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backLink}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={[styles.backText, { color: sub }]}>← Go back to Chats</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Layout ────────────────────────────────────────────────
export default function ChatLayout() {
  return (
    <ChatErrorBoundary>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            title: 'Chat'
          }}
        />
      </Stack>
    </ChatErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorCard: {
    width: '100%',
    maxWidth: 360,
    padding: Spacing.xl,
    borderRadius: Radii.card,
    borderWidth: 1,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600' as any,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: Radii.pill,
    marginBottom: Spacing.md,
  },
  retryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  backLink: {
    paddingVertical: 8,
  },
  backText: {
    fontSize: 14,
  },
});
