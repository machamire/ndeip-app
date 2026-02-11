import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { NDEIP_COLORS } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const MENU_ITEMS = [
    { id: 'lists', label: 'Lists', icon: 'list-ul', route: '/settings/lists', color: NDEIP_COLORS.electricBlue },
    { id: 'starred', label: 'Starred Messages', icon: 'star', route: '/settings/starred', color: NDEIP_COLORS.gold },
    { id: 'chat_history', label: 'Chat History', icon: 'history', route: '/settings/chat-history', color: NDEIP_COLORS.meshCyan },
    { id: 'account', label: 'Account', icon: 'key', route: '/settings/account', color: NDEIP_COLORS.emerald },
    { id: 'privacy', label: 'Privacy', icon: 'lock', route: '/settings/privacy', color: '#9333EA' },
    { id: 'chats', label: 'Chats', icon: 'comments-o', route: '/settings/chats-settings', color: NDEIP_COLORS.primaryTeal },
    { id: 'notifications', label: 'Notifications', icon: 'bell', route: '/settings/notifications', color: NDEIP_COLORS.rose },
    { id: 'storage', label: 'Storage and Data', icon: 'database', route: '/settings/storage-data', color: '#F97316' },
    { id: 'help', label: 'Help', icon: 'question-circle', route: '/settings/help-feedback', color: NDEIP_COLORS.gray[400] },
];

export default function SettingsScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const dndMode = user?.dnd_mode || 'available';
    const dndConfig: any = {
        available: { label: 'Available', icon: 'circle', color: NDEIP_COLORS.emerald },
        be_quiet: { label: 'Be Quiet', icon: 'moon-o', color: NDEIP_COLORS.gold },
        get_busy: { label: 'Get Busy', icon: 'briefcase', color: '#FF8C00' },
        do_not_disturb: { label: 'DND', icon: 'minus-circle', color: NDEIP_COLORS.rose },
    };
    const currentDnd = dndConfig[dndMode];

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Profile Card */}
            <TouchableOpacity
                style={styles.profileCard}
                onPress={() => router.push('/settings/edit-profile' as any)}
                activeOpacity={0.7}
            >
                <View style={styles.profileAvatar}>
                    <Text style={styles.profileAvatarText}>
                        {(user?.name || 'U').charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                    <Text style={styles.profileAbout}>{user?.about || 'Hey there! I\'m using ndeip'}</Text>
                </View>
                <FontAwesome name="chevron-right" size={14} color={NDEIP_COLORS.gray[600]} />
            </TouchableOpacity>

            {/* Quick Settings */}
            <View style={styles.quickRow}>
                <TouchableOpacity
                    style={styles.quickCard}
                    onPress={() => router.push('/features/dnd-settings' as any)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.quickIcon, { backgroundColor: currentDnd.color + '15' }]}>
                        <FontAwesome name={currentDnd.icon} size={16} color={currentDnd.color} />
                    </View>
                    <Text style={styles.quickLabel}>Availability</Text>
                    <Text style={[styles.quickValue, { color: currentDnd.color }]}>{currentDnd.label}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickCard}
                    onPress={() => router.push('/features/top3' as any)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.quickIcon, { backgroundColor: NDEIP_COLORS.gold + '15' }]}>
                        <FontAwesome name="star" size={16} color={NDEIP_COLORS.gold} />
                    </View>
                    <Text style={styles.quickLabel}>Favorites</Text>
                    <Text style={[styles.quickValue, { color: NDEIP_COLORS.gold }]}>Top 3</Text>
                </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <View style={styles.menuSection}>
                {MENU_ITEMS.map(item => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.menuItem}
                        onPress={() => router.push(item.route as any)}
                        activeOpacity={0.65}
                    >
                        <View style={[styles.menuIcon, { backgroundColor: item.color + '12' }]}>
                            <FontAwesome name={item.icon as any} size={15} color={item.color} />
                        </View>
                        <Text style={styles.menuLabel}>{item.label}</Text>
                        <FontAwesome name="chevron-right" size={11} color={NDEIP_COLORS.gray[700]} />
                    </TouchableOpacity>
                ))}
            </View>

            {/* App Info */}
            <View style={styles.appInfo}>
                <Image
                    source={require('../../assets/images/ndeip-logo.png')}
                    style={{ width: 80, height: 32, resizeMode: 'contain', marginBottom: 8 }}
                />
                <Text style={styles.appVersion}>Version 1.0.0</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: NDEIP_COLORS.gray[950] },

    profileCard: {
        flexDirection: 'row', alignItems: 'center', margin: 16, padding: 18, gap: 14,
        backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    profileAvatar: {
        width: 56, height: 56, borderRadius: 18, backgroundColor: NDEIP_COLORS.primaryTeal,
        justifyContent: 'center', alignItems: 'center',
    },
    profileAvatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
    profileInfo: { flex: 1 },
    profileName: { fontSize: 18, fontWeight: '700', color: NDEIP_COLORS.gray[100] },
    profileAbout: { fontSize: 13, color: NDEIP_COLORS.gray[400], marginTop: 3 },

    quickRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 20 },
    quickCard: {
        flex: 1, alignItems: 'center', padding: 16, gap: 8, backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    quickIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    quickLabel: { fontSize: 11, fontWeight: '600', color: NDEIP_COLORS.gray[500], textTransform: 'uppercase', letterSpacing: 0.5 },
    quickValue: { fontSize: 13, fontWeight: '700' },

    menuSection: { marginHorizontal: 16 },
    menuItem: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    menuIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: NDEIP_COLORS.gray[200] },

    appInfo: { alignItems: 'center', paddingTop: 32 },
    appVersion: { fontSize: 12, color: NDEIP_COLORS.gray[600] },
});
