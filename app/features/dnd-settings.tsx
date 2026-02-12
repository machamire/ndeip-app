import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';

const DND_MODES = [
    { key: 'available', icon: 'check-circle', label: 'Available', desc: 'Everyone can reach you', color: NDEIP_COLORS.emerald },
    { key: 'busy', icon: 'clock-o', label: 'Busy', desc: 'Only Top 3 can call', color: NDEIP_COLORS.amber },
    { key: 'dnd', icon: 'moon-o', label: 'Do Not Disturb', desc: 'Silence all except emergencies', color: NDEIP_COLORS.rose },
    { key: 'invisible', icon: 'eye-slash', label: 'Invisible', desc: 'Appear offline to everyone', color: NDEIP_COLORS.gray[500] },
];

const TOP_3_EXCEPTIONS = [
    { name: 'Sarah', id: '1' },
    { name: 'Marcus', id: '2' },
    { name: 'Thandi', id: '3' },
];

export default function DNDSettingsScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const [active, setActive] = useState('available');
    const [quietHours, setQuietHours] = useState(false);

    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];
    const borderC = isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle;

    return (
        <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={{ paddingBottom: 60 }}>
            <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>STATUS MODE</Text>

            {/* 2x2 Grid */}
            <View style={styles.grid}>
                {DND_MODES.map(mode => {
                    const isActive = active === mode.key;
                    return (
                        <TouchableOpacity
                            key={mode.key}
                            onPress={() => setActive(mode.key)}
                            activeOpacity={0.7}
                            style={[styles.modeCard, {
                                borderColor: isActive ? mode.color : borderC,
                                borderWidth: isActive ? 2 : StyleSheet.hairlineWidth,
                                backgroundColor: isActive ? `${mode.color}10` : (isDark ? Glass.dark.background : Glass.light.background),
                            }]}
                        >
                            <FontAwesome name={mode.icon as any} size={24} color={isActive ? mode.color : NDEIP_COLORS.gray[500]} />
                            <Text style={[styles.modeLabel, { color: isActive ? mode.color : colors.text }]}>{mode.label}</Text>
                            <Text style={[styles.modeDesc, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>{mode.desc}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Top 3 Exceptions */}
            <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400], marginTop: 24 }]}>
                EXCEPTIONS — TOP 3
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exceptionsRow}>
                {TOP_3_EXCEPTIONS.map(contact => (
                    <View key={contact.id} style={styles.exceptionItem}>
                        <LinearGradient colors={NDEIP_COLORS.gradients.brand as any} style={styles.exceptionAvatar}>
                            <Text style={styles.exceptionInitial}>{contact.name[0]}</Text>
                        </LinearGradient>
                        <Text style={[styles.exceptionName, { color: isDark ? NDEIP_COLORS.gray[300] : NDEIP_COLORS.gray[600] }]}>{contact.name}</Text>
                    </View>
                ))}
                <TouchableOpacity style={styles.exceptionItem}>
                    <View style={[styles.exceptionAdd, { borderColor: borderC }]}>
                        <FontAwesome name="plus" size={14} color={NDEIP_COLORS.gray[500]} />
                    </View>
                    <Text style={[styles.exceptionName, { color: NDEIP_COLORS.gray[500] }]}>Add</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Quiet Hours */}
            <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400], marginTop: 24 }]}>QUIET HOURS</Text>
            <View style={[styles.quietCard, {
                backgroundColor: isDark ? Glass.dark.background : Glass.light.background,
                borderColor: borderC,
            }]}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.quietTitle, { color: colors.text }]}>Enable Quiet Hours</Text>
                    <Text style={[styles.quietDesc, { color: NDEIP_COLORS.gray[500] }]}>Auto-DND from 10 PM to 7 AM</Text>
                </View>
                <Switch
                    value={quietHours}
                    onValueChange={setQuietHours}
                    trackColor={{ false: NDEIP_COLORS.gray[700], true: NDEIP_COLORS.primaryTeal }}
                    thumbColor="#fff"
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    sectionLabel: { ...Typography.presets.sectionLabel as any, paddingHorizontal: Spacing.screenHorizontal, marginBottom: 12, marginTop: 16 },
    // Grid
    grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.screenHorizontal, gap: 12 },
    modeCard: {
        width: '47%',
        padding: 16,
        borderRadius: Radii.card,
        alignItems: 'center',
        gap: 8,
    },
    modeLabel: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
    modeDesc: { fontSize: 11, textAlign: 'center', lineHeight: 15 },
    // Exceptions
    exceptionsRow: { paddingHorizontal: Spacing.screenHorizontal, gap: 14 },
    exceptionItem: { alignItems: 'center', width: 60 },
    exceptionAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    exceptionInitial: { color: '#fff', fontSize: 18, fontWeight: '600' },
    exceptionName: { fontSize: 11, fontWeight: '500', marginTop: 6 },
    exceptionAdd: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
    // Quiet Hours
    quietCard: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: Spacing.screenHorizontal,
        padding: 16, borderRadius: Radii.card,
        borderWidth: StyleSheet.hairlineWidth,
    },
    quietTitle: { fontSize: 15, fontWeight: '600' },
    quietDesc: { fontSize: 12, marginTop: 2 },
});
