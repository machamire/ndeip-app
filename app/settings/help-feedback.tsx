import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NDEIP_COLORS } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function HelpFeedbackScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* App Icon */}
            <View style={styles.heroSection}>
                <View style={styles.appIconContainer}>
                    <Text style={styles.appIconText}>
                        <Text style={{ color: NDEIP_COLORS.primaryTeal }}>ndei</Text>
                        <Text style={{ color: NDEIP_COLORS.electricBlue }}>p</Text>
                    </Text>
                </View>
                <Text style={styles.appName}>ndeip</Text>
                <Text style={styles.appVersion}>Version 1.0.0</Text>
            </View>

            {/* Menu Items */}
            {[
                { icon: 'life-ring', label: 'Help Center', subtitle: 'Get help, contact us' },
                { icon: 'comment-o', label: 'Send feedback', subtitle: 'Report technical issues' },
                { icon: 'file-text-o', label: 'Terms and Privacy Policy' },
                { icon: 'flag-o', label: 'Channel reports' },
                { icon: 'code', label: 'Licenses' },
            ].map((item, i) => (
                <TouchableOpacity key={i} style={styles.item} activeOpacity={0.7}>
                    <FontAwesome name={item.icon as any} size={16} color={NDEIP_COLORS.primaryTeal} style={{ width: 24 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.itemLabel}>{item.label}</Text>
                        {item.subtitle && <Text style={styles.itemSubtitle}>{item.subtitle}</Text>}
                    </View>
                    <FontAwesome name="chevron-right" size={12} color={NDEIP_COLORS.gray[600]} />
                </TouchableOpacity>
            ))}

            {/* Copyright */}
            <Text style={styles.copyright}>© 2026 ndeip LLC</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0F0F' },
    heroSection: { alignItems: 'center', paddingVertical: 40, gap: 4 },
    appIconContainer: { width: 80, height: 80, borderRadius: 20, backgroundColor: 'rgba(0,59,59,0.2)', borderWidth: 2, borderColor: NDEIP_COLORS.primaryTeal, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    appIconText: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
    appName: { fontSize: 20, fontWeight: '800', color: '#F0F4F4' },
    appVersion: { fontSize: 13, color: NDEIP_COLORS.gray[500] },
    item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.04)' },
    itemLabel: { fontSize: 16, fontWeight: '500', color: '#D8E0E0' },
    itemSubtitle: { fontSize: 13, color: NDEIP_COLORS.gray[500], marginTop: 2 },
    copyright: { fontSize: 12, color: NDEIP_COLORS.gray[600], textAlign: 'center', paddingTop: 32 },
});
