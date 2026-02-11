import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, ScrollView, Animated, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { NDEIP_COLORS } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const TOP_3 = [
  { id: '1', name: 'Sarah J.', initials: 'SJ', online: true, unread: 3, color: NDEIP_COLORS.primaryTeal },
  { id: '2', name: 'Marcus', initials: 'MW', online: true, unread: 0, color: NDEIP_COLORS.electricBlue },
  { id: '3', name: 'Lisa', initials: 'LC', online: false, unread: 1, color: NDEIP_COLORS.meshCyan },
];

const CONVERSATIONS = [
  { id: '4', name: 'Amara Okafor', initials: 'AO', lastMessage: 'Sure, let me check that for you 👍', time: '2:30 PM', unread: 2, online: true, pinned: false },
  { id: '5', name: 'Team ndeip', initials: 'TN', lastMessage: 'Robert: Meeting at 3pm tomorrow', time: '1:15 PM', unread: 5, online: false, isGroup: true, pinned: false },
  { id: '6', name: 'David Kim', initials: 'DK', lastMessage: 'Got the files, thank you!', time: '12:00 PM', unread: 0, online: false, pinned: false },
  { id: '7', name: 'Emma Wilson', initials: 'EW', lastMessage: 'Happy birthday! 🎂🎉', time: '11:30 AM', unread: 0, online: true, pinned: false },
  { id: '8', name: 'Dev Village', initials: 'DV', lastMessage: 'The sprint review is scheduled...', time: 'Yesterday', unread: 0, online: false, isGroup: true, pinned: false },
  { id: '9', name: 'Robert Taylor', initials: 'RT', lastMessage: 'Voice message (0:34)', time: 'Yesterday', unread: 0, online: false, pinned: false },
];

const FILTERS = ['All', 'Unread', 'Favorites', 'Groups', 'Villages'];

