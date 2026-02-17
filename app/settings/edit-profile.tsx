import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';
import { useAuth } from '@/contexts/AuthContext';

export default function EditProfileScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];
    const cardBg = isDark ? Glass.dark.background : Glass.light.background;
    const borderC = isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle;
    const { user, updateProfile } = useAuth();

    const [displayName, setDisplayName] = useState(user?.display_name || '');
    const [about, setAbout] = useState(user?.about || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [editing, setEditing] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const initials = displayName
        ? displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
        : 'Y';

    const handleSaveField = async (field: string, value: string) => {
        setSaving(true);
        try {
            await updateProfile({ [field]: value });
            setEditing(null);
        } catch {
            Alert.alert('Error', 'Failed to save. Please try again.');
        }
        setSaving(false);
    };

    const handlePhotoPress = () => {
        Alert.alert('Profile Photo', 'Choose an option', [
            {
                text: 'Take Photo',
                onPress: async () => {
                    try {
                        const ImagePicker = require('expo-image-picker');
                        const { status } = await ImagePicker.requestCameraPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert('Permission needed', 'Camera access is required to take a photo.');
                            return;
                        }
                        const result = await ImagePicker.launchCameraAsync({
                            mediaTypes: ['images'],
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.8,
                        });
                        if (!result.canceled && result.assets?.[0]) {
                            await updateProfile({ avatar_url: result.assets[0].uri });
                        }
                    } catch {
                        Alert.alert('Error', 'Failed to take photo.');
                    }
                },
            },
            {
                text: 'Choose from Gallery',
                onPress: async () => {
                    try {
                        const ImagePicker = require('expo-image-picker');
                        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert('Permission needed', 'Gallery access is required to choose a photo.');
                            return;
                        }
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ['images'],
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.8,
                        });
                        if (!result.canceled && result.assets?.[0]) {
                            await updateProfile({ avatar_url: result.assets[0].uri });
                        }
                    } catch {
                        Alert.alert('Error', 'Failed to pick image.');
                    }
                },
            },
            {
                text: 'Remove Photo',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await updateProfile({ avatar_url: null } as any);
                    } catch {
                        Alert.alert('Error', 'Failed to remove photo.');
                    }
                },
            },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const fields = [
        { key: 'display_name', label: 'Display Name', value: displayName, setter: setDisplayName, icon: 'user' },
        { key: 'about', label: 'About', value: about, setter: setAbout, icon: 'info-circle' },
        { key: 'phone', label: 'Phone', value: phone, setter: setPhone, icon: 'phone' },
    ];

    return (
        <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={{ paddingBottom: 60 }}>
            {/* Avatar */}
            <View style={styles.avatarSection}>
                <View style={styles.avatarWrap}>
                    <LinearGradient colors={NDEIP_COLORS.gradients.brand as any} style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </LinearGradient>
                    <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.7} onPress={handlePhotoPress}>
                        <LinearGradient colors={NDEIP_COLORS.gradients.brand as any} style={styles.cameraBtnInner}>
                            <FontAwesome name="camera" size={12} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={handlePhotoPress}>
                    <Text style={[styles.changeText, { color: NDEIP_COLORS.primaryTeal }]}>Change photo</Text>
                </TouchableOpacity>
            </View>

            {/* Fields */}
            <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderC }]}>
                {fields.map((field, i) => (
                    <TouchableOpacity
                        key={field.key}
                        style={[styles.fieldRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]}
                        activeOpacity={0.6}
                        onPress={() => setEditing(field.key)}
                    >
                        <FontAwesome name={field.icon as any} size={15} color={NDEIP_COLORS.gray[500]} style={{ width: 24 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.fieldLabel, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>{field.label}</Text>
                            {editing === field.key ? (
                                <TextInput
                                    value={field.value}
                                    onChangeText={field.setter}
                                    onBlur={() => handleSaveField(field.key, field.value)}
                                    autoFocus
                                    style={[styles.fieldInput, { color: colors.text, borderBottomColor: NDEIP_COLORS.primaryTeal }]}
                                    returnKeyType="done"
                                    onSubmitEditing={() => handleSaveField(field.key, field.value)}
                                />
                            ) : (
                                <Text style={[styles.fieldValue, { color: colors.text }]}>{field.value || 'Not set'}</Text>
                            )}
                        </View>
                        {editing !== field.key && (
                            <FontAwesome name="pencil" size={12} color={NDEIP_COLORS.gray[600]} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={[styles.hint, { color: NDEIP_COLORS.gray[600] }]}>
                Your display name and photo are visible to all ndeip users. Your phone number is kept private.
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    avatarSection: { alignItems: 'center', paddingVertical: 24 },
    avatarWrap: { position: 'relative' },
    avatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontSize: 36, fontWeight: '700' },
    cameraBtn: { position: 'absolute', bottom: 0, right: 0 },
    cameraBtnInner: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: NDEIP_COLORS.gray[950] },
    changeText: { fontSize: 14, fontWeight: '600', marginTop: 10 },
    card: {
        marginHorizontal: Spacing.screenHorizontal,
        borderRadius: Radii.card,
        borderWidth: StyleSheet.hairlineWidth,
        overflow: 'hidden',
    },
    fieldRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    fieldLabel: { fontSize: 12, fontWeight: '500', marginBottom: 2 },
    fieldValue: { fontSize: 16 },
    fieldInput: { fontSize: 16, borderBottomWidth: 1, paddingVertical: 4 },
    hint: { fontSize: 12, lineHeight: 18, paddingHorizontal: Spacing.screenHorizontal + 4, marginTop: 12 },
});
