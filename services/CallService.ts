/**
 * CallService — Call state machine + history
 * 
 * Manages voice/video call state flow:
 * idle → ringing → connected → ended
 * 
 * Persists call history to AsyncStorage.
 * Ready for WebRTC integration later.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────
export type CallState = 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended';
export type CallType = 'voice' | 'video';

export interface CallEntry {
    id: string;
    contactId: string;
    contactName: string;
    type: CallType;
    direction: 'outgoing' | 'incoming' | 'missed';
    duration: number; // seconds
    time: string;
    timestamp: number;
}

export interface ActiveCall {
    contactId: string;
    contactName: string;
    type: CallType;
    state: CallState;
    startTime: number;
    duration: number;
    isMuted: boolean;
    isSpeaker: boolean;
    isVideoOn: boolean;
}

// ─── Storage ──────────────────────────────────────────────
const KEYS = {
    history: 'ndeip_call_history',
    initialized: 'ndeip_calls_initialized',
};

// ─── Seed Data ────────────────────────────────────────────
const SEED_HISTORY: CallEntry[] = [
    { id: 'c1', contactId: '1', contactName: 'Sarah Chen', type: 'video', direction: 'outgoing', duration: 342, time: 'Today, 10:15 AM', timestamp: Date.now() - 3600000 * 4 },
    { id: 'c2', contactId: '2', contactName: 'Marcus Johnson', type: 'voice', direction: 'incoming', duration: 180, time: 'Today, 9:30 AM', timestamp: Date.now() - 3600000 * 5 },
    { id: 'c3', contactId: '3', contactName: 'Thandi Nkosi', type: 'voice', direction: 'missed', duration: 0, time: 'Yesterday, 6:45 PM', timestamp: Date.now() - 3600000 * 20 },
    { id: 'c4', contactId: '5', contactName: 'Mom ❤️', type: 'video', direction: 'outgoing', duration: 1200, time: 'Yesterday, 2:00 PM', timestamp: Date.now() - 3600000 * 24 },
    { id: 'c5', contactId: '7', contactName: 'Priya Sharma', type: 'voice', direction: 'incoming', duration: 420, time: '2 days ago', timestamp: Date.now() - 3600000 * 48 },
];

// ─── Listeners ────────────────────────────────────────────
type CallStateListener = (call: ActiveCall | null) => void;
type HistoryListener = (history: CallEntry[]) => void;

const stateListeners: Set<CallStateListener> = new Set();
const historyListeners: Set<HistoryListener> = new Set();

// ─── CallService ──────────────────────────────────────────
class CallServiceClass {
    private activeCall: ActiveCall | null = null;
    private callTimer: ReturnType<typeof setInterval> | null = null;
    private ringingTimeout: ReturnType<typeof setTimeout> | null = null;

    async initialize(): Promise<void> {
        const initialized = await AsyncStorage.getItem(KEYS.initialized);
        if (!initialized) {
            await AsyncStorage.setItem(KEYS.history, JSON.stringify(SEED_HISTORY));
            await AsyncStorage.setItem(KEYS.initialized, 'true');
        }
    }

    // ─── Call History ───────────────────────────────────────
    async getCallHistory(): Promise<CallEntry[]> {
        await this.initialize();
        const data = await AsyncStorage.getItem(KEYS.history);
        return data ? JSON.parse(data) : [];
    }

    private async addToHistory(entry: CallEntry): Promise<void> {
        const history = await this.getCallHistory();
        history.unshift(entry);
        await AsyncStorage.setItem(KEYS.history, JSON.stringify(history));
        historyListeners.forEach(l => l(history));
    }

    // ─── Start Call ─────────────────────────────────────────
    startCall(contactId: string, contactName: string, type: CallType): ActiveCall {
        this.activeCall = {
            contactId,
            contactName,
            type,
            state: 'ringing',
            startTime: Date.now(),
            duration: 0,
            isMuted: false,
            isSpeaker: false,
            isVideoOn: type === 'video',
        };
        this.notifyStateListeners();

        // Simulate: ringing → connecting → connected
        this.ringingTimeout = setTimeout(() => {
            if (this.activeCall) {
                this.activeCall.state = 'connecting';
                this.notifyStateListeners();

                setTimeout(() => {
                    if (this.activeCall) {
                        this.activeCall.state = 'connected';
                        this.activeCall.startTime = Date.now();
                        this.notifyStateListeners();

                        // Start call timer
                        this.callTimer = setInterval(() => {
                            if (this.activeCall && this.activeCall.state === 'connected') {
                                this.activeCall.duration = Math.floor((Date.now() - this.activeCall.startTime) / 1000);
                                this.notifyStateListeners();
                            }
                        }, 1000);
                    }
                }, 1500);
            }
        }, 3000);

        return this.activeCall;
    }

    // ─── End Call ───────────────────────────────────────────
    async endCall(): Promise<CallEntry | null> {
        if (!this.activeCall) return null;

        const call = this.activeCall;
        call.state = 'ended';
        this.notifyStateListeners();

        // Cleanup timers
        if (this.callTimer) clearInterval(this.callTimer);
        if (this.ringingTimeout) clearTimeout(this.ringingTimeout);
        this.callTimer = null;
        this.ringingTimeout = null;

        // Create history entry
        const formatTime = () => {
            const now = new Date();
            const h = now.getHours();
            const m = now.getMinutes().toString().padStart(2, '0');
            const ampm = h >= 12 ? 'PM' : 'AM';
            return `Today, ${h % 12 || 12}:${m} ${ampm}`;
        };

        const entry: CallEntry = {
            id: `call_${Date.now()}`,
            contactId: call.contactId,
            contactName: call.contactName,
            type: call.type,
            direction: 'outgoing',
            duration: call.duration,
            time: formatTime(),
            timestamp: Date.now(),
        };

        await this.addToHistory(entry);
        this.activeCall = null;

        // Delayed cleanup notification
        setTimeout(() => this.notifyStateListeners(), 500);

        return entry;
    }

    // ─── Controls ───────────────────────────────────────────
    toggleMute(): boolean {
        if (this.activeCall) {
            this.activeCall.isMuted = !this.activeCall.isMuted;
            this.notifyStateListeners();
            return this.activeCall.isMuted;
        }
        return false;
    }

    toggleSpeaker(): boolean {
        if (this.activeCall) {
            this.activeCall.isSpeaker = !this.activeCall.isSpeaker;
            this.notifyStateListeners();
            return this.activeCall.isSpeaker;
        }
        return false;
    }

    toggleVideo(): boolean {
        if (this.activeCall) {
            this.activeCall.isVideoOn = !this.activeCall.isVideoOn;
            this.notifyStateListeners();
            return this.activeCall.isVideoOn;
        }
        return false;
    }

    getActiveCall(): ActiveCall | null {
        return this.activeCall;
    }

    // ─── Subscriptions ─────────────────────────────────────
    onCallStateChange(listener: CallStateListener): () => void {
        stateListeners.add(listener);
        return () => { stateListeners.delete(listener); };
    }

    onHistoryChange(listener: HistoryListener): () => void {
        historyListeners.add(listener);
        return () => { historyListeners.delete(listener); };
    }

    private notifyStateListeners(): void {
        stateListeners.forEach(l => l(this.activeCall ? { ...this.activeCall } : null));
    }

    // Format call duration nicely
    formatDuration(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }
}

export const CallService = new CallServiceClass();
export default CallService;
