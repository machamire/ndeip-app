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
import { Typography, Spacing, Radii, Glass, Shadows } from '@/constants/ndeipBrandSystem';

const LIVE_ROOMS = [
    { id: '1', title: 'Design Thinking Workshop', speakers: 3, listeners: 24, tags: ['Design', 'UX'], vibe: 'teal' },
    { id: '2', title: 'Evening Chill & Chat', speakers: 2, listeners: 56, tags: ['Social', 'Music'], vibe: 'blue' },
    { id: '3', title: 'Startup Founders Circle', speakers: 5, listeners: 89, tags: ['Business', 'Tech'], vibe: 'purple' },
];

const SCHEDULED = [
    { id: '4', title: 'React Native Deep Dive', host: 'Alex Kim', time: 'Tomorrow, 3:00 PM', attendees: 42 },
    { id: '5', title: 'Community Town Hall', host: 'Village Admin', time: 'Friday, 7:00 PM', attendees: 128 },
];

const MY_VILLAGES = [
    { id: '6', name: 'Design Community', members: 1240, lastActive: '2m ago' },
    { id: '7', name: 'SA Tech Hub', members: 890, lastActive: '15m ago' },
    { id: '8', name: 'Creative Writers', members: 345, lastActive: '1h ago' },
];

const vibeColors: Record<string, string[]> = {
    teal: ['rgba(27,77,62,0.15)', 'rgba(27,77,62,0.05)'],
    blue: ['rgba(37,99,235,0.15)', 'rgba(37,99,235,0.05)'],
    purple: ['rgba(139,92,246,0.15)', 'rgba(139,92,246,0.05)'],
};

function MiniAvatars({ count }: { count: number }) {
    const colors = ['#1B4D3E', '#2563EB', '#8B5CF6', '#F59E0B', '#10B981'];
    return (
        <View style={{ flexDirection: 'row' }}>
            {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                <View key={i} style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: colors[i % colors.length],
                    borderWidth: 2,
                    borderColor: NDEIP_COLORS.gray[950],
                    marginLeft: i > 0 ? -8 : 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <FontAwesome name="user" size={10} color="rgba(255,255,255,0.7)" />
                </View>
            ))}
            {count > 3 && (
                <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: NDEIP_COLORS.gray[700],
                    borderWidth: 2,
                    borderColor: NDEIP_COLORS.gray[950],
                    marginLeft: -8,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Text style={{ fontSize: 8, color: '#fff', fontWeight: '700' }}>+{count - 3}</Text>
                </View>
            )}
        </View>
    );
}

