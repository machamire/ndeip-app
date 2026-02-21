import React, { useState, useEffect, useCallback } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Glass, Shadows } from '@/constants/ndeipBrandSystem';
import { VillageService } from '@/services/VillageService';
import VillageOnboarding from '@/components/villages/VillageOnboarding';
import EmojiReactionBar, { ReactionCounts, REACTION_EMOJIS } from '@/components/EmojiReactionBar';

// ─── Live Rooms Data ──────────────────────────────────────
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

// ─── Noticeboard Feed Data ────────────────────────────────
type NoticeType = 'announcement' | 'poll' | 'event';

interface NoticeItem {
    id: string;
    type: NoticeType;
    village: string;
    author: string;
    time: string;
    title?: string;
    body?: string;
    pinned?: boolean;
    question?: string;
    options?: { label: string; votes: number }[];
    totalVotes?: number;
    eventTitle?: string;
    eventDate?: string;
    eventLocation?: string;
    attendees?: number;
}

const NOTICEBOARD_FEED: NoticeItem[] = [
    {
        id: 'n1', type: 'announcement', village: 'Design Community',
        author: 'Admin', time: '1h ago', pinned: true,
        title: 'Weekly Design Challenge',
        body: "This week's theme: Glassmorphism in mobile UIs. Submit entries by Sunday 6 PM. Tag #DesignChallenge in your posts!",
    },
    {
        id: 'n2', type: 'poll', village: 'SA Tech Hub',
        author: 'Marcus J.', time: '3h ago',
        question: 'What should our next workshop cover?',
        options: [
            { label: 'React Native Animations', votes: 34 },
            { label: 'GraphQL Best Practices', votes: 21 },
            { label: 'TypeScript Advanced Patterns', votes: 28 },
            { label: 'DevOps for Mobile', votes: 12 },
        ],
        totalVotes: 95,
    },
    {
        id: 'n3', type: 'event', village: 'Creative Writers',
        author: 'Thandi N.', time: '5h ago',
        eventTitle: 'Open Mic Poetry Night',
        eventDate: 'Saturday, Feb 15 · 7:00 PM',
        eventLocation: 'Community Hall, Harare',
        attendees: 64,
    },
    {
        id: 'n4', type: 'announcement', village: 'SA Tech Hub',
        author: 'Kai C.', time: '8h ago',
        title: 'We hit 1,000 members!',
        body: "A huge thank you to everyone who's been part of this journey. Special shoutout to our top contributors this month.",
    },
    {
        id: 'n5', type: 'poll', village: 'Design Community',
        author: 'Sarah C.', time: 'Yesterday',
        question: 'Best prototyping tool for 2026?',
        options: [
            { label: 'Figma', votes: 156 },
            { label: 'Framer', votes: 89 },
            { label: 'Sketch + Principle', votes: 23 },
        ],
        totalVotes: 268,
    },
];

const vibeColors: Record<string, string[]> = {
    teal: ['rgba(27,77,62,0.15)', 'rgba(27,77,62,0.05)'],
    blue: ['rgba(37,99,235,0.15)', 'rgba(37,99,235,0.05)'],
    purple: ['rgba(139,92,246,0.15)', 'rgba(139,92,246,0.05)'],
};

function MiniAvatars({ count }: { count: number }) {
    const avatarColors = ['#1B4D3E', '#2563EB', '#8B5CF6', '#F59E0B', '#10B981'];
    return (
        <View style={{ flexDirection: 'row' }}>
            {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                <View key={i} style={{
                    width: 24, height: 24, borderRadius: 12,
                    backgroundColor: avatarColors[i % avatarColors.length],
                    borderWidth: 2, borderColor: NDEIP_COLORS.gray[950],
                    marginLeft: i > 0 ? -8 : 0,
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <FontAwesome name="user" size={10} color="rgba(255,255,255,0.7)" />
                </View>
            ))}
            {count > 3 && (
                <View style={{
                    width: 24, height: 24, borderRadius: 12,
                    backgroundColor: NDEIP_COLORS.gray[700],
                    borderWidth: 2, borderColor: NDEIP_COLORS.gray[950],
                    marginLeft: -8, alignItems: 'center', justifyContent: 'center',
                }}>
                    <Text style={{ fontSize: 8, color: '#fff', fontWeight: '700' }}>+{count - 3}</Text>
                </View>
            )}
        </View>
    );
}

