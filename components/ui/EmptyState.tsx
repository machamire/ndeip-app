import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { NDEIP_COLORS } from '@/constants/Colors';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';

type EmptyStateVariant = 'chats' | 'calls' | 'stories' | 'messages' | 'search' | 'gallery';

interface EmptyStateProps {
    variant: EmptyStateVariant;
    isDark?: boolean;
    onAction?: () => void;
    actionLabel?: string;
}

const VARIANTS: Record<EmptyStateVariant, {
    icon: string;
    title: string;
    subtitle: string;
    gradientColors: string[];
}> = {
    chats: {
        icon: 'comments',
        title: 'No conversations yet',
        subtitle: 'Start a conversation by tapping the\npencil button below',
        gradientColors: [NDEIP_COLORS.primaryTeal, NDEIP_COLORS.electricBlue],
    },
    calls: {
        icon: 'phone',
        title: 'No call history',
        subtitle: 'Your calls will appear here.\nTap the phone button to start a call',
        gradientColors: ['#1B4D3E', '#0D7C5F'],
    },
    stories: {
        icon: 'camera',
        title: 'No stories right now',
        subtitle: 'When your contacts share stories,\nthey\'ll appear here',
        gradientColors: [NDEIP_COLORS.electricBlue, '#6B5CFF'],
    },
    messages: {
        icon: 'paper-plane',
        title: 'Start the conversation',
        subtitle: 'Send a message to get started.\nMessages are end-to-end encrypted',
        gradientColors: [NDEIP_COLORS.primaryTeal, NDEIP_COLORS.emerald],
    },
    search: {
        icon: 'search',
        title: 'No results found',
        subtitle: 'Try a different search term\nor adjust your filters',
        gradientColors: [NDEIP_COLORS.gray[600], NDEIP_COLORS.gray[500]],
    },
    gallery: {
        icon: 'image',
        title: 'No media yet',
        subtitle: 'Photos and videos you take\nwill appear here',
        gradientColors: ['#6B5CFF', '#FF6B9D'],
    },
};

export default function EmptyState({ variant, isDark = true, onAction, actionLabel }: EmptyStateProps) {
    const config = VARIANTS[variant];
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Fade in + scale up
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        // Gentle floating animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: -8,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View style={[
            styles.container,
            {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
            },
        ]}>
            {/* Animated icon circle */}
            <Animated.View style={[styles.iconWrapper, { transform: [{ translateY: floatAnim }] }]}>
                <LinearGradient
                    colors={config.gradientColors as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconGradient}
                >
                    <FontAwesome name={config.icon as any} size={32} color="#fff" />
                </LinearGradient>

                {/* Decorative rings */}
                <View style={[styles.ring, styles.ringOuter, { borderColor: config.gradientColors[0] + '15' }]} />
                <View style={[styles.ring, styles.ringInner, { borderColor: config.gradientColors[0] + '25' }]} />
            </Animated.View>

            {/* Text content */}
            <Text style={[styles.title, { color: isDark ? '#F0F4F3' : NDEIP_COLORS.gray[900] }]}>
                {config.title}
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>
                {config.subtitle}
            </Text>

            {/* Optional action button */}
            {onAction && actionLabel && (
                <TouchableOpacity activeOpacity={0.8} onPress={onAction} style={styles.actionBtn}>
                    <LinearGradient
                        colors={config.gradientColors as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.actionGradient}
                    >
                        <Text style={styles.actionText}>{actionLabel}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}

            {/* E2E badge for messaging */}
            {variant === 'messages' && (
                <View style={styles.e2eBadge}>
                    <FontAwesome name="lock" size={10} color={NDEIP_COLORS.gray[600]} />
                    <Text style={styles.e2eText}>End-to-end encrypted</Text>
                </View>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    iconWrapper: {
        position: 'relative',
        marginBottom: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ring: {
        position: 'absolute',
        borderWidth: 1.5,
        borderRadius: 999,
    },
    ringOuter: {
        width: 120,
        height: 120,
    },
    ringInner: {
        width: 100,
        height: 100,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 20,
    },
    actionBtn: {
        marginTop: 4,
    },
    actionGradient: {
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 24,
    },
    actionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    e2eBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        opacity: 0.6,
    },
    e2eText: {
        color: NDEIP_COLORS.gray[600],
        fontSize: 11,
        fontWeight: '500',
    },
});
