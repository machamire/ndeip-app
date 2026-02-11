import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import { NDEIP_COLORS } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const MY_STORIES = { id: '0', name: 'My Stories', description: 'Tap to add a story', initials: 'ME', hasNew: false };

const TOP3_STORIES = [
    { id: '1', name: 'Sarah J.', initials: 'SJ', time: '12 min ago', isTop3: true, viewed: false, color: NDEIP_COLORS.primaryTeal },
    { id: '2', name: 'Marcus', initials: 'MW', time: '25 min ago', isTop3: true, viewed: false, color: NDEIP_COLORS.electricBlue },
    { id: '3', name: 'Lisa', initials: 'LC', time: '1 hr ago', isTop3: true, viewed: true, color: NDEIP_COLORS.meshCyan },
];

const OTHER_STORIES = [
    { id: '4', name: 'Amara O.', initials: 'AO', time: '2 hrs ago', isTop3: false, viewed: false, color: NDEIP_COLORS.emerald },
    { id: '5', name: 'Robert', initials: 'RT', time: '3 hrs ago', isTop3: false, viewed: true, color: NDEIP_COLORS.gold },
    { id: '6', name: 'Emma W.', initials: 'EW', time: '5 hrs ago', isTop3: false, viewed: false, color: '#9333EA' },
];

const AD_ENTRY = { id: 'ad', isAd: true };

const TABS = ['Stories', 'Regional News'];

