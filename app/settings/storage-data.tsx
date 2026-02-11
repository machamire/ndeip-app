import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NDEIP_COLORS } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function StorageDataScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.sectionHeader}>Storage</Text>
            <TouchableOpacity style={styles.item} activeOpacity={0.7}>
                <FontAwesome name="database" size={16} color={NDEIP_COLORS.primaryTeal} style={{ width: 24 }} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.itemLabel}>Manage storage</Text>
                </View>
                <FontAwesome name="chevron-right" size={12} color={NDEIP_COLORS.gray[600]} />
            </TouchableOpacity>

            <Text style={styles.sectionHeader}>Network</Text>
            {[
                { icon: 'bar-chart', label: 'Network usage' },
                { icon: 'phone', label: 'Use less data for calls', toggle: false },
                { icon: 'globe', label: 'Proxy' },
            ].map((item, i) => (
                <TouchableOpacity key={i} style={styles.item} activeOpacity={0.7}>
                    <FontAwesome name={item.icon as any} size={16} color={NDEIP_COLORS.primaryTeal} style={{ width: 24 }} />
                    <Text style={[styles.itemLabel, { flex: 1 }]}>{item.label}</Text>
                    {item.toggle !== undefined ? (
                        <View style={styles.toggle}><View style={styles.toggleDot} /></View>
                    ) : (
                        <FontAwesome name="chevron-right" size={12} color={NDEIP_COLORS.gray[600]} />
                    )}
                </TouchableOpacity>
            ))}

            <Text style={styles.sectionHeader}>Media quality</Text>
            {[
                { icon: 'cloud-upload', label: 'Upload quality', value: 'HD' },
                { icon: 'cloud-download', label: 'Auto-download quality', value: 'Standard' },
            ].map((item, i) => (
                <TouchableOpacity key={i} style={styles.item} activeOpacity={0.7}>
                    <FontAwesome name={item.icon as any} size={16} color={NDEIP_COLORS.primaryTeal} style={{ width: 24 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.itemLabel}>{item.label}</Text>
                        <Text style={styles.itemValue}>{item.value}</Text>
                    </View>
                    <FontAwesome name="chevron-right" size={12} color={NDEIP_COLORS.gray[600]} />
                </TouchableOpacity>
            ))}

            <Text style={styles.sectionHeader}>Media auto-download</Text>
            <Text style={styles.sectionSubtext}>Choose when to automatically download media</Text>
            {[
                { label: 'Photos', wifi: true, cell: true },
                { label: 'Audio', wifi: true, cell: false },
                { label: 'Video', wifi: true, cell: false },
                { label: 'Documents', wifi: true, cell: true },
            ].map((item, i) => (
                <View key={i} style={styles.mediaItem}>
                    <Text style={styles.mediaLabel}>{item.label}</Text>
                    <View style={styles.mediaOptions}>
                        <View style={[styles.mediaBadge, item.wifi && styles.mediaBadgeActive]}>
                            <Text style={[styles.mediaBadgeText, item.wifi && styles.mediaBadgeTextActive]}>Wi-Fi</Text>
                        </View>
                        <View style={[styles.mediaBadge, item.cell && styles.mediaBadgeActive]}>
                            <Text style={[styles.mediaBadgeText, item.cell && styles.mediaBadgeTextActive]}>Cellular</Text>
                        </View>
                    </View>
                </View>
            ))}

            <TouchableOpacity style={styles.resetButton}>
                <Text style={styles.resetText}>Reset auto-download settings</Text>
            </TouchableOpacity>

            <Text style={styles.footer}>Voice Messages are always automatically downloaded.</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0F0F' },
    sectionHeader: { fontSize: 13, fontWeight: '700', color: NDEIP_COLORS.gray[500], textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 },
    sectionSubtext: { fontSize: 13, color: NDEIP_COLORS.gray[500], paddingHorizontal: 16, paddingBottom: 8 },
    item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.04)' },
    itemLabel: { fontSize: 16, fontWeight: '500', color: '#D8E0E0' },
    itemValue: { fontSize: 13, color: NDEIP_COLORS.gray[500], marginTop: 2 },
    toggle: { width: 46, height: 26, borderRadius: 13, backgroundColor: NDEIP_COLORS.gray[700], justifyContent: 'center', paddingHorizontal: 2 },
    toggleDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
    mediaItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.04)' },
    mediaLabel: { fontSize: 16, fontWeight: '500', color: '#D8E0E0' },
    mediaOptions: { flexDirection: 'row', gap: 8 },
    mediaBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    mediaBadgeActive: { backgroundColor: 'rgba(0,59,59,0.2)', borderColor: NDEIP_COLORS.primaryTeal },
    mediaBadgeText: { fontSize: 12, fontWeight: '600', color: NDEIP_COLORS.gray[500] },
    mediaBadgeTextActive: { color: NDEIP_COLORS.primaryTeal },
    resetButton: { paddingHorizontal: 16, paddingVertical: 16 },
    resetText: { fontSize: 14, color: NDEIP_COLORS.electricBlue, fontWeight: '600' },
    footer: { fontSize: 12, color: NDEIP_COLORS.gray[600], paddingHorizontal: 16, fontStyle: 'italic' },
});
