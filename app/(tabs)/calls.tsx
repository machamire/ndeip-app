import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';
import { CallService, CallEntry } from '@/services/CallService';
import EmptyState from '@/components/ui/EmptyState';



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
    const router = useRouter();
    const [filter, setFilter] = useState<'all' | 'missed'>('all');
    const [callHistory, setCallHistory] = useState<CallEntry[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        const history = await CallService.getCallHistory();
        setCallHistory(history);
        setRefreshing(false);
    };

    useEffect(() => {
        const load = async () => {
            const history = await CallService.getCallHistory();
            setCallHistory(history);
        };
        load();
        const unsubscribe = CallService.onHistoryChange((history) => setCallHistory(history));
        return () => unsubscribe();
    }, []);

    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];
    const filtered = filter === 'missed' ? callHistory.filter(c => c.direction === 'missed') : callHistory;

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
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NDEIP_COLORS.primaryTeal} colors={[NDEIP_COLORS.primaryTeal]} />
                }
            >
                {filtered.length === 0 ? (
                    <EmptyState variant="calls" isDark={isDark} />
                ) : (
                    filtered.map(call => (
                        <TouchableOpacity key={call.id} style={styles.callRow} activeOpacity={0.6}
                            onPress={() => router.push({ pathname: '/call', params: { id: call.contactId, name: call.contactName, type: call.type } } as any)}
                        >
                            <CallAvatar name={call.contactName} />
                            <View style={styles.callContent}>
                                <Text style={[styles.callName, { color: call.direction === 'missed' ? NDEIP_COLORS.rose : colors.text }]}>
                                    {call.contactName}
                                </Text>
                                <View style={styles.callMeta}>
                                    <FontAwesome
                                        name={call.direction === 'outgoing' ? 'arrow-up' : call.direction === 'missed' ? 'arrow-down' : 'arrow-down'}
                                        size={10}
                                        color={call.direction === 'missed' ? NDEIP_COLORS.rose : NDEIP_COLORS.emerald}
                                        style={{ transform: [{ rotate: '45deg' }] }}
                                    />
                                    <FontAwesome
                                        name={call.type === 'video' ? 'video-camera' : 'phone'}
                                        size={10}
                                        color={isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400]}
                                    />
                                    <Text style={[styles.callTime, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>
                                        {call.time}{call.duration > 0 ? ` · ${CallService.formatDuration(call.duration)}` : ''}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.callAction} activeOpacity={0.6}
                                onPress={() => router.push({ pathname: '/call', params: { id: call.contactId, name: call.contactName, type: call.type } } as any)}
                            >
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
