import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import { NDEIP_COLORS } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const LIVE_ROOMS = [
    {
        id: '1', name: 'Startup Founders Hangout', topic: 'Building in Africa',
        speakers: 4, listeners: 28, hosts: ['AO', 'DK'],
        color: NDEIP_COLORS.primaryTeal,
    },
    {
        id: '2', name: 'Music & Culture', topic: 'Afrobeats Weekly',
        speakers: 2, listeners: 56, hosts: ['MW', 'EW'],
        color: NDEIP_COLORS.electricBlue,
    },
];

const SCHEDULED = [
    {
        id: '3', name: 'Tech Talk: AI in 2026', time: 'Tomorrow, 7:00 PM',
        speakers: 3, hosts: ['SJ', 'LC'],
        color: NDEIP_COLORS.meshCyan,
    },
    {
        id: '4', name: 'Community Builders', time: 'Feb 15, 4:00 PM',
        speakers: 5, hosts: ['RT', 'AO'],
        color: NDEIP_COLORS.gold,
    },
];

const MY_VILLAGES = [
    { id: '5', name: 'ndeip Dev Village', members: 42, color: NDEIP_COLORS.primaryTeal },
    { id: '6', name: 'Creative Corner', members: 18, color: NDEIP_COLORS.electricBlue },
];

const TABS = ['Live Now', 'Scheduled', 'My Villages'];

export default function VillagesScreen() {
    const [activeTab, setActiveTab] = useState('Live Now');

    return (
        <View style={styles.container}>
            {/* Tab Bar */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.tabActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        {tab === 'Live Now' && activeTab === tab && <View style={styles.livePulse} />}
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {activeTab === 'Live Now' && (
                <FlatList
                    data={LIVE_ROOMS}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 80 }}
                    renderItem={({ item }) => (
                        <View style={[styles.roomCard, { borderColor: item.color + '20' }]}>
                            <View style={styles.roomHeader}>
                                <View style={styles.liveTag}>
                                    <View style={styles.liveDot} />
                                    <Text style={styles.liveText}>LIVE</Text>
                                </View>
                                <Text style={styles.roomListeners}>
                                    <FontAwesome name="users" size={11} color={NDEIP_COLORS.gray[400]} /> {item.listeners + item.speakers}
                                </Text>
                            </View>
                            <Text style={styles.roomName}>{item.name}</Text>
                            <Text style={styles.roomTopic}>{item.topic}</Text>
                            <View style={styles.roomFooter}>
                                <View style={styles.speakersRow}>
                                    {item.hosts.map((h, i) => (
                                        <View key={i} style={[styles.miniAvatar, { backgroundColor: item.color, marginLeft: i > 0 ? -8 : 0 }]}>
                                            <Text style={styles.miniAvatarText}>{h}</Text>
                                        </View>
                                    ))}
                                    <Text style={styles.speakerCount}>{item.speakers} speaking</Text>
                                </View>
                                <TouchableOpacity style={[styles.joinBtn, { backgroundColor: item.color }]} activeOpacity={0.8}>
                                    <Text style={styles.joinBtnText}>Join</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            {activeTab === 'Scheduled' && (
                <FlatList
                    data={SCHEDULED}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 80 }}
                    renderItem={({ item }) => (
                        <View style={styles.roomCard}>
                            <View style={styles.roomHeader}>
                                <View style={[styles.scheduledTag, { backgroundColor: item.color + '15' }]}>
                                    <FontAwesome name="clock-o" size={10} color={item.color} />
                                    <Text style={[styles.scheduledText, { color: item.color }]}>{item.time}</Text>
                                </View>
                            </View>
                            <Text style={styles.roomName}>{item.name}</Text>
                            <View style={styles.roomFooter}>
                                <View style={styles.speakersRow}>
                                    {item.hosts.map((h, i) => (
                                        <View key={i} style={[styles.miniAvatar, { backgroundColor: item.color, marginLeft: i > 0 ? -8 : 0 }]}>
                                            <Text style={styles.miniAvatarText}>{h}</Text>
                                        </View>
                                    ))}
                                    <Text style={styles.speakerCount}>{item.speakers} speakers</Text>
                                </View>
                                <TouchableOpacity style={styles.notifyBtn} activeOpacity={0.8}>
                                    <FontAwesome name="bell-o" size={14} color={NDEIP_COLORS.electricBlue} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            {activeTab === 'My Villages' && (
                <FlatList
                    data={MY_VILLAGES}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 80 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.villageCard} activeOpacity={0.7}>
                            <View style={[styles.villageIcon, { backgroundColor: item.color + '15' }]}>
                                <FontAwesome name="home" size={20} color={item.color} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.villageName}>{item.name}</Text>
                                <Text style={styles.villageMembers}>{item.members} members</Text>
                            </View>
                            <FontAwesome name="chevron-right" size={12} color={NDEIP_COLORS.gray[600]} />
                        </TouchableOpacity>
                    )}
                />
            )}

            {/* FAB */}
            <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
                <FontAwesome name="plus" size={22} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: NDEIP_COLORS.gray[950] },

    tabBar: { maxHeight: 52, paddingTop: 8 },
    tab: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', gap: 6,
    },
    tabActive: { backgroundColor: NDEIP_COLORS.primaryTeal + '18', borderColor: NDEIP_COLORS.primaryTeal + '40' },
    tabText: { fontSize: 13, fontWeight: '600', color: NDEIP_COLORS.gray[400] },
    tabTextActive: { color: NDEIP_COLORS.emerald, fontWeight: '700' },
    livePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: NDEIP_COLORS.rose },

    roomCard: {
        backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 18, padding: 18,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    roomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    liveTag: {
        flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: NDEIP_COLORS.rose + '15',
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: NDEIP_COLORS.rose },
    liveText: { fontSize: 10, fontWeight: '800', color: NDEIP_COLORS.rose, letterSpacing: 1 },
    roomListeners: { fontSize: 12, color: NDEIP_COLORS.gray[400] },
    roomName: { fontSize: 17, fontWeight: '700', color: NDEIP_COLORS.gray[100], marginBottom: 4 },
    roomTopic: { fontSize: 13, color: NDEIP_COLORS.gray[400], marginBottom: 14 },

    scheduledTag: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    },
    scheduledText: { fontSize: 11, fontWeight: '700' },

    roomFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    speakersRow: { flexDirection: 'row', alignItems: 'center' },
    miniAvatar: { width: 28, height: 28, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: NDEIP_COLORS.gray[950] },
    miniAvatarText: { color: '#fff', fontSize: 9, fontWeight: '800' },
    speakerCount: { fontSize: 11, color: NDEIP_COLORS.gray[400], marginLeft: 8 },

    joinBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
    joinBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
    notifyBtn: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: NDEIP_COLORS.electricBlue + '12' },

    villageCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16,
        backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    villageIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    villageName: { fontSize: 15, fontWeight: '700', color: NDEIP_COLORS.gray[100] },
    villageMembers: { fontSize: 12, color: NDEIP_COLORS.gray[500], marginTop: 2 },

    fab: {
        position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 16,
        backgroundColor: NDEIP_COLORS.electricBlue, justifyContent: 'center', alignItems: 'center',
        shadowColor: NDEIP_COLORS.electricBlue, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
    },
});
