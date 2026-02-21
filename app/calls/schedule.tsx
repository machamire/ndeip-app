/**
 * Schedule Call — Create a scheduled call with title, description, time
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
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
import { Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';

export default function ScheduleCallScreen() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [callType, setCallType] = useState<'voice' | 'video'>('voice');
    const [focused, setFocused] = useState<string | null>(null);

    const handleSchedule = () => {
        if (!title.trim()) {
            Alert.alert('Required', 'Please enter a call title.');
            return;
        }
        Alert.alert(
            'Call Scheduled! 📅',
            `"${title}" has been scheduled. Participants will be notified.`,
            [{ text: 'OK', onPress: () => router.back() }]
        );
    };

    const handleCreateLink = () => {
        Alert.alert(
            'Call Link Created! 🔗',
            'Your call link has been copied to clipboard:\nndeip.com/call/abc123',
            [
                { text: 'Share', onPress: () => { } },
                { text: 'OK' },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <FontAwesome name="arrow-left" size={18} color={NDEIP_COLORS.gray[300]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Schedule Call</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Call Type Toggle */}
                <View style={styles.typeToggle}>
                    {(['voice', 'video'] as const).map((t) => (
                        <TouchableOpacity
                            key={t}
                            onPress={() => setCallType(t)}
                            style={[styles.typeBtn, callType === t && styles.typeBtnActive]}
                            activeOpacity={0.7}
                        >
                            <FontAwesome
                                name={t === 'voice' ? 'phone' : 'video-camera'}
                                size={14}
                                color={callType === t ? '#fff' : NDEIP_COLORS.gray[500]}
                            />
                            <Text style={[styles.typeText, callType === t && styles.typeTextActive]}>
                                {t === 'voice' ? 'Voice' : 'Video'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Title */}
                <View style={styles.field}>
                    <Text style={styles.label}>Call Title</Text>
                    <View style={[styles.inputWrap, focused === 'title' && styles.inputFocused]}>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. Team sync, Family catchup"
                            placeholderTextColor={NDEIP_COLORS.gray[600]}
                            style={styles.input}
                            onFocus={() => setFocused('title')}
                            onBlur={() => setFocused(null)}
                        />
                    </View>
                </View>

                {/* Description */}
                <View style={styles.field}>
                    <Text style={styles.label}>Description <Text style={styles.labelHint}>(optional)</Text></Text>
                    <View style={[styles.inputWrap, styles.textAreaWrap, focused === 'desc' && styles.inputFocused]}>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="What's this call about?"
                            placeholderTextColor={NDEIP_COLORS.gray[600]}
                            style={[styles.input, styles.textArea]}
                            multiline numberOfLines={3}
                            onFocus={() => setFocused('desc')}
                            onBlur={() => setFocused(null)}
                        />
                    </View>
                </View>

                {/* Date */}
                <View style={styles.field}>
                    <Text style={styles.label}>Date</Text>
                    <View style={[styles.inputWrap, focused === 'date' && styles.inputFocused]}>
                        <FontAwesome name="calendar-o" size={14} color={NDEIP_COLORS.gray[500]} />
                        <TextInput
                            value={date}
                            onChangeText={setDate}
                            placeholder="e.g. Feb 25, 2026"
                            placeholderTextColor={NDEIP_COLORS.gray[600]}
                            style={styles.input}
                            onFocus={() => setFocused('date')}
                            onBlur={() => setFocused(null)}
                        />
                    </View>
                </View>

                {/* Time */}
                <View style={styles.timeRow}>
                    <View style={[styles.field, { flex: 1 }]}>
                        <Text style={styles.label}>Start</Text>
                        <View style={[styles.inputWrap, focused === 'start' && styles.inputFocused]}>
                            <FontAwesome name="clock-o" size={14} color={NDEIP_COLORS.gray[500]} />
                            <TextInput
                                value={startTime}
                                onChangeText={setStartTime}
                                placeholder="10:00 AM"
                                placeholderTextColor={NDEIP_COLORS.gray[600]}
                                style={styles.input}
                                onFocus={() => setFocused('start')}
                                onBlur={() => setFocused(null)}
                            />
                        </View>
                    </View>
                    <View style={[styles.field, { flex: 1 }]}>
                        <Text style={styles.label}>End</Text>
                        <View style={[styles.inputWrap, focused === 'end' && styles.inputFocused]}>
                            <FontAwesome name="clock-o" size={14} color={NDEIP_COLORS.gray[500]} />
                            <TextInput
                                value={endTime}
                                onChangeText={setEndTime}
                                placeholder="11:00 AM"
                                placeholderTextColor={NDEIP_COLORS.gray[600]}
                                style={styles.input}
                                onFocus={() => setFocused('end')}
                                onBlur={() => setFocused(null)}
                            />
                        </View>
                    </View>
                </View>

                {/* Create Link */}
                <TouchableOpacity onPress={handleCreateLink} style={styles.linkBtn} activeOpacity={0.7}>
                    <FontAwesome name="link" size={14} color={NDEIP_COLORS.electricBlue} />
                    <Text style={styles.linkBtnText}>Create call link to share</Text>
                </TouchableOpacity>

                {/* Schedule button */}
                <TouchableOpacity onPress={handleSchedule} activeOpacity={0.85} style={styles.scheduleBtn}>
                    <LinearGradient
                        colors={NDEIP_COLORS.gradients.brand as any}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.scheduleGradient}
                    >
                        <FontAwesome name="calendar-check-o" size={16} color="#fff" />
                        <Text style={styles.scheduleText}>Schedule Call</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
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
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    headerTitle: { color: '#fff', fontSize: 17, fontWeight: '600' },
    scrollContent: { paddingBottom: 40, paddingTop: 8 },
    typeToggle: {
        flexDirection: 'row',
        marginHorizontal: Spacing.screenHorizontal,
        marginVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 14,
        padding: 4,
    },
    typeBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: 10, borderRadius: 12,
    },
    typeBtnActive: {
        backgroundColor: 'rgba(27,77,62,0.25)',
    },
    typeText: { color: NDEIP_COLORS.gray[500], fontSize: 14, fontWeight: '500' },
    typeTextActive: { color: '#fff' },
    field: { paddingHorizontal: Spacing.screenHorizontal, marginBottom: 16 },
    label: { color: NDEIP_COLORS.gray[400], fontSize: 13, fontWeight: '500', marginBottom: 8 },
    labelHint: { color: NDEIP_COLORS.gray[600], fontWeight: '400' },
    inputWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: Radii.input, borderWidth: 1.5, borderColor: 'transparent',
        height: 48, paddingHorizontal: 14, gap: 10,
    },
    textAreaWrap: { height: 80, alignItems: 'flex-start', paddingVertical: 12 },
    inputFocused: { borderColor: 'rgba(27,77,62,0.35)' },
    input: { flex: 1, color: '#F0F4F3', fontSize: 15 },
    textArea: { textAlignVertical: 'top', height: '100%' as any },
    timeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    linkBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8,
        marginHorizontal: Spacing.screenHorizontal,
        marginBottom: 20,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(37,99,235,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(37,99,235,0.15)',
    },
    linkBtnText: { color: NDEIP_COLORS.electricBlue, fontSize: 14, fontWeight: '500' },
    scheduleBtn: { marginHorizontal: Spacing.screenHorizontal },
    scheduleGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, height: 48, borderRadius: 14,
    },
    scheduleText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
