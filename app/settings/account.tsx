import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { NDEIP_COLORS } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function AccountScreen() {
    const router = useRouter();
    const { signOut } = useAuth();

    const ITEMS = [
        { id: 'security', label: 'Security Notifications', icon: 'shield', desc: 'Get notified about security changes', color: NDEIP_COLORS.emerald },
        { id: 'passkeys', label: 'Passkeys', icon: 'key', desc: 'Manage your passkeys', color: NDEIP_COLORS.electricBlue },
        { id: 'email', label: 'Email Address', icon: 'envelope-o', desc: 'Add email for account recovery', color: NDEIP_COLORS.meshCyan },
        { id: 'two_step', label: 'Two-Step Verification', icon: 'lock', desc: 'Add extra security to your account', color: NDEIP_COLORS.gold },
        { id: 'linked', label: 'Linked Devices', icon: 'laptop', desc: 'Manage your linked devices', color: NDEIP_COLORS.primaryTeal, route: '/settings/linked-devices' },
        { id: 'request', label: 'Request Account Info', icon: 'file-text-o', desc: 'Download your account data', color: NDEIP_COLORS.gray[400] },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {ITEMS.map(item => (
                <TouchableOpacity
                    key={item.id} style={styles.row}
                    onPress={item.route ? () => router.push(item.route as any) : undefined}
                    activeOpacity={0.65}
                >
                    <View style={[styles.itemIcon, { backgroundColor: item.color + '12' }]}>
                        <FontAwesome name={item.icon as any} size={15} color={item.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.rowLabel}>{item.label}</Text>
                        <Text style={styles.rowDesc}>{item.desc}</Text>
                    </View>
                    <FontAwesome name="chevron-right" size={11} color={NDEIP_COLORS.gray[700]} />
                </TouchableOpacity>
            ))}

            {/* Delete Account */}
            <View style={styles.dangerSection}>
                <TouchableOpacity style={styles.deleteButton} activeOpacity={0.7}>
                    <FontAwesome name="trash-o" size={16} color={NDEIP_COLORS.rose} />
                    <Text style={styles.deleteText}>Delete My Account</Text>
                </TouchableOpacity>
                <Text style={styles.deleteHint}>This will permanently delete your account and all data</Text>
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutRow} onPress={() => { signOut(); router.replace('/auth/login' as any); }} activeOpacity={0.7}>
                <FontAwesome name="sign-out" size={16} color={NDEIP_COLORS.rose} />
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: NDEIP_COLORS.gray[950] },
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.03)' },
    itemIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    rowLabel: { fontSize: 15, fontWeight: '500', color: NDEIP_COLORS.gray[200] },
    rowDesc: { fontSize: 12, color: NDEIP_COLORS.gray[500], marginTop: 2 },
    dangerSection: { paddingHorizontal: 16, paddingTop: 32, alignItems: 'center', gap: 8 },
    deleteButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 24, backgroundColor: NDEIP_COLORS.rose + '08', borderRadius: 14, borderWidth: 1, borderColor: NDEIP_COLORS.rose + '15' },
    deleteText: { fontSize: 15, fontWeight: '600', color: NDEIP_COLORS.rose },
    deleteHint: { fontSize: 12, color: NDEIP_COLORS.gray[600], textAlign: 'center' },
    logoutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, paddingVertical: 14 },
    logoutText: { fontSize: 15, fontWeight: '600', color: NDEIP_COLORS.rose },
});
