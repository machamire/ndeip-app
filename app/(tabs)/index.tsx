import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Shadows, Glass } from '@/constants/ndeipBrandSystem';

// ─── Mock Data ────────────────────────────────────────────
const TOP_3 = [
  { id: '1', name: 'Sarah', online: true, avatar: null },
  { id: '2', name: 'Marcus', online: true, avatar: null },
  { id: '3', name: 'Thandi', online: false, avatar: null },
];

const FILTERS = ['All', 'Unread', 'Groups', 'Channels'];

const CONVERSATIONS = [
  { id: '1', name: 'Sarah Chen', message: 'See you at the village meeting! 🎉', time: '2m', unread: 3, online: true, pinned: true },
  { id: '2', name: 'Marcus Johnson', message: 'The presentation looks amazing', time: '15m', unread: 0, online: true, pinned: true },
  { id: '3', name: 'Thandi Nkosi', message: 'Voice note 🎤 0:42', time: '1h', unread: 1, online: false, pinned: true },
  { id: '4', name: 'Dev Village', message: 'Alex: Just pushed the new build', time: '2h', unread: 12, online: false, isGroup: true },
  { id: '5', name: 'Mom ❤️', message: "Don't forget to eat!", time: '3h', unread: 0, online: false },
  { id: '6', name: 'Design Team', message: 'Kai: Check the new mockups', time: '5h', unread: 5, isGroup: true },
  { id: '7', name: 'Jordan Lee', message: 'Thanks for the recommendation!', time: 'Yesterday', unread: 0 },
  { id: '8', name: 'Priya Sharma', message: 'The flight is booked ✈️', time: 'Yesterday', unread: 0 },
];

// ─── Avatar Component ─────────────────────────────────────
function Avatar({ name, size = 52, online, showRing }: { name: string; size?: number; online?: boolean; showRing?: boolean }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const colors = [
    ['#1B4D3E', '#2A7A5E'], ['#2563EB', '#3B82F6'], ['#8B5CF6', '#A78BFA'],
    ['#F59E0B', '#FBBF24'], ['#10B981', '#34D399'], ['#EF4444', '#FB7185'],
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;

  return (
    <View style={{ position: 'relative' }}>
      {showRing && (
        <LinearGradient
          colors={[NDEIP_COLORS.primaryTeal, NDEIP_COLORS.electricBlue] as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: size + 6,
            height: size + 6,
            borderRadius: (size + 6) / 2,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View style={{ width: size + 2, height: size + 2, borderRadius: (size + 2) / 2, backgroundColor: NDEIP_COLORS.gray[950], alignItems: 'center', justifyContent: 'center' }}>
            <LinearGradient
              colors={colors[colorIndex] as any}
              style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: '#fff', fontSize: size * 0.38, fontWeight: '600', letterSpacing: 0.5 }}>{initials}</Text>
            </LinearGradient>
          </View>
        </LinearGradient>
      )}
      {!showRing && (
        <LinearGradient
          colors={colors[colorIndex] as any}
          style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: '#fff', fontSize: size * 0.38, fontWeight: '600', letterSpacing: 0.5 }}>{initials}</Text>
        </LinearGradient>
      )}
      {online && (
        <View style={{
          position: 'absolute',
          bottom: showRing ? 2 : 0,
          right: showRing ? 4 : 0,
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: NDEIP_COLORS.emerald,
          borderWidth: 2.5,
          borderColor: NDEIP_COLORS.gray[950],
        }} />
      )}
    </View>
  );
}

