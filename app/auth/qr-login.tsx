import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { NDEIP_COLORS } from '@/constants/Colors';
import { Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';

export default function QRLoginScreen() {
    const router = useRouter();

    return (
        <LinearGradient colors={['#0A0F0E', '#111918', '#0A0F0E'] as any} style={styles.container}>
            {/* Back */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
                <FontAwesome name="arrow-left" size={18} color={NDEIP_COLORS.gray[400]} />
            </TouchableOpacity>

            <View style={styles.content}>
                <Text style={styles.title}>Scan QR Code</Text>
                <Text style={styles.subtitle}>Open ndeip on your phone and scan this code to sign in</Text>

                {/* QR Frame */}
                <View style={styles.qrFrame}>
                    <View style={styles.qrPlaceholder}>
                        <FontAwesome name="qrcode" size={120} color={NDEIP_COLORS.gray[700]} />
                    </View>
                    {/* Corner accents */}
                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />
                </View>

                <Text style={styles.hint}>
                    <FontAwesome name="mobile-phone" size={16} color={NDEIP_COLORS.gray[500]} />
                    {'  '}Point your phone camera at this QR code
                </Text>

                <TouchableOpacity style={styles.helpLink} activeOpacity={0.7}>
                    <Text style={styles.helpText}>Need help? Learn how to scan</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    backBtn: {
        width: 44, height: 44, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center',
        marginTop: 50, marginLeft: 16,
    },
    content: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 32, paddingBottom: 80,
    },
    title: { color: '#F0F4F3', fontSize: 24, fontWeight: '700', marginBottom: 8 },
    subtitle: { color: NDEIP_COLORS.gray[500], fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
    qrFrame: {
        width: 240, height: 240,
        backgroundColor: Glass.dark.background,
        borderRadius: Radii.cardLarge,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Glass.dark.borderSubtle,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 32,
        position: 'relative',
    },
    qrPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    corner: {
        position: 'absolute',
        width: 28, height: 28,
        borderColor: NDEIP_COLORS.primaryTeal,
    },
    cornerTL: { top: -1, left: -1, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: Radii.cardLarge },
    cornerTR: { top: -1, right: -1, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: Radii.cardLarge },
    cornerBL: { bottom: -1, left: -1, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: Radii.cardLarge },
    cornerBR: { bottom: -1, right: -1, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: Radii.cardLarge },
    hint: { color: NDEIP_COLORS.gray[500], fontSize: 13, textAlign: 'center' },
    helpLink: { marginTop: 24 },
    helpText: { color: NDEIP_COLORS.primaryTeal, fontSize: 14, fontWeight: '500' },
});
