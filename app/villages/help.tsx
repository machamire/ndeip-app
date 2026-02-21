/**
 * Villages Help — "What are Villages?" article-style page
 */
import React from 'react';
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

const FEATURES = [
    { icon: 'newspaper-o' as const, title: 'Noticeboard', desc: 'Announcements, polls, and event updates from your village — all in one feed.' },
    { icon: 'microphone' as const, title: 'Live Rooms', desc: 'Clubhouse-style audio rooms for real-time conversations with village members.' },
    { icon: 'calendar' as const, title: 'Events & Meetups', desc: 'Schedule events, RSVP, and set reminders so you never miss what matters.' },
    { icon: 'lock' as const, title: 'Privacy & Moderation', desc: 'Each village has admins and rules to keep conversations safe and focused.' },
    { icon: 'thumb-tack' as const, title: 'Pinned Messages', desc: 'Important announcements pinned at the top for easy access.' },
    { icon: 'users' as const, title: 'Channels', desc: 'Organize conversations by topic within your village — from general chat to specialized discussions.' },
    { icon: 'bar-chart' as const, title: 'Polls & Voting', desc: 'Create polls to make group decisions, gather opinions, and drive engagement.' },
    { icon: 'share-alt' as const, title: 'Share & Invite', desc: 'Invite friends and family to join your village with a simple link or QR code.' },
];

const FAQ = [
    { q: 'Who can create a Village?', a: 'Anyone can create a village! Just tap the "+" button on the Villages tab and follow the steps.' },
    { q: 'Are Villages free?', a: 'Yes, creating and joining villages is completely free.' },
    { q: 'How do I leave a Village?', a: 'Go to the village settings and tap "Leave Village". Your messages will remain unless you delete them first.' },
    { q: 'Can I have multiple Villages?', a: 'Absolutely! Join as many villages as you like — there\'s no limit.' },
];

export default function VillagesHelpScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* ─── Header ─── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <FontAwesome name="arrow-left" size={18} color={NDEIP_COLORS.gray[300]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Villages</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ─── Hero ─── */}
                <View style={styles.hero}>
                    <LinearGradient
                        colors={NDEIP_COLORS.gradients.brand as any}
                        style={styles.heroIcon}
                    >
                        <FontAwesome name="users" size={28} color="rgba(255,255,255,0.9)" />
                    </LinearGradient>
                    <Text style={styles.heroTitle}>What are Villages?</Text>
                    <Text style={styles.heroDesc}>
                        Villages are your communities on ndeip — think WhatsApp groups meets Clubhouse.
                        A space to connect, share, discuss, and organize with people who matter to you.
                    </Text>
                </View>

                {/* ─── Features ─── */}
                <Text style={styles.sectionLabel}>FEATURES</Text>
                {FEATURES.map((f, i) => (
                    <View key={i} style={styles.featureCard}>
                        <View style={styles.featureIconWrap}>
                            <FontAwesome name={f.icon} size={16} color={NDEIP_COLORS.primaryTeal} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.featureTitle}>{f.title}</Text>
                            <Text style={styles.featureDesc}>{f.desc}</Text>
                        </View>
                    </View>
                ))}

                {/* ─── FAQ ─── */}
                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>FAQ</Text>
                {FAQ.map((faq, i) => (
                    <View key={i} style={styles.faqCard}>
                        <Text style={styles.faqQ}>{faq.q}</Text>
                        <Text style={styles.faqA}>{faq.a}</Text>
                    </View>
                ))}

                {/* ─── Feedback ─── */}
                <View style={styles.feedbackWrap}>
                    <Text style={styles.feedbackText}>Does this answer your question?</Text>
                    <View style={styles.feedbackRow}>
                        <TouchableOpacity style={styles.feedbackBtn} activeOpacity={0.7}>
                            <FontAwesome name="thumbs-up" size={16} color={NDEIP_COLORS.emerald} />
                            <Text style={[styles.feedbackBtnText, { color: NDEIP_COLORS.emerald }]}>Yes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.feedbackBtn} activeOpacity={0.7}>
                            <FontAwesome name="thumbs-down" size={16} color={NDEIP_COLORS.rose} />
                            <Text style={[styles.feedbackBtnText, { color: NDEIP_COLORS.rose }]}>No</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.screenHorizontal,
        paddingVertical: 14,
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
    hero: {
        alignItems: 'center',
        paddingHorizontal: Spacing.screenHorizontal,
        paddingTop: 32,
        paddingBottom: 24,
    },
    heroIcon: {
        width: 64, height: 64, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        color: '#fff', fontSize: 26, fontWeight: '800',
        letterSpacing: -0.5, marginBottom: 10, textAlign: 'center',
    },
    heroDesc: {
        color: NDEIP_COLORS.gray[400], fontSize: 15, lineHeight: 22,
        textAlign: 'center', maxWidth: 340,
    },
    sectionLabel: {
        ...Typography.presets.sectionLabel as any,
        paddingHorizontal: Spacing.screenHorizontal,
        marginBottom: 12, marginTop: 16,
    },
    featureCard: {
        flexDirection: 'row', alignItems: 'flex-start',
        gap: 14,
        marginHorizontal: Spacing.screenHorizontal,
        marginBottom: 14,
        padding: 14,
        backgroundColor: Glass.dark.background,
        borderRadius: Radii.card,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Glass.dark.borderSubtle,
    },
    featureIconWrap: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: 'rgba(27,77,62,0.12)',
        alignItems: 'center', justifyContent: 'center',
    },
    featureTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 3 },
    featureDesc: { color: NDEIP_COLORS.gray[400], fontSize: 13, lineHeight: 19 },
    faqCard: {
        marginHorizontal: Spacing.screenHorizontal,
        marginBottom: 12,
        padding: 14,
        backgroundColor: Glass.dark.background,
        borderRadius: Radii.card,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Glass.dark.borderSubtle,
    },
    faqQ: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 6 },
    faqA: { color: NDEIP_COLORS.gray[400], fontSize: 13, lineHeight: 19 },
    feedbackWrap: {
        alignItems: 'center',
        paddingVertical: 28,
        marginTop: 8,
    },
    feedbackText: { color: NDEIP_COLORS.gray[500], fontSize: 14, marginBottom: 14 },
    feedbackRow: { flexDirection: 'row', gap: 16 },
    feedbackBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 20, paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    feedbackBtnText: { fontSize: 14, fontWeight: '600' },
});
