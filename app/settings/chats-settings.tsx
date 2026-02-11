import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NDEIP_COLORS } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ChatsSettingsScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.sectionHeader}>Display</Text>
            {[
                { icon: 'paint-brush', label: 'Default chat theme', value: 'Dark' },
                { icon: 'magic', label: 'Animations', value: 'Choose whether emoji, stickers and GIFs move automatically.' },
                { icon: 'image', label: 'Save to Photos', value: 'Automatically save photos and videos you receive to Photos.' },
            ].map((item, i) => (
                <TouchableOpacity key={i} style={styles.item} activeOpacity={0.7}>
                    <FontAwesome name={item.icon as any} size={16} color={NDEIP_COLORS.primaryTeal} style={{ width: 24 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.itemLabel}>{item.label}</Text>
                        {item.value && <Text style={styles.itemValue}>{item.value}</Text>}
                    </View>
                    <FontAwesome name="chevron-right" size={12} color={NDEIP_COLORS.gray[600]} />
                </TouchableOpacity>
            ))}

            <Text style={styles.sectionHeader}>Advanced</Text>
            {[
                { icon: 'share-square-o', label: 'Export chat' },
                { icon: 'file-text-o', label: 'Voice message transcripts' },
                { icon: 'shield', label: 'Private Processing' },
            ].map((item, i) => (
                <TouchableOpacity key={i} style={styles.item} activeOpacity={0.7}>
                    <FontAwesome name={item.icon as any} size={16} color={NDEIP_COLORS.primaryTeal} style={{ width: 24 }} />
                    <Text style={[styles.itemLabel, { flex: 1 }]}>{item.label}</Text>
                    <FontAwesome name="chevron-right" size={12} color={NDEIP_COLORS.gray[600]} />
                </TouchableOpacity>
            ))}

            <Text style={styles.sectionHeader}>Bulk Actions</Text>
            {[
                { icon: 'archive', label: 'Archive all chats', color: NDEIP_COLORS.gray[300] },
                { icon: 'eraser', label: 'Clear all chats', color: NDEIP_COLORS.error },
                { icon: 'trash', label: 'Delete all chats', color: NDEIP_COLORS.error },
            ].map((item, i) => (
                <TouchableOpacity key={i} style={styles.item} activeOpacity={0.7}>
                    <FontAwesome name={item.icon as any} size={16} color={item.color} style={{ width: 24 }} />
                    <Text style={[styles.itemLabel, { flex: 1, color: item.color }]}>{item.label}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0F0F' },
    sectionHeader: { fontSize: 13, fontWeight: '700', color: NDEIP_COLORS.gray[500], textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 },
    item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.04)' },
    itemLabel: { fontSize: 16, fontWeight: '500', color: '#D8E0E0' },
    itemValue: { fontSize: 13, color: NDEIP_COLORS.gray[500], marginTop: 2, lineHeight: 18 },
});
