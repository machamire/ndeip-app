import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NDEIP_COLORS } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const PRESET_LISTS = [
    { id: 'unread', label: 'Unread', type: 'preset', icon: 'envelope' },
    { id: 'favorites', label: 'Favorites', type: 'preset', icon: 'star' },
    { id: 'groups', label: 'Groups', type: 'preset', icon: 'users' },
    { id: 'available', label: 'Available presets', type: 'preset', icon: 'check-circle' },
    { id: 'villages', label: 'Villages', type: 'preset', icon: 'home' },
];

export default function ListsScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.sectionHeader}>Your lists</Text>
            {PRESET_LISTS.map(item => (
                <TouchableOpacity key={item.id} style={styles.item} activeOpacity={0.7}>
                    <FontAwesome name={item.icon as any} size={16} color={NDEIP_COLORS.primaryTeal} style={{ width: 24 }} />
                    <Text style={styles.itemLabel}>{item.label}</Text>
                    <View style={styles.presetBadge}><Text style={styles.presetText}>preset</Text></View>
                </TouchableOpacity>
            ))}

            <View style={styles.emptySection}>
                <View style={styles.emptyIcon}>
                    <FontAwesome name="th-list" size={32} color={NDEIP_COLORS.gray[600]} />
                </View>
                <Text style={styles.emptyTitle}>Custom Lists</Text>
                <Text style={styles.emptyText}>Any list you create becomes a filter at the top of your Chats tab.</Text>
                <TouchableOpacity style={styles.createButton}>
                    <FontAwesome name="plus" size={14} color="#fff" />
                    <Text style={styles.createButtonText}>Create a custom list</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0F0F' },
    sectionHeader: { fontSize: 13, fontWeight: '700', color: NDEIP_COLORS.gray[500], textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 },
    item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.04)' },
    itemLabel: { flex: 1, fontSize: 16, fontWeight: '500', color: '#D8E0E0' },
    presetBadge: { backgroundColor: 'rgba(0,59,59,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    presetText: { fontSize: 11, color: NDEIP_COLORS.primaryTeal, fontWeight: '600' },
    emptySection: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 32, gap: 12 },
    emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.04)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: NDEIP_COLORS.gray[300] },
    emptyText: { fontSize: 14, color: NDEIP_COLORS.gray[500], textAlign: 'center', lineHeight: 22 },
    createButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: NDEIP_COLORS.primaryTeal, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25, marginTop: 8 },
    createButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