export default function ChatsScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const [activeFilter, setActiveFilter] = React.useState('All');
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  // ─── Filtered Conversations ─────────────────────────────
  const filteredConversations = React.useMemo(() => {
    let list = CONVERSATIONS;

    // Apply filter pills
    if (activeFilter === 'Unread') list = list.filter(c => c.unread > 0);
    else if (activeFilter === 'Groups') list = list.filter(c => c.isGroup);
    else if (activeFilter === 'Channels') list = list.filter(c => c.isGroup); // placeholder for channels

    // Apply search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeFilter, searchQuery]);

  const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];
  const cardBg = isDark ? Glass.dark.background : Glass.light.background;
  const borderColor = isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ─── Top 3 Contacts ─── */}
        <View style={styles.top3Section}>
          <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>
            FAVORITES
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.top3Scroll}>
            {TOP_3.map((contact) => (
              <TouchableOpacity key={contact.id} style={styles.top3Item} activeOpacity={0.7}>
                <Avatar name={contact.name} size={Spacing.components.top3AvatarSize} online={contact.online} showRing />
                <Text style={[styles.top3Name, { color: isDark ? NDEIP_COLORS.gray[300] : NDEIP_COLORS.gray[600] }]} numberOfLines={1}>
                  {contact.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.top3AddButton} activeOpacity={0.7}>
              <View style={[styles.top3AddCircle, { borderColor: isDark ? NDEIP_COLORS.glass.border : NDEIP_COLORS.glass.borderLight }]}>
                <FontAwesome name="plus" size={18} color={NDEIP_COLORS.gray[500]} />
              </View>
              <Text style={[styles.top3Name, { color: NDEIP_COLORS.gray[500] }]}>Add</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ─── DND Status Strip ─── */}
        <TouchableOpacity
          style={[styles.dndStrip, { backgroundColor: cardBg, borderColor }]}
          activeOpacity={0.7}
        >
          <View style={[styles.dndDot, { backgroundColor: NDEIP_COLORS.emerald }]} />
          <Text style={[styles.dndText, { color: isDark ? NDEIP_COLORS.gray[400] : NDEIP_COLORS.gray[500] }]}>
            Available — Everyone can reach you
          </Text>
          <FontAwesome name="chevron-right" size={10} color={NDEIP_COLORS.gray[600]} />
        </TouchableOpacity>

        {/* ─── Search Bar ─── */}
        <View style={[styles.searchContainer, {
          backgroundColor: isDark ? Glass.dark.background : Glass.light.background,
          borderColor: searchFocused
            ? (isDark ? 'rgba(27,77,62,0.25)' : 'rgba(27,77,62,0.15)')
            : 'transparent',
        }]}>
          <FontAwesome name="search" size={14} color={NDEIP_COLORS.gray[500]} />
          <TextInput
            placeholder="Search conversations..."
            placeholderTextColor={NDEIP_COLORS.gray[500]}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            returnKeyType="search"
            autoCorrect={false}
          />
        </View>

        {/* ─── Filter Pills ─── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {FILTERS.map((filter) => {
            const isActive = filter === activeFilter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                style={[
                  styles.filterPill,
                  isActive && {
                    backgroundColor: isDark ? 'rgba(27,77,62,0.2)' : 'rgba(27,77,62,0.1)',
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterText,
                  { color: isActive ? NDEIP_COLORS.primaryTeal : (isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400]) },
                  isActive && { fontWeight: '600' as any },
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.conversationList}>
          {filteredConversations.length === 0 ? (
            <View style={styles.emptySearch}>
              <FontAwesome name="search" size={32} color={NDEIP_COLORS.gray[600]} />
              <Text style={[styles.emptySearchText, { color: NDEIP_COLORS.gray[500] }]}>
                No conversations found
              </Text>
            </View>
          ) : (
            filteredConversations.map((chat, index) => (
              <TouchableOpacity
                key={chat.id}
                style={[styles.conversationRow]}
                activeOpacity={0.6}
              >
                <Avatar
                  name={chat.name}
                  size={Spacing.components.avatarSizeMedium}
                  online={chat.online}
                />
                <View style={styles.conversationContent}>
                  <View style={styles.conversationTop}>
                    <Text style={[styles.conversationName, { color: colors.text }]} numberOfLines={1}>
                      {chat.pinned && <Text style={{ color: NDEIP_COLORS.amber }}>★ </Text>}
                      {chat.name}
                    </Text>
                    <Text style={[styles.conversationTime, { color: chat.unread > 0 ? NDEIP_COLORS.primaryTeal : NDEIP_COLORS.gray[500] }]}>
                      {chat.time}
                    </Text>
                  </View>
                  <View style={styles.conversationBottom}>
                    <Text style={[styles.conversationMessage, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]} numberOfLines={1}>
                      {chat.message}
                    </Text>
                    {chat.unread > 0 && (
                      <LinearGradient
                        colors={NDEIP_COLORS.gradients.brand as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.unreadBadge}
                      >
                        <Text style={styles.unreadText}>
                          {chat.unread > 99 ? '99+' : chat.unread}
                        </Text>
                      </LinearGradient>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* ─── FAB ─── */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <LinearGradient
          colors={NDEIP_COLORS.gradients.brand as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <FontAwesome name="pencil" size={22} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Top 3
  top3Section: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  sectionLabel: {
    ...Typography.presets.sectionLabel as any,
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: 12,
  },
  top3Scroll: {
    paddingHorizontal: Spacing.screenHorizontal,
    gap: 16,
  },
  top3Item: {
    alignItems: 'center',
    width: 72,
  },
  top3Name: {
    fontSize: Typography.sizes.micro,
    fontWeight: '500' as any,
    marginTop: 6,
  },
  top3AddButton: {
    alignItems: 'center',
    width: 72,
  },
  top3AddCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // DND Strip
  dndStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.screenHorizontal,
    marginVertical: 12,
    paddingHorizontal: 14,
    height: Spacing.components.dndStripHeight,
    borderRadius: Spacing.components.dndStripHeight / 2,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  dndDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dndText: {
    flex: 1,
    fontSize: Typography.sizes.footnote,
    fontWeight: '500' as any,
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.screenHorizontal,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: Spacing.components.searchBarHeight,
    borderRadius: Radii.input,
    borderWidth: 1.5,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.bodySmall,
    fontWeight: '400' as any,
  },
  // Filters
  filterContainer: {
    paddingHorizontal: Spacing.screenHorizontal,
    gap: 8,
    marginBottom: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: Typography.sizes.caption,
    fontWeight: '500' as any,
  },
  // Conversations
  conversationList: {
    paddingTop: 4,
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenHorizontal,
    paddingVertical: 14,
    gap: 14,
  },
  conversationContent: {
    flex: 1,
  },
  conversationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: '600' as any,
    flex: 1,
    marginRight: 8,
  },
  conversationTime: {
    fontSize: Typography.sizes.micro,
  },
  conversationBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationMessage: {
    fontSize: Typography.sizes.caption,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    minWidth: Spacing.components.badgeSize,
    height: Spacing.components.badgeSize,
    borderRadius: Spacing.components.badgeSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700' as any,
    color: '#fff',
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 88,
    right: 20,
    ...Shadows.fab,
  },
  fabGradient: {
    width: Spacing.components.fabSize,
    height: Spacing.components.fabSize,
    borderRadius: Spacing.components.fabSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Empty search state
  emptySearch: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptySearchText: {
    fontSize: Typography.sizes.bodySmall,
    marginTop: 12,
  },
});
