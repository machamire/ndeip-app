/**
 * EmojiReactionBar — Horizontal strip of emoji reaction buttons
 * Supports: 👍 ❤️ 😂 😮 🙏 🔥
 */
import React, { useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { NDEIP_COLORS } from '@/constants/Colors';
import { Radii, Glass } from '@/constants/ndeipBrandSystem';

export const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '🙏', '🔥'] as const;

export interface ReactionCounts {
    [emoji: string]: number;
}

interface EmojiReactionBarProps {
    /** Current reaction counts */
    reactions: ReactionCounts;
    /** Emojis the current user has already reacted with */
    userReactions?: string[];
    /** Fires when user taps an emoji */
    onReact: (emoji: string) => void;
    /** Show compact (inline) or full (overlay-style) mode */
    compact?: boolean;
}

export default function EmojiReactionBar({
    reactions,
    userReactions = [],
    onReact,
    compact = true,
}: EmojiReactionBarProps) {
    // Scale animation per emoji
    const scales = useRef(
        Object.fromEntries(REACTION_EMOJIS.map((e) => [e, new Animated.Value(1)]))
    ).current;

    const handlePress = useCallback((emoji: string) => {
        // Quick bounce animation
        const anim = scales[emoji];
        Animated.sequence([
            Animated.timing(anim, { toValue: 1.4, duration: 100, useNativeDriver: true }),
            Animated.spring(anim, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
        ]).start();
        onReact(emoji);
    }, [onReact, scales]);

    const hasAnyReactions = Object.values(reactions).some((c) => c > 0);

    return (
        <View style={[styles.container, compact && styles.containerCompact]}>
            {/* ─── Existing reaction counts (if any) ─── */}
            {hasAnyReactions && (
                <View style={styles.countsRow}>
                    {REACTION_EMOJIS.filter((e) => (reactions[e] || 0) > 0).map((emoji) => {
                        const isUserReacted = userReactions.includes(emoji);
                        return (
                            <TouchableOpacity
                                key={emoji}
                                onPress={() => handlePress(emoji)}
                                activeOpacity={0.7}
                                style={[styles.countChip, isUserReacted && styles.countChipActive]}
                            >
                                <Animated.Text
                                    style={[styles.countEmoji, { transform: [{ scale: scales[emoji] }] }]}
                                >
                                    {emoji}
                                </Animated.Text>
                                <Text style={[styles.countNum, isUserReacted && styles.countNumActive]}>
                                    {reactions[emoji]}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            {/* ─── Reaction picker strip ─── */}
            {!compact && (
                <View style={styles.pickerRow}>
                    {REACTION_EMOJIS.map((emoji) => (
                        <TouchableOpacity
                            key={emoji}
                            onPress={() => handlePress(emoji)}
                            activeOpacity={0.7}
                            style={styles.pickerBtn}
                        >
                            <Animated.Text
                                style={[styles.pickerEmoji, { transform: [{ scale: scales[emoji] }] }]}
                            >
                                {emoji}
                            </Animated.Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 6,
    },
    containerCompact: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    countsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    countChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    countChipActive: {
        backgroundColor: 'rgba(27,77,62,0.15)',
        borderColor: 'rgba(27,77,62,0.3)',
    },
    countEmoji: { fontSize: 14 },
    countNum: {
        color: NDEIP_COLORS.gray[500],
        fontSize: 12,
        fontWeight: '600',
    },
    countNumActive: {
        color: NDEIP_COLORS.primaryTeal,
    },
    pickerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: Glass.dark.background,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: Glass.dark.borderSubtle,
    },
    pickerBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickerEmoji: { fontSize: 22 },
});
