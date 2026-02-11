import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NDEIP_COLORS } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const NOTIFICATION_CATEGORIES = [
    { id: 'message', label: 'Message notifications', desc: 'Sound, Show notifications', toggled: true },
    { id: 'group', label: 'Group notifications', desc: 'Sound, Show notifications', toggled: true },
    { id: 'status', label: 'Status notifications', toggled: true },
    { id: 'reaction', label: 'Reaction notifications', toggled: true },
];

export default function NotificationsScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Disabled Banner */}
            <View style={styles.disabledBanner}>
                <FontAwesome name="bell-slash" size={32} color={NDEIP_COLORS.success} />
                <Text style={styles.disabledTitle}>Notifications are disabled</Text>
                <Text style={styles.disabledText}>Notifications are turned off in your phone settings. Turn them back on so you can choose which notifications you want to get.</Text>
                <TouchableOpacity style={styles.settingsButton}>
                    <Text style={styles.settingsButtonText}>Go to phone settings</Text>
                </TouchableOpacity>
            </View>

            {/* Categories */}
            <Text style={styles.sectionHeader}>Notification categories</Text>
            {NOTIFICATION_CATEGORIES.map((item) => (
                <View key={item.id} style={styles.item}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.itemLabel}>{item.label}</Text>
                        {item.desc && <Text style={styles.itemDesc}>{item.desc}</Text>}
                    </View>
                    <View style={[styles.toggle, item.toggled && styles.toggleActive]}>
                        <View style={[styles.toggleDot, item.toggled && styles.toggleDotActive]} />
                    </View>
                </View>
            ))}

            <Text style={styles.sectionHeader}>Sounds</Text>
            <TouchableOpacity style={styles.item} activeOpacity={0.7}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.itemLabel}>Sound</Text>
                    <Text style={styles.itemDesc}>Default</Text>
                </View>
                <FontAwesome name="chevron-right" size={12} color={NDEIP_COLORS.gray[600]} />
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0F0F' },
    disabledBanner: { alignItems: 'center', padding: 28, margin: 16, backgroundColor: 'rgba(0,229,165,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,229,165,0.1)', gap: 10 },
    disabledTitle: { fontSize: 18, fontWeight: '700', color: '#D8E0E0', textAlign: 'center' },
    disabledText: { fontSize: 13, color: NDEIP_COLORS.gray[400], textAlign: 'center', lineHeight: 20 },
    settingsButton: { backgroundColor: NDEIP_COLORS.success, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 25, marginTop: 4 },
    settingsButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    sectionHeader: { fontSize: 13, fontWeight: '700', color: NDEIP_COLORS.gray[500], textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 },
    item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.04)' },
    itemLabel: { fontSize: 16, fontWeight: '500', color: '#D8E0E0' },
    itemDesc: { fontSize: 13, color: NDEIP_COLORS.gray[500], marginTop: 2 },
    toggle: { width: 46, height: 26, borderRadius: 13, backgroundColor: NDEIP_COLORS.gray[700], justifyContent: 'center', paddingHorizontal: 2 },
    toggleActive: { backgroundColor: NDEIP_COLORS.primaryTeal },
    toggleDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
    toggleDotActive: { alignSelf: 'flex-end' },
});
