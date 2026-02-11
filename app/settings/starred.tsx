import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NDEIP_COLORS } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function StarredScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.emptyState}>
                <View style={styles.iconContainer}>
                    <FontAwesome name="star-o" size={48} color={NDEIP_COLORS.gray[600]} />
                </View>
                <Text style={styles.title}>No starred messages</Text>
                <Text style={styles.subtitle}>Tap and hold on any message, then tap{'\n'}"Star" to save it here for easy access.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0F0F' },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 14 },
    iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.04)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    title: { fontSize: 20, fontWeight: '700', color: NDEIP_COLORS.gray[300] },
    subtitle: { fontSize: 14, color: NDEIP_COLORS.gray[500], textAlign: 'center', lineHeight: 22 },
});
