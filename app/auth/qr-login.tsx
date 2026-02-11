import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { NDEIP_COLORS } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function QRLoginScreen() {
    const router = useRouter();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.headerSection}>
                <Image
                    source={require('../../assets/images/ndeip-logo.png')}
                    style={{ width: 100, height: 40, resizeMode: 'contain', marginBottom: 20 }}
                />
                <Text style={styles.title}>Log In with QR Code</Text>
                <Text style={styles.subtitle}>Use your phone to scan a QR code and log in to ndeip on another device</Text>
            </View>

            {/* QR Placeholder */}
            <View style={styles.qrCard}>
                <View style={styles.qrFrame}>
                    <View style={styles.qrPlaceholder}>
                        <FontAwesome name="qrcode" size={120} color={NDEIP_COLORS.gray[600]} />
                    </View>
                    {/* Corner markers */}
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                </View>
                <Text style={styles.qrHint}>Point your camera at a QR code</Text>
            </View>

            {/* Steps */}
            <View style={styles.stepsSection}>
                <Text style={styles.stepsTitle}>How to use:</Text>
                {[
                    'Open ndeip on your phone',
                    'Go to Settings → Linked Devices',
                    'Tap "Link a Device" and scan this code',
                ].map((step, i) => (
                    <View key={i} style={styles.stepRow}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>{i + 1}</Text>
                        </View>
                        <Text style={styles.stepText}>{step}</Text>
                    </View>
                ))}
            </View>

            {/* Security Note */}
            <View style={styles.securityNote}>
                <FontAwesome name="lock" size={13} color={NDEIP_COLORS.emerald} />
                <Text style={styles.securityText}>
                    Your login is end-to-end encrypted. ndeip cannot read your messages.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: NDEIP_COLORS.gray[950] },
    scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40, alignItems: 'center' },
    headerSection: { alignItems: 'center', marginBottom: 28 },
    title: { fontSize: 24, fontWeight: '800', color: NDEIP_COLORS.gray[100], letterSpacing: -0.3 },
    subtitle: { fontSize: 14, color: NDEIP_COLORS.gray[400], textAlign: 'center', marginTop: 8, lineHeight: 20, maxWidth: 300 },

    qrCard: { alignItems: 'center', marginBottom: 32 },
    qrFrame: { width: 240, height: 240, justifyContent: 'center', alignItems: 'center', position: 'relative' },
    qrPlaceholder: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16 },
    corner: { position: 'absolute', width: 28, height: 28, borderColor: NDEIP_COLORS.electricBlue, borderWidth: 3 },
    topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
    topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
    bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
    bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
    qrHint: { fontSize: 13, color: NDEIP_COLORS.gray[500], marginTop: 16 },

    stepsSection: { width: '100%', maxWidth: 340, marginBottom: 28 },
    stepsTitle: { fontSize: 14, fontWeight: '700', color: NDEIP_COLORS.gray[300], marginBottom: 14 },
    stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    stepNumber: { width: 28, height: 28, borderRadius: 8, backgroundColor: NDEIP_COLORS.electricBlue + '15', justifyContent: 'center', alignItems: 'center' },
    stepNumberText: { fontSize: 13, fontWeight: '800', color: NDEIP_COLORS.electricBlue },
    stepText: { flex: 1, fontSize: 14, color: NDEIP_COLORS.gray[300], lineHeight: 20 },

    securityNote: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: NDEIP_COLORS.emerald + '08', borderRadius: 12, borderWidth: 1, borderColor: NDEIP_COLORS.emerald + '15', maxWidth: 340 },
    securityText: { flex: 1, fontSize: 12, color: NDEIP_COLORS.gray[400], lineHeight: 18 },
});
