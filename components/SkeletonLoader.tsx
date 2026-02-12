/**
 * SkeletonLoader — Branded shimmer loading state components
 * 
 * Uses the NDEIP design system glassmorphism and warm charcoal palette
 * to create premium-feeling loading placeholders.
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { NDEIP_COLORS } from '@/constants/Colors';
import { Radii, Glass } from '@/constants/ndeipBrandSystem';

// ─── Shimmer Animation ───────────────────────────────────
function useShimmer(duration = 1200) {
    const shimmer = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, {
                    toValue: 1,
                    duration,
                    useNativeDriver: false,
                }),
                Animated.timing(shimmer, {
                    toValue: 0,
                    duration,
                    useNativeDriver: false,
                }),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, [shimmer, duration]);

    return shimmer;
}

// ─── Base Skeleton Block ─────────────────────────────────
interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
    const shimmer = useShimmer();

    const backgroundColor = shimmer.interpolate({
        inputRange: [0, 1],
        outputRange: [
            NDEIP_COLORS.gray[850],
            NDEIP_COLORS.gray[800],
        ],
    });

    return (
        <Animated.View
            style={[
                { width: width as any, height, borderRadius, backgroundColor },
                style,
            ]}
        />
    );
}

// ─── Chat List Skeleton ──────────────────────────────────
export function ChatListSkeleton({ count = 6 }: { count?: number }) {
    return (
        <View style={skelStyles.chatList}>
            {Array.from({ length: count }).map((_, i) => (
                <View key={i} style={skelStyles.chatRow}>
                    <Skeleton width={52} height={52} borderRadius={26} />
                    <View style={skelStyles.chatContent}>
                        <Skeleton width="60%" height={14} />
                        <Skeleton width="85%" height={12} style={{ marginTop: 6 }} />
                    </View>
                    <Skeleton width={28} height={10} borderRadius={4} />
                </View>
            ))}
        </View>
    );
}

// ─── Story List Skeleton ─────────────────────────────────
export function StoryListSkeleton({ count = 4 }: { count?: number }) {
    return (
        <View style={skelStyles.storyRow}>
            {Array.from({ length: count }).map((_, i) => (
                <View key={i} style={skelStyles.storyItem}>
                    <Skeleton width={72} height={72} borderRadius={36} />
                    <Skeleton width={48} height={10} borderRadius={4} style={{ marginTop: 6 }} />
                </View>
            ))}
        </View>
    );
}

// ─── Message Skeleton ────────────────────────────────────
export function MessageSkeleton({ count = 5 }: { count?: number }) {
    return (
        <View style={skelStyles.messageList}>
            {Array.from({ length: count }).map((_, i) => {
                const sent = i % 3 === 1;
                const width = 120 + (i % 4) * 40;
                return (
                    <View key={i} style={[skelStyles.messageRow, sent && skelStyles.messageRowSent]}>
                        <Skeleton width={width} height={38} borderRadius={18} />
                    </View>
                );
            })}
        </View>
    );
}

// ─── Card Skeleton ───────────────────────────────────────
export function CardSkeleton() {
    return (
        <View style={skelStyles.card}>
            <View style={skelStyles.cardHeader}>
                <Skeleton width={40} height={40} borderRadius={12} />
                <View style={skelStyles.cardHeaderText}>
                    <Skeleton width="50%" height={14} />
                    <Skeleton width="30%" height={10} style={{ marginTop: 4 }} />
                </View>
            </View>
            <Skeleton width="100%" height={120} borderRadius={Radii.card} style={{ marginTop: 12 }} />
        </View>
    );
}

const skelStyles = StyleSheet.create({
    chatList: {
        paddingHorizontal: 20,
        paddingTop: 12,
        gap: 16,
    },
    chatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    chatContent: {
        flex: 1,
    },
    storyRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 14,
    },
    storyItem: {
        alignItems: 'center',
        width: 74,
    },
    messageList: {
        paddingHorizontal: 12,
        paddingVertical: 16,
        gap: 6,
    },
    messageRow: {
        flexDirection: 'row',
    },
    messageRowSent: {
        justifyContent: 'flex-end',
    },
    card: {
        marginHorizontal: 20,
        padding: 16,
        borderRadius: Radii.card,
        backgroundColor: Glass.dark.background,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Glass.dark.borderSubtle,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cardHeaderText: {
        flex: 1,
    },
});