// ─── Announcement Card ────────────────────────────────────
function AnnouncementCard({ item, isDark, colors, onLike }: { item: NoticeItem; isDark: boolean; colors: any; onLike?: (id: string) => void }) {
    const [liked, setLiked] = useState(false);
    const [reactions, setReactions] = useState<ReactionCounts>({ '👍': 2, '❤️': 1 });
    const [userReactions, setUserReactions] = useState<string[]>([]);
    const handleReact = (emoji: string) => {
        setReactions((prev) => {
            const isRemoving = userReactions.includes(emoji);
            return { ...prev, [emoji]: Math.max(0, (prev[emoji] || 0) + (isRemoving ? -1 : 1)) };
        });
        setUserReactions((prev) =>
            prev.includes(emoji) ? prev.filter((e) => e !== emoji) : [...prev, emoji]
        );
    };
    return (
        <View style={[styles.noticeCard, {
            backgroundColor: isDark ? Glass.dark.background : Glass.light.background,
            borderColor: isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle,
        }]}>
            <View style={styles.noticeHeader}>
                <View style={[styles.noticeTypeBadge, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                    <FontAwesome name="bullhorn" size={12} color={NDEIP_COLORS.emerald} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.noticeVillage, { color: NDEIP_COLORS.primaryTeal }]}>{item.village}</Text>
                    <Text style={[styles.noticeMeta, { color: NDEIP_COLORS.gray[500] }]}>
                        {item.author} · {item.time}
                    </Text>
                </View>
                {item.pinned && (
                    <View style={[styles.pinnedBadge, { backgroundColor: 'rgba(245,158,11,0.1)' }]}>
                        <FontAwesome name="thumb-tack" size={10} color={NDEIP_COLORS.amber} />
                        <Text style={{ fontSize: 10, color: NDEIP_COLORS.amber, fontWeight: '600' }}>Pinned</Text>
                    </View>
                )}
            </View>
            {item.title && (
                <Text style={[styles.noticeTitle, { color: colors.text }]}>{item.title}</Text>
            )}
            {item.body && (
                <Text style={[styles.noticeBody, { color: isDark ? NDEIP_COLORS.gray[400] : NDEIP_COLORS.gray[600] }]}>
                    {item.body}
                </Text>
            )}
            <View style={styles.noticeActions}>
                <TouchableOpacity style={styles.noticeActionBtn} activeOpacity={0.7} onPress={() => { setLiked(!liked); onLike?.(item.id); }}>
                    <FontAwesome name={liked ? 'heart' : 'heart-o'} size={14} color={liked ? NDEIP_COLORS.rose : NDEIP_COLORS.gray[500]} />
                    <Text style={[styles.noticeActionText, { color: liked ? NDEIP_COLORS.rose : NDEIP_COLORS.gray[500] }]}>{liked ? 'Liked' : 'Like'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.noticeActionBtn} activeOpacity={0.7}>
                    <FontAwesome name="comment-o" size={14} color={NDEIP_COLORS.gray[500]} />
                    <Text style={[styles.noticeActionText, { color: NDEIP_COLORS.gray[500] }]}>Reply</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.noticeActionBtn} activeOpacity={0.7}>
                    <FontAwesome name="share" size={14} color={NDEIP_COLORS.gray[500]} />
                    <Text style={[styles.noticeActionText, { color: NDEIP_COLORS.gray[500] }]}>Share</Text>
                </TouchableOpacity>
            </View>
            <EmojiReactionBar reactions={reactions} userReactions={userReactions} onReact={handleReact} compact />
        </View>
    );
}