export default function VillagesScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];

    return (
        <View style={[styles.container, { backgroundColor: bg }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* ─── Live Rooms ─── */}
                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>
                        LIVE NOW
                    </Text>
                    {LIVE_ROOMS.map(room => (
                        <TouchableOpacity key={room.id} activeOpacity={0.7}>
                            <LinearGradient
                                colors={vibeColors[room.vibe] as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[styles.roomCard, {
                                    borderColor: isDark ? Glass.dark.border : Glass.light.border,
                                }]}
                            >
                                <View style={styles.roomTop}>
                                    <View style={styles.liveBadge}>
                                        <View style={styles.liveDot} />
                                        <Text style={styles.liveText}>LIVE</Text>
                                    </View>
                                    <View style={styles.listenerCount}>
                                        <FontAwesome name="headphones" size={10} color={NDEIP_COLORS.gray[400]} />
                                        <Text style={[styles.listenerText, { color: NDEIP_COLORS.gray[400] }]}>{room.listeners}</Text>
                                    </View>
                                </View>
                                <Text style={[styles.roomTitle, { color: colors.text }]}>{room.title}</Text>
                                <View style={styles.roomBottom}>
                                    <MiniAvatars count={room.speakers} />
                                    <View style={styles.tagRow}>
                                        {room.tags.map((tag, i) => (
                                            <View key={i} style={[styles.tag, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                                                <Text style={[styles.tagText, { color: isDark ? NDEIP_COLORS.gray[400] : NDEIP_COLORS.gray[500] }]}>{tag}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ─── Scheduled ─── */}
                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>
                        UPCOMING
                    </Text>
                    {SCHEDULED.map(event => (
                        <TouchableOpacity
                            key={event.id}
                            style={[styles.scheduledCard, {
                                backgroundColor: isDark ? Glass.dark.background : Glass.light.background,
                                borderColor: isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle,
                            }]}
                            activeOpacity={0.7}
                        >
                            <View style={styles.scheduledIcon}>
                                <FontAwesome name="clock-o" size={18} color={NDEIP_COLORS.electricBlue} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.scheduledTitle, { color: colors.text }]}>{event.title}</Text>
                                <Text style={[styles.scheduledMeta, { color: NDEIP_COLORS.gray[500] }]}>
                                    {event.host} · {event.time}
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.remindBtn} activeOpacity={0.7}>
                                <FontAwesome name="bell-o" size={14} color={NDEIP_COLORS.primaryTeal} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ─── My Villages ─── */}
                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>
                        MY VILLAGES
                    </Text>
                    {MY_VILLAGES.map(village => (
                        <TouchableOpacity
                            key={village.id}
                            style={[styles.villageRow]}
                            activeOpacity={0.6}
                        >
                            <LinearGradient
                                colors={[NDEIP_COLORS.primaryTeal, NDEIP_COLORS.electricBlue] as any}
                                style={styles.villageAvatar}
                            >
                                <FontAwesome name="users" size={16} color="rgba(255,255,255,0.9)" />
                            </LinearGradient>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.villageName, { color: colors.text }]}>{village.name}</Text>
                                <Text style={[styles.villageMeta, { color: NDEIP_COLORS.gray[500] }]}>
                                    {village.members.toLocaleString()} members · {village.lastActive}
                                </Text>
                            </View>
                            <FontAwesome name="chevron-right" size={12} color={NDEIP_COLORS.gray[600]} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* ─── FAB ─── */}
            <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
                <LinearGradient
                    colors={NDEIP_COLORS.gradients.brand as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.fabInner}
                >
                    <FontAwesome name="plus" size={22} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    section: { marginTop: 8, paddingBottom: 8 },
    sectionLabel: {
        ...Typography.presets.sectionLabel as any,
        paddingHorizontal: Spacing.screenHorizontal,
        marginBottom: 12,
        marginTop: 16,
    },
    // Live Room Cards
    roomCard: {
        marginHorizontal: Spacing.screenHorizontal,
        marginBottom: 12,
        padding: 16,
        borderRadius: Radii.card,
        borderWidth: StyleSheet.hairlineWidth,
    },
    roomTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239,68,68,0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 5,
    },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },
    liveText: { fontSize: 10, fontWeight: '700', color: '#EF4444', letterSpacing: 1 },
    listenerCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    listenerText: { fontSize: 12, fontWeight: '600' },
    roomTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
    roomBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    tagRow: { flexDirection: 'row', gap: 6 },
    tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    tagText: { fontSize: 11, fontWeight: '500' },
    // Scheduled
    scheduledCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: Spacing.screenHorizontal,
        marginBottom: 10,
        padding: 14,
        borderRadius: Radii.card,
        borderWidth: StyleSheet.hairlineWidth,
        gap: 12,
    },
    scheduledIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(37,99,235,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scheduledTitle: { fontSize: 15, fontWeight: '600' },
    scheduledMeta: { fontSize: 12, marginTop: 2 },
    remindBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: NDEIP_COLORS.glass.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // My Villages
    villageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.screenHorizontal,
        paddingVertical: 12,
        gap: 14,
    },
    villageAvatar: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    villageName: { fontSize: 15, fontWeight: '600' },
    villageMeta: { fontSize: 12, marginTop: 2 },
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
    fabInner: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
