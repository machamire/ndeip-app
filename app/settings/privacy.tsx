import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';

const PRIVACY_SETTINGS = [
    { title: 'Last Seen', value: 'Everyone', type: 'select' },
    { title: 'Profile Photo', value: 'My Contacts', type: 'select' },
    { title: 'About', value: 'Everyone', type: 'select' },
    { title: 'Groups', value: 'Everyone', type: 'select' },
    { title: 'Read Receipts', value: true, type: 'toggle' },
    { title: 'Online Status', value: true, type: 'toggle' },
];

const SECURITY = [
    { title: 'Blocked Contacts', value: '', type: 'nav' },
    { title: 'Fingerprint Lock', value: false, type: 'toggle' },
    { title: 'Screen Lock', value: 'None', type: 'select' },
];

export default function PrivacyScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];
    const cardBg = isDark ? Glass.dark.background : Glass.light.background;
    const borderC = isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle;

    const renderRow = (item: any, i: number, isLast: boolean) => (
        <TouchableOpacity
            key={i}
            style={[styles.row, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]}
            activeOpacity={item.type === 'toggle' ? 1 : 0.6}
        >
            <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>{item.title}</Text>
                {item.type === 'select' && <Text style={[styles.rowValue, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>{item.value as string}</Text>}
            </View>
            {item.type === 'toggle' && (
                <Switch
                    value={item.value as boolean}
                    trackColor={{ false: NDEIP_COLORS.gray[700], true: NDEIP_COLORS.primaryTeal }}
                    thumbColor="#fff"
                    style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                />
            )}
            {(item.type === 'select' || item.type === 'nav') && (
                <FontAwesome name="chevron-right" size={12} color={NDEIP_COLORS.gray[600]} style={{ opacity: 0.5 }} />
            )}
        </TouchableOpacity>
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={{ paddingBottom: 60 }}>
            <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>VISIBILITY</Text>
            <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderC }]}>
                {PRIVACY_SETTINGS.map((item, i) => renderRow(item, i, i === PRIVACY_SETTINGS.length - 1))}
            </View>
            <Text style={[styles.hint, { color: NDEIP_COLORS.gray[600] }]}>
                These settings control who can see your personal information.
            </Text>

            <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400], marginTop: 24 }]}>SECURITY</Text>
            <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderC }]}>
                {SECURITY.map((item, i) => renderRow(item, i, i === SECURITY.length - 1))}
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
    hint: { fontSize: 12, lineHeight: 18, paddingHorizontal: Spacing.screenHorizontal + 4, marginTop: 10 },
});
