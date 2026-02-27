/**
 * CallService — Call history & WebRTC signaling via Supabase
 * 
 * Replaces AsyncStorage with Supabase for call history and
 * uses Supabase Realtime for WebRTC signaling.
 */
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────
export type CallType = 'voice' | 'video';
export type CallStatus = 'completed' | 'missed' | 'declined' | 'no_answer' | 'failed';

export interface CallEntry {
    id: string;
    caller_id: string;
    callee_id: string;
    caller_name?: string;
    callee_name?: string;
    type: CallType;
    status: CallStatus;
    duration: number; // seconds
    started_at: string;
    ended_at?: string;
    // UI compat
    incoming?: boolean;
    name?: string;
    time?: string;
}

export interface ActiveCall {
    id: string;
    remoteUserId: string;
    remoteName: string;
    type: CallType;
    isMuted: boolean;
    isSpeaker: boolean;
    isVideoEnabled: boolean;
    duration: number;
    status: 'ringing' | 'connected' | 'ended' | 'no_answer' | 'failed';
}

export interface IncomingCallSignal {
    callerId: string;
    callerName: string;
    type: CallType;
}

// ─── Helpers ──────────────────────────────────────────────────
function formatCallTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

// ─── CallService ──────────────────────────────────────────────
class CallServiceClass {
    private currentUserId: string | null = null;
    private signalChannel: RealtimeChannel | null = null;
    private incomingCallCallback: ((signal: IncomingCallSignal) => void) | null = null;
    private activeCall: ActiveCall | null = null;
    private callTimer: ReturnType<typeof setInterval> | null = null;

    setCurrentUser(userId: string) {
        this.currentUserId = userId;
    }

    // ─── Call History ─────────────────────────────────────────
    async getCallHistory(): Promise<CallEntry[]> {
        if (!this.currentUserId) return [];

        const { data, error } = await supabase
            .from('call_history')
            .select(`
                *,
                caller:profiles!call_history_caller_id_fkey(display_name),
                callee:profiles!call_history_callee_id_fkey(display_name)
            `)
            .or(`caller_id.eq.${this.currentUserId},callee_id.eq.${this.currentUserId}`)
            .order('started_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Failed to fetch call history:', error.message);
            return [];
        }

