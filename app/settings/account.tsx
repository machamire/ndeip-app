import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';

const SECURITY_ITEMS = [
    { title: 'Email', value: 'yo•••@gmail.com', icon: 'envelope', type: 'nav' },
    { title: 'Two-Factor Authentication', value: 'Enabled', icon: 'shield', type: 'nav' },
    { title: 'Passkeys', value: '1 passkey', icon: 'key', type: 'nav' },
    { title: 'Change Password', value: '', icon: 'lock', type: 'nav' },
    { title: 'Security Notifications', value: true, icon: 'bell', type: 'toggle' },
];

const DATA_ITEMS = [
    { title: 'Request My Data', value: '', icon: 'download', type: 'nav' },
    { title: 'Delete Account', value: '', icon: 'trash', type: 'danger' },
];

export default function AccountScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];
    const cardBg = isDark ? Glass.dark.background : Glass.light.background;
    const borderC = isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle;

    return (
        <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={{ paddingBottom: 60 }}>
            <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>SECURITY</Text>
            <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderC }]}>
                {SECURITY_ITEMS.map((item, i) => (
                    <TouchableOpacity key={i} style={[styles.row, i < SECURITY_ITEMS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]} activeOpacity={item.type === 'toggle' ? 1 : 0.6}>
                        <View style={[styles.iconCircle, { backgroundColor: `${NDEIP_COLORS.electricBlue}15` }]}>
                            <FontAwesome name={item.icon as any} size={14} color={NDEIP_COLORS.electricBlue} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.rowTitle, { color: colors.text }]}>{item.title}</Text>
                            {item.value && typeof item.value === 'string' && <Text style={[styles.rowValue, { color: NDEIP_COLORS.gray[500] }]}>{item.value}</Text>}
                        </View>
                        {item.type === 'toggle' ? (
                            <Switch value={item.value as boolean} trackColor={{ false: NDEIP_COLORS.gray[700], true: NDEIP_COLORS.primaryTeal }} thumbColor="#fff" style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }} />
                        ) : (
                            <FontAwesome name="chevron-right" size={12} color={NDEIP_COLORS.gray[600]} style={{ opacity: 0.5 }} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400], marginTop: 24 }]}>YOUR DATA</Text>
            <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderC }]}>
                {DATA_ITEMS.map((item, i) => (
                    <TouchableOpacity key={i} style={[styles.row, i < DATA_ITEMS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]} activeOpacity={0.6}>
                        <View style={[styles.iconCircle, { backgroundColor: item.type === 'danger' ? 'rgba(239,68,68,0.12)' : `${NDEIP_COLORS.amethyst}15` }]}>
                            <FontAwesome name={item.icon as any} size={14} color={item.type === 'danger' ? NDEIP_COLORS.rose : NDEIP_COLORS.amethyst} />
                        </View>
                        <Text style={[styles.rowTitle, { color: item.type === 'danger' ? NDEIP_COLORS.rose : colors.text, flex: 1 }]}>{item.title}</Text>
                        <FontAwesome name="chevron-right" size={12} color={NDEIP_COLORS.gray[600]} style={{ opacity: 0.5 }} />
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
    iconCircle: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    rowTitle: { fontSize: 15, fontWeight: '500' },
    rowValue: { fontSize: 12, marginTop: 2 },
});
