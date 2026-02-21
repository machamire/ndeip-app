/**
 * Terms & Conditions — Native scrollable page
 * Matches dark teal design system.
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

const LAST_UPDATED = 'February 20, 2026';

const SECTIONS = [
    {
        title: 'Overview',
        body: 'Welcome to ndeip ("the App"). By creating an account or using the App, you agree to these Terms & Conditions. ndeip is a communication platform that enables messaging, voice/video calls, stories, and community spaces called Villages.',
    },
    {
        title: 'Eligibility',
        body: 'You must be at least 13 years old to use ndeip. If you are under 18, you confirm that a parent or guardian has reviewed and agreed to these terms on your behalf.',
    },
    {
        title: 'User Accounts',
        body: 'You are responsible for maintaining the security of your account credentials. Do not share your password. You agree to provide accurate registration information and to update it as necessary.',
    },
    {
        title: 'User Content & Conduct',
        body: 'You retain ownership of content you post. By sharing content on ndeip, you grant us a non-exclusive license to display, distribute, and store that content for the purpose of operating the App. You agree not to post content that is illegal, harmful, threatening, abusive, defamatory, or otherwise objectionable.',
    },
    {
        title: 'Privacy',
        body: 'We value your privacy. ndeip collects only the data necessary to provide our services — your profile information, messages (end-to-end encrypted), call metadata, and usage analytics. We do not sell your personal data to third parties.',
    },
    {
        title: 'Villages & Channels',
        body: 'Villages are community spaces within ndeip. Village admins can create Channels, set rules, and moderate content. By joining a Village, you agree to follow its rules. ndeip reserves the right to remove Villages or Channels that violate these terms.',
    },
    {
        title: 'Calls & Messaging',
        body: 'ndeip provides voice and video calling features. Call quality depends on your network connection. We are not responsible for dropped calls or quality issues caused by external factors. Message delivery is best-effort.',
    },
    {
        title: 'Intellectual Property',
        body: 'The ndeip name, logo, and design are trademarks of Vana vekuLocation LLC. You may not use our trademarks without written permission.',
    },
    {
        title: 'Termination',
        body: 'We may suspend or terminate your account if you violate these terms. You may delete your account at any time through Settings. Upon deletion, your data will be removed within 30 days.',
    },
    {
        title: 'Disclaimers',
        body: 'ndeip is provided "as is" without warranties of any kind. We do not guarantee uninterrupted service. We are not liable for any indirect, incidental, or consequential damages arising from your use of the App.',
    },
    {
        title: 'Contact',
        body: 'For questions about these terms, contact us at support@ndeip.com or through the in-app feedback feature.',
    },
];

export default function TermsScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* ─── Header ─── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <FontAwesome name="arrow-left" size={18} color={NDEIP_COLORS.gray[300]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms & Conditions</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ─── Title Block ─── */}
                <View style={styles.titleBlock}>
                    <Text style={styles.pageTitle}>Terms of Service</Text>
                    <Text style={styles.updated}>Last updated: {LAST_UPDATED}</Text>
                </View>

                {/* ─── Sections ─── */}
                {SECTIONS.map((section, i) => (
                    <View key={i} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionDot} />
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                        </View>
                        <Text style={styles.sectionBody}>{section.body}</Text>
                    </View>
                ))}

                {/* ─── Footer ─── */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        © 2026 Vana vekuLocation LLC. All rights reserved.
                    </Text>
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
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    titleBlock: {
        paddingHorizontal: Spacing.screenHorizontal,
        paddingTop: 28,
        paddingBottom: 20,
    },
    pageTitle: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 6,
    },
    updated: {
        color: NDEIP_COLORS.gray[500],
        fontSize: 13,
    },
    section: {
        paddingHorizontal: Spacing.screenHorizontal,
        marginBottom: 22,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    sectionDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: NDEIP_COLORS.primaryTeal,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    sectionBody: {
        color: NDEIP_COLORS.gray[400],
        fontSize: 14,
        lineHeight: 22,
        paddingLeft: 14,
    },
    footer: {
        alignItems: 'center',
        paddingTop: 30,
        paddingBottom: 20,
    },
    footerText: {
        color: NDEIP_COLORS.gray[600],
        fontSize: 12,
    },
});
