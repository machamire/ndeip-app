import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Modal,
    Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';
import { CallService, CallEntry } from '@/services/CallService';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';

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

function formatDuration(seconds: number): string {
    if (seconds <= 0) return '';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

export default function CallsScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const router = useRouter();
    const { user } = useAuth();
    const [filter, setFilter] = useState<'all' | 'missed'>('all');
    const [callHistory, setCallHistory] = useState<CallEntry[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [showActionSheet, setShowActionSheet] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        const history = await CallService.getCallHistory();
        setCallHistory(history);
        setRefreshing(false);
    };

    useEffect(() => {
        if (!user) return;
        CallService.setCurrentUser(user.id);

        const load = async () => {
            const history = await CallService.getCallHistory();
            setCallHistory(history);
        };
        load();
    }, [user]);

    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];
    const filtered = filter === 'missed'
        ? callHistory.filter(c => c.status === 'missed' || c.status === 'no_answer')
        : callHistory;

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

            {/* ─── Quick Actions ─── */}
            <View style={styles.quickActions}>
                {[
                    { icon: 'phone' as const, label: 'Call', action: () => router.push('/call' as any) },
                    { icon: 'calendar' as const, label: 'Schedule', action: () => router.push('/calls/schedule' as any) },
                    { icon: 'th' as const, label: 'Keypad', action: () => router.push('/calls/keypad' as any) },
                    { icon: 'star' as const, label: 'Favorites', action: () => { } },
                ].map((qa, i) => (
                    <TouchableOpacity key={i} onPress={qa.action} style={styles.quickActionBtn} activeOpacity={0.7}>
                        <LinearGradient
                            colors={['rgba(27,77,62,0.15)', 'rgba(27,77,62,0.05)'] as any}
                            style={styles.quickActionIcon}
                        >
                            <FontAwesome name={qa.icon} size={18} color={NDEIP_COLORS.primaryTeal} />
                        </LinearGradient>
                        <Text style={[styles.quickActionLabel, { color: isDark ? NDEIP_COLORS.gray[400] : NDEIP_COLORS.gray[600] }]}>{qa.label}</Text>
                    </TouchableOpacity>
                ))}
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
                    filtered.map(call => {
                        const isMissed = call.status === 'missed' || call.status === 'no_answer';
                        const callName = call.name || 'Unknown';
                        const otherUserId = call.incoming ? call.caller_id : call.callee_id;

                        return (
                            <TouchableOpacity key={call.id} style={styles.callRow} activeOpacity={0.6}
                                onPress={() => router.push({ pathname: '/settings/user-profile', params: { id: otherUserId, name: callName } } as any)}
                            >
                                <CallAvatar name={callName} />
                                <View style={styles.callContent}>
                                    <Text style={[styles.callName, { color: isMissed ? NDEIP_COLORS.rose : colors.text }]}>
                                        {callName}
                                    </Text>
                                    <View style={styles.callMeta}>
                                        <FontAwesome
                                            name={call.incoming ? 'arrow-down' : 'arrow-up'}
                                            size={10}
                                            color={isMissed ? NDEIP_COLORS.rose : NDEIP_COLORS.emerald}
                                            style={{ transform: [{ rotate: '45deg' }] }}
                                        />
                                        <FontAwesome
                                            name={call.type === 'video' ? 'video-camera' : 'phone'}
                                            size={10}
                                            color={isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400]}
                                        />
                                        <Text style={[styles.callTime, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>
                                            {call.time}{call.duration > 0 ? ` · ${formatDuration(call.duration)}` : ''}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.callAction} activeOpacity={0.6}
                                    onPress={() => router.push({ pathname: '/call', params: { id: otherUserId, name: callName, type: call.type } } as any)}
                                >
                                    <FontAwesome
                                        name={call.type === 'video' ? 'video-camera' : 'phone'}
                                        size={16}
                                        color={NDEIP_COLORS.primaryTeal}
                                    />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>

            {/* ─── + Header Button ─── */}
            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.85}
                onPress={() => setShowActionSheet(true)}
            >
                <LinearGradient
                    colors={NDEIP_COLORS.gradients.brand as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.fabInner}
                >
                    <FontAwesome name="plus" size={22} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>

            {/* ─── Action Sheet Modal ─── */}
            <Modal
                visible={showActionSheet}
                transparent
                animationType="fade"
                onRequestClose={() => setShowActionSheet(false)}
            >
                <Pressable style={styles.overlay} onPress={() => setShowActionSheet(false)}>
                    <View style={[styles.actionSheet, { backgroundColor: isDark ? NDEIP_COLORS.gray[900] : '#fff' }]}>
                        <View style={styles.actionSheetHandle} />
                        {[
                            { icon: 'phone' as const, label: 'Start new call', onPress: () => { setShowActionSheet(false); router.push('/call' as any); } },
                            { icon: 'link' as const, label: 'Create call link', onPress: () => { setShowActionSheet(false); }, disabled: true },
                            { icon: 'calendar' as const, label: 'Schedule a call', onPress: () => { setShowActionSheet(false); router.push('/calls/schedule' as any); } },
                        ].map((item, i) => (
                            <TouchableOpacity
                                key={i}
                                style={[styles.actionSheetItem, item.disabled && { opacity: 0.4 }]}
                                onPress={item.onPress}
                                disabled={item.disabled}
                                activeOpacity={0.6}
                            >
                                <View style={[styles.actionSheetIcon, { backgroundColor: isDark ? 'rgba(27,77,62,0.15)' : 'rgba(27,77,62,0.08)' }]}>
                                    <FontAwesome name={item.icon} size={16} color={NDEIP_COLORS.primaryTeal} />
                                </View>
                                <Text style={[styles.actionSheetLabel, { color: isDark ? '#F0F4F3' : NDEIP_COLORS.gray[900] }]}>
                                    {item.label}
                                    {item.disabled && ' (coming soon)'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.actionSheetCancel}
                            onPress={() => setShowActionSheet(false)}
                        >
                            <Text style={{ color: NDEIP_COLORS.gray[500], fontWeight: '600', fontSize: 15 }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
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
    // Quick Actions
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: Spacing.screenHorizontal,
        paddingVertical: 12,
    },
    quickActionBtn: {
        alignItems: 'center',
        gap: 6,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    // Action Sheet
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    actionSheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 12,
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    actionSheetHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: NDEIP_COLORS.gray[600],
        alignSelf: 'center',
        marginBottom: 16,
    },
    actionSheetItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 14,
    },
    actionSheetIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionSheetLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    actionSheetCancel: {
        alignItems: 'center',
        paddingTop: 16,
        marginTop: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: NDEIP_COLORS.gray[700],
    },
});
