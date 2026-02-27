import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Animated,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { NDEIP_COLORS } from '@/constants/Colors';
import { CallService, ActiveCall } from '@/services/CallService';
import { ChatService } from '@/services/ChatService';
import CallConnecting from '@/components/calls/CallConnecting';
import VideoFrame from '@/components/calls/VideoFrame';
import { useAuth } from '@/contexts/AuthContext';

type CallState = 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'no_answer' | 'failed';

const RING_TIMEOUT_MS = 30000; // 30 seconds before "no answer"

export default function CallScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useAuth();
    const contactName = (params.name as string) || 'Unknown';
    const callType = (params.type as string) || 'voice';
    const contactId = (params.id as string) || '0';

    const [callState, setCallState] = useState<CallState>('idle');
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaker, setIsSpeaker] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(callType === 'video');

    // Pulse animation for ringing
    const pulseAnim = React.useRef(new Animated.Value(1)).current;
    const ringTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!user) return;
        CallService.setCurrentUser(user.id);

        // Start call
        const initCall = async () => {
            try {
                const call = await CallService.startCall(contactId, contactName, callType as any);
                setCallState(call.status as CallState);

                // Set a timeout: if still ringing after 30s, transition to no_answer
                ringTimeoutRef.current = setTimeout(() => {
                    setCallState((current) => {
                        if (current === 'ringing' || current === 'idle') {
                            return 'no_answer';
                        }
                        return current;
                    });
                }, RING_TIMEOUT_MS);
            } catch (err) {
                console.error('Failed to start call:', err);
                setCallState('failed');
            }
        };
        initCall();

        return () => {
            if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
        };
    }, [user]);

    // Duration counter when connected
    useEffect(() => {
        if (callState !== 'connected') return;
        // Clear ring timeout since we connected
        if (ringTimeoutRef.current) {
            clearTimeout(ringTimeoutRef.current);
            ringTimeoutRef.current = null;
        }
        const timer = setInterval(() => setDuration(d => d + 1), 1000);
        return () => clearInterval(timer);
    }, [callState]);

    // When transitioning to no_answer, update the call record
    useEffect(() => {
        if (callState === 'no_answer') {
            CallService.endCall('no_answer');
        }
    }, [callState]);

    // Pulse animation loop during ringing
    useEffect(() => {
        if (callState === 'ringing') {
            const loop = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                ])
            );
            loop.start();
            return () => loop.stop();
        }
    }, [callState]);

    const handleEndCall = useCallback(async () => {
        if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
        await CallService.endCall();
        router.back();
    }, [router]);

    const handleCallAgain = useCallback(async () => {
        setCallState('idle');
        setDuration(0);
        try {
            const call = await CallService.startCall(contactId, contactName, callType as any);
            setCallState(call.status as CallState);
            ringTimeoutRef.current = setTimeout(() => {
                setCallState((current) => {
                    if (current === 'ringing' || current === 'idle') return 'no_answer';
                    return current;
                });
            }, RING_TIMEOUT_MS);
        } catch (err) {
            setCallState('failed');
        }
    }, [contactId, contactName, callType]);

    const handleRecordVoiceMessage = useCallback(async () => {
        // Navigate to chat — user can record a voice note there
        try {
            const conversationId = await ChatService.findOrCreateConversation(contactId);
            if (conversationId) {
                router.replace({ pathname: '/chat', params: { conversationId, name: contactName } } as any);
            } else {
                Alert.alert('Error', 'Could not open conversation');
                router.back();
            }
        } catch {
            Alert.alert('Error', 'Could not open conversation');
            router.back();
        }
    }, [contactId, contactName, router]);

    const initials = contactName.split(' ').map((n: string) => n[0]).join('').slice(0, 2);

    const formatDuration = (s: number): string => {
        if (s < 60) return `0:${String(s).padStart(2, '0')}`;
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    const statusText = {
        idle: 'Connecting...',
        ringing: 'Ringing...',
        connecting: 'Connecting...',
        connected: formatDuration(duration),
        ended: 'Call Ended',
        no_answer: 'No Answer',
        failed: 'Call Failed',
    }[callState];

    // ─── No Answer / Failed Screen ───────────────────────────────
    if (callState === 'no_answer' || callState === 'failed') {
        return (
            <LinearGradient
                colors={['#0A1A14', '#0D1F18', '#0A1A14']}
                style={styles.container}
            >
                <View style={{ height: Platform.OS === 'ios' ? 60 : 40 }} />

                {/* Contact Info */}
                <View style={styles.contactSection}>
                    <LinearGradient
                        colors={[NDEIP_COLORS.primaryTeal, NDEIP_COLORS.electricBlue]}
                        style={styles.avatar}
                    >
                        <Text style={styles.avatarText}>{initials}</Text>
                    </LinearGradient>

                    <Text style={styles.contactName}>{contactName}</Text>
                    <Text style={[styles.statusText, { color: callState === 'failed' ? NDEIP_COLORS.rose : NDEIP_COLORS.gray[400] }]}>
                        {statusText}
                    </Text>

                    {/* Decorative line */}
                    <View style={{
                        width: 40, height: 3, borderRadius: 2, marginTop: 24,
                        backgroundColor: callState === 'failed' ? NDEIP_COLORS.rose : NDEIP_COLORS.gray[700],
                    }} />
                </View>

                {/* Post-call actions */}
                <View style={styles.postCallActions}>
                    {/* Cancel (go back) */}
                    <TouchableOpacity
                        style={styles.postCallBtn}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.postCallIcon, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                            <FontAwesome name="times" size={22} color={NDEIP_COLORS.gray[400]} />
                        </View>
                        <Text style={styles.postCallLabel}>Cancel</Text>
                    </TouchableOpacity>

                    {/* Record voice message */}
                    <TouchableOpacity
                        style={styles.postCallBtn}
                        onPress={handleRecordVoiceMessage}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={['rgba(27,77,62,0.3)', 'rgba(27,77,62,0.15)']}
                            style={styles.postCallIcon}
                        >
                            <FontAwesome name="microphone" size={22} color={NDEIP_COLORS.emerald} />
                        </LinearGradient>
                        <Text style={[styles.postCallLabel, { color: NDEIP_COLORS.emerald }]}>
                            Voice Message
                        </Text>
                    </TouchableOpacity>

                    {/* Call again */}
                    <TouchableOpacity
                        style={styles.postCallBtn}
                        onPress={handleCallAgain}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={NDEIP_COLORS.gradients.brand as any}
                            style={styles.postCallIcon}
                        >
                            <FontAwesome name="phone" size={22} color="#fff" />
                        </LinearGradient>
                        <Text style={[styles.postCallLabel, { color: NDEIP_COLORS.primaryTeal }]}>
                            Call Again
                        </Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    // ─── Normal Call Screen ─────────────────────────────────────
    return (
        <LinearGradient
            colors={['#0A1A14', '#0D1F18', '#0A1A14']}
            style={styles.container}
        >
            {/* Status bar spacer */}
            <View style={{ height: Platform.OS === 'ios' ? 60 : 40 }} />

            {/* E2E Badge */}
            <View style={styles.e2eBadge}>
                <FontAwesome name="lock" size={10} color={NDEIP_COLORS.emerald} />
                <Text style={styles.e2eText}>End-to-end encrypted</Text>
            </View>

            {/* Contact Info */}
            <View style={styles.contactSection}>
                <Animated.View style={[
                    styles.avatarContainer,
                    callState === 'ringing' && { transform: [{ scale: pulseAnim }] },
                ]}>
                    <LinearGradient
                        colors={[NDEIP_COLORS.primaryTeal, NDEIP_COLORS.electricBlue]}
                        style={styles.avatar}
                    >
                        <Text style={styles.avatarText}>{initials}</Text>
                    </LinearGradient>
                    {callState === 'ringing' && (
                        <View style={styles.pulseRing} />
                    )}
                </Animated.View>

                <Text style={styles.contactName}>{contactName}</Text>
                <Text style={styles.statusText}>{statusText}</Text>

                {/* CallConnecting animation during ringing */}
                {callState === 'ringing' && (
                    <View style={{ width: '100%', height: 120, marginTop: 16 }}>
                        <CallConnecting
                            caller={{ id: 'me', name: 'You', avatar: null }}
                            receiver={{ id: contactId, name: contactName, avatar: null }}
                            connectionState="connecting"
                            onConnectionComplete={() => { }}
                            onConnectionFailed={() => { }}
                            showProgress={true}
                            audioEnabled={false}
                            style={{ flex: 1 }}
                        />
                    </View>
                )}
                {callState === 'connected' && (
                    <View style={styles.callTypeBadge}>
                        <FontAwesome
                            name={callType === 'video' ? 'video-camera' : 'phone'}
                            size={10}
                            color={NDEIP_COLORS.emerald}
                        />
                        <Text style={styles.callTypeText}>
                            {callType === 'video' ? 'Video Call' : 'Voice Call'}
                        </Text>
                    </View>
                )}
            </View>

            {/* Video area for video calls */}
            {callType === 'video' && callState === 'connected' && (
                <View style={styles.videoArea}>
                    <VideoFrame
                        videoStream={null}
                        participant={{ id: contactId, name: contactName, avatar: null }}
                        isLocal={false}
                        isPrimaryView={true}
                        showControls={false}
                        enableGestures={false}
                        onModeChange={() => { }}
                        onQualityChange={() => { }}
                        onFilterChange={() => { }}
                        onParticipantAction={() => { }}
                        style={{ flex: 1, borderRadius: 20 }}
                    />
                    <View style={styles.localVideo}>
                        <VideoFrame
                            videoStream={null}
                            participant={{ id: 'me', name: 'You', avatar: null }}
                            isLocal={true}
                            isPrimaryView={false}
                            showControls={false}
                            enableGestures={false}
                            onModeChange={() => { }}
                            onQualityChange={() => { }}
                            onFilterChange={() => { }}
                            onParticipantAction={() => { }}
                            style={{ flex: 1 }}
                        />
                    </View>
                </View>
            )}

            {/* Controls */}
            <View style={styles.controlsSection}>
                <View style={styles.controlRow}>
                    <TouchableOpacity
                        style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
                        onPress={() => { CallService.toggleMute(); setIsMuted(m => !m); }}
                    >
                        <FontAwesome name={isMuted ? 'microphone-slash' : 'microphone'} size={22} color="#fff" />
                        <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.controlBtn, isSpeaker && styles.controlBtnActive]}
                        onPress={() => { CallService.toggleSpeaker(); setIsSpeaker(s => !s); }}
                    >
                        <FontAwesome name="volume-up" size={22} color="#fff" />
                        <Text style={styles.controlLabel}>Speaker</Text>
                    </TouchableOpacity>

                    {callType === 'video' && (
                        <TouchableOpacity
                            style={[styles.controlBtn, !isVideoOn && styles.controlBtnActive]}
                            onPress={() => { CallService.toggleVideo(); setIsVideoOn(v => !v); }}
                        >
                            <FontAwesome name={isVideoOn ? 'video-camera' : 'eye-slash'} size={20} color="#fff" />
                            <Text style={styles.controlLabel}>{isVideoOn ? 'Camera' : 'Camera Off'}</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.controlBtn}>
                        <FontAwesome name="plus" size={22} color="#fff" />
                        <Text style={styles.controlLabel}>Add</Text>
                    </TouchableOpacity>
                </View>

                {/* End Call Button */}
                <TouchableOpacity onPress={handleEndCall} style={styles.endCallWrap}>
                    <LinearGradient
                        colors={['#EF4444', '#DC2626']}
                        style={styles.endCallBtn}
                    >
                        <FontAwesome name="phone" size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    e2eBadge: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: 8,
    },
    e2eText: { color: NDEIP_COLORS.gray[500], fontSize: 12 },
    contactSection: { alignItems: 'center', paddingTop: 40, gap: 12 },
    avatarContainer: { position: 'relative' },
    avatar: {
        width: 120, height: 120, borderRadius: 60,
        alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { color: '#fff', fontSize: 42, fontWeight: '700' },
    pulseRing: {
        position: 'absolute', top: -15, left: -15, right: -15, bottom: -15,
        borderRadius: 75, borderWidth: 2, borderColor: NDEIP_COLORS.primaryTeal,
        opacity: 0.3,
    },
    contactName: { color: '#F0F4F3', fontSize: 28, fontWeight: '700' },
    statusText: { color: NDEIP_COLORS.gray[400], fontSize: 16 },
    callTypeBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(16,185,129,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    },
    callTypeText: { color: NDEIP_COLORS.emerald, fontSize: 12, fontWeight: '500' },
    videoArea: { flex: 1, position: 'relative', margin: 20, borderRadius: 20, overflow: 'hidden' },
    localVideo: {
        position: 'absolute', bottom: 16, right: 16,
        width: 100, height: 140, borderRadius: 16, overflow: 'hidden',
        borderWidth: 2, borderColor: NDEIP_COLORS.primaryTeal,
    },
    controlsSection: {
        paddingBottom: Platform.OS === 'ios' ? 50 : 30,
        paddingHorizontal: 30, alignItems: 'center', gap: 30,
    },
    controlRow: { flexDirection: 'row', justifyContent: 'center', gap: 24 },
    controlBtn: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    controlBtnActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
    controlLabel: { color: NDEIP_COLORS.gray[400], fontSize: 10, marginTop: 6 },
    endCallWrap: { marginTop: 10 },
    endCallBtn: {
        width: 72, height: 72, borderRadius: 36,
        alignItems: 'center', justifyContent: 'center',
    },
    // Post-call (No Answer / Failed) screen
    postCallActions: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingBottom: Platform.OS === 'ios' ? 80 : 60,
        gap: 36,
    },
    postCallBtn: {
        alignItems: 'center',
        gap: 10,
    },
    postCallIcon: {
        width: 64, height: 64, borderRadius: 32,
        alignItems: 'center', justifyContent: 'center',
    },
    postCallLabel: {
        color: NDEIP_COLORS.gray[400],
        fontSize: 12,
        fontWeight: '500',
    },
});
