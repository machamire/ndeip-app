import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NDEIP_COLORS } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const MOCK_CONTACTS = [
    { id: '1', name: 'Sarah Johnson', phone: '+1 (555) 111-2222' },
    { id: '2', name: 'Marcus Williams', phone: '+1 (555) 333-4444' },
    { id: '3', name: 'Lisa Chen', phone: '+1 (555) 555-6666' },
];

const ALL_CONTACTS = [
    { id: '4', name: 'Amara Okafor', phone: '+1 (555) 777-8888' },
    { id: '5', name: 'Robert Taylor', phone: '+1 (555) 999-0000' },
    { id: '6', name: 'David Kim', phone: '+1 (555) 121-3434' },
    { id: '7', name: 'Emma Wilson', phone: '+1 (555) 565-7878' },
];

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
const SLOT_COLORS = [NDEIP_COLORS.primaryTeal, NDEIP_COLORS.electricBlue, NDEIP_COLORS.meshCyan];

export default function Top3Screen() {
    const [top3, setTop3] = useState(MOCK_CONTACTS);
    const [showPicker, setShowPicker] = useState(false);
    const [editingSlot, setEditingSlot] = useState<number | null>(null);

    const handleRemove = (index: number) => {
        const newTop3 = [...top3];
        newTop3.splice(index, 1);
        setTop3(newTop3);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Hero */}
            <View style={styles.heroSection}>
                <View style={styles.starsRow}>
                    <FontAwesome name="star" size={18} color={NDEIP_COLORS.gold} />
                    <FontAwesome name="star" size={26} color={NDEIP_COLORS.gold} />
                    <FontAwesome name="star" size={18} color={NDEIP_COLORS.gold} />
                </View>
                <Text style={styles.heroTitle}>Your Top 3</Text>
                <Text style={styles.heroSubtitle}>
                    These contacts always get through — even when you're on DND. Their stories are ad-free.
                </Text>
            </View>

            {/* Slots */}
            <View style={styles.slotsContainer}>
                {[0, 1, 2].map(index => {
                    const contact = top3[index];
                    return (
                        <View key={index} style={styles.slotCard}>
                            <View style={[styles.slotBadge, { backgroundColor: SLOT_COLORS[index] + '15' }]}>
                                <Text style={[styles.slotNumber, { color: SLOT_COLORS[index] }]}>{index + 1}</Text>
                            </View>
                            {contact ? (
                                <View style={styles.slotContent}>
                                    <View style={[styles.slotAvatar, { backgroundColor: SLOT_COLORS[index] }]}>
                                        <Text style={styles.slotAvatarText}>{getInitials(contact.name)}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.slotName}>{contact.name}</Text>
                                        <Text style={styles.slotPhone}>{contact.phone}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleRemove(index)} style={styles.removeButton}>
                                        <FontAwesome name="times" size={12} color={NDEIP_COLORS.rose} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity style={styles.addSlot} onPress={() => { setEditingSlot(index); setShowPicker(true); }}>
                                    <FontAwesome name="plus" size={14} color={SLOT_COLORS[index]} />
                                    <Text style={[styles.addSlotText, { color: SLOT_COLORS[index] }]}>Add contact</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}
            </View>

            {/* Perks */}
            <Text style={styles.sectionHeader}>Top 3 Perks</Text>
            {[
                { icon: 'bell', text: 'Always ring through, even on DND', color: NDEIP_COLORS.emerald },
                { icon: 'shield', text: 'No ads between their stories', color: NDEIP_COLORS.electricBlue },
                { icon: 'bolt', text: 'Priority message delivery', color: NDEIP_COLORS.gold },
                { icon: 'star', text: 'Pinned to top of chat list', color: NDEIP_COLORS.rose },
            ].map((perk, i) => (
                <View key={i} style={styles.perkItem}>
                    <View style={[styles.perkIcon, { backgroundColor: perk.color + '12' }]}>
                        <FontAwesome name={perk.icon as any} size={14} color={perk.color} />
                    </View>
                    <Text style={styles.perkText}>{perk.text}</Text>
                </View>
            ))}

            {/* Contact Picker */}
            {showPicker && (
                <View style={styles.pickerOverlay}>
                    <Text style={styles.pickerTitle}>Choose a contact</Text>
                    {ALL_CONTACTS.map(contact => (
                        <TouchableOpacity
                            key={contact.id} style={styles.pickerItem}
                            onPress={() => {
                                if (editingSlot !== null) {
                                    const newTop3 = [...top3];
                                    newTop3[editingSlot] = contact;
                                    setTop3(newTop3);
                                }
                                setShowPicker(false);
                                setEditingSlot(null);
                            }}
                        >
                            <View style={[styles.pickerAvatar, { backgroundColor: NDEIP_COLORS.primaryTeal }]}>
                                <Text style={styles.pickerAvatarText}>{getInitials(contact.name)}</Text>
                            </View>
                            <View>
                                <Text style={styles.pickerName}>{contact.name}</Text>
                                <Text style={styles.pickerPhone}>{contact.phone}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.cancelButton} onPress={() => { setShowPicker(false); setEditingSlot(null); }}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: NDEIP_COLORS.gray[950] },
    heroSection: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 40, gap: 8 },
    starsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    heroTitle: { fontSize: 26, fontWeight: '800', color: NDEIP_COLORS.gray[100] },
    heroSubtitle: { fontSize: 14, color: NDEIP_COLORS.gray[400], textAlign: 'center', lineHeight: 22 },
    slotsContainer: { paddingHorizontal: 16, gap: 12, marginBottom: 28 },
    slotCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    slotBadge: { position: 'absolute', top: 10, right: 12, width: 24, height: 24, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    slotNumber: { fontSize: 12, fontWeight: '800' },
    slotContent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    slotAvatar: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    slotAvatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    slotName: { fontSize: 16, fontWeight: '600', color: NDEIP_COLORS.gray[100] },
    slotPhone: { fontSize: 13, color: NDEIP_COLORS.gray[500], marginTop: 2 },
    removeButton: { width: 32, height: 32, borderRadius: 10, backgroundColor: NDEIP_COLORS.rose + '10', justifyContent: 'center', alignItems: 'center' },
    addSlot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
    addSlotText: { fontSize: 15, fontWeight: '600' },
    sectionHeader: { fontSize: 11, fontWeight: '700', color: NDEIP_COLORS.gray[500], textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 16, paddingBottom: 12 },
    perkItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 14 },
    perkIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    perkText: { fontSize: 15, color: NDEIP_COLORS.gray[200], fontWeight: '500' },
    pickerOverlay: { margin: 16, marginTop: 28, padding: 20, backgroundColor: NDEIP_COLORS.gray[900], borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    pickerTitle: { fontSize: 18, fontWeight: '700', color: NDEIP_COLORS.gray[100], marginBottom: 16 },
    pickerItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.04)' },
    pickerAvatar: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    pickerAvatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    pickerName: { fontSize: 15, fontWeight: '600', color: NDEIP_COLORS.gray[200] },
    pickerPhone: { fontSize: 12, color: NDEIP_COLORS.gray[500], marginTop: 1 },
    cancelButton: { marginTop: 12, paddingVertical: 12, alignItems: 'center' },
    cancelText: { fontSize: 15, fontWeight: '600', color: NDEIP_COLORS.rose },
});
