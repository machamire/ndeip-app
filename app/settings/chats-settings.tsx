import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';

const CHAT_SETTINGS = [
    { title: 'Enter Key Sends', value: false, type: 'toggle' },
    { title: 'Media Visibility', value: true, type: 'toggle' },
    { title: 'Font Size', value: 'Medium', type: 'select' },
    { title: 'Wallpaper', value: 'Default', type: 'select' },
    { title: 'Chat Backup', value: 'Daily', type: 'select' },
    { title: 'Archive All Chats', value: '', type: 'nav' },
];

export default function ChatsSettingsScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];
    const cardBg = isDark ? Glass.dark.background : Glass.light.background;
    const borderC = isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle;

    return (
        <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={{ paddingBottom: 60 }}>
            <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>CHAT PREFERENCES</Text>
            <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderC }]}>
                {CHAT_SETTINGS.map((item, i) => (
                    <TouchableOpacity key={i} style={[styles.row, i < CHAT_SETTINGS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]} activeOpacity={item.type === 'toggle' ? 1 : 0.6}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.rowTitle, { color: colors.text }]}>{item.title}</Text>
                            {item.type === 'select' && <Text style={[styles.rowValue, { color: NDEIP_COLORS.gray[500] }]}>{item.value as string}</Text>}
                        </View>
                        {item.type === 'toggle' ? (
                            <Switch value={item.value as boolean} trackColor={{ false: NDEIP_COLORS.gray[700], true: NDEIP_COLORS.primaryTeal }} thumbColor="#fff" style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }} />
                        ) : (
                            <FontAwesome name="chevron-right" size={12} color={NDEIP_COLORS.gray[600]} style={{ opacity: 0.5 }} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    sectionLabel: { ...Typography.presets.sectionLabel as any, paddingHorizontal: Spacing.screenHorizontal, marginBottom: 8, marginTop: 16 },
    card: { marginHorizontal: Spacing.screenHorizontal, borderRadius: Radii.card, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    rowTitle: { fontSize: 15, fontWeight: '500' },
    rowValue: { fontSize: 13, marginTop: 2 },
});
