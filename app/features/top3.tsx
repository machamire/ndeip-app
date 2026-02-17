import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';
import { useAuth } from '@/contexts/AuthContext';

const CONTACT_POOL = [
    { id: '1', name: 'Sarah Chen' },
    { id: '2', name: 'Marcus Johnson' },
    { id: '3', name: 'Thandi Nkosi' },
    { id: '4', name: 'Kai Chen' },
    { id: '5', name: 'Priya Sharma' },
    { id: '6', name: 'David Williams' },
    { id: '7', name: 'Lerato Moyo' },
];

const rankColors = ['#F59E0B', '#A8B8B3', '#CD7F32', '#10B981', '#2563EB'];

const avatarGrads = [
    [NDEIP_COLORS.primaryTeal, NDEIP_COLORS.electricBlue],
    [NDEIP_COLORS.electricBlue, NDEIP_COLORS.amethyst],
    [NDEIP_COLORS.emerald, NDEIP_COLORS.cyan],
    [NDEIP_COLORS.amber, NDEIP_COLORS.rose],
    [NDEIP_COLORS.cyan, NDEIP_COLORS.electricBlue],
];

export default function Top3Screen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];
    const borderC = isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle;
    const { user, updateProfile } = useAuth();

    // Build slots from auth state
    const savedIds = user?.top3_contacts || [];
    const [slots, setSlots] = useState<(string | null)[]>(() => {
        const initial: (string | null)[] = [];
        for (let i = 0; i < 5; i++) {
            initial.push(savedIds[i] || null);
        }
        return initial;
    });

    const getContact = (id: string) => CONTACT_POOL.find(c => c.id === id);

    const handleRemove = useCallback(async (index: number) => {
        const updated = [...slots];
        updated[index] = null;
        setSlots(updated);
        const ids = updated.filter(Boolean) as string[];
        try {
            await updateProfile({ top3_contacts: ids } as any);
        } catch {
            Alert.alert('Error', 'Failed to update Top 5.');
        }
    }, [slots, updateProfile]);

    const handleAdd = useCallback(async (index: number) => {
        // Find contacts not already in slots
        const used = new Set(slots.filter(Boolean));
        const available = CONTACT_POOL.filter(c => !used.has(c.id));
        if (available.length === 0) {
            Alert.alert('All contacts assigned', 'All available contacts are already in your Top 5.');
            return;
        }
        // For now, pick the first available
        const nextContact = available[0];
        const updated = [...slots];
        updated[index] = nextContact.id;
        setSlots(updated);
        const ids = updated.filter(Boolean) as string[];
        try {
            await updateProfile({ top3_contacts: ids } as any);
        } catch {
            Alert.alert('Error', 'Failed to update Top 5.');
        }
    }, [slots, updateProfile]);

    return (
        <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={{ paddingBottom: 60 }}>
            <Text style={[styles.headerDesc, { color: isDark ? NDEIP_COLORS.gray[400] : NDEIP_COLORS.gray[500] }]}>
                Your Top 5 contacts get priority access — they can reach you even in DND mode and appear first in your chats.
            </Text>

            <View style={styles.slotsContainer}>
                {slots.map((contactId, i) => {
                    const contact = contactId ? getContact(contactId) : null;
                    const filled = !!contact;
                    const initials = filled ? contact!.name.split(' ').map(n => n[0]).join('') : '';

                    return (
                        <View
                            key={i}
                            style={[styles.slotCard, {
                                backgroundColor: isDark ? Glass.dark.background : Glass.light.background,
                                borderColor: borderC,
                            }]}
                        >
                            {/* Rank Badge */}
                            <View style={[styles.rankBadge, { backgroundColor: rankColors[i] }]}>
                                <Text style={styles.rankText}>{i + 1}</Text>
                            </View>

                            {/* Content */}
                            {filled ? (
                                <View style={styles.slotContent}>
                                    <LinearGradient colors={avatarGrads[i] as any} style={styles.slotAvatar}>
                                        <Text style={styles.slotInitials}>{initials}</Text>
                                    </LinearGradient>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.slotName, { color: colors.text }]}>{contact!.name}</Text>
                                        <Text style={[styles.slotMeta, { color: NDEIP_COLORS.gray[500] }]}>Top {i + 1} · Priority access</Text>
                                    </View>
                                    <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(i)}>
                                        <FontAwesome name="times-circle" size={20} color={NDEIP_COLORS.gray[600]} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity style={styles.slotEmpty} onPress={() => handleAdd(i)}>
                                    <View style={[styles.emptyCircle, { borderColor: borderC }]}>
                                        <FontAwesome name="plus" size={20} color={NDEIP_COLORS.gray[500]} />
                                    </View>
                                    <Text style={[styles.emptyLabel, { color: NDEIP_COLORS.gray[500] }]}>Add contact</Text>
                                </TouchableOpacity>
                            )}

                            {/* Drag Handle */}
                            <View style={styles.dragHandle}>
                                <FontAwesome name="bars" size={14} color={NDEIP_COLORS.gray[600]} />
                            </View>
                        </View>
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
    slotsContainer: { paddingHorizontal: Spacing.screenHorizontal, gap: 12 },
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
