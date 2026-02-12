import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';

const HELP_ITEMS = [
    { title: 'FAQ', desc: 'Common questions and answers', icon: 'question-circle', color: NDEIP_COLORS.electricBlue },
    { title: 'Contact Support', desc: 'Get help from our team', icon: 'envelope', color: NDEIP_COLORS.emerald },
    { title: 'Report a Problem', desc: 'Let us know about issues', icon: 'bug', color: NDEIP_COLORS.amber },
    { title: 'Suggest a Feature', desc: 'Share your ideas', icon: 'lightbulb-o', color: NDEIP_COLORS.amethyst },
    { title: 'Terms of Service', desc: '', icon: 'file-text-o', color: NDEIP_COLORS.gray[400] },
    { title: 'Privacy Policy', desc: '', icon: 'shield', color: NDEIP_COLORS.gray[400] },
];

export default function HelpFeedbackScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];
    const cardBg = isDark ? Glass.dark.background : Glass.light.background;
    const borderC = isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle;

    return (
        <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={{ paddingBottom: 60 }}>
            <Text style={[styles.sectionLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>HELP & SUPPORT</Text>
            <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderC }]}>
                {HELP_ITEMS.map((item, i) => (
                    <TouchableOpacity key={i} style={[styles.row, i < HELP_ITEMS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]} activeOpacity={0.6}>
                        <View style={[styles.iconCircle, { backgroundColor: `${item.color}15` }]}>
                            <FontAwesome name={item.icon as any} size={15} color={item.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.rowTitle, { color: colors.text }]}>{item.title}</Text>
                            {item.desc ? <Text style={[styles.rowDesc, { color: NDEIP_COLORS.gray[500] }]}>{item.desc}</Text> : null}
                        </View>
                        <FontAwesome name="chevron-right" size={12} color={NDEIP_COLORS.gray[600]} style={{ opacity: 0.5 }} />
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: NDEIP_COLORS.gray[600] }]}>ndeip v1.0.0</Text>
                <Text style={[styles.footerText, { color: NDEIP_COLORS.gray[600] }]}>Made with ❤️ in South Africa</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    sectionLabel: { ...Typography.presets.sectionLabel as any, paddingHorizontal: Spacing.screenHorizontal, marginBottom: 8, marginTop: 16 },
    card: { marginHorizontal: Spacing.screenHorizontal, borderRadius: Radii.card, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    iconCircle: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    rowTitle: { fontSize: 15, fontWeight: '500' },
    rowDesc: { fontSize: 12, marginTop: 2 },
    footer: { alignItems: 'center', paddingVertical: 32, gap: 6 },
    footerText: { fontSize: 12 },
});
