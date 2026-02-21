/**
 * Channel Templates — Browse and pick a template to create a channel
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { NDEIP_COLORS } from '@/constants/Colors';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';
import { TEMPLATE_CATEGORIES, CHANNEL_TEMPLATES } from '@/constants/channelTemplates';

export default function ChannelTemplatesScreen() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const filteredTemplates = selectedCategory
        ? CHANNEL_TEMPLATES.filter((t) => t.category === selectedCategory)
        : CHANNEL_TEMPLATES;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* ─── Header ─── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <FontAwesome name="arrow-left" size={18} color={NDEIP_COLORS.gray[300]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Channel Templates</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* ─── Intro ─── */}
                <Text style={styles.intro}>
                    Pick a template to get started, or create one from scratch.
                </Text>

                {/* ─── Create from scratch ─── */}
                <TouchableOpacity
                    onPress={() => router.push('/villages/create-channel' as any)}
                    style={styles.scratchBtn}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={NDEIP_COLORS.gradients.brand as any}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.scratchGradient}
                    >
                        <FontAwesome name="plus" size={16} color="#fff" />
                        <Text style={styles.scratchText}>Create from Scratch</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* ─── Category Filter ─── */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryRow}
                >
                    <TouchableOpacity
                        onPress={() => setSelectedCategory(null)}
                        style={[styles.categoryPill, !selectedCategory && styles.categoryPillActive]}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.categoryPillText, !selectedCategory && styles.categoryPillTextActive]}>All</Text>
                    </TouchableOpacity>
                    {TEMPLATE_CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat.key}
                            onPress={() => setSelectedCategory(cat.key)}
                            style={[styles.categoryPill, selectedCategory === cat.key && styles.categoryPillActive]}
                            activeOpacity={0.7}
                        >
                            <FontAwesome
                                name={cat.icon as any}
                                size={12}
                                color={selectedCategory === cat.key ? '#fff' : NDEIP_COLORS.gray[500]}
                            />
                            <Text style={[styles.categoryPillText, selectedCategory === cat.key && styles.categoryPillTextActive]}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* ─── Templates ─── */}
                {filteredTemplates.map((tpl) => (
                    <TouchableOpacity
                        key={tpl.id}
                        onPress={() => router.push({ pathname: '/villages/create-channel', params: { templateId: tpl.id } } as any)}
                        style={styles.tplCard}
                        activeOpacity={0.7}
                    >
                        <View style={styles.tplHeader}>
                            <View style={styles.tplIconWrap}>
                                <FontAwesome name={tpl.categoryIcon as any} size={16} color={NDEIP_COLORS.primaryTeal} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.tplName}>{tpl.name}</Text>
                                <Text style={styles.tplDesc}>{tpl.description}</Text>
                            </View>
                            <View style={[styles.privacyBadge, tpl.privacySuggestion === 'private' && styles.privacyBadgePrivate]}>
                                <FontAwesome
                                    name={tpl.privacySuggestion === 'private' ? 'lock' : 'globe'}
                                    size={10}
                                    color={tpl.privacySuggestion === 'private' ? NDEIP_COLORS.amber : NDEIP_COLORS.emerald}
                                />
                            </View>
                        </View>
                        <View style={styles.tplTopics}>
                            {tpl.suggestedTopics.slice(0, 3).map((topic, i) => (
                                <View key={i} style={styles.topicChip}>
                                    <Text style={styles.topicText}>{topic}</Text>
                                </View>
                            ))}
                        </View>
                    </TouchableOpacity>
                ))}
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
    scrollContent: { paddingBottom: 40 },
    intro: {
        color: NDEIP_COLORS.gray[400], fontSize: 14, lineHeight: 20,
        paddingHorizontal: Spacing.screenHorizontal, paddingTop: 20, paddingBottom: 14,
    },
    scratchBtn: { marginHorizontal: Spacing.screenHorizontal, marginBottom: 16 },
    scratchGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, height: 44, borderRadius: 14,
    },
    scratchText: { color: '#fff', fontSize: 15, fontWeight: '600' },
    categoryRow: {
        paddingHorizontal: Spacing.screenHorizontal,
        gap: 8, paddingBottom: 16,
    },
    categoryPill: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    categoryPillActive: {
        backgroundColor: 'rgba(27,77,62,0.25)',
        borderColor: NDEIP_COLORS.primaryTeal,
    },
    categoryPillText: { color: NDEIP_COLORS.gray[500], fontSize: 12, fontWeight: '500' },
    categoryPillTextActive: { color: '#fff' },
    tplCard: {
        marginHorizontal: Spacing.screenHorizontal, marginBottom: 12,
        padding: 16, borderRadius: Radii.card,
        backgroundColor: Glass.dark.background,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Glass.dark.borderSubtle,
    },
    tplHeader: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    },
    tplIconWrap: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: 'rgba(27,77,62,0.12)',
        alignItems: 'center', justifyContent: 'center',
    },
    tplName: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 3 },
    tplDesc: { color: NDEIP_COLORS.gray[400], fontSize: 13, lineHeight: 18 },
    privacyBadge: {
        width: 26, height: 26, borderRadius: 13,
        backgroundColor: 'rgba(16,185,129,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    privacyBadgePrivate: { backgroundColor: 'rgba(245,158,11,0.1)' },
    tplTopics: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
    topicChip: {
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    topicText: { color: NDEIP_COLORS.gray[500], fontSize: 11, fontWeight: '500' },
});