export default function ChatsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const dndMode = user?.dnd_mode || 'available';
  const dndConfig: any = {
    available: { label: 'Available', icon: 'circle', color: NDEIP_COLORS.emerald },
    be_quiet: { label: 'Be Quiet', icon: 'moon-o', color: NDEIP_COLORS.gold },
    get_busy: { label: 'Get Busy', icon: 'briefcase', color: '#FF8C00' },
    do_not_disturb: { label: 'DND', icon: 'minus-circle', color: NDEIP_COLORS.rose },
  };
  const currentDnd = dndConfig[dndMode];

  return (
    <View style={styles.container}>
      {/* DND Status Strip */}
      {dndMode !== 'available' && (
        <TouchableOpacity
          style={[styles.dndStrip, { backgroundColor: currentDnd.color + '12', borderColor: currentDnd.color + '25' }]}
          onPress={() => router.push('/features/dnd-settings' as any)}
        >
          <FontAwesome name={currentDnd.icon} size={12} color={currentDnd.color} />
          <Text style={[styles.dndText, { color: currentDnd.color }]}>{currentDnd.label}</Text>
          <Text style={styles.dndHint}>Top 3 can still reach you</Text>
        </TouchableOpacity>
      )}

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <FontAwesome name="search" size={14} color={NDEIP_COLORS.gray[500]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats..."
            placeholderTextColor={NDEIP_COLORS.gray[500]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={CONVERSATIONS}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListHeaderComponent={() => (
          <View>
            {/* Top 3 Contacts */}
            <View style={styles.top3Section}>
              <View style={styles.top3Header}>
                <FontAwesome name="star" size={12} color={NDEIP_COLORS.gold} />
                <Text style={styles.top3Title}>Top 3</Text>
              </View>
              <View style={styles.top3Row}>
                {TOP_3.map((c, i) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.top3Card}
                    onPress={() => router.push({ pathname: '/chat', params: { contactId: c.id, contactName: c.name } } as any)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.top3Avatar, { backgroundColor: c.color }]}>
                      <Text style={styles.top3AvatarText}>{c.initials}</Text>
                      {c.online && <View style={styles.onlineDot} />}
                    </View>
                    <Text style={styles.top3Name} numberOfLines={1}>{c.name}</Text>
                    {c.unread > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{c.unread}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.recentLabel}>Recent</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatRow}
            onPress={() => router.push({ pathname: '/chat', params: { contactId: item.id, contactName: item.name } } as any)}
            activeOpacity={0.65}
          >
            <View style={[styles.chatAvatar, { backgroundColor: item.isGroup ? NDEIP_COLORS.electricBlue : NDEIP_COLORS.primaryTeal }]}>
              <Text style={styles.chatAvatarText}>{item.initials}</Text>
              {item.online && <View style={styles.chatOnlineDot} />}
            </View>
            <View style={styles.chatContent}>
              <View style={styles.chatTopRow}>
                <Text style={styles.chatName} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.chatTime, item.unread > 0 && { color: NDEIP_COLORS.emerald }]}>{item.time}</Text>
              </View>
              <View style={styles.chatBottomRow}>
                <Text style={styles.chatMsg} numberOfLines={1}>{item.lastMessage}</Text>
                {item.unread > 0 && (
                  <View style={styles.chatUnread}>
                    <Text style={styles.chatUnreadText}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <FontAwesome name="pencil" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NDEIP_COLORS.gray[950] },

  dndStrip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 8, borderBottomWidth: 1 },
  dndText: { fontSize: 13, fontWeight: '700' },
  dndHint: { fontSize: 11, color: NDEIP_COLORS.gray[500], marginLeft: 'auto' },

  searchRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14, paddingHorizontal: 14, height: 44, gap: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  searchInput: { flex: 1, fontSize: 14, color: NDEIP_COLORS.gray[100] },

  filtersRow: { maxHeight: 44, marginBottom: 8 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  filterChipActive: {
    backgroundColor: NDEIP_COLORS.primaryTeal + '18', borderColor: NDEIP_COLORS.primaryTeal + '40',
  },
  filterText: { fontSize: 12, fontWeight: '600', color: NDEIP_COLORS.gray[400] },
  filterTextActive: { color: NDEIP_COLORS.emerald },

  top3Section: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 14 },
  top3Header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  top3Title: { fontSize: 11, fontWeight: '700', color: NDEIP_COLORS.gold, textTransform: 'uppercase', letterSpacing: 1 },
  top3Row: { flexDirection: 'row', gap: 14 },
  top3Card: { alignItems: 'center', width: 70 },
  top3Avatar: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  top3AvatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  top3Name: { fontSize: 11, fontWeight: '600', color: NDEIP_COLORS.gray[300], textAlign: 'center' },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6,
    backgroundColor: NDEIP_COLORS.emerald, borderWidth: 2, borderColor: NDEIP_COLORS.gray[950],
  },
  unreadBadge: {
    position: 'absolute', top: -2, right: 2, minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: NDEIP_COLORS.emerald, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4,
  },
  unreadText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  recentLabel: {
    fontSize: 11, fontWeight: '700', color: NDEIP_COLORS.gray[500], textTransform: 'uppercase',
    letterSpacing: 1, paddingHorizontal: 16, paddingBottom: 8,
  },

  chatRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  chatAvatar: { width: 50, height: 50, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  chatAvatarText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  chatOnlineDot: {
    position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: 6,
    backgroundColor: NDEIP_COLORS.emerald, borderWidth: 2, borderColor: NDEIP_COLORS.gray[950],
  },
  chatContent: { flex: 1 },
  chatTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  chatName: { fontSize: 15, fontWeight: '700', color: NDEIP_COLORS.gray[100], flex: 1, marginRight: 8 },
  chatTime: { fontSize: 11, color: NDEIP_COLORS.gray[500], fontWeight: '500' },
  chatBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatMsg: { fontSize: 13, color: NDEIP_COLORS.gray[400], flex: 1, marginRight: 8 },
  chatUnread: {
    minWidth: 20, height: 20, borderRadius: 10, backgroundColor: NDEIP_COLORS.emerald,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5,
  },
  chatUnreadText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  fab: {
    position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 16,
    backgroundColor: NDEIP_COLORS.primaryTeal, justifyContent: 'center', alignItems: 'center',
    shadowColor: NDEIP_COLORS.primaryTeal, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
  },
});
