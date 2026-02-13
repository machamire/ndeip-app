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

// ─── TTL Utilities ───────────────────────────────────────
const STORY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function createStoryTimestamp(hoursAgo: number) {
    const created = Date.now() - hoursAgo * 60 * 60 * 1000;
    return { created_at: created, expires_at: created + STORY_TTL_MS };
}

function getTimeRemaining(expiresAt: number): string {
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) return 'Expired';
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    if (hours > 0) return `${hours}h left`;
    return `${minutes}m left`;
}

function isStoryLive(story: { expires_at: number }) {
    return story.expires_at > Date.now();
}

// ─── Mock Data ────────────────────────────────────────
const MY_STORY = { hasStory: false, lastUpdate: null };

const TOP_5_STORIES = [
    { id: '1', name: 'Sarah', seen: false, count: 3, ...createStoryTimestamp(2) },
    { id: '2', name: 'Marcus', seen: false, count: 1, ...createStoryTimestamp(6) },
    { id: '3', name: 'Thandi', seen: true, count: 2, ...createStoryTimestamp(18) },
    { id: '4', name: 'Kai Chen', seen: false, count: 2, ...createStoryTimestamp(4) },
    { id: '5', name: 'Priya Sharma', seen: true, count: 1, ...createStoryTimestamp(10) },
];

const RECENT_STORIES = [
    { id: '4', name: 'Jordan Lee', seen: false, count: 2, ...createStoryTimestamp(1) },
    { id: '5', name: 'Priya Sharma', seen: false, count: 4, ...createStoryTimestamp(4) },
    { id: '6', name: 'Alex Kim', seen: true, count: 1, ...createStoryTimestamp(20) },
    { id: '7', name: 'Naledi M.', seen: true, count: 1, ...createStoryTimestamp(12) },
    { id: '8', name: 'Kai Chen', seen: true, count: 3, ...createStoryTimestamp(22) },
];

// ─── Story Avatar ─────────────────────────────────────────
function StoryAvatar({ name, seen, count, expires_at }: { name: string; seen: boolean; count: number; expires_at: number }) {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
    const gradColors = [
        ['#1B4D3E', '#2563EB'], ['#2563EB', '#8B5CF6'], ['#10B981', '#06B6D4'],
        ['#F59E0B', '#EF4444'], ['#8B5CF6', '#F43F5E'],
    ];
    const ci = name.charCodeAt(0) % gradColors.length;

    return (
        <TouchableOpacity style={styles.storyItem} activeOpacity={0.7}>
            {!seen ? (
                <LinearGradient
                    colors={gradColors[ci] as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.storyRingUnseen}
                >
                    <View style={styles.storyRingInner}>
                        <LinearGradient
                            colors={gradColors[ci] as any}
                            style={styles.storyAvatar}
                        >
                            <Text style={styles.storyInitials}>{initials}</Text>
                        </LinearGradient>
                    </View>
                </LinearGradient>
            ) : (
                <View style={styles.storyRingSeen}>
                    <LinearGradient
                        colors={[NDEIP_COLORS.gray[700], NDEIP_COLORS.gray[600]] as any}
                        style={[styles.storyAvatar, { opacity: 0.7 }]}
                    >
                        <Text style={styles.storyInitials}>{initials}</Text>
                    </LinearGradient>
                </View>
            )}
            <Text style={[styles.storyName, seen && styles.storyNameSeen]} numberOfLines={1}>
                {name.split(' ')[0]}
            </Text>
            {count > 1 && (
                <View style={styles.storyCount}>
                    <View style={[styles.storyCountDot, !seen && styles.storyCountDotActive]} />
                    <View style={[styles.storyCountDot, !seen && styles.storyCountDotActive]} />
                    {count > 2 && <View style={[styles.storyCountDot, !seen && styles.storyCountDotActive]} />}
                </View>
            )}
            <Text style={styles.storyTimeLeft}>{getTimeRemaining(expires_at)}</Text>
        </TouchableOpacity>
    );
}

