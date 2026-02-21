/**
 * LoadingScreen — Minimal splash / resume overlay
 * Shows ndeip logo centered + "developed by Vana vekuLocation LLC" at bottom.
 * Matches sign-in/sign-up dark teal aesthetic.
 */
import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NDEIP_COLORS } from '@/constants/Colors';
import { Typography, Spacing } from '@/constants/ndeipBrandSystem';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {
    visible: boolean;
    onFinish?: () => void;
}

export default function LoadingScreen({ visible, onFinish }: LoadingScreenProps) {
    const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

    useEffect(() => {
        if (visible) {
            opacity.setValue(1);
        } else {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }).start(() => {
                onFinish?.();
            });
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View style={[styles.container, { opacity }]} pointerEvents={visible ? 'auto' : 'none'}>
            <LinearGradient
                colors={['#141E1B', '#1A2522', '#141E1B'] as any}
                style={styles.gradient}
            >
                {/* Centered Logo */}
                <View style={styles.logoWrap}>
                    <Image
                        source={require('../assets/images/ndeip-logo.png')}
                        resizeMode="contain"
                        style={styles.logo}
                        accessibilityLabel="ndeip logo"
                    />
                </View>

                {/* Bottom Attribution */}
                <View style={styles.bottomWrap}>
                    <Text style={styles.fromText}>developed by</Text>
                    <Text style={styles.companyText}>Vana vekuLocation LLC</Text>
                </View>
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        elevation: 9999,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 140,
        height: 56,
    },
    bottomWrap: {
        alignItems: 'center',
        paddingBottom: 48,
    },
    fromText: {
        color: NDEIP_COLORS.gray[500],
        fontSize: 13,
        fontWeight: '400',
        letterSpacing: 0.3,
        marginBottom: 4,
    },
    companyText: {
        color: NDEIP_COLORS.gray[400],
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.4,
    },
});