// ─── Poll Card ────────────────────────────────────────────
function PollCard({ item, isDark, colors, onVote }: { item: NoticeItem; isDark: boolean; colors: any; onVote?: (id: string, idx: number) => void }) {
    const [votedIndex, setVotedIndex] = useState<number | null>(null);
    const total = item.totalVotes || 0;

    return (
        <View style={[styles.noticeCard, {
            backgroundColor: isDark ? Glass.dark.background : Glass.light.background,
            borderColor: isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle,
        }]}>
            <View style={styles.noticeHeader}>
                <View style={[styles.noticeTypeBadge, { backgroundColor: 'rgba(37,99,235,0.12)' }]}>
                    <FontAwesome name="bar-chart" size={12} color={NDEIP_COLORS.electricBlue} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.noticeVillage, { color: NDEIP_COLORS.primaryTeal }]}>{item.village}</Text>
                    <Text style={[styles.noticeMeta, { color: NDEIP_COLORS.gray[500] }]}>
                        {item.author} · {item.time}
                    </Text>
                </View>
                <View style={[styles.pollBadge]}>
                    <FontAwesome name="pie-chart" size={10} color={NDEIP_COLORS.electricBlue} />
                    <Text style={{ fontSize: 10, color: NDEIP_COLORS.electricBlue, fontWeight: '600' }}>Poll</Text>
                </View>
            </View>
            <Text style={[styles.pollQuestion, { color: colors.text }]}>{item.question}</Text>
            <View style={styles.pollOptions}>
                {item.options?.map((opt, i) => {
                    const pct = total > 0 ? (opt.votes / total) * 100 : 0;
                    const isVoted = votedIndex === i;
                    return (
                        <TouchableOpacity
                            key={i}
                            onPress={() => { setVotedIndex(i); onVote?.(item.id, i); }}
                            style={[styles.pollOption, {
                                borderColor: isVoted ? NDEIP_COLORS.primaryTeal : (isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle),
                            }]}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.pollBar, {
                                width: `${pct}%` as any,
                                backgroundColor: isVoted
                                    ? 'rgba(27,77,62,0.15)'
                                    : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                            }]} />
                            <Text style={[styles.pollLabel, { color: colors.text }]}>{opt.label}</Text>
                            <Text style={[styles.pollPct, { color: NDEIP_COLORS.gray[500] }]}>{Math.round(pct)}%</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            <Text style={[styles.pollTotal, { color: NDEIP_COLORS.gray[500] }]}>
                {total} votes
            </Text>
        </View>
    );
}