export default function StoriesScreen() {
    const [activeTab, setActiveTab] = useState('Stories');

    const listData: any[] = [
        { ...MY_STORIES, isMyStory: true },
        { type: 'sectionHeader', title: '★ Top 3' },
        ...TOP3_STORIES,
        { ...AD_ENTRY },
        { type: 'sectionHeader', title: 'Recent Stories' },
        ...OTHER_STORIES,
        { ...AD_ENTRY, id: 'ad2' },
    ];

    return (
        <View style={styles.container}>
            {/* Tab Bar */}
            <View style={styles.tabBar}>
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.tabActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {activeTab === 'Stories' ? (
                <FlatList
                    data={listData}
                    keyExtractor={(item: any) => item.id || item.title || Math.random().toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    renderItem={({ item }: any) => {
                        if (item.type === 'sectionHeader') {
                            return (
                                <Text style={styles.sectionHeader}>{item.title}</Text>
                            );
                        }
                        if (item.isAd) {
                            return (
                                <View style={styles.adCard}>
                                    <View style={styles.adBadge}>
                                        <FontAwesome name="bullhorn" size={10} color={NDEIP_COLORS.gray[500]} />
                                        <Text style={styles.adBadgeText}>Sponsored</Text>
                                    </View>
                                    <View style={styles.adContent}>
                                        <View style={styles.adIcon}>
                                            <FontAwesome name="shopping-bag" size={16} color={NDEIP_COLORS.gray[500]} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.adTitle}>Ad placeholder</Text>
                                            <Text style={styles.adDesc}>Sponsored content will appear here</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        }
                        if (item.isMyStory) {
                            return (
                                <TouchableOpacity style={styles.myStoryRow} activeOpacity={0.7}>
                                    <View style={styles.myStoryAvatar}>
                                        <FontAwesome name="plus" size={18} color={NDEIP_COLORS.electricBlue} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.myStoryName}>My Stories</Text>
                                        <Text style={styles.myStoryHint}>Tap to add a story  ·  <Text style={{ color: NDEIP_COLORS.gold }}>Disappears after 24h</Text></Text>
                                    </View>
                                    <FontAwesome name="camera" size={18} color={NDEIP_COLORS.emerald} />
                                </TouchableOpacity>
                            );
                        }
                        return (
                            <TouchableOpacity style={styles.storyRow} activeOpacity={0.65}>
                                <View style={[styles.storyRing, item.viewed ? styles.storyRingViewed : styles.storyRingNew]}>
                                    <View style={[styles.storyAvatar, { backgroundColor: item.color || NDEIP_COLORS.primaryTeal }]}>
                                        <Text style={styles.storyAvatarText}>{item.initials}</Text>
                                    </View>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Text style={styles.storyName}>{item.name}</Text>
                                        {item.isTop3 && (
                                            <View style={styles.top3Tag}>
                                                <FontAwesome name="star" size={8} color={NDEIP_COLORS.gold} />
                                                <Text style={styles.top3TagText}>Top 3</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.storyTime}>{item.time}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            ) : (
                <View style={styles.emptyState}>
                    <FontAwesome name="newspaper-o" size={48} color={NDEIP_COLORS.gray[600]} />
                    <Text style={styles.emptyTitle}>Regional News</Text>
                    <Text style={styles.emptySubtitle}>Local and regional news from your area will appear here</Text>
                </View>
            )}

            {/* FAB */}
            <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
                <FontAwesome name="camera" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: NDEIP_COLORS.gray[950] },

    tabBar: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, gap: 8 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)' },
    tabActive: { backgroundColor: NDEIP_COLORS.primaryTeal + '18', borderWidth: 1, borderColor: NDEIP_COLORS.primaryTeal + '30' },
    tabText: { fontSize: 13, fontWeight: '600', color: NDEIP_COLORS.gray[500] },
    tabTextActive: { color: NDEIP_COLORS.emerald, fontWeight: '700' },

    sectionHeader: {
        fontSize: 11, fontWeight: '700', color: NDEIP_COLORS.gray[500], textTransform: 'uppercase',
        letterSpacing: 1.2, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8,
    },

    myStoryRow: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    myStoryAvatar: {
        width: 52, height: 52, borderRadius: 18, backgroundColor: NDEIP_COLORS.electricBlue + '15',
        justifyContent: 'center' as any, alignItems: 'center' as any, borderWidth: 2, borderColor: NDEIP_COLORS.electricBlue + '30',
        borderStyle: 'dashed',
    },
    myStoryName: { fontSize: 15, fontWeight: '700', color: NDEIP_COLORS.gray[100] },
    myStoryHint: { fontSize: 12, color: NDEIP_COLORS.gray[500], marginTop: 2 },

    storyRow: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 14,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    storyRing: { width: 56, height: 56, borderRadius: 19, justifyContent: 'center', alignItems: 'center', borderWidth: 2.5 },
    storyRingNew: { borderColor: NDEIP_COLORS.emerald },
    storyRingViewed: { borderColor: NDEIP_COLORS.gray[700] },
    storyAvatar: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    storyAvatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    storyName: { fontSize: 15, fontWeight: '600', color: NDEIP_COLORS.gray[100] },
    storyTime: { fontSize: 12, color: NDEIP_COLORS.gray[500], marginTop: 2 },
    top3Tag: {
        flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: NDEIP_COLORS.gold + '15',
        paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
    },
    top3TagText: { fontSize: 9, fontWeight: '800', color: NDEIP_COLORS.gold, textTransform: 'uppercase' },

    adCard: {
        marginHorizontal: 16, marginVertical: 8, padding: 14, backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
    },
    adBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
    adBadgeText: { fontSize: 9, fontWeight: '700', color: NDEIP_COLORS.gray[500], textTransform: 'uppercase', letterSpacing: 0.5 },
    adContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    adIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)', justifyContent: 'center', alignItems: 'center' },
    adTitle: { fontSize: 14, fontWeight: '600', color: NDEIP_COLORS.gray[300] },
    adDesc: { fontSize: 12, color: NDEIP_COLORS.gray[500], marginTop: 2 },

    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 12 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: NDEIP_COLORS.gray[300] },
    emptySubtitle: { fontSize: 14, color: NDEIP_COLORS.gray[500], textAlign: 'center' },

    fab: {
        position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 16,
        backgroundColor: NDEIP_COLORS.emerald, justifyContent: 'center', alignItems: 'center',
        shadowColor: NDEIP_COLORS.emerald, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
    },
});