        return (data || []).map((entry: any) => ({
            id: entry.id,
            caller_id: entry.caller_id,
            callee_id: entry.callee_id,
            caller_name: entry.caller?.display_name || 'Unknown',
            callee_name: entry.callee?.display_name || 'Unknown',
            type: entry.type,
            status: entry.status,
            duration: entry.duration || 0,
            started_at: entry.started_at,
            ended_at: entry.ended_at,
            incoming: entry.callee_id === this.currentUserId,
            name: entry.caller_id === this.currentUserId
                ? (entry.callee?.display_name || 'Unknown')
                : (entry.caller?.display_name || 'Unknown'),
            time: formatCallTime(entry.started_at),
        }));
    }

    // ─── Start a Call ─────────────────────────────────────────
    async startCall(calleeId: string, calleeName: string, type: CallType): Promise<ActiveCall> {
        if (!this.currentUserId) throw new Error('Not authenticated');

        // Create call history record
        const { data: historyEntry, error } = await supabase
            .from('call_history')
            .insert({
                caller_id: this.currentUserId,
                callee_id: calleeId,
                type,
                status: 'missed', // Will be updated on answer
            })
            .select()
            .single();

        if (error) throw error;

        // Send call offer signal
        await supabase
            .from('call_signals')
            .insert({
                caller_id: this.currentUserId,
                callee_id: calleeId,
                type: 'offer',
                payload: {
                    call_history_id: historyEntry.id,
                    call_type: type,
                },
            });

        // Set up active call
        this.activeCall = {
            id: historyEntry.id,
            remoteUserId: calleeId,
            remoteName: calleeName,
            type,
            isMuted: false,
            isSpeaker: false,
            isVideoEnabled: type === 'video',
            duration: 0,
            status: 'ringing',
        };

        return { ...this.activeCall };
    }

    // ─── Answer a Call ────────────────────────────────────────
    async answerCall(callerId: string, callHistoryId: string, type: CallType): Promise<void> {
        if (!this.currentUserId) return;

        // Send answer signal
        await supabase
            .from('call_signals')
            .insert({
                caller_id: this.currentUserId,
                callee_id: callerId,
                type: 'answer',
                payload: { call_history_id: callHistoryId },
            });

        // Update call history status
        await supabase
            .from('call_history')
            .update({ status: 'completed' })
            .eq('id', callHistoryId);

        // Set up active call
        this.activeCall = {
            id: callHistoryId,
            remoteUserId: callerId,
            remoteName: '',
            type,
            isMuted: false,
            isSpeaker: false,
            isVideoEnabled: type === 'video',
            duration: 0,
            status: 'connected',
        };

        // Start duration timer
        this.startCallTimer();
    }

    // ─── End a Call ───────────────────────────────────────────
    async endCall(overrideStatus?: CallStatus): Promise<CallEntry | null> {
        if (!this.activeCall || !this.currentUserId) return null;

        const callId = this.activeCall.id;
        const duration = this.activeCall.duration;

        // Stop timer
        this.stopCallTimer();

        // Determine final status
        const finalStatus: CallStatus = overrideStatus
            || (duration > 0 ? 'completed' : 'missed');

        // Send hangup signal
        await supabase
            .from('call_signals')
            .insert({
                caller_id: this.currentUserId,
                callee_id: this.activeCall.remoteUserId,
                type: 'hangup',
                payload: { call_history_id: callId },
            });

        // Update call history
        await supabase
            .from('call_history')
            .update({
                ended_at: new Date().toISOString(),
                duration,
                status: finalStatus,
            })
            .eq('id', callId);

        const endedCall: CallEntry = {
            id: callId,
            caller_id: this.currentUserId,
            callee_id: this.activeCall.remoteUserId,
            type: this.activeCall.type,
            status: finalStatus,
            duration,
            started_at: new Date().toISOString(),
        };

        this.activeCall = null;
        return endedCall;
    }

    // ─── Decline a Call ───────────────────────────────────────
    async declineCall(callerId: string, callHistoryId: string): Promise<void> {
        if (!this.currentUserId) return;

        await supabase
            .from('call_signals')
            .insert({
                caller_id: this.currentUserId,
                callee_id: callerId,
                type: 'reject',
                payload: { call_history_id: callHistoryId },
            });

        await supabase
            .from('call_history')
            .update({ status: 'declined' })
            .eq('id', callHistoryId);
    }

    // ─── Toggle Controls ──────────────────────────────────────
    toggleMute(): boolean {
        if (!this.activeCall) return false;
        this.activeCall.isMuted = !this.activeCall.isMuted;
        return this.activeCall.isMuted;
    }

    toggleSpeaker(): boolean {
        if (!this.activeCall) return false;
        this.activeCall.isSpeaker = !this.activeCall.isSpeaker;
        return this.activeCall.isSpeaker;
    }

    toggleVideo(): boolean {
        if (!this.activeCall) return false;
        this.activeCall.isVideoEnabled = !this.activeCall.isVideoEnabled;
        return this.activeCall.isVideoEnabled;
    }

    getActiveCall(): ActiveCall | null {
        return this.activeCall ? { ...this.activeCall } : null;
    }

    // ─── Call Signals Subscription ────────────────────────────
    subscribeToIncomingCalls(callback: (signal: IncomingCallSignal) => void): () => void {
        if (!this.currentUserId) return () => { };

        this.incomingCallCallback = callback;

        this.signalChannel = supabase
            .channel(`call-signals:${this.currentUserId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'call_signals',
                    filter: `callee_id=eq.${this.currentUserId}`,
                },
                async (payload) => {
                    const signal = payload.new as any;

                    if (signal.type === 'offer') {
                        // Look up caller name
                        const { data: callerProfile } = await supabase
                            .from('profiles')
                            .select('display_name')
                            .eq('id', signal.caller_id)
                            .single();

                        callback({
                            callerId: signal.caller_id,
                            callerName: callerProfile?.display_name || 'Unknown',
                            type: signal.payload?.call_type || 'voice',
                        });
                    } else if (signal.type === 'hangup') {
                        // Remote ended the call
                        if (this.activeCall) {
                            await this.endCall();
                        }
                    } else if (signal.type === 'reject') {
                        // Call was declined
                        if (this.activeCall) {
                            this.stopCallTimer();
                            this.activeCall.status = 'ended';
                        }
                    } else if (signal.type === 'answer') {
                        // Call was answered — start connected state
                        if (this.activeCall) {
                            this.activeCall.status = 'connected';
                            this.startCallTimer();
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            if (this.signalChannel) {
                supabase.removeChannel(this.signalChannel);
                this.signalChannel = null;
            }
            this.incomingCallCallback = null;
        };
    }

    // ─── Timer ────────────────────────────────────────────────
    private startCallTimer() {
        this.stopCallTimer();
        this.callTimer = setInterval(() => {
            if (this.activeCall) {
                this.activeCall.duration += 1;
            }
        }, 1000);
    }

    private stopCallTimer() {
        if (this.callTimer) {
            clearInterval(this.callTimer);
            this.callTimer = null;
        }
    }

    // ─── Initialize (no-op, kept for compat) ──────────────────
    async initialize(): Promise<void> {
        // No-op — Supabase is always ready
    }

    // ─── Cleanup ──────────────────────────────────────────────
    cleanup() {
        this.stopCallTimer();
        if (this.signalChannel) {
            supabase.removeChannel(this.signalChannel);
            this.signalChannel = null;
        }
    }
}

export const CallService = new CallServiceClass();
export default CallService;
