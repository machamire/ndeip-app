import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';

const STORAGE_INFO = [
    { label: 'Photos', size: '1.2 GB', color: NDEIP_COLORS.electricBlue },
    { label: 'Videos', size: '3.4 GB', color: NDEIP_COLORS.amethyst },
    { label: 'Documents', size: '256 MB', color: NDEIP_COLORS.amber },
    { label: 'Audio', size: '89 MB', color: NDEIP_COLORS.emerald },
];

const DATA_SETTINGS = [
    { title: 'Use Less Data for Calls', value: 'Off', type: 'select' },
    { title: 'Auto-Download Media', value: 'Wi-Fi Only', type: 'select' },
    { title: 'Upload Quality', value: 'HD', type: 'select' },
    { title: 'Network Stats', value: '', type: 'nav' },
];

export default function StorageDataScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];
    const cardBg = isDark ? Glass.dark.background : Glass.light.background;
    const borderC = isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle;
    const totalGB = 5.0;

    return (
        <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={{ paddingBottom: 60 }}>
            {/* Storage Overview Card */}
            <View style={[styles.overviewCard, { backgroundColor: cardBg, borderColor: borderC }]}>
                <Text style={[styles.overviewTitle, { color: colors.text }]}>Storage Used</Text>
                <Text style={[styles.overviewTotal, { color: NDEIP_COLORS.primaryTeal }]}>{totalGB.toFixed(1)} GB</Text>
                {/* Bar */}
                <View style={styles.storageBar}>
                    {STORAGE_INFO.map((item, i) => (
                        <View key={i} style={[styles.storageSegment, { backgroundColor: item.color, flex: parseFloat(item.size) / totalGB }]} />
                    ))}
                </View>
                {/* Legend */}
                <View style={styles.legend}>
                    {STORAGE_INFO.map((item, i) => (
                        <View key={i} style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                            <Text style={[styles.legendLabel, { color: NDEIP_COLORS.gray[400] }]}>{item.label}</Text>
                            <Text style={[styles.legendSize, { color: colors.text }]}>{item.size}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <TouchableOpacity style={[styles.clearBtn, { borderColor: borderC }]} activeOpacity={0.7}>
                <FontAwesome name="trash-o" size={15} color={NDEIP_COLORS.rose} />
                <Text style={[styles.clearText, { color: NDEIP_COLORS.rose }]}>Clear Cache</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>DATA USAGE</Text>
            <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderC }]}>
                {DATA_SETTINGS.map((item, i) => (
                    <TouchableOpacity key={i} style={[styles.row, i < DATA_SETTINGS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]} activeOpacity={0.6}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.rowTitle, { color: colors.text }]}>{item.title}</Text>
                            {item.value && <Text style={[styles.rowValue, { color: NDEIP_COLORS.gray[500] }]}>{item.value}</Text>}
                        </View>
                        <FontAwesome name="chevron-right" size={12} color={NDEIP_COLORS.gray[600]} style={{ opacity: 0.5 }} />
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    overviewCard: {
        margin: Spacing.screenHorizontal, marginTop: 16,
        padding: 20, borderRadius: Radii.card,
        borderWidth: StyleSheet.hairlineWidth,
    },
    overviewTitle: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
    overviewTotal: { fontSize: 28, fontWeight: '700', marginBottom: 16 },
    storageBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 },
    storageSegment: { borderRadius: 4 },
    legend: { marginTop: 16, gap: 8 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendLabel: { flex: 1, fontSize: 13 },
    legendSize: { fontSize: 13, fontWeight: '600' },
    clearBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginHorizontal: Spacing.screenHorizontal, marginBottom: 8,
        height: 44, borderRadius: Radii.button,
        borderWidth: StyleSheet.hairlineWidth,
    },
    clearText: { fontSize: 14, fontWeight: '600' },
    sectionLabel: { ...Typography.presets.sectionLabel as any, paddingHorizontal: Spacing.screenHorizontal, marginBottom: 8, marginTop: 16 },
    card: { marginHorizontal: Spacing.screenHorizontal, borderRadius: Radii.card, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    rowTitle: { fontSize: 15, fontWeight: '500' },
    rowValue: { fontSize: 13, marginTop: 2 },
});
