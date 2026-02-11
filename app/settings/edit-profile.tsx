import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Image } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { NDEIP_COLORS } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

export default function EditProfileScreen() {
    const { user, updateProfile, signOut } = useAuth();
    const router = useRouter();
    const [name, setName] = useState(user?.name || '');
    const [about, setAbout] = useState(user?.about || "Hey there! I'm using ndeip");
    const [phone, setPhone] = useState(user?.phone || '');

    const handleSave = () => {
        updateProfile({ name, about, phone });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Avatar */}
            <View style={styles.avatarSection}>
                <TouchableOpacity style={styles.avatarWrapper} activeOpacity={0.7}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{(name || 'U').charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.cameraIcon}>
                        <FontAwesome name="camera" size={12} color="#fff" />
                    </View>
                </TouchableOpacity>
                <Text style={styles.avatarHint}>Tap to change photo</Text>
            </View>

            {/* Fields */}
            {[
                { label: 'Name', value: name, onChangeText: setName, icon: 'user-o' },
                { label: 'About', value: about, onChangeText: setAbout, icon: 'info-circle' },
                { label: 'Phone', value: phone, onChangeText: setPhone, icon: 'phone', keyboardType: 'phone-pad' },
            ].map((field, i) => (
                <View key={i} style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    <View style={styles.fieldRow}>
                        <FontAwesome name={field.icon as any} size={15} color={NDEIP_COLORS.gray[500]} style={{ width: 24, textAlign: 'center' as any }} />
                        <TextInput
                            style={styles.fieldInput}
                            value={field.value}
                            onChangeText={field.onChangeText}
                            placeholderTextColor={NDEIP_COLORS.gray[600]}
                            keyboardType={(field.keyboardType as any) || 'default'}
                        />
                        <TouchableOpacity><FontAwesome name="pencil" size={14} color={NDEIP_COLORS.electricBlue} /></TouchableOpacity>
                    </View>
                </View>
            ))}

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={() => { signOut(); router.replace('/auth/login' as any); }} activeOpacity={0.7}>
                <FontAwesome name="sign-out" size={16} color={NDEIP_COLORS.rose} />
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: NDEIP_COLORS.gray[950] },
    avatarSection: { alignItems: 'center', paddingVertical: 30, gap: 10 },
    avatarWrapper: { position: 'relative' },
    avatar: { width: 96, height: 96, borderRadius: 32, backgroundColor: NDEIP_COLORS.primaryTeal, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontSize: 36, fontWeight: '700' },
    cameraIcon: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 10, backgroundColor: NDEIP_COLORS.electricBlue, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: NDEIP_COLORS.gray[950] },
    avatarHint: { fontSize: 12, color: NDEIP_COLORS.gray[500] },

    fieldGroup: { paddingHorizontal: 16, marginBottom: 20 },
    fieldLabel: { fontSize: 11, fontWeight: '700', color: NDEIP_COLORS.gray[500], textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
    fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.05)' },
    fieldInput: { flex: 1, fontSize: 16, color: NDEIP_COLORS.gray[100], fontWeight: '500' },

    saveButton: {
        marginHorizontal: 16, marginTop: 12, height: 50, borderRadius: 14,
        backgroundColor: NDEIP_COLORS.primaryTeal, justifyContent: 'center', alignItems: 'center',
        shadowColor: NDEIP_COLORS.primaryTeal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, paddingVertical: 14 },
    logoutText: { fontSize: 15, fontWeight: '600', color: NDEIP_COLORS.rose },
});
