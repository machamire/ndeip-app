import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';

const HISTORY_ACTIONS = [
    { title: 'Export Chat History', desc: 'Save all messages as a file', icon: 'download', color: NDEIP_COLORS.electricBlue },
    { title: 'Clear All Chats', desc: 'Remove messages but keep contacts', icon: 'eraser', color: NDEIP_COLORS.amber },
    { title: 'Delete All Chats', desc: 'Remove all chats and messages', icon: 'trash', color: NDEIP_COLORS.rose },
];

export default function ChatHistoryScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];
    const cardBg = isDark ? Glass.dark.background : Glass.light.background;
    const borderC = isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle;

    return (
        <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={{ paddingBottom: 60 }}>
            <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>CHAT HISTORY</Text>
            <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderC }]}>
                {HISTORY_ACTIONS.map((item, i) => (
                    <TouchableOpacity key={i} style={[styles.row, i < HISTORY_ACTIONS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]} activeOpacity={0.6}>
                        <View style={[styles.iconCircle, { backgroundColor: `${item.color}15` }]}>
                            <FontAwesome name={item.icon as any} size={15} color={item.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.rowTitle, { color: item.color === NDEIP_COLORS.rose ? NDEIP_COLORS.rose : colors.text }]}>{item.title}</Text>
                            <Text style={[styles.rowDesc, { color: NDEIP_COLORS.gray[500] }]}>{item.desc}</Text>
                        </View>
                        <FontAwesome name="chevron-right" size={12} color={NDEIP_COLORS.gray[600]} style={{ opacity: 0.5 }} />
                    </TouchableOpacity>
                ))}
            </View>
            <Text style={[styles.warning, { color: NDEIP_COLORS.gray[600] }]}>
                ⚠️ Deleting chats is permanent and cannot be undone. Export your history first if you need a backup.
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    sectionLabel: { ...Typography.presets.sectionLabel as any, paddingHorizontal: Spacing.screenHorizontal, marginBottom: 8, marginTop: 16 },
    card: { marginHorizontal: Spacing.screenHorizontal, borderRadius: Radii.card, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    iconCircle: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    rowTitle: { fontSize: 15, fontWeight: '600' },
    rowDesc: { fontSize: 12, marginTop: 2 },
    warning: { fontSize: 12, lineHeight: 18, paddingHorizontal: Spacing.screenHorizontal + 4, marginTop: 12 },
});
