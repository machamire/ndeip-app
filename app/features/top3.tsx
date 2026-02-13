import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';

const TOP_5_SLOTS = [
    { rank: 1, name: 'Sarah Chen', filled: true },
    { rank: 2, name: 'Marcus Johnson', filled: true },
    { rank: 3, name: 'Thandi Nkosi', filled: true },
    { rank: 4, name: 'Kai Chen', filled: true },
    { rank: 5, name: null, filled: false },
];

const rankColors = ['#F59E0B', '#A8B8B3', '#CD7F32', '#10B981', '#2563EB']; // Gold, Silver, Bronze, Emerald, Sapphire

export default function Top3Screen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];
    const borderC = isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle;

    return (
        <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={{ paddingBottom: 60 }}>
            <Text style={[styles.headerDesc, { color: isDark ? NDEIP_COLORS.gray[400] : NDEIP_COLORS.gray[500] }]}>
                Your Top 5 contacts get priority access — they can reach you even in DND mode and appear first in your chats.
            </Text>

            <View style={styles.slots}>
                {TOP_5_SLOTS.map((slot, i) => {
                    const avatarGrads = [
                        [NDEIP_COLORS.primaryTeal, NDEIP_COLORS.electricBlue],
                        [NDEIP_COLORS.electricBlue, NDEIP_COLORS.amethyst],
                        [NDEIP_COLORS.emerald, NDEIP_COLORS.cyan],
                        [NDEIP_COLORS.amber, NDEIP_COLORS.rose],
                        [NDEIP_COLORS.cyan, NDEIP_COLORS.electricBlue],
                    ];
                    const initials = slot.filled ? slot.name!.split(' ').map(n => n[0]).join('') : '';

                    return (
                        <TouchableOpacity
                            key={slot.rank}
                            style={[styles.slotCard, {
                                backgroundColor: isDark ? Glass.dark.background : Glass.light.background,
                                borderColor: borderC,
                            }]}
                            activeOpacity={0.7}
                        >
                            {/* Rank Badge */}
                            <View style={[styles.rankBadge, { backgroundColor: rankColors[i] }]}>
                                <Text style={styles.rankText}>{slot.rank}</Text>
                            </View>

                            {/* Content */}
                            {slot.filled ? (
                                <View style={styles.slotContent}>
                                    <LinearGradient colors={avatarGrads[i] as any} style={styles.slotAvatar}>
                                        <Text style={styles.slotInitials}>{initials}</Text>
                                    </LinearGradient>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.slotName, { color: colors.text }]}>{slot.name}</Text>
                                        <Text style={[styles.slotMeta, { color: NDEIP_COLORS.gray[500] }]}>Top {slot.rank} · Priority access</Text>
                                    </View>
                                    <TouchableOpacity style={styles.removeBtn}>
                                        <FontAwesome name="times-circle" size={20} color={NDEIP_COLORS.gray[600]} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.slotEmpty}>
                                    <View style={[styles.emptyCircle, { borderColor: borderC }]}>
                                        <FontAwesome name="plus" size={20} color={NDEIP_COLORS.gray[500]} />
                                    </View>
                                    <Text style={[styles.emptyLabel, { color: NDEIP_COLORS.gray[500] }]}>Add contact</Text>
                                </View>
                            )}

                            {/* Drag Handle */}
                            <View style={styles.dragHandle}>
                                <FontAwesome name="bars" size={14} color={NDEIP_COLORS.gray[600]} />
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <Text style={[styles.hint, { color: NDEIP_COLORS.gray[600] }]}>
                Drag to reorder. Your #1 contact gets premium priority — their messages always appear first.
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerDesc: {
        fontSize: 14, lineHeight: 21,
        paddingHorizontal: Spacing.screenHorizontal,
        paddingVertical: 16,
    },
    slots: { paddingHorizontal: Spacing.screenHorizontal, gap: 12 },
    slotCard: {
        borderRadius: Radii.card,
        borderWidth: StyleSheet.hairlineWidth,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rankBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    slotContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    slotAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    slotInitials: { color: '#fff', fontSize: 17, fontWeight: '600' },
    slotName: { fontSize: 16, fontWeight: '600' },
    slotMeta: { fontSize: 12, marginTop: 2 },
    removeBtn: { padding: 4 },
    slotEmpty: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    emptyCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
    emptyLabel: { fontSize: 15, fontWeight: '500' },
    dragHandle: { padding: 4 },
    hint: { fontSize: 12, lineHeight: 18, paddingHorizontal: Spacing.screenHorizontal + 4, marginTop: 16 },
});
