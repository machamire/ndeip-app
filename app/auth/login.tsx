import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, Animated, Dimensions,
    ScrollView, ActivityIndicator, Image
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { NDEIP_COLORS } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();
    const { signIn, signInWithGoogle, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const logoScale = useRef(new Animated.Value(0.5)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const formSlide = useRef(new Animated.Value(40)).current;
    const formOpacity = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.spring(logoScale, { toValue: 1, tension: 40, friction: 8, useNativeDriver: true }),
                Animated.timing(logoOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.timing(formOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(formSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, { toValue: 1, duration: 3000, useNativeDriver: false }),
                Animated.timing(glowAnim, { toValue: 0, duration: 3000, useNativeDriver: false }),
            ])
        ).start();
    }, []);

    const handleLogin = async () => {
        setError('');
        if (!email.trim()) { setError('Please enter your email'); return; }
        try {
            await signIn(email, password);
        } catch (e: any) {
            setError(e.message || 'Login failed');
        }
    };

    const handleGoogleLogin = async () => {
        try { await signInWithGoogle(); } catch (e: any) { setError(e.message || 'Google login failed'); }
    };

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.03, 0.08],
    });

    return (
        <View style={styles.container}>
            {/* Ambient background glow */}
            <Animated.View style={[styles.ambientGlow, styles.glowTeal, { opacity: glowOpacity }]} />
            <Animated.View style={[styles.ambientGlow, styles.glowBlue, { opacity: glowOpacity }]} />

            {/* Subtle mesh lines */}
            <View style={styles.meshOverlay}>
                {[...Array(8)].map((_, i) => (
                    <View key={i} style={[styles.meshLine, {
                        top: `${10 + i * 12}%`,
                        transform: [{ rotate: `${-20 + i * 7}deg` }],
                        opacity: 0.015 + i * 0.003,
                        backgroundColor: i % 2 === 0 ? NDEIP_COLORS.primaryTeal : NDEIP_COLORS.electricBlue,
                    }]} />
                ))}
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                    {/* Logo */}
                    <Animated.View style={[styles.logoContainer, {
                        transform: [{ scale: logoScale }],
                        opacity: logoOpacity,
                    }]}>
                        <View style={styles.logoGlowRing}>
                            <Image
                                source={require('../../assets/images/ndeip-logo.png')}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.tagline}>Connect · Communicate · Create</Text>
                    </Animated.View>

                    {/* Form Card */}
                    <Animated.View style={[styles.formCard, {
                        opacity: formOpacity,
                        transform: [{ translateY: formSlide }],
                    }]}>
                        <Text style={styles.welcomeTitle}>Welcome back</Text>
                        <Text style={styles.welcomeSubtitle}>Sign in to continue your conversations</Text>

                        {error ? (
                            <View style={styles.errorBar}>
                                <FontAwesome name="exclamation-circle" size={14} color={NDEIP_COLORS.rose} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        {/* Email */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <View style={styles.inputContainer}>
                                <FontAwesome name="envelope-o" size={15} color={NDEIP_COLORS.gray[400]} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="you@example.com"
                                    placeholderTextColor={NDEIP_COLORS.gray[500]}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                />
                            </View>
                        </View>

                        {/* Password */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={styles.inputContainer}>
                                <FontAwesome name="lock" size={16} color={NDEIP_COLORS.gray[400]} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    placeholderTextColor={NDEIP_COLORS.gray[500]}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoComplete="password"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                    <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={15} color={NDEIP_COLORS.gray[400]} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.forgotLink}>
                            <Text style={styles.forgotText}>Forgot password?</Text>
                        </TouchableOpacity>

                        {/* Sign In Button */}
                        <TouchableOpacity
                            style={[styles.primaryButton, isLoading && { opacity: 0.6 }]}
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={0.85}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Google */}
                        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin} activeOpacity={0.85}>
                            <FontAwesome name="google" size={16} color="#fff" />
                            <Text style={styles.googleButtonText}>Continue with Google</Text>
                        </TouchableOpacity>

                        {/* QR Login */}
                        <TouchableOpacity
                            style={styles.qrButton}
                            onPress={() => router.push('/auth/qr-login' as any)}
                            activeOpacity={0.85}
                        >
                            <FontAwesome name="qrcode" size={16} color={NDEIP_COLORS.tealLight} />
                            <Text style={styles.qrButtonText}>Sign in with QR Code</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Sign Up Link */}
                    <View style={styles.signUpRow}>
                        <Text style={styles.signUpText}>Don't have an account? </Text>
                        <Link href="/auth/signup" asChild>
                            <TouchableOpacity>
                                <Text style={styles.signUpLink}>Create one</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: NDEIP_COLORS.gray[950],
    },
    ambientGlow: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    glowTeal: {
        top: -80,
        left: -60,
        backgroundColor: NDEIP_COLORS.primaryTeal,
    },
    glowBlue: {
        bottom: -80,
        right: -60,
        backgroundColor: NDEIP_COLORS.electricBlue,
    },
    meshOverlay: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    meshLine: {
        position: 'absolute',
        width: '250%',
        height: 1,
        left: '-75%',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 60,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 36,
    },
    logoGlowRing: {
        padding: 20,
        borderRadius: 28,
        backgroundColor: 'rgba(27,77,62,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(27,77,62,0.15)',
        marginBottom: 16,
    },
    logoImage: {
        width: 160,
        height: 64,
    },
    tagline: {
        fontSize: 13,
        color: NDEIP_COLORS.gray[400],
        letterSpacing: 2,
        textTransform: 'uppercase',
        fontWeight: '500',
    },

    // Form Card — Glass morphism
    formCard: {
        backgroundColor: 'rgba(13,22,19,0.85)',
        borderRadius: 24,
        padding: 28,
        borderWidth: 1,
        borderColor: 'rgba(42,122,94,0.12)',
        width: '100%',
        maxWidth: 420,
        alignSelf: 'center',
        // Glass shadow
        shadowColor: NDEIP_COLORS.primaryTeal,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 8,
    },
    welcomeTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: NDEIP_COLORS.gray[100],
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: NDEIP_COLORS.gray[400],
        marginBottom: 24,
        lineHeight: 20,
    },
    errorBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(244,63,94,0.08)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(244,63,94,0.15)',
    },
    errorText: { color: NDEIP_COLORS.rose, fontSize: 13, flex: 1, fontWeight: '500' },

    inputWrapper: { marginBottom: 16 },
    inputLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: NDEIP_COLORS.gray[400],
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        paddingHorizontal: 16,
        height: 52,
    },
    inputIcon: { marginRight: 12, width: 20, textAlign: 'center' as any },
    input: { flex: 1, fontSize: 15, color: NDEIP_COLORS.gray[100], fontWeight: '500' },
    eyeBtn: { padding: 8, marginLeft: 4 },

    forgotLink: { alignSelf: 'flex-end', marginBottom: 20 },
    forgotText: { color: NDEIP_COLORS.electricBlue, fontSize: 13, fontWeight: '600' },

    primaryButton: {
        height: 52,
        borderRadius: 14,
        justifyContent: 'center' as any,
        alignItems: 'center' as any,
        marginBottom: 20,
        backgroundColor: NDEIP_COLORS.primaryTeal,
        shadowColor: NDEIP_COLORS.primaryTeal,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

    divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
    dividerText: {
        color: NDEIP_COLORS.gray[500],
        fontSize: 11,
        fontWeight: '600',
        marginHorizontal: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: NDEIP_COLORS.electricBlue,
        height: 52,
        borderRadius: 14,
        marginBottom: 10,
        gap: 10,
        shadowColor: NDEIP_COLORS.electricBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
    googleButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },

    qrButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: 'rgba(42,122,94,0.3)',
        gap: 10,
        backgroundColor: 'rgba(42,122,94,0.06)',
    },
    qrButtonText: { color: NDEIP_COLORS.tealLight, fontSize: 15, fontWeight: '600' },

    signUpRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 28,
    },
    signUpText: { color: NDEIP_COLORS.gray[400], fontSize: 14 },
    signUpLink: { color: NDEIP_COLORS.electricBlue, fontSize: 14, fontWeight: '700' },
});
