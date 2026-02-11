import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NDEIP_COLORS } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ChatHistoryScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}>
            {/* Sync Status */}
            <View style={styles.syncCard}>
                <View style={styles.syncHeader}>
                    <FontAwesome name="exclamation-circle" size={20} color={NDEIP_COLORS.warning} />
                    <Text style={styles.syncTitle}>Couldn't finish syncing</Text>
                </View>
                <Text style={styles.syncDescription}>
                    Use the Wi-Fi and set up on your phone to continue syncing your chat history.
                </Text>
                <TouchableOpacity style={styles.learnMore}>
                    <Text style={styles.learnMoreText}>Learn more</Text>
                </TouchableOpacity>
            </View>

            {/* Partially Synced Info */}
            <View style={styles.infoCard}>
                <FontAwesome name="cloud" size={16} color={NDEIP_COLORS.gray[400]} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.infoTitle}>Partially Synced</Text>
                    <Text style={styles.infoText}>Your chat history isn't on this device. To see all your messages, restore from a backup.</Text>
                </View>
            </View>

            {/* End-to-end encrypted note */}
            <View style={styles.encryptedNote}>
                <FontAwesome name="lock" size={12} color={NDEIP_COLORS.success} />
                <Text style={styles.encryptedText}>End-to-end encrypted</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0F0F' },
    syncCard: { margin: 16, padding: 18, backgroundColor: 'rgba(255,184,0,0.08)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,184,0,0.15)' },
    syncHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    syncTitle: { fontSize: 16, fontWeight: '700', color: NDEIP_COLORS.warning },
    syncDescription: { fontSize: 14, color: NDEIP_COLORS.gray[400], lineHeight: 20, marginBottom: 12 },
    learnMore: { alignSelf: 'flex-start', paddingVertical: 6 },
    learnMoreText: { fontSize: 14, fontWeight: '600', color: NDEIP_COLORS.electricBlue },
    infoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, margin: 16, padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12 },
    infoTitle: { fontSize: 15, fontWeight: '600', color: '#D8E0E0', marginBottom: 4 },
    infoText: { fontSize: 13, color: NDEIP_COLORS.gray[500], lineHeight: 20 },
    encryptedNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, position: 'absolute', bottom: 20, left: 0, right: 0 },
    encryptedText: { fontSize: 12, color: NDEIP_COLORS.success, fontWeight: '500' },
});
