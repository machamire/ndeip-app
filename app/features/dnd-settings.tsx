import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NDEIP_COLORS } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/contexts/AuthContext';

const DND_MODES = [
    { id: 'available', label: 'Available', description: 'Anyone can reach you', icon: 'circle', color: NDEIP_COLORS.emerald },
    { id: 'be_quiet', label: 'Be Quiet', description: 'Only Top 3 and calls come through', icon: 'moon-o', color: NDEIP_COLORS.gold },
    { id: 'get_busy', label: 'Get Busy', description: 'Only Top 3 calls come through', icon: 'briefcase', color: '#FF8C00' },
    { id: 'do_not_disturb', label: 'Do Not Disturb', description: 'Complete silence — Top 3 still come through', icon: 'minus-circle', color: NDEIP_COLORS.rose },
];

const QUIET_HOURS = [
    { id: 'night', label: 'Night Mode', time: '10:00 PM — 7:00 AM', enabled: true },
    { id: 'work', label: 'Work Hours', time: '9:00 AM — 5:00 PM', enabled: false },
    { id: 'custom', label: 'Custom Schedule', time: 'Tap to configure', enabled: false },
];

export default function DNDSettingsScreen() {
    const { user, updateProfile } = useAuth();
    const [selectedMode, setSelectedMode] = useState(user?.dnd_mode || 'available');

    const handleModeChange = (mode: string) => {
        setSelectedMode(mode);
        updateProfile({ dnd_mode: mode as any });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Current Status */}
            <View style={styles.statusCard}>
                <Text style={styles.statusLabel}>Your current status</Text>
                <View style={styles.currentStatus}>
                    <FontAwesome
                        name={DND_MODES.find(m => m.id === selectedMode)?.icon as any || 'circle'}
                        size={24}
                        color={DND_MODES.find(m => m.id === selectedMode)?.color}
                    />
                    <Text style={[styles.currentStatusText, { color: DND_MODES.find(m => m.id === selectedMode)?.color }]}>
                        {DND_MODES.find(m => m.id === selectedMode)?.label}
                    </Text>
                </View>
            </View>

            {/* Mode Selection */}
            <Text style={styles.sectionHeader}>Choose your status</Text>
            {DND_MODES.map(mode => (
                <TouchableOpacity
                    key={mode.id}
                    style={[styles.modeCard, selectedMode === mode.id && styles.modeCardActive, selectedMode === mode.id && { borderColor: mode.color + '40' }]}
                    onPress={() => handleModeChange(mode.id)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.modeIcon, { backgroundColor: mode.color + '15' }]}>
                        <FontAwesome name={mode.icon as any} size={18} color={mode.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.modeLabel}>{mode.label}</Text>
                        <Text style={styles.modeDescription}>{mode.description}</Text>
                    </View>
                    <View style={[styles.radio, selectedMode === mode.id && { borderColor: mode.color }]}>
                        {selectedMode === mode.id && <View style={[styles.radioInner, { backgroundColor: mode.color }]} />}
                    </View>
                </TouchableOpacity>
            ))}

            <View style={styles.noteCard}>
                <FontAwesome name="star" size={14} color={NDEIP_COLORS.gold} />
                <Text style={styles.noteText}>
                    Your <Text style={styles.noteBold}>Top 3 contacts</Text> can always reach you, regardless of your DND setting.
                </Text>
            </View>

            <Text style={styles.sectionHeader}>Quiet Hours</Text>
            <Text style={styles.sectionSubtext}>Automatically switch modes during scheduled hours</Text>
            {QUIET_HOURS.map(schedule => (
                <TouchableOpacity key={schedule.id} style={styles.scheduleItem} activeOpacity={0.7}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.scheduleLabel}>{schedule.label}</Text>
                        <Text style={styles.scheduleTime}>{schedule.time}</Text>
                    </View>
                    <View style={[styles.toggle, schedule.enabled && styles.toggleActive]}>
                        <View style={[styles.toggleDot, schedule.enabled && styles.toggleDotActive]} />
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: NDEIP_COLORS.gray[950] },
    statusCard: { margin: 16, padding: 20, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center', gap: 12 },
    statusLabel: { fontSize: 11, fontWeight: '700', color: NDEIP_COLORS.gray[500], textTransform: 'uppercase', letterSpacing: 1 },
    currentStatus: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    currentStatusText: { fontSize: 22, fontWeight: '800' },
    sectionHeader: { fontSize: 11, fontWeight: '700', color: NDEIP_COLORS.gray[500], textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 4 },
    sectionSubtext: { fontSize: 13, color: NDEIP_COLORS.gray[500], paddingHorizontal: 16, paddingBottom: 12 },
    modeCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 10, padding: 16, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.05)', gap: 14 },
    modeCardActive: { backgroundColor: 'rgba(255,255,255,0.04)' },
    modeIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    modeLabel: { fontSize: 16, fontWeight: '700', color: NDEIP_COLORS.gray[100] },
    modeDescription: { fontSize: 13, color: NDEIP_COLORS.gray[500], marginTop: 2 },
    radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: NDEIP_COLORS.gray[700], justifyContent: 'center', alignItems: 'center' },
    radioInner: { width: 12, height: 12, borderRadius: 6 },
    noteCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, margin: 16, padding: 14, backgroundColor: NDEIP_COLORS.gold + '08', borderRadius: 14, borderWidth: 1, borderColor: NDEIP_COLORS.gold + '15' },
    noteText: { flex: 1, fontSize: 13, color: NDEIP_COLORS.gray[400], lineHeight: 20 },
    noteBold: { fontWeight: '700', color: NDEIP_COLORS.gold },
    scheduleItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.03)' },
    scheduleLabel: { fontSize: 16, fontWeight: '500', color: NDEIP_COLORS.gray[200] },
    scheduleTime: { fontSize: 13, color: NDEIP_COLORS.gray[500], marginTop: 2 },
    toggle: { width: 46, height: 26, borderRadius: 13, backgroundColor: NDEIP_COLORS.gray[700], justifyContent: 'center', paddingHorizontal: 2 },
    toggleActive: { backgroundColor: NDEIP_COLORS.primaryTeal },
    toggleDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
    toggleDotActive: { alignSelf: 'flex-end' },
});
