import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { NDEIP_COLORS } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const { width } = Dimensions.get('window');
const QR_SIZE = Math.min(width * 0.55, 240);

const MOCK_DEVICES = [
    { id: '1', name: 'Chrome on Windows', lastActive: 'Active now', icon: 'laptop' },
    { id: '2', name: 'Safari on MacBook', lastActive: 'Last active: 2 hours ago', icon: 'laptop' },
];

export default function LinkedDevicesScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* QR Section */}
            <View style={styles.qrSection}>
                <View style={styles.qrFrame}>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                    <View style={styles.qrPlaceholder}>
                        <FontAwesome name="qrcode" size={100} color={NDEIP_COLORS.primaryTeal} />
                        <View style={styles.centerLogo}>
                            <Text style={{ fontSize: 12, fontWeight: '900', color: NDEIP_COLORS.primaryTeal }}>np</Text>
                        </View>
                    </View>
                </View>
                <Text style={styles.qrTitle}>Scan to log in</Text>
                <Text style={styles.qrDesc}>Scan this QR code from another device to link it to your account.</Text>
            </View>

            {/* Link Button */}
            <TouchableOpacity style={styles.linkButton}>
                <FontAwesome name="plus-circle" size={18} color="#fff" />
                <Text style={styles.linkButtonText}>Link a Device</Text>
            </TouchableOpacity>

            {/* Linked Devices */}
            <Text style={styles.sectionHeader}>Linked devices</Text>
            {MOCK_DEVICES.map(device => (
                <View key={device.id} style={styles.deviceItem}>
                    <View style={styles.deviceIcon}>
                        <FontAwesome name={device.icon as any} size={18} color={NDEIP_COLORS.primaryTeal} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.deviceName}>{device.name}</Text>
                        <Text style={styles.deviceActive}>{device.lastActive}</Text>
                    </View>
                    <TouchableOpacity>
                        <FontAwesome name="times" size={16} color={NDEIP_COLORS.error} />
                    </TouchableOpacity>
                </View>
            ))}

            {/* Security note */}
            <View style={styles.securityNote}>
                <FontAwesome name="shield" size={14} color={NDEIP_COLORS.success} />
                <Text style={styles.securityText}>Your messages are end-to-end encrypted on all linked devices. QR codes are single-use and expire after 60 seconds.</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0F0F' },
    qrSection: { alignItems: 'center', paddingVertical: 32 },
    qrFrame: { width: QR_SIZE + 36, height: QR_SIZE + 36, justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: 20 },
    corner: { position: 'absolute', width: 28, height: 28, borderColor: NDEIP_COLORS.primaryTeal, borderWidth: 3 },
    topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
    topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
    bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
    bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
    qrPlaceholder: { width: QR_SIZE, height: QR_SIZE, backgroundColor: 'rgba(0,59,59,0.12)', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    centerLogo: { position: 'absolute', width: 30, height: 30, borderRadius: 6, backgroundColor: '#0A0F0F', justifyContent: 'center', alignItems: 'center' },
    qrTitle: { fontSize: 18, fontWeight: '700', color: '#F0F4F4', marginBottom: 6 },
    qrDesc: { fontSize: 13, color: NDEIP_COLORS.gray[500], textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
    linkButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginHorizontal: 16, backgroundColor: NDEIP_COLORS.primaryTeal, height: 50, borderRadius: 14 },
    linkButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    sectionHeader: { fontSize: 13, fontWeight: '700', color: NDEIP_COLORS.gray[500], textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, paddingTop: 28, paddingBottom: 8 },
    deviceItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.04)' },
    deviceIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(0,59,59,0.15)', justifyContent: 'center', alignItems: 'center' },
    deviceName: { fontSize: 15, fontWeight: '600', color: '#D8E0E0' },
    deviceActive: { fontSize: 12, color: NDEIP_COLORS.gray[500], marginTop: 2 },
    securityNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, margin: 16, marginTop: 24, padding: 14, backgroundColor: 'rgba(0,229,165,0.06)', borderRadius: 12 },
    securityText: { flex: 1, fontSize: 12, color: NDEIP_COLORS.success, lineHeight: 18 },
});
