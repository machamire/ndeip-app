/**
 * VillageOnboarding — One-time welcome overlay for first-time village visitors
 * Shows once, persisted via AsyncStorage.
 */
import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { NDEIP_COLORS } from '@/constants/Colors';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';

const { width, height } = Dimensions.get('window');

const BULLETS = [
    { icon: 'newspaper-o' as const, text: 'Noticeboard with announcements, polls & events' },
    { icon: 'microphone' as const, text: 'Clubhouse-style live audio rooms' },
    { icon: 'calendar' as const, text: 'Community events & meetups' },
    { icon: 'comments' as const, text: 'Topic-based channels for focused chats' },
    { icon: 'shield' as const, text: 'Admin moderation & privacy controls' },
];

interface VillageOnboardingProps {
    visible: boolean;
    onDismiss: () => void;
}

export default function VillageOnboarding({ visible, onDismiss }: VillageOnboardingProps) {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.spring(scale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
            ]).start();
        }
    }, [visible]);

    const handleDismiss = () => {
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
            onDismiss();
        });
    };

    if (!visible) return null;

    return (
        <Animated.View style={[styles.overlay, { opacity }]}>
            <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
                {/* Title */}
                <View style={styles.titleRow}>
                    <LinearGradient
                        colors={NDEIP_COLORS.gradients.brand as any}
                        style={styles.titleIcon}
                    >
                        <FontAwesome name="users" size={20} color="rgba(255,255,255,0.9)" />
                    </LinearGradient>
                    <Text style={styles.title}>Welcome to Villages! 🏘️</Text>
                </View>

                <Text style={styles.subtitle}>
                    Villages are community spaces where you can connect, share, and organize with your people.
                </Text>

                {/* Bullets */}
                <View style={styles.bullets}>
                    {BULLETS.map((b, i) => (
                        <View key={i} style={styles.bullet}>
                            <FontAwesome name={b.icon} size={14} color={NDEIP_COLORS.primaryTeal} style={{ width: 20 }} />
                            <Text style={styles.bulletText}>{b.text}</Text>
                        </View>
                    ))}
                </View>

                {/* Got it button */}
                <TouchableOpacity onPress={handleDismiss} activeOpacity={0.85}>
                    <LinearGradient
                        colors={NDEIP_COLORS.gradients.brand as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gotItBtn}
                    >
                        <Text style={styles.gotItText}>Got it!</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    card: {
        width: width - 48,
        maxWidth: 380,
        backgroundColor: NDEIP_COLORS.gray[900],
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(27,77,62,0.2)',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    titleIcon: {
        width: 40, height: 40, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
    },
    title: {
        color: '#fff', fontSize: 20, fontWeight: '700',
        flex: 1,
    },
    subtitle: {
        color: NDEIP_COLORS.gray[400], fontSize: 14, lineHeight: 20,
        marginBottom: 18,
    },
    bullets: { gap: 12, marginBottom: 22 },
    bullet: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    bulletText: {
        color: NDEIP_COLORS.gray[300], fontSize: 13, lineHeight: 18, flex: 1,
    },
    gotItBtn: {
        height: 44, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
    },
    gotItText: {
        color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: 0.3,
    },
});
