import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';

const CALL_HISTORY = [
    { id: '1', name: 'Sarah Chen', type: 'video', direction: 'outgoing', time: 'Today, 2:30 PM', missed: false },
    { id: '2', name: 'Marcus Johnson', type: 'voice', direction: 'incoming', time: 'Today, 11:15 AM', missed: false },
    { id: '3', name: 'Dev Village', type: 'voice', direction: 'incoming', time: 'Yesterday, 8:00 PM', missed: true, isGroup: true },
    { id: '4', name: 'Thandi Nkosi', type: 'video', direction: 'outgoing', time: 'Yesterday, 3:45 PM', missed: false },
    { id: '5', name: 'Priya Sharma', type: 'voice', direction: 'incoming', time: 'Monday, 9:20 AM', missed: true },
    { id: '6', name: 'Jordan Lee', type: 'video', direction: 'outgoing', time: 'Sunday, 6:10 PM', missed: false },
    { id: '7', name: 'Mom ❤️', type: 'voice', direction: 'incoming', time: 'Saturday, 12:00 PM', missed: false },
];

function CallAvatar({ name, size = 48 }: { name: string; size?: number }) {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
    const c = [['#1B4D3E', '#2A7A5E'], ['#2563EB', '#3B82F6'], ['#8B5CF6', '#A78BFA'], ['#F59E0B', '#FBBF24'], ['#10B981', '#34D399']];
    const ci = name.charCodeAt(0) % c.length;
    return (
        <LinearGradient colors={c[ci] as any} style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: size * 0.38, fontWeight: '600' }}>{initials}</Text>
        </LinearGradient>
    );
}

export default function CallsScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const [filter, setFilter] = React.useState<'all' | 'missed'>('all');

    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];
    const filtered = filter === 'missed' ? CALL_HISTORY.filter(c => c.missed) : CALL_HISTORY;

    return (
        <View style={[styles.container, { backgroundColor: bg }]}>
            {/* ─── Filter Tabs ─── */}
            <View style={[styles.filterWrap, { backgroundColor: isDark ? Glass.dark.background : Glass.light.background }]}>
                {(['all', 'missed'] as const).map(f => {
                    const active = f === filter;
                    return (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setFilter(f)}
                            style={[styles.filterTab, active && styles.filterTabActive]}
                            activeOpacity={0.7}
                        >
                            {active ? (
                                <LinearGradient
                                    colors={NDEIP_COLORS.gradients.brand as any}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.filterTabGradient}
                                >
                                    <Text style={styles.filterTabTextActive}>{f === 'all' ? 'All' : 'Missed'}</Text>
                                </LinearGradient>
                            ) : (
                                <Text style={[styles.filterTabText, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>
                                    {f === 'all' ? 'All' : 'Missed'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* ─── Call History ─── */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {filtered.length === 0 ? (
                    <View style={styles.emptyState}>
                        <FontAwesome name="phone" size={48} color={NDEIP_COLORS.gray[700]} />
                        <Text style={[styles.emptyText, { color: NDEIP_COLORS.gray[500] }]}>No missed calls</Text>
                    </View>
                ) : (
                    filtered.map(call => (
                        <TouchableOpacity key={call.id} style={styles.callRow} activeOpacity={0.6}>
                            <CallAvatar name={call.name} />
                            <View style={styles.callContent}>
                                <Text style={[styles.callName, { color: call.missed ? NDEIP_COLORS.rose : colors.text }]}>
                                    {call.name}
                                </Text>
                                <View style={styles.callMeta}>
                                    <FontAwesome
                                        name={call.direction === 'outgoing' ? 'arrow-up' : 'arrow-down'}
                                        size={10}
                                        color={call.missed ? NDEIP_COLORS.rose : NDEIP_COLORS.emerald}
                                        style={{ transform: [{ rotate: call.direction === 'outgoing' ? '45deg' : '45deg' }] }}
                                    />
                                    <FontAwesome
                                        name={call.type === 'video' ? 'video-camera' : 'phone'}
                                        size={10}
                                        color={isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400]}
                                    />
                                    <Text style={[styles.callTime, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>
                                        {call.time}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.callAction} activeOpacity={0.6}>
                                <FontAwesome
                                    name={call.type === 'video' ? 'video-camera' : 'phone'}
                                    size={16}
                                    color={NDEIP_COLORS.primaryTeal}
                                />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* ─── FAB ─── */}
            <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
                <LinearGradient
                    colors={NDEIP_COLORS.gradients.brand as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.fabInner}
                >
                    <FontAwesome name="phone" size={22} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    // Filter Tabs
    filterWrap: {
        flexDirection: 'row',
        marginHorizontal: Spacing.screenHorizontal,
        marginTop: 8,
        marginBottom: 8,
        borderRadius: 18,
        padding: 3,
    },
    filterTab: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 34, borderRadius: 16 },
    filterTabActive: {},
    filterTabGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterTabText: { fontSize: 14, fontWeight: '600' },
    filterTabTextActive: { fontSize: 14, fontWeight: '600', color: '#fff' },
    // Call Rows
    callRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.screenHorizontal,
        paddingVertical: 14,
        gap: 14,
    },
    callContent: { flex: 1 },
    callName: { fontSize: 15, fontWeight: '600', marginBottom: 3 },
    callMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    callTime: { fontSize: 12 },
    callAction: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 120,
        gap: 16,
    },
    emptyText: { fontSize: 16, fontWeight: '500' },
    // FAB
    fab: {
        position: 'absolute',
        bottom: 88,
        right: 20,
        shadowColor: '#1B4D3E',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 10,
    },
    fabInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
