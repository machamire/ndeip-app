import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';

const STARRED = [
    { id: '1', from: 'Sarah Chen', text: 'Here\'s the link to the project docs 📎', time: 'Yesterday, 3:45 PM' },
    { id: '2', from: 'Marcus Johnson', text: 'Meeting moved to Thursday at 2 PM', time: 'Monday, 11:00 AM' },
    { id: '3', from: 'Dev Village', text: 'API endpoints are live: api.ndeip.com/v2', time: 'Last week' },
];

export default function StarredScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];

    return (
        <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={{ paddingBottom: 60 }}>
            {STARRED.length === 0 ? (
                <View style={styles.empty}>
                    <FontAwesome name="star-o" size={48} color={NDEIP_COLORS.gray[700]} />
                    <Text style={[styles.emptyText, { color: NDEIP_COLORS.gray[500] }]}>No starred messages</Text>
                    <Text style={[styles.emptyHint, { color: NDEIP_COLORS.gray[600] }]}>Long press a message to star it</Text>
                </View>
            ) : (
                STARRED.map((msg, i) => (
                    <TouchableOpacity key={msg.id} style={styles.messageRow} activeOpacity={0.6}>
                        <FontAwesome name="star" size={14} color={NDEIP_COLORS.amber} />
                        <View style={{ flex: 1 }}>
                            <View style={styles.messageTop}>
                                <Text style={[styles.messageSender, { color: colors.text }]}>{msg.from}</Text>
                                <Text style={[styles.messageTime, { color: NDEIP_COLORS.gray[500] }]}>{msg.time}</Text>
                            </View>
                            <Text style={[styles.messageText, { color: isDark ? NDEIP_COLORS.gray[400] : NDEIP_COLORS.gray[500] }]} numberOfLines={2}>
                                {msg.text}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 120, gap: 12 },
    emptyText: { fontSize: 16, fontWeight: '500' },
    emptyHint: { fontSize: 13 },
    messageRow: {
        flexDirection: 'row', gap: 12, paddingHorizontal: Spacing.screenHorizontal, paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    messageTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    messageSender: { fontSize: 15, fontWeight: '600' },
    messageTime: { fontSize: 11 },
    messageText: { fontSize: 14, lineHeight: 20 },
});
