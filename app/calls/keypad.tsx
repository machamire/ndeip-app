/**
 * Keypad Screen — Numeric dialer
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Platform,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { NDEIP_COLORS } from '@/constants/Colors';
import { Spacing, Radii } from '@/constants/ndeipBrandSystem';

const KEYS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
];
const SUB_LABELS: Record<string, string> = {
    '2': 'ABC', '3': 'DEF', '4': 'GHI', '5': 'JKL',
    '6': 'MNO', '7': 'PQRS', '8': 'TUV', '9': 'WXYZ',
    '0': '+',
};

export default function KeypadScreen() {
    const router = useRouter();
    const [number, setNumber] = useState('');

    const handlePress = (key: string) => setNumber((prev) => prev + key);
    const handleDelete = () => setNumber((prev) => prev.slice(0, -1));
    const handleCall = () => {
        if (!number.trim()) return;
        router.push({ pathname: '/call', params: { id: 'dial', name: number, type: 'voice' } } as any);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <FontAwesome name="arrow-left" size={18} color={NDEIP_COLORS.gray[300]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Keypad</Text>
                <View style={{ width: 36 }} />
            </View>

            {/* Number display */}
            <View style={styles.display}>
                <Text style={styles.displayNumber} numberOfLines={1} adjustsFontSizeToFit>
                    {number || 'Enter number'}
                </Text>
            </View>

            {/* Keypad grid */}
            <View style={styles.keypad}>
                {KEYS.map((row, ri) => (
                    <View key={ri} style={styles.keyRow}>
                        {row.map((key) => (
                            <TouchableOpacity
                                key={key}
                                onPress={() => handlePress(key)}
                                onLongPress={key === '0' ? () => handlePress('+') : undefined}
                                style={styles.key}
                                activeOpacity={0.5}
                            >
                                <Text style={styles.keyText}>{key}</Text>
                                {SUB_LABELS[key] && (
                                    <Text style={styles.keySub}>{SUB_LABELS[key]}</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>

            {/* Action row */}
            <View style={styles.actionRow}>
                <View style={{ width: 56 }} />
                <TouchableOpacity onPress={handleCall} activeOpacity={0.85}>
                    <LinearGradient
                        colors={NDEIP_COLORS.gradients.brand as any}
                        style={styles.callBtn}
                    >
                        <FontAwesome name="phone" size={24} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn} activeOpacity={0.7}>
                    <FontAwesome name="long-arrow-left" size={22} color={NDEIP_COLORS.gray[400]} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: NDEIP_COLORS.gray[950],
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.screenHorizontal, paddingVertical: 14,
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    headerTitle: { color: '#fff', fontSize: 17, fontWeight: '600' },
    display: {
        paddingHorizontal: 32,
        paddingVertical: 24,
        alignItems: 'center',
    },
    displayNumber: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '300',
        letterSpacing: 2,
    },
    keypad: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 40,
        gap: 12,
    },
    keyRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    key: {
        width: 72, height: 72,
        borderRadius: 36,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    keyText: { color: '#fff', fontSize: 28, fontWeight: '300' },
    keySub: { color: NDEIP_COLORS.gray[500], fontSize: 10, fontWeight: '600', letterSpacing: 2, marginTop: -2 },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 40,
        paddingHorizontal: 40,
    },
    callBtn: {
        width: 64, height: 64, borderRadius: 32,
        alignItems: 'center', justifyContent: 'center',
    },
    deleteBtn: {
        width: 56, height: 56,
        alignItems: 'center', justifyContent: 'center',
    },
});
