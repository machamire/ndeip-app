/**
 * User Profile — View another user's profile
 * 
 * Accessible from chat header or call history.
 * Shows avatar, name, about, action buttons (Message, Voice, Video).
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';
import { ChatService } from '@/services/ChatService';
import { supabase } from '@/lib/supabase';

interface UserProfile {
    id: string;
    display_name: string;
    avatar_url?: string;
    about?: string;
    is_online?: boolean;
}

export default function UserProfileScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const userId = (params.id as string) || '';
    const userName = (params.name as string) || 'User';
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, display_name, avatar_url, about, is_online')
                    .eq('id', userId)
                    .single();

                if (data && !error) {
                    setProfile(data as UserProfile);
                } else {
                    // Fallback with the name from params
                    setProfile({
                        id: userId,
                        display_name: userName,
                    });
                }
            } catch {
                setProfile({
                    id: userId,
                    display_name: userName,
                });
            }
            setLoading(false);
        };
        fetchProfile();
    }, [userId]);

    const handleMessage = async () => {
        try {
            const conversationId = await ChatService.findOrCreateConversation(userId);
            if (conversationId) {
                router.push({
                    pathname: '/chat',
                    params: { conversationId, name: profile?.display_name || userName },
                } as any);
            }
        } catch (err) {
            console.error('Failed to open conversation:', err);
        }
    };

    const handleVoiceCall = () => {
        router.push({
            pathname: '/call',
            params: { id: userId, name: profile?.display_name || userName, type: 'voice' },
        } as any);
    };

    const handleVideoCall = () => {
        router.push({
            pathname: '/call',
            params: { id: userId, name: profile?.display_name || userName, type: 'video' },
        } as any);
    };

    const displayName = profile?.display_name || userName;
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2);
    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={NDEIP_COLORS.primaryTeal} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <FontAwesome name="arrow-left" size={18} color={isDark ? NDEIP_COLORS.gray[300] : NDEIP_COLORS.gray[600]} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
                {/* Avatar + Info */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarWrap}>
                        <LinearGradient
                            colors={[NDEIP_COLORS.primaryTeal, NDEIP_COLORS.electricBlue]}
                            style={styles.avatar}
                        >
                            <Text style={styles.avatarText}>{initials}</Text>
                        </LinearGradient>
                        {profile?.is_online && (
                            <View style={styles.onlineDot} />
                        )}
                    </View>

                    <Text style={[styles.displayName, { color: colors.text }]}>
                        {displayName}
                    </Text>

                    {profile?.about ? (
                        <Text style={[styles.aboutText, { color: isDark ? NDEIP_COLORS.gray[400] : NDEIP_COLORS.gray[600] }]}>
                            {profile.about}
                        </Text>
                    ) : (
                        <Text style={[styles.aboutText, { color: NDEIP_COLORS.gray[500], fontStyle: 'italic' }]}>
                            No about info
                        </Text>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionBtn} onPress={handleMessage} activeOpacity={0.7}>
                        <View style={[styles.actionIcon, { backgroundColor: isDark ? 'rgba(27,77,62,0.15)' : 'rgba(27,77,62,0.08)' }]}>
                            <FontAwesome name="comment" size={18} color={NDEIP_COLORS.primaryTeal} />
                        </View>
                        <Text style={[styles.actionLabel, { color: NDEIP_COLORS.primaryTeal }]}>Message</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn} onPress={handleVoiceCall} activeOpacity={0.7}>
                        <View style={[styles.actionIcon, { backgroundColor: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)' }]}>
                            <FontAwesome name="phone" size={18} color={NDEIP_COLORS.emerald} />
                        </View>
                        <Text style={[styles.actionLabel, { color: NDEIP_COLORS.emerald }]}>Voice</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn} onPress={handleVideoCall} activeOpacity={0.7}>
                        <View style={[styles.actionIcon, { backgroundColor: isDark ? 'rgba(37,99,235,0.12)' : 'rgba(37,99,235,0.08)' }]}>
                            <FontAwesome name="video-camera" size={16} color={NDEIP_COLORS.electricBlue} />
                        </View>
                        <Text style={[styles.actionLabel, { color: NDEIP_COLORS.electricBlue }]}>Video</Text>
                    </TouchableOpacity>
                </View>

                {/* Info Cards */}
                <View style={styles.infoSection}>
                    <View style={[styles.infoCard, {
                        backgroundColor: isDark ? Glass.dark.background : Glass.light.background,
                        borderColor: isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle,
                    }]}>
                        <View style={styles.infoRow}>
                            <FontAwesome name="info-circle" size={16} color={NDEIP_COLORS.gray[500]} />
                            <Text style={[styles.infoLabel, { color: isDark ? NDEIP_COLORS.gray[400] : NDEIP_COLORS.gray[600] }]}>
                                About
                            </Text>
                        </View>
                        <Text style={[styles.infoValue, { color: colors.text }]}>
                            {profile?.about || 'Hey there! I am using NDEIP.'}
                        </Text>
                    </View>

                    {/* Shared Media placeholder */}
                    <TouchableOpacity
                        style={[styles.infoCard, {
                            backgroundColor: isDark ? Glass.dark.background : Glass.light.background,
                            borderColor: isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle,
                        }]}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.infoRow, { justifyContent: 'space-between' }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <FontAwesome name="photo" size={16} color={NDEIP_COLORS.gray[500]} />
                                <Text style={[styles.infoLabel, { color: isDark ? NDEIP_COLORS.gray[400] : NDEIP_COLORS.gray[600] }]}>
                                    Media, links, docs
                                </Text>
                            </View>
                            <FontAwesome name="chevron-right" size={12} color={NDEIP_COLORS.gray[600]} />
                        </View>
                    </TouchableOpacity>

                    {/* Mute / Block actions */}
                    <View style={[styles.infoCard, {
                        backgroundColor: isDark ? Glass.dark.background : Glass.light.background,
                        borderColor: isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle,
                    }]}>
                        <TouchableOpacity style={styles.infoRow} activeOpacity={0.6}>
                            <FontAwesome name="bell-slash-o" size={15} color={NDEIP_COLORS.gray[500]} />
                            <Text style={[styles.infoLabel, { color: isDark ? NDEIP_COLORS.gray[400] : NDEIP_COLORS.gray[600] }]}>
                                Mute notifications
                            </Text>
                        </TouchableOpacity>
                        <View style={[styles.divider, { backgroundColor: isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle }]} />
                        <TouchableOpacity style={styles.infoRow} activeOpacity={0.6}>
                            <FontAwesome name="ban" size={15} color={NDEIP_COLORS.rose} />
                            <Text style={[styles.infoLabel, { color: NDEIP_COLORS.rose }]}>
                                Block {displayName.split(' ')[0]}
                            </Text>
                        </TouchableOpacity>
                        <View style={[styles.divider, { backgroundColor: isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle }]} />
                        <TouchableOpacity style={styles.infoRow} activeOpacity={0.6}>
                            <FontAwesome name="flag" size={15} color={NDEIP_COLORS.rose} />
                            <Text style={[styles.infoLabel, { color: NDEIP_COLORS.rose }]}>
                                Report {displayName.split(' ')[0]}
                            </Text>
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
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.screenHorizontal,
        paddingVertical: 14,
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    headerTitle: { fontSize: 17, fontWeight: '600' },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 28,
        gap: 10,
    },
    avatarWrap: { position: 'relative' },
    avatar: {
        width: 100, height: 100, borderRadius: 50,
        alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { color: '#fff', fontSize: 36, fontWeight: '700' },
    onlineDot: {
        position: 'absolute', bottom: 4, right: 4,
        width: 14, height: 14, borderRadius: 7,
        backgroundColor: NDEIP_COLORS.emerald,
        borderWidth: 3, borderColor: NDEIP_COLORS.gray[950],
    },
    displayName: { fontSize: 24, fontWeight: '700' },
    aboutText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 32,
        paddingVertical: 16,
    },
    actionBtn: { alignItems: 'center', gap: 6 },
    actionIcon: {
        width: 52, height: 52, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center',
    },
    actionLabel: { fontSize: 12, fontWeight: '600' },
    infoSection: {
        paddingHorizontal: Spacing.screenHorizontal,
        paddingTop: 16,
        gap: 12,
    },
    infoCard: {
        padding: 16,
        borderRadius: Radii.card,
        borderWidth: StyleSheet.hairlineWidth,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 4,
    },
    infoLabel: { fontSize: 14, fontWeight: '500' },
    infoValue: { fontSize: 14, marginTop: 6, lineHeight: 20 },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginVertical: 10,
    },
});
