/**
 * MeshReadIndicator — Unique circle-fill read receipt indicator
 * 
 * ○  sending  — hollow outline, pulsing
 * ◔  sent     — 25% filled with brand teal
 * ◑  delivered — 50% filled with brand teal
 * ●  read     — fully filled, one-time mesh ripple glow
 */
import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { MeshColors } from '@/constants/ndeipBrandSystem';

const SIZE = 14;
const STROKE = 1.5;
const R = (SIZE - STROKE) / 2;
const CX = SIZE / 2;
const CY = SIZE / 2;

// Helper: arc path for partial fill
function arcPath(percentage) {
    if (percentage >= 1) return null; // just use full circle
    const angle = percentage * 360;
    const rad = (angle - 90) * (Math.PI / 180);
    const x = CX + R * Math.cos(rad);
    const y = CY + R * Math.sin(rad);
    const largeArc = angle > 180 ? 1 : 0;
    return `M ${CX} ${CY} L ${CX} ${CY - R} A ${R} ${R} 0 ${largeArc} 1 ${x} ${y} Z`;
}

export default function MeshReadIndicator({ status = 'sent' }) {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    // Pulse for sending state
    useEffect(() => {
        if (status === 'sending') {
            const loop = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
                ])
            );
            loop.start();
            return () => loop.stop();
        } else {
            pulseAnim.setValue(1);
        }
    }, [status]);

    // Glow for read state
    useEffect(() => {
        if (status === 'read') {
            Animated.sequence([
                Animated.timing(glowAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.timing(glowAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]).start();
        }
    }, [status]);

    const teal = MeshColors.primaryTeal;
    const blue = MeshColors.electricBlue;

    let fillColor = teal;
    let fillPercentage = 0;
    let strokeColor = 'rgba(255,255,255,0.35)';

    switch (status) {
        case 'sending':
            fillPercentage = 0;
            strokeColor = 'rgba(255,255,255,0.3)';
            break;
        case 'sent':
            fillPercentage = 0.25;
            strokeColor = teal;
            break;
        case 'delivered':
            fillPercentage = 0.5;
            strokeColor = teal;
            break;
        case 'read':
            fillPercentage = 1;
            fillColor = blue;
            strokeColor = blue;
            break;
    }

    const glowScale = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.6],
    });
    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0.4, 0],
    });

    return (
        <View style={styles.container}>
            {/* Glow ring for read state */}
            {status === 'read' && (
                <Animated.View style={[styles.glow, {
                    transform: [{ scale: glowScale }],
                    opacity: glowOpacity,
                    backgroundColor: blue,
                }]} />
            )}
            <Animated.View style={{ opacity: pulseAnim }}>
                <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                    {/* Outer circle */}
                    <Circle
                        cx={CX}
                        cy={CY}
                        r={R}
                        stroke={strokeColor}
                        strokeWidth={STROKE}
                        fill="none"
                    />
                    {/* Pie fill */}
                    {fillPercentage > 0 && fillPercentage < 1 && (
                        <Path d={arcPath(fillPercentage)} fill={fillColor} opacity={0.9} />
                    )}
                    {/* Full fill */}
                    {fillPercentage >= 1 && (
                        <Circle cx={CX} cy={CY} r={R - 0.5} fill={fillColor} />
                    )}
                </Svg>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: SIZE,
        height: SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
    },
});
