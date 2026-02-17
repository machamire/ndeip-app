/**
 * useVoiceRecording — Hook for audio recording via expo-av
 * 
 * Provides start/stop/cancel recording with live duration tracking.
 * Returns audio URI and duration on stop for sending via ChatService.
 */
import { useState, useRef, useCallback } from 'react';
import { Platform } from 'react-native';

let Audio: any = null;
try {
    Audio = require('expo-av').Audio;
} catch (e) {
    // expo-av not available (web fallback)
}

interface VoiceRecordingState {
    isRecording: boolean;
    recordingDuration: number;
    metering: number;
}

interface VoiceRecordingResult {
    uri: string;
    duration: number;
}

export function useVoiceRecording() {
    const [state, setState] = useState<VoiceRecordingState>({
        isRecording: false,
        recordingDuration: 0,
        metering: 0,
    });

    const recordingRef = useRef<any>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef<number>(0);

    const startRecording = useCallback(async (): Promise<boolean> => {
        try {
            if (!Audio) {
                // Web fallback: simulate recording
                setState({ isRecording: true, recordingDuration: 0, metering: 0 });
                startTimeRef.current = Date.now();
                timerRef.current = setInterval(() => {
                    setState(prev => ({
                        ...prev,
                        recordingDuration: Math.floor((Date.now() - startTimeRef.current) / 1000),
                        metering: -20 + Math.random() * 30,
                    }));
                }, 200);
                return true;
            }

            // Request permissions
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                console.warn('Audio recording permission denied');
                return false;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const recording = new Audio.Recording();
            await recording.prepareToRecordAsync({
                ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
                isMeteringEnabled: true,
            });
            await recording.startAsync();

            recordingRef.current = recording;
            startTimeRef.current = Date.now();
            setState({ isRecording: true, recordingDuration: 0, metering: 0 });

            // Live duration + metering
            timerRef.current = setInterval(async () => {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                let meter = 0;
                try {
                    const status = await recording.getStatusAsync();
                    meter = status.metering || 0;
                } catch { }
                setState(prev => ({
                    ...prev,
                    recordingDuration: elapsed,
                    metering: meter,
                }));
            }, 200);

            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            return false;
        }
    }, []);

    const stopRecording = useCallback(async (): Promise<VoiceRecordingResult | null> => {
        try {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

            if (!Audio || !recordingRef.current) {
                // Web fallback: return a fake URI
                setState({ isRecording: false, recordingDuration: 0, metering: 0 });
                return { uri: `recording_${Date.now()}.m4a`, duration };
            }

            await recordingRef.current.stopAndUnloadAsync();
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

            const uri = recordingRef.current.getURI();
            recordingRef.current = null;

            setState({ isRecording: false, recordingDuration: 0, metering: 0 });
            return uri ? { uri, duration } : null;
        } catch (error) {
            console.error('Failed to stop recording:', error);
            setState({ isRecording: false, recordingDuration: 0, metering: 0 });
            return null;
        }
    }, []);

    const cancelRecording = useCallback(async () => {
        try {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            if (recordingRef.current) {
                await recordingRef.current.stopAndUnloadAsync();
                recordingRef.current = null;
            }

            setState({ isRecording: false, recordingDuration: 0, metering: 0 });
        } catch (error) {
            console.error('Failed to cancel recording:', error);
            setState({ isRecording: false, recordingDuration: 0, metering: 0 });
        }
    }, []);

    return {
        ...state,
        startRecording,
        stopRecording,
        cancelRecording,
    };
}

export default useVoiceRecording;