export default function StoriesScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];

    // Filter expired stories (TTL enforcement)
    const liveTop5 = React.useMemo(() => TOP_5_STORIES.filter(isStoryLive), []);
    const liveRecent = React.useMemo(() => RECENT_STORIES.filter(isStoryLive), []);

    return (
        <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* ─── My Story Card ─── */}
            <TouchableOpacity activeOpacity={0.8} style={styles.myStoryCard}>
                <View style={[styles.myStoryCardInner, {
                    backgroundColor: isDark ? Glass.dark.background : Glass.light.background,
                    borderColor: isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle,
                }]}>
                    <View style={styles.myStoryLeft}>
                        <LinearGradient
                            colors={[NDEIP_COLORS.primaryTeal, NDEIP_COLORS.electricBlue] as any}
                            style={styles.myStoryAvatar}
                        >
                            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>Y</Text>
                        </LinearGradient>
                        <View style={styles.myStoryAddBadge}>
                            <LinearGradient
                                colors={NDEIP_COLORS.gradients.brand as any}
                                style={styles.myStoryAddBadgeInner}
                            >
                                <FontAwesome name="plus" size={10} color="#fff" />
                            </LinearGradient>
                        </View>
                    </View>
                    <View style={styles.myStoryText}>
                        <Text style={[styles.myStoryTitle, { color: colors.text }]}>Add to your story</Text>
                        <Text style={[styles.myStorySubtitle, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>
                            Tap to add · Disappears after 24h
                        </Text>
                    </View>
                    <FontAwesome name="camera" size={18} color={NDEIP_COLORS.primaryTeal} />
                </View>
            </TouchableOpacity>

            {/* ─── Top 5 Stories ─── */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>
                        TOP 5
                    </Text>
                    <View style={styles.adFreeBadge}>
                        <FontAwesome name="star" size={8} color={NDEIP_COLORS.amber} />
                        <Text style={styles.adFreeText}>Ad-free</Text>
                    </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesScroll}>
                    {liveTop5.length > 0 ? liveTop5.map(story => (
                        <StoryAvatar key={story.id} {...story} />
                    )) : (
                        <Text style={{ color: NDEIP_COLORS.gray[500], fontSize: 13, paddingHorizontal: Spacing.screenHorizontal }}>No stories right now</Text>
                    )}
                </ScrollView>
            </View>

            {/* ─── Recent Stories ─── */}
            <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>
                    RECENT
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesScroll}>
                    {liveRecent.length > 0 ? liveRecent.map(story => (
                        <StoryAvatar key={story.id} {...story} />
                    )) : (
                        <Text style={{ color: NDEIP_COLORS.gray[500], fontSize: 13, paddingHorizontal: Spacing.screenHorizontal }}>No stories right now</Text>
                    )}
                </ScrollView>
            </View>

            {/* ─── Sponsored ─── */}
            <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[600] : NDEIP_COLORS.gray[400] }]}>
                    SPONSORED
                </Text>
                <TouchableOpacity style={[styles.sponsoredCard, {
                    borderColor: isDark ? NDEIP_COLORS.glass.border : NDEIP_COLORS.glass.borderLight,
                    backgroundColor: isDark ? Glass.dark.background : Glass.light.background,
                }]} activeOpacity={0.7}>
                    <View style={styles.sponsoredContent}>
                        <View style={styles.sponsoredAvatar}>
                            <FontAwesome name="shopping-bag" size={20} color={NDEIP_COLORS.amethyst} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.sponsoredTitle, { color: colors.text }]}>Brand Partner</Text>
                            <Text style={[styles.sponsoredDesc, { color: NDEIP_COLORS.gray[500] }]}>Tap to view promotion</Text>
                        </View>
                        <FontAwesome name="chevron-right" size={12} color={NDEIP_COLORS.gray[600]} />
                    </View>
                </TouchableOpacity>
            </View>

            {/* ─── Regional News ─── */}
            <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>
                    REGIONAL NEWS
                </Text>
                <TouchableOpacity style={[styles.newsCard, {
                    backgroundColor: isDark ? Glass.dark.background : Glass.light.background,
                    borderColor: isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle,
                }]} activeOpacity={0.7}>
                    <FontAwesome name="newspaper-o" size={24} color={NDEIP_COLORS.electricBlue} />
                    <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={[styles.newsTitle, { color: colors.text }]}>Local Updates</Text>
                        <Text style={[styles.newsDesc, { color: NDEIP_COLORS.gray[500] }]}>3 new stories from your region</Text>
                    </View>
                    <FontAwesome name="chevron-right" size={12} color={NDEIP_COLORS.gray[600]} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    // My Story
    myStoryCard: {
        paddingHorizontal: Spacing.screenHorizontal,
        paddingTop: 12,
        paddingBottom: 4,
    },
    myStoryCardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: Radii.card,
        borderWidth: StyleSheet.hairlineWidth,
        gap: 14,
    },
    myStoryLeft: { position: 'relative' },
    myStoryAvatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    myStoryAddBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
    },
    myStoryAddBadgeInner: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: NDEIP_COLORS.gray[950],
    },
    myStoryText: { flex: 1 },
    myStoryTitle: { fontSize: 16, fontWeight: '600' },
    myStorySubtitle: { fontSize: 12, marginTop: 2 },
    // Sections
    section: { marginTop: 24 },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.screenHorizontal,
        marginBottom: 12,
        gap: 8,
    },
    sectionLabel: {
        ...Typography.presets.sectionLabel as any,
        paddingHorizontal: Spacing.screenHorizontal,
        marginBottom: 12,
    },
    adFreeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(245,158,11,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    adFreeText: { fontSize: 10, color: NDEIP_COLORS.amber, fontWeight: '600' },
    storiesScroll: {
        paddingHorizontal: Spacing.screenHorizontal,
        gap: 14,
    },
    // Story Item
    storyItem: { alignItems: 'center', width: 74 },
    storyRingUnseen: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    storyRingInner: {
        width: 66,
        height: 66,
        borderRadius: 33,
        backgroundColor: NDEIP_COLORS.gray[950],
        alignItems: 'center',
        justifyContent: 'center',
    },
    storyRingSeen: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 1.5,
        borderColor: NDEIP_COLORS.gray[700],
        alignItems: 'center',
        justifyContent: 'center',
    },
    storyAvatar: {
        width: 62,
        height: 62,
        borderRadius: 31,
        alignItems: 'center',
        justifyContent: 'center',
    },
    storyInitials: { color: '#fff', fontSize: 22, fontWeight: '600' },
    storyName: {
        fontSize: 11,
        fontWeight: '500',
        color: NDEIP_COLORS.gray[300],
        marginTop: 6,
    },
    storyNameSeen: { opacity: 0.5 },
    storyCount: { flexDirection: 'row', gap: 3, marginTop: 4 },
    storyCountDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: NDEIP_COLORS.gray[600],
    },
    storyCountDotActive: { backgroundColor: NDEIP_COLORS.primaryTeal },
    storyTimeLeft: {
        fontSize: 9,
        color: NDEIP_COLORS.gray[500],
        marginTop: 2,
    },
    // Sponsored
    sponsoredCard: {
        marginHorizontal: Spacing.screenHorizontal,
        borderRadius: Radii.card,
        borderWidth: StyleSheet.hairlineWidth,
        borderStyle: 'dashed',
    },
    sponsoredContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    sponsoredAvatar: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(139,92,246,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sponsoredTitle: { fontSize: 15, fontWeight: '600' },
    sponsoredDesc: { fontSize: 12, marginTop: 2 },
    // News
    newsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: Spacing.screenHorizontal,
        padding: 16,
        borderRadius: Radii.card,
        borderWidth: StyleSheet.hairlineWidth,
    },
    newsTitle: { fontSize: 15, fontWeight: '600' },
    newsDesc: { fontSize: 12, marginTop: 2 },
});
