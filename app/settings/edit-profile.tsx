import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';

export default function EditProfileScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];
    const cardBg = isDark ? Glass.dark.background : Glass.light.background;
    const borderC = isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle;

    return (
        <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={{ paddingBottom: 60 }}>
            {/* Avatar */}
            <View style={styles.avatarSection}>
                <View style={styles.avatarWrap}>
                    <LinearGradient colors={NDEIP_COLORS.gradients.brand as any} style={styles.avatar}>
                        <Text style={styles.avatarText}>Y</Text>
                    </LinearGradient>
                    <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.7}>
                        <LinearGradient colors={NDEIP_COLORS.gradients.brand as any} style={styles.cameraBtnInner}>
                            <FontAwesome name="camera" size={12} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
                <Text style={[styles.changeText, { color: NDEIP_COLORS.primaryTeal }]}>Change photo</Text>
            </View>

            {/* Fields */}
            <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderC }]}>
                {[
                    { label: 'Display Name', value: 'Your Name', icon: 'user' },
                    { label: 'About', value: "Hey there! I'm using ndeip", icon: 'info-circle' },
                    { label: 'Phone', value: '+27 XX XXX XXXX', icon: 'phone' },
                ].map((field, i) => (
                    <TouchableOpacity key={i} style={[styles.fieldRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]} activeOpacity={0.6}>
                        <FontAwesome name={field.icon as any} size={15} color={NDEIP_COLORS.gray[500]} style={{ width: 24 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.fieldLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>{field.label}</Text>
                            <Text style={[styles.fieldValue, { color: colors.text }]}>{field.value}</Text>
                        </View>
                        <FontAwesome name="pencil" size={12} color={NDEIP_COLORS.gray[600]} />
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={[styles.hint, { color: NDEIP_COLORS.gray[600] }]}>
                Your display name and photo are visible to all ndeip users. Your phone number is kept private.
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    avatarSection: { alignItems: 'center', paddingVertical: 24 },
    avatarWrap: { position: 'relative' },
    avatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontSize: 36, fontWeight: '700' },
    cameraBtn: { position: 'absolute', bottom: 0, right: 0 },
    cameraBtnInner: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: NDEIP_COLORS.gray[950] },
    changeText: { fontSize: 14, fontWeight: '600', marginTop: 10 },
    card: {
        marginHorizontal: Spacing.screenHorizontal,
        borderRadius: Radii.card,
        borderWidth: StyleSheet.hairlineWidth,
        overflow: 'hidden',
    },
    fieldRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    fieldLabel: { fontSize: 12, fontWeight: '500', marginBottom: 2 },
    fieldValue: { fontSize: 16 },
    hint: { fontSize: 12, lineHeight: 18, paddingHorizontal: Spacing.screenHorizontal + 4, marginTop: 12 },
});
