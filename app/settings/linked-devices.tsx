import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';

const DEVICES = [
    { name: 'MacBook Pro', type: 'laptop', lastActive: 'Active now', active: true },
    { name: 'Chrome Browser', type: 'desktop', lastActive: '2 hours ago', active: false },
];

export default function LinkedDevicesScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];
    const cardBg = isDark ? Glass.dark.background : Glass.light.background;
    const borderC = isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle;

    return (
        <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={{ paddingBottom: 60 }}>
            {/* Link New Device */}
            <TouchableOpacity style={[styles.linkCard, { borderColor: borderC }]} activeOpacity={0.7}>
                <LinearGradient colors={NDEIP_COLORS.gradients.brand as any} style={styles.linkIcon}>
                    <FontAwesome name="plus" size={18} color="#fff" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.linkTitle, { color: colors.text }]}>Link a New Device</Text>
                    <Text style={[styles.linkDesc, { color: NDEIP_COLORS.gray[500] }]}>Use your phone to scan QR code</Text>
                </View>
                <FontAwesome name="chevron-right" size={12} color={NDEIP_COLORS.gray[600]} />
            </TouchableOpacity>

            <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>LINKED DEVICES</Text>
            <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderC }]}>
                {DEVICES.map((device, i) => (
                    <TouchableOpacity key={i} style={[styles.row, i < DEVICES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]} activeOpacity={0.6}>
                        <View style={[styles.deviceIcon, { backgroundColor: `${NDEIP_COLORS.cyan}15` }]}>
                            <FontAwesome name={device.type as any} size={16} color={NDEIP_COLORS.cyan} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.deviceName, { color: colors.text }]}>{device.name}</Text>
                            <Text style={[styles.deviceStatus, { color: device.active ? NDEIP_COLORS.emerald : NDEIP_COLORS.gray[500] }]}>
                                {device.lastActive}
                            </Text>
                        </View>
                        <FontAwesome name="ellipsis-h" size={14} color={NDEIP_COLORS.gray[600]} />
                    </TouchableOpacity>
                ))}
            </View>
            <Text style={[styles.hint, { color: NDEIP_COLORS.gray[600] }]}>
                Linked devices can access your messages. Remove any devices you don't recognize.
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    linkCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        margin: Spacing.screenHorizontal, marginTop: 16,
        padding: 16, borderRadius: Radii.card,
        borderWidth: StyleSheet.hairlineWidth, borderStyle: 'dashed',
    },
    linkIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    linkTitle: { fontSize: 16, fontWeight: '600' },
    linkDesc: { fontSize: 12, marginTop: 2 },
    sectionLabel: { ...Typography.presets.sectionLabel as any, paddingHorizontal: Spacing.screenHorizontal, marginBottom: 8, marginTop: 16 },
    card: { marginHorizontal: Spacing.screenHorizontal, borderRadius: Radii.card, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    deviceIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    deviceName: { fontSize: 15, fontWeight: '600' },
    deviceStatus: { fontSize: 12, marginTop: 2 },
    hint: { fontSize: 12, lineHeight: 18, paddingHorizontal: Spacing.screenHorizontal + 4, marginTop: 10 },
});
