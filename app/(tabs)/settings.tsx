import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Glass, Shadows } from '@/constants/ndeipBrandSystem';

const SETTINGS_GROUPS = [
    {
        label: 'GENERAL',
        items: [
            { title: 'Account', desc: 'Security, passkeys, email', icon: 'lock', color: NDEIP_COLORS.electricBlue, route: '/settings/account' },
            { title: 'Privacy', desc: 'Last seen, profile photo, groups', icon: 'shield', color: NDEIP_COLORS.primaryTeal, route: '/settings/privacy' },
            { title: 'Notifications', desc: 'Tones, vibrations, alerts', icon: 'bell', color: NDEIP_COLORS.amber, route: '/settings/notifications' },
            { title: 'Chat Settings', desc: 'Wallpaper, font size, history', icon: 'comment', color: NDEIP_COLORS.emerald, route: '/settings/chats-settings' },
        ],
    },
    {
        label: 'DATA',
        items: [
            { title: 'Storage & Data', desc: 'Network usage, auto-download', icon: 'database', color: NDEIP_COLORS.amethyst, route: '/settings/storage-data' },
            { title: 'Linked Devices', desc: 'Manage your devices', icon: 'laptop', color: NDEIP_COLORS.cyan, route: '/settings/linked-devices' },
        ],
    },
    {
        label: 'MORE',
        items: [
            { title: 'Lists', desc: 'Organize your chats', icon: 'list', color: NDEIP_COLORS.gray[400], route: '/settings/lists' },
            { title: 'Starred Messages', desc: 'Your saved messages', icon: 'star', color: NDEIP_COLORS.amber, route: '/settings/starred' },
            { title: 'Help & Feedback', desc: 'FAQ, contact us, report', icon: 'question-circle', color: NDEIP_COLORS.gray[400], route: '/settings/help-feedback' },
        ],
    },
];

