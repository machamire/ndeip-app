import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, Animated, ScrollView,
    ActivityIndicator, Image,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { NDEIP_COLORS } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function SignupScreen() {
    const router = useRouter();
    const { signUp, signInWithGoogle, isLoading } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');

    const fadeIn = useRef(new Animated.Value(0)).current;
    const slideUp = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideUp, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleSignup = async () => {
        setError('');
        if (!name.trim()) { setError('Please enter your name'); return; }
        if (!email.trim()) { setError('Please enter your email'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
        if (password !== confirm) { setError('Passwords do not match'); return; }
        try { await signUp(email, password, name); } catch (e: any) { setError(e.message || 'Sign up failed'); }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                    <Animated.View style={[styles.headerSection, { opacity: fadeIn }]}>
                        <Image
                            source={require('../../assets/images/ndeip-logo.png')}
                            style={{ width: 120, height: 48, resizeMode: 'contain', marginBottom: 20 }}
                        />
                        <Text style={styles.title}>Create your account</Text>
                        <Text style={styles.subtitle}>Join the future of messaging</Text>
                    </Animated.View>

                    <Animated.View style={[styles.formCard, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
                        {error ? (
                            <View style={styles.errorBar}>
                                <FontAwesome name="exclamation-circle" size={14} color={NDEIP_COLORS.rose} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        {[
                            { label: 'Full Name', icon: 'user-o', value: name, onChangeText: setName, placeholder: 'John Doe' },
                            { label: 'Email', icon: 'envelope-o', value: email, onChangeText: setEmail, placeholder: 'you@example.com', keyboardType: 'email-address' },
                        ].map((field, i) => (
                            <View key={i} style={styles.inputWrapper}>
                                <Text style={styles.inputLabel}>{field.label}</Text>
                                <View style={styles.inputContainer}>
                                    <FontAwesome name={field.icon as any} size={15} color={NDEIP_COLORS.gray[400]} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder={field.placeholder}
                                        placeholderTextColor={NDEIP_COLORS.gray[500]}
                                        value={field.value}
                                        onChangeText={field.onChangeText}
                                        keyboardType={(field.keyboardType as any) || 'default'}
                                        autoCapitalize={field.keyboardType ? 'none' : 'words'}
                                    />
                                </View>
                            </View>
                        ))}

                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={styles.inputContainer}>
                                <FontAwesome name="lock" size={16} color={NDEIP_COLORS.gray[400]} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Min 6 characters"
                                    placeholderTextColor={NDEIP_COLORS.gray[500]}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPw}
                                />
                                <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                                    <FontAwesome name={showPw ? 'eye-slash' : 'eye'} size={15} color={NDEIP_COLORS.gray[400]} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Confirm Password</Text>
                            <View style={styles.inputContainer}>
                                <FontAwesome name="lock" size={16} color={NDEIP_COLORS.gray[400]} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Re-enter password"
                                    placeholderTextColor={NDEIP_COLORS.gray[500]}
                                    value={confirm}
                                    onChangeText={setConfirm}
                                    secureTextEntry={!showPw}
                                />
                            </View>
                        </View>

                        <TouchableOpacity style={styles.primaryButton} onPress={handleSignup} disabled={isLoading} activeOpacity={0.85}>
                            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Create Account</Text>}
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle} activeOpacity={0.85}>
                            <FontAwesome name="google" size={16} color="#fff" />
                            <Text style={styles.googleButtonText}>Sign up with Google</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <View style={styles.loginRow}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <Link href="/auth/login" asChild>
                            <TouchableOpacity><Text style={styles.loginLink}>Sign In</Text></TouchableOpacity>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: NDEIP_COLORS.gray[950] },
    scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 50 },
    headerSection: { alignItems: 'center', marginBottom: 28 },
    title: { fontSize: 26, fontWeight: '800', color: NDEIP_COLORS.gray[100], letterSpacing: -0.5 },
    subtitle: { fontSize: 14, color: NDEIP_COLORS.gray[400], marginTop: 4 },

    formCard: {
        backgroundColor: 'rgba(13,22,19,0.85)', borderRadius: 24, padding: 28,
        borderWidth: 1, borderColor: 'rgba(42,122,94,0.12)', maxWidth: 420, alignSelf: 'center', width: '100%',
        shadowColor: NDEIP_COLORS.primaryTeal, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 8,
    },
    errorBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(244,63,94,0.08)', padding: 12, borderRadius: 12, marginBottom: 16, gap: 8, borderWidth: 1, borderColor: 'rgba(244,63,94,0.15)' },
    errorText: { color: NDEIP_COLORS.rose, fontSize: 13, flex: 1, fontWeight: '500' },

    inputWrapper: { marginBottom: 14 },
    inputLabel: { fontSize: 12, fontWeight: '700', color: NDEIP_COLORS.gray[400], textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 16, height: 52 },
    inputIcon: { marginRight: 12, width: 20, textAlign: 'center' as any },
    input: { flex: 1, fontSize: 15, color: NDEIP_COLORS.gray[100], fontWeight: '500' },
    eyeBtn: { padding: 8, marginLeft: 4 },

    primaryButton: {
        height: 52, borderRadius: 14, justifyContent: 'center' as any, alignItems: 'center' as any,
        marginBottom: 18, marginTop: 6, backgroundColor: NDEIP_COLORS.primaryTeal,
        shadowColor: NDEIP_COLORS.primaryTeal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    },
    primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

    divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
    dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
    dividerText: { color: NDEIP_COLORS.gray[500], fontSize: 11, fontWeight: '600', marginHorizontal: 16, textTransform: 'uppercase', letterSpacing: 1 },

    googleButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: NDEIP_COLORS.electricBlue,
        height: 52, borderRadius: 14, gap: 10, shadowColor: NDEIP_COLORS.electricBlue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4,
    },
    googleButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },

    loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
    loginText: { color: NDEIP_COLORS.gray[400], fontSize: 14 },
    loginLink: { color: NDEIP_COLORS.electricBlue, fontSize: 14, fontWeight: '700' },
});
