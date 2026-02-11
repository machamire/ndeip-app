import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import { NDEIP_COLORS } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const CALLS = [
    { id: '1', name: 'Sarah J.', initials: 'SJ', type: 'incoming', media: 'video', time: 'Today, 2:30 PM', missed: false, color: NDEIP_COLORS.primaryTeal },
    { id: '2', name: 'Marcus Williams', initials: 'MW', type: 'outgoing', media: 'voice', time: 'Today, 1:15 PM', missed: false, color: NDEIP_COLORS.electricBlue },
    { id: '3', name: 'Amara Okafor', initials: 'AO', type: 'incoming', media: 'voice', time: 'Yesterday, 6:45 PM', missed: true, color: NDEIP_COLORS.emerald },
    { id: '4', name: 'Team ndeip', initials: 'TN', type: 'outgoing', media: 'video', time: 'Yesterday, 3:00 PM', missed: false, isGroup: true, color: NDEIP_COLORS.meshCyan },
    { id: '5', name: 'David Kim', initials: 'DK', type: 'incoming', media: 'voice', time: 'Mon, 9:30 AM', missed: true, color: NDEIP_COLORS.gold },
    { id: '6', name: 'Lisa Chen', initials: 'LC', type: 'outgoing', media: 'voice', time: 'Mon, 8:00 AM', missed: false, color: '#9333EA' },
    { id: '7', name: 'Emma Wilson', initials: 'EW', type: 'incoming', media: 'video', time: 'Sun, 5:00 PM', missed: false, color: NDEIP_COLORS.rose },
];

export default function CallsScreen() {
    const [filter, setFilter] = useState('All');
    const filtered = filter === 'Missed' ? CALLS.filter(c => c.missed) : CALLS;

    return (
        <View style={styles.container}>
            {/* Filters */}
            <View style={styles.filterRow}>
                {['All', 'Missed'].map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 80 }}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.callRow} activeOpacity={0.65}>
                        <View style={[styles.avatar, { backgroundColor: item.color }]}>
                            <Text style={styles.avatarText}>{item.initials}</Text>
                        </View>
                        <View style={styles.callInfo}>
                            <Text style={[styles.callName, item.missed && { color: NDEIP_COLORS.rose }]}>{item.name}</Text>
                            <View style={styles.callMeta}>
                                <FontAwesome
                                    name={item.type === 'incoming' ? 'arrow-down' : 'arrow-up'}
                                    size={10}
                                    color={item.missed ? NDEIP_COLORS.rose : NDEIP_COLORS.emerald}
                                    style={{ marginRight: 4 }}
                                />
                                <Text style={styles.callTime}>{item.time}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.callAction} activeOpacity={0.7}>
                            <FontAwesome
                                name={item.media === 'video' ? 'video-camera' : 'phone'}
                                size={16}
                                color={NDEIP_COLORS.emerald}
                            />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                        <FontAwesome name="phone" size={48} color={NDEIP_COLORS.gray[700]} />
                        <Text style={styles.emptyTitle}>No missed calls</Text>
                    </View>
                )}
            />

            {/* FAB */}
            <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
                <FontAwesome name="phone" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: NDEIP_COLORS.gray[950] },
    filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 8 },
    filterBtn: {
        paddingHorizontal: 20, paddingVertical: 9, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    filterBtnActive: { backgroundColor: NDEIP_COLORS.primaryTeal + '18', borderColor: NDEIP_COLORS.primaryTeal + '40' },
    filterText: { fontSize: 13, fontWeight: '600', color: NDEIP_COLORS.gray[400] },
    filterTextActive: { color: NDEIP_COLORS.emerald, fontWeight: '700' },

    callRow: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 14,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    avatar: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    callInfo: { flex: 1 },
    callName: { fontSize: 15, fontWeight: '600', color: NDEIP_COLORS.gray[100], marginBottom: 3 },
    callMeta: { flexDirection: 'row', alignItems: 'center' },
    callTime: { fontSize: 12, color: NDEIP_COLORS.gray[500] },
    callAction: {
        width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
        backgroundColor: NDEIP_COLORS.emerald + '12',
    },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 120, gap: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: NDEIP_COLORS.gray[400] },

    fab: {
        position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 16,
        backgroundColor: NDEIP_COLORS.emerald, justifyContent: 'center', alignItems: 'center',
        shadowColor: NDEIP_COLORS.emerald, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
    },
});
