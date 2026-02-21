/**
 * Create Channel — Form to create a new channel, optionally prefilled from a template
 */
import React, { useState, useEffect } from 'react';
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
    Switch,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { NDEIP_COLORS } from '@/constants/Colors';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';
import { CHANNEL_TEMPLATES } from '@/constants/channelTemplates';

export default function CreateChannelScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ templateId?: string }>();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [rules, setRules] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [focused, setFocused] = useState<string | null>(null);
    const [templateName, setTemplateName] = useState<string | null>(null);

    // Prefill from template if available
    useEffect(() => {
        if (params.templateId) {
            const tpl = CHANNEL_TEMPLATES.find((t) => t.id === params.templateId);
            if (tpl) {
                setName(tpl.name);
                setDescription(tpl.description);
                setRules(tpl.rules.join('\n'));
                setIsPrivate(tpl.privacySuggestion === 'private');
                setTemplateName(tpl.name);
            }
        }
    }, [params.templateId]);

    const handleCreate = () => {
        if (!name.trim()) {
            Alert.alert('Required', 'Please enter a channel name.');
            return;
        }
        // MVP: just show success and go back
        Alert.alert(
            'Channel Created! 🎉',
            `"${name}" has been created. It will appear in your Villages.`,
            [{ text: 'OK', onPress: () => router.back() }]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* ─── Header ─── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <FontAwesome name="arrow-left" size={18} color={NDEIP_COLORS.gray[300]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Channel</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {templateName && (
                    <View style={styles.templateBanner}>
                        <FontAwesome name="magic" size={14} color={NDEIP_COLORS.electricBlue} />
                        <Text style={styles.templateBannerText}>
                            Based on "{templateName}" template
                        </Text>
                    </View>
                )}

                {/* Channel Name */}
                <View style={styles.field}>
                    <Text style={styles.label}>Channel Name</Text>
                    <View style={[styles.inputWrap, focused === 'name' && styles.inputFocused]}>
                        <FontAwesome name="hashtag" size={14} color={NDEIP_COLORS.gray[500]} />
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g. Community Watch"
                            placeholderTextColor={NDEIP_COLORS.gray[600]}
                            style={styles.input}
                            onFocus={() => setFocused('name')}
                            onBlur={() => setFocused(null)}
                        />
                    </View>
                </View>

                {/* Description */}
                <View style={styles.field}>
                    <Text style={styles.label}>Description</Text>
                    <View style={[styles.inputWrap, styles.textAreaWrap, focused === 'desc' && styles.inputFocused]}>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="What is this channel about?"
                            placeholderTextColor={NDEIP_COLORS.gray[600]}
                            style={[styles.input, styles.textArea]}
                            multiline
                            numberOfLines={3}
                            onFocus={() => setFocused('desc')}
                            onBlur={() => setFocused(null)}
                        />
                    </View>
                </View>

                {/* Rules */}
                <View style={styles.field}>
                    <Text style={styles.label}>Rules <Text style={styles.labelHint}>(one per line)</Text></Text>
                    <View style={[styles.inputWrap, styles.textAreaWrap, focused === 'rules' && styles.inputFocused]}>
                        <TextInput
                            value={rules}
                            onChangeText={setRules}
                            placeholder="Be respectful&#10;No spam&#10;Stay on topic"
                            placeholderTextColor={NDEIP_COLORS.gray[600]}
                            style={[styles.input, styles.textArea]}
                            multiline
                            numberOfLines={3}
                            onFocus={() => setFocused('rules')}
                            onBlur={() => setFocused(null)}
                        />
                    </View>
                </View>

                {/* Privacy */}
                <View style={styles.privacyRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Private Channel</Text>
                        <Text style={styles.privacyHint}>
                            {isPrivate ? 'Only invited members can see and join' : 'Anyone in the village can find and join'}
                        </Text>
                    </View>
                    <Switch
                        value={isPrivate}
                        onValueChange={setIsPrivate}
                        trackColor={{ false: NDEIP_COLORS.gray[700], true: 'rgba(27,77,62,0.5)' }}
                        thumbColor={isPrivate ? NDEIP_COLORS.primaryTeal : NDEIP_COLORS.gray[400]}
                    />
                </View>

                {/* Create Button */}
                <TouchableOpacity onPress={handleCreate} activeOpacity={0.85} style={styles.createBtn}>
                    <LinearGradient
                        colors={NDEIP_COLORS.gradients.brand as any}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.createGradient}
                    >
                        <FontAwesome name="check" size={16} color="#fff" />
                        <Text style={styles.createText}>Create Channel</Text>
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
    templateBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        marginHorizontal: Spacing.screenHorizontal,
        marginBottom: 16, marginTop: 8,
        paddingHorizontal: 14, paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(37,99,235,0.08)',
        borderWidth: 1, borderColor: 'rgba(37,99,235,0.15)',
    },
    templateBannerText: { color: NDEIP_COLORS.electricBlue, fontSize: 13, fontWeight: '500' },
    field: { paddingHorizontal: Spacing.screenHorizontal, marginBottom: 18 },
    label: { color: NDEIP_COLORS.gray[400], fontSize: 13, fontWeight: '500', marginBottom: 8, marginLeft: 2 },
    labelHint: { color: NDEIP_COLORS.gray[600], fontWeight: '400' },
    inputWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: Radii.input, borderWidth: 1.5, borderColor: 'transparent',
        height: 48, paddingHorizontal: 14, gap: 10,
    },
    textAreaWrap: { height: 90, alignItems: 'flex-start', paddingVertical: 12 },
    inputFocused: { borderColor: 'rgba(27,77,62,0.35)' },
    input: { flex: 1, color: '#F0F4F3', fontSize: 15 },
    textArea: { textAlignVertical: 'top', height: '100%' as any },
    privacyRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.screenHorizontal,
        marginBottom: 24,
    },
    privacyHint: { color: NDEIP_COLORS.gray[600], fontSize: 12, marginTop: 2 },
    createBtn: { marginHorizontal: Spacing.screenHorizontal, marginTop: 8 },
    createGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, height: 48, borderRadius: 14,
    },
    createText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
