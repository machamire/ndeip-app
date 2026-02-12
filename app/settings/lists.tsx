import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';

const LISTS = [
    { name: 'Close Friends', count: 8, icon: 'heart', color: NDEIP_COLORS.rose },
    { name: 'Family', count: 12, icon: 'home', color: NDEIP_COLORS.amber },
    { name: 'Work', count: 24, icon: 'briefcase', color: NDEIP_COLORS.electricBlue },
    { name: 'Muted', count: 3, icon: 'volume-off', color: NDEIP_COLORS.gray[500] },
];

export default function ListsScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];
    const cardBg = isDark ? Glass.dark.background : Glass.light.background;
    const borderC = isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle;

    return (
        <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={{ paddingBottom: 60 }}>
            {/* Create New */}
            <TouchableOpacity style={[styles.createCard, { borderColor: borderC }]} activeOpacity={0.7}>
                <View style={[styles.createIcon, { backgroundColor: `${NDEIP_COLORS.primaryTeal}15` }]}>
                    <FontAwesome name="plus" size={16} color={NDEIP_COLORS.primaryTeal} />
                </View>
                <Text style={[styles.createText, { color: NDEIP_COLORS.primaryTeal }]}>Create New List</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>YOUR LISTS</Text>
            <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderC }]}>
                {LISTS.map((list, i) => (
                    <TouchableOpacity key={i} style={[styles.row, i < LISTS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]} activeOpacity={0.6}>
                        <View style={[styles.listIcon, { backgroundColor: `${list.color}15` }]}>
                            <FontAwesome name={list.icon as any} size={14} color={list.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.listName, { color: colors.text }]}>{list.name}</Text>
                            <Text style={[styles.listCount, { color: NDEIP_COLORS.gray[500] }]}>{list.count} contacts</Text>
                        </View>
                        <FontAwesome name="chevron-right" size={12} color={NDEIP_COLORS.gray[600]} style={{ opacity: 0.5 }} />
                    </TouchableOpacity>
                ))}
            </View>
            <Text style={[styles.hint, { color: NDEIP_COLORS.gray[600] }]}>
                Lists help you organize your chats and control who sees your stories.
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    createCard: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        margin: Spacing.screenHorizontal, marginTop: 16,
        padding: 16, borderRadius: Radii.card,
        borderWidth: StyleSheet.hairlineWidth, borderStyle: 'dashed',
    },
    createIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    createText: { fontSize: 15, fontWeight: '600' },
    sectionLabel: { ...Typography.presets.sectionLabel as any, paddingHorizontal: Spacing.screenHorizontal, marginBottom: 8, marginTop: 16 },
    card: { marginHorizontal: Spacing.screenHorizontal, borderRadius: Radii.card, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    listIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    listName: { fontSize: 15, fontWeight: '600' },
    listCount: { fontSize: 12, marginTop: 2 },
    hint: { fontSize: 12, lineHeight: 18, paddingHorizontal: Spacing.screenHorizontal + 4, marginTop: 10 },
});
