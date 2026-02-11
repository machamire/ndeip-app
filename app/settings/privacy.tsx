import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NDEIP_COLORS } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const PRIVACY_ITEMS = [
    { id: 'last_seen', label: 'Last Seen & Online', value: 'Everyone', type: 'selector' },
    { id: 'profile_photo', label: 'Profile Photo', value: 'Everyone', type: 'selector' },
    { id: 'about', label: 'About', value: 'Everyone', type: 'selector' },
    { id: 'status', label: 'Stories', value: 'My contacts', type: 'selector' },
    { id: 'read_receipts', label: 'Read Receipts', value: true, type: 'toggle' },
    { id: 'disappearing', label: 'Default Message Timer', value: 'Off', type: 'selector' },
    { id: 'groups', label: 'Groups', value: 'Everyone', type: 'selector' },
    { id: 'live_location', label: 'Live Location', value: 'None', type: 'selector' },
    { id: 'calls', label: 'Calls', value: 'Silence unknown callers', type: 'toggle', toggleValue: false },
    { id: 'blocked', label: 'Blocked Contacts', value: '0', type: 'selector' },
    { id: 'fingerprint', label: 'App Lock', value: false, type: 'toggle' },
    { id: 'chat_lock', label: 'Chat Lock', value: 'None', type: 'selector' },
    { id: 'camera_effects', label: 'Advanced Camera Effects', value: true, type: 'toggle' },
];

export default function PrivacyScreen() {
    const [items, setItems] = useState(PRIVACY_ITEMS);

    const toggleItem = (id: string) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, value: !item.value, toggleValue: item.toggleValue !== undefined ? !item.toggleValue : undefined } : item
        ));
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.sectionHeader}>Who can see my personal info</Text>
            {items.filter(i => ['last_seen', 'profile_photo', 'about', 'status'].includes(i.id)).map(item => (
                <TouchableOpacity key={item.id} style={styles.row} activeOpacity={0.65}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.rowLabel}>{item.label}</Text>
                        <Text style={styles.rowValue}>{String(item.value)}</Text>
                    </View>
                    <FontAwesome name="chevron-right" size={11} color={NDEIP_COLORS.gray[700]} />
                </TouchableOpacity>
            ))}

            <Text style={styles.sectionHeader}>Messaging</Text>
            {items.filter(i => ['read_receipts', 'disappearing'].includes(i.id)).map(item => (
                <TouchableOpacity key={item.id} style={styles.row} activeOpacity={0.65} onPress={item.type === 'toggle' ? () => toggleItem(item.id) : undefined}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.rowLabel}>{item.label}</Text>
                        {item.type === 'selector' && <Text style={styles.rowValue}>{String(item.value)}</Text>}
                    </View>
                    {item.type === 'toggle' ? (
                        <View style={[styles.toggle, item.value && styles.toggleActive]}>
                            <View style={[styles.toggleDot, item.value && styles.toggleDotActive]} />
                        </View>
                    ) : <FontAwesome name="chevron-right" size={11} color={NDEIP_COLORS.gray[700]} />}
                </TouchableOpacity>
            ))}

            <Text style={styles.sectionHeader}>More</Text>
            {items.filter(i => ['groups', 'live_location', 'calls', 'blocked', 'fingerprint', 'chat_lock', 'camera_effects'].includes(i.id)).map(item => (
                <TouchableOpacity key={item.id} style={styles.row} activeOpacity={0.65} onPress={item.type === 'toggle' ? () => toggleItem(item.id) : undefined}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.rowLabel}>{item.label}</Text>
                        {item.type === 'selector' && <Text style={styles.rowValue}>{String(item.value)}</Text>}
                    </View>
                    {item.type === 'toggle' ? (
                        <View style={[styles.toggle, (item.value || item.toggleValue) && styles.toggleActive]}>
                            <View style={[styles.toggleDot, (item.value || item.toggleValue) && styles.toggleDotActive]} />
                        </View>
                    ) : <FontAwesome name="chevron-right" size={11} color={NDEIP_COLORS.gray[700]} />}
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: NDEIP_COLORS.gray[950] },
    sectionHeader: { fontSize: 11, fontWeight: '700', color: NDEIP_COLORS.gray[500], textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 },
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.03)' },
    rowLabel: { fontSize: 15, fontWeight: '500', color: NDEIP_COLORS.gray[200] },
    rowValue: { fontSize: 13, color: NDEIP_COLORS.gray[500], marginTop: 2 },
    toggle: { width: 46, height: 26, borderRadius: 13, backgroundColor: NDEIP_COLORS.gray[700], justifyContent: 'center', paddingHorizontal: 2 },
    toggleActive: { backgroundColor: NDEIP_COLORS.primaryTeal },
    toggleDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
    toggleDotActive: { alignSelf: 'flex-end' as any },
});