export default function SettingsScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const router = useRouter();
    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];

    return (
        <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={{ paddingBottom: 100 }}>

            {/* ─── Profile Card ─── */}
            <TouchableOpacity
                style={[styles.profileCard, {
                    backgroundColor: isDark ? Glass.dark.background : Glass.light.background,
                    borderColor: isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle,
                }]}
                activeOpacity={0.7}
                onPress={() => router.push('/settings/edit-profile' as any)}
            >
                <LinearGradient
                    colors={NDEIP_COLORS.gradients.brand as any}
                    style={styles.profileAvatar}
                >
                    <Text style={styles.profileInitials}>Y</Text>
                </LinearGradient>
                <View style={styles.profileInfo}>
                    <Text style={[styles.profileName, { color: colors.text }]}>Your Name</Text>
                    <Text style={[styles.profileAbout, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>
                        Hey there! I'm using ndeip
                    </Text>
                </View>
                <FontAwesome name="chevron-right" size={14} color={NDEIP_COLORS.gray[600]} />
            </TouchableOpacity>

            {/* ─── Quick Access — DND & Top 5 ─── */}
            <View style={styles.quickAccessRow}>
                <TouchableOpacity
                    style={[styles.quickCard, {
                        backgroundColor: isDark ? Glass.dark.background : Glass.light.background,
                        borderColor: isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle,
                    }]}
                    activeOpacity={0.7}
                    onPress={() => router.push('/features/dnd-settings' as any)}
                >
                    <View style={[styles.quickIcon, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                        <FontAwesome name="moon-o" size={16} color={NDEIP_COLORS.emerald} />
                    </View>
                    <Text style={[styles.quickLabel, { color: colors.text }]}>Do Not Disturb</Text>
                    <Text style={[styles.quickValue, { color: NDEIP_COLORS.emerald }]}>Available</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.quickCard, {
                        backgroundColor: isDark ? Glass.dark.background : Glass.light.background,
                        borderColor: isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle,
                    }]}
                    activeOpacity={0.7}
                    onPress={() => router.push('/features/top3' as any)}
                >
                    <View style={[styles.quickIcon, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                        <FontAwesome name="star" size={16} color={NDEIP_COLORS.amber} />
                    </View>
                    <Text style={[styles.quickLabel, { color: colors.text }]}>Top 5</Text>
                    <Text style={[styles.quickValue, { color: NDEIP_COLORS.amber }]}>5 contacts</Text>
                </TouchableOpacity>
            </View>

            {/* ─── Settings Groups ─── */}
            {SETTINGS_GROUPS.map((group, gi) => (
                <View key={gi} style={styles.settingsGroup}>
                    <Text style={[styles.groupLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>
                        {group.label}
                    </Text>
                    {group.items.map((item, ii) => (
                        <TouchableOpacity
                            key={ii}
                            style={styles.settingsRow}
                            activeOpacity={0.6}
                            onPress={() => router.push(item.route as any)}
                        >
                            <View style={[styles.settingsIconCircle, { backgroundColor: `${item.color}15` }]}>
                                <FontAwesome name={item.icon as any} size={15} color={item.color} />
                            </View>
                            <View style={styles.settingsContent}>
                                <Text style={[styles.settingsTitle, { color: colors.text }]}>{item.title}</Text>
                                <Text style={[styles.settingsDesc, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>{item.desc}</Text>
                            </View>
                            <FontAwesome name="chevron-right" size={12} color={NDEIP_COLORS.gray[600]} style={{ opacity: 0.5 }} />
                        </TouchableOpacity>
                    ))}
                </View>
            ))}

            {/* ─── Footer ─── */}
            <View style={styles.footer}>
                <Image
                    source={require('../../assets/images/ndeip-logo.png')}
                    resizeMode="contain"
                    style={styles.footerLogo}
                />
                <Text style={[styles.footerVersion, { color: NDEIP_COLORS.gray[400] }]}>ndeip v1.0.0</Text>
                <Text style={[styles.footerCredit, { color: NDEIP_COLORS.emerald }]}>Developed by Vana VekuLocation LLC</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    // Profile Card
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: Spacing.screenHorizontal,
        marginTop: 8,
        padding: 16,
        borderRadius: Radii.card,
        borderWidth: StyleSheet.hairlineWidth,
        gap: 14,
    },
    profileAvatar: {
        width: Spacing.components.avatarSizeXL,
        height: Spacing.components.avatarSizeXL,
        borderRadius: Spacing.components.avatarSizeXL / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileInitials: { color: '#fff', fontSize: 28, fontWeight: '700' },
    profileInfo: { flex: 1 },
    profileName: { fontSize: Typography.sizes.title2, fontWeight: '700' },
    profileAbout: { fontSize: Typography.sizes.caption, marginTop: 3 },
    // Quick Access
    quickAccessRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.screenHorizontal,
        gap: 12,
        marginBottom: 8,
    },
    quickCard: {
        flex: 1,
        padding: 14,
        borderRadius: Radii.card,
        borderWidth: StyleSheet.hairlineWidth,
        gap: 8,
    },
    quickIcon: {
        width: Spacing.components.iconCircleSize,
        height: Spacing.components.iconCircleSize,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickLabel: { fontSize: 14, fontWeight: '600' },
    quickValue: { fontSize: 12, fontWeight: '500' },
    // Groups
    settingsGroup: { marginTop: 8 },
    groupLabel: {
        ...Typography.presets.sectionLabel as any,
        paddingHorizontal: Spacing.screenHorizontal,
        marginBottom: 8,
        marginTop: 16,
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.screenHorizontal,
        paddingVertical: 13,
        gap: 14,
    },
    settingsIconCircle: {
        width: Spacing.components.iconCircleSize,
        height: Spacing.components.iconCircleSize,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsContent: { flex: 1 },
    settingsTitle: { fontSize: 15, fontWeight: '500' },
    settingsDesc: { fontSize: 12, marginTop: 2 },
    // Footer
    footer: {
        alignItems: 'center',
        paddingVertical: 32,
        gap: 8,
    },
    footerLogo: { width: 60, height: 24, opacity: 0.7 },
    footerVersion: { fontSize: 11 },
    footerCredit: { fontSize: 10, fontWeight: '400' as any },
});