// ─── Event Card ───────────────────────────────────────────
function EventCard({ item, isDark, colors, onRsvp }: { item: NoticeItem; isDark: boolean; colors: any; onRsvp?: (id: string, going: boolean) => void }) {
    const [going, setGoing] = useState(false);
    return (
        <View style={[styles.noticeCard, {
            backgroundColor: isDark ? Glass.dark.background : Glass.light.background,
            borderColor: isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle,
        }]}>
            <View style={styles.noticeHeader}>
                <View style={[styles.noticeTypeBadge, { backgroundColor: 'rgba(139,92,246,0.12)' }]}>
                    <FontAwesome name="calendar" size={12} color={NDEIP_COLORS.amethyst} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.noticeVillage, { color: NDEIP_COLORS.primaryTeal }]}>{item.village}</Text>
                    <Text style={[styles.noticeMeta, { color: NDEIP_COLORS.gray[500] }]}>
                        {item.author} · {item.time}
                    </Text>
                </View>
            </View>
            <Text style={[styles.eventTitle, { color: colors.text }]}>{item.eventTitle}</Text>
            <View style={styles.eventDetail}>
                <FontAwesome name="clock-o" size={13} color={NDEIP_COLORS.electricBlue} />
                <Text style={[styles.eventDetailText, { color: isDark ? NDEIP_COLORS.gray[400] : NDEIP_COLORS.gray[600] }]}>
                    {item.eventDate}
                </Text>
            </View>
            <View style={styles.eventDetail}>
                <FontAwesome name="map-marker" size={14} color={NDEIP_COLORS.rose} />
                <Text style={[styles.eventDetailText, { color: isDark ? NDEIP_COLORS.gray[400] : NDEIP_COLORS.gray[600] }]}>
                    {item.eventLocation}
                </Text>
            </View>
            <View style={styles.eventFooter}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MiniAvatars count={item.attendees || 0} />
                    <Text style={[styles.eventAttendees, { color: NDEIP_COLORS.gray[500] }]}>
                        {item.attendees} going
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => { setGoing(!going); onRsvp?.(item.id, !going); }}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={going ? [NDEIP_COLORS.gray[600], NDEIP_COLORS.gray[500]] as any : NDEIP_COLORS.gradients.brand as any}
                        style={styles.goingBtn}
                    >
                        <FontAwesome name={going ? 'check' : 'hand-o-up'} size={12} color="#fff" />
                        <Text style={styles.goingBtnText}>{going ? 'Going!' : 'RSVP'}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function VillagesScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];
    const [activeTab, setActiveTab] = useState<'rooms' | 'noticeboard'>('noticeboard');
    const [refreshing, setRefreshing] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const router = useRouter();

    // Check for first-time village visit
    useEffect(() => {
        AsyncStorage.getItem('ndeip_village_onboarded').then((val) => {
            if (!val) setShowOnboarding(true);
        });
    }, []);

    const handleDismissOnboarding = useCallback(async () => {
        setShowOnboarding(false);
        await AsyncStorage.setItem('ndeip_village_onboarded', 'true');
    }, []);

    const handleLike = useCallback(async (id: string) => {
        await VillageService.likeNotice(id);
    }, []);

    const handleVote = useCallback(async (id: string, idx: number) => {
        await VillageService.voteOnPoll(id, idx);
    }, []);

    const handleRsvp = useCallback(async (id: string, going: boolean) => {
        await VillageService.rsvpEvent(id, going);
    }, []);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await VillageService.initialize();
        setRefreshing(false);
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: bg }]}>
            {/* ─── Tab Switcher ─── */}
            <View style={styles.tabSwitcher}>
                <TouchableOpacity
                    onPress={() => setActiveTab('noticeboard')}
                    style={[styles.tabBtn, activeTab === 'noticeboard' && styles.tabBtnActive]}
                    activeOpacity={0.7}
                >
                    <FontAwesome name="newspaper-o" size={14} color={activeTab === 'noticeboard' ? NDEIP_COLORS.primaryTeal : NDEIP_COLORS.gray[500]} />
                    <Text style={[styles.tabBtnText, { color: activeTab === 'noticeboard' ? NDEIP_COLORS.primaryTeal : NDEIP_COLORS.gray[500] }]}>
                        Noticeboard
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('rooms')}
                    style={[styles.tabBtn, activeTab === 'rooms' && styles.tabBtnActive]}
                    activeOpacity={0.7}
                >
                    <FontAwesome name="microphone" size={14} color={activeTab === 'rooms' ? NDEIP_COLORS.primaryTeal : NDEIP_COLORS.gray[500]} />
                    <Text style={[styles.tabBtnText, { color: activeTab === 'rooms' ? NDEIP_COLORS.primaryTeal : NDEIP_COLORS.gray[500] }]}>
                        Live Rooms
                    </Text>
                </TouchableOpacity>
            </View>

            {/* ─── Help Link ─── */}
            <TouchableOpacity
                onPress={() => router.push('/villages/help' as any)}
                style={styles.helpLink}
                activeOpacity={0.7}
            >
                <FontAwesome name="question-circle-o" size={14} color={NDEIP_COLORS.primaryTeal} />
                <Text style={styles.helpLinkText}>What are Villages?</Text>
            </TouchableOpacity>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={NDEIP_COLORS.primaryTeal}
                        colors={[NDEIP_COLORS.primaryTeal]}
                    />
                }
            >

                {activeTab === 'noticeboard' ? (
                    <>
                        {/* ─── Noticeboard Feed ─── */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>
                                VILLAGE NOTICEBOARD
                            </Text>
                            {NOTICEBOARD_FEED.map(item => {
                                if (item.type === 'announcement') return <AnnouncementCard key={item.id} item={item} isDark={isDark} colors={colors} onLike={handleLike} />;
                                if (item.type === 'poll') return <PollCard key={item.id} item={item} isDark={isDark} colors={colors} onVote={handleVote} />;
                                if (item.type === 'event') return <EventCard key={item.id} item={item} isDark={isDark} colors={colors} onRsvp={handleRsvp} />;
                                return null;
                            })}
                        </View>

                        {/* ─── My Villages ─── */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>
                                MY VILLAGES
                            </Text>
                            {MY_VILLAGES.map(village => (
                                <TouchableOpacity key={village.id} style={[styles.villageRow]} activeOpacity={0.6}>
                                    <LinearGradient colors={[NDEIP_COLORS.primaryTeal, NDEIP_COLORS.electricBlue] as any} style={styles.villageAvatar}>
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
                    </>
                ) : (
                    <>
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
                                        style={[styles.roomCard, { borderColor: isDark ? Glass.dark.border : Glass.light.border }]}
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
                    </>
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
                    <FontAwesome name="plus" size={22} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>

            {/* ─── Onboarding Overlay ─── */}
            <VillageOnboarding visible={showOnboarding} onDismiss={handleDismissOnboarding} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    tabSwitcher: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.screenHorizontal,
        paddingVertical: 8,
        gap: 8,
    },
    tabBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 12,
    },
    tabBtnActive: {
        backgroundColor: 'rgba(27,77,62,0.12)',
    },
    tabBtnText: { fontSize: 14, fontWeight: '600' as any },
    section: { marginTop: 8, paddingBottom: 8 },
    sectionLabel: {
        ...Typography.presets.sectionLabel as any,
        paddingHorizontal: Spacing.screenHorizontal,
        marginBottom: 12,
        marginTop: 16,
    },
    noticeCard: {
        marginHorizontal: Spacing.screenHorizontal,
        marginBottom: 14,
        padding: 16,
        borderRadius: Radii.card,
        borderWidth: StyleSheet.hairlineWidth,
    },
    noticeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    noticeTypeBadge: {
        width: 32, height: 32, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
    },
    noticeVillage: { fontSize: 13, fontWeight: '600' as any },
    noticeMeta: { fontSize: 11, marginTop: 1 },
    noticeTitle: { fontSize: 16, fontWeight: '700' as any, marginBottom: 6 },
    noticeBody: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
    noticeActions: {
        flexDirection: 'row',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(255,255,255,0.06)',
        paddingTop: 10,
        gap: 20,
    },
    noticeActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    noticeActionText: { fontSize: 13, fontWeight: '500' as any },
    pinnedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    pollBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: 'rgba(37,99,235,0.1)',
    },
    pollQuestion: { fontSize: 16, fontWeight: '600' as any, marginBottom: 12 },
    pollOptions: { gap: 8 },
    pollOption: {
        position: 'relative',
        overflow: 'hidden',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pollBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        borderRadius: 10,
    },
    pollLabel: { fontSize: 14, fontWeight: '500' as any, zIndex: 1 },
    pollPct: { fontSize: 13, fontWeight: '600' as any, zIndex: 1 },
    pollTotal: { fontSize: 12, marginTop: 8 },
    eventTitle: { fontSize: 16, fontWeight: '700' as any, marginBottom: 8 },
    eventDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    eventDetailText: { fontSize: 13 },
    eventFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(255,255,255,0.06)',
    },
    eventAttendees: { fontSize: 12 },
    goingBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    goingBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' as any },
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
    liveText: { fontSize: 10, fontWeight: '700' as any, color: '#EF4444', letterSpacing: 1 },
    listenerCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    listenerText: { fontSize: 12, fontWeight: '600' as any },
    roomTitle: { fontSize: 16, fontWeight: '600' as any, marginBottom: 12 },
    roomBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    tagRow: { flexDirection: 'row', gap: 6 },
    tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    tagText: { fontSize: 11, fontWeight: '500' as any },
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
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(37,99,235,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    scheduledTitle: { fontSize: 15, fontWeight: '600' as any },
    scheduledMeta: { fontSize: 12, marginTop: 2 },
    remindBtn: {
        width: 36, height: 36, borderRadius: 18,
        borderWidth: 1, borderColor: NDEIP_COLORS.glass.border,
        alignItems: 'center', justifyContent: 'center',
    },
    villageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.screenHorizontal,
        paddingVertical: 12,
        gap: 14,
    },
    villageAvatar: {
        width: 44, height: 44, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
    },
    villageName: { fontSize: 15, fontWeight: '600' as any },
    villageMeta: { fontSize: 12, marginTop: 2 },
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
    helpLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: Spacing.screenHorizontal,
    },
    helpLinkText: {
        color: NDEIP_COLORS.primaryTeal,
        fontSize: 13,
        fontWeight: '500',
    },
});
