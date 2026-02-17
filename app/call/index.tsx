import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { NDEIP_COLORS } from '@/constants/Colors';
import { CallService, CallState, ActiveCall } from '@/services/CallService';
import CallConnecting from '@/components/calls/CallConnecting';
import VideoFrame from '@/components/calls/VideoFrame';

export default function CallScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
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

    useEffect(() => {
        // Start call
        CallService.startCall(contactId, contactName, callType as any);

        // Subscribe to state changes
        const unsubscribe = CallService.onCallStateChange((call: ActiveCall | null) => {
            if (call) {
                setCallState(call.state);
                setDuration(call.duration);
                setIsMuted(call.isMuted);
                setIsSpeaker(call.isSpeaker);
                setIsVideoOn(call.isVideoOn);
            } else {
                setCallState('ended');
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

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
        await CallService.endCall();
        router.back();
    }, [router]);

    const initials = contactName.split(' ').map((n: string) => n[0]).join('').slice(0, 2);
    const formatDuration = (s: number) => CallService.formatDuration(s);

    const statusText = {
        idle: 'Connecting...',
        ringing: 'Ringing...',
        connecting: 'Connecting...',
        connected: formatDuration(duration),
        ended: 'Call Ended',
    }[callState];

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
                        onPress={() => CallService.toggleMute()}
                    >
                        <FontAwesome name={isMuted ? 'microphone-slash' : 'microphone'} size={22} color="#fff" />
                        <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.controlBtn, isSpeaker && styles.controlBtnActive]}
                        onPress={() => CallService.toggleSpeaker()}
                    >
                        <FontAwesome name="volume-up" size={22} color="#fff" />
                        <Text style={styles.controlLabel}>Speaker</Text>
                    </TouchableOpacity>

                    {callType === 'video' && (
                        <TouchableOpacity
                            style={[styles.controlBtn, !isVideoOn && styles.controlBtnActive]}
                            onPress={() => CallService.toggleVideo()}
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
    remoteVideo: {
        flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
    },
    localVideo: {
        position: 'absolute', bottom: 16, right: 16,
        width: 100, height: 140, borderRadius: 16, overflow: 'hidden',
        borderWidth: 2, borderColor: NDEIP_COLORS.primaryTeal,
    },
    localVideoGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
});
