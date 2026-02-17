/**
 * ChatService — Messaging abstraction layer
 * 
 * Works with AsyncStorage locally now.
 * Designed to swap cleanly to Supabase later without UI changes.
 * 
 * Features:
 * - Conversation list with persistence
 * - Message send with optimistic updates (sending → sent → delivered → read)
 * - Simulated incoming reply after 2-3s delay
 * - Voice & media message support
 * - Subscriber pattern for real-time updates
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type MessageType = 'text' | 'voice' | 'image' | 'video' | 'file' | 'system';

export interface Message {
    id: string;
    chatId: string;
    text?: string;
    sent: boolean; // true = outgoing, false = incoming
    time: string;
    timestamp: number;
    status: MessageStatus;
    type: MessageType;
    // Voice
    audioUri?: string;
    duration?: number;
    // Media
    mediaUri?: string;
    // Ephemeral
    ephemeral?: boolean;
    consumed?: boolean;
    kept?: boolean;
    // Scheduling
    scheduled?: boolean;
    scheduledTime?: string;
}

export interface Conversation {
    id: string;
    name: string;
    message: string; // last message preview
    time: string;
    unread: number;
    avatar?: string;
    online?: boolean;
    muted?: boolean;
    pinned?: boolean;
    isGroup?: boolean;
    folder?: string;
    starred?: boolean;
    typing?: boolean;
}

// ─── Storage Keys ─────────────────────────────────────────────
const KEYS = {
    conversations: 'ndeip_conversations',
    messages: (chatId: string) => `ndeip_messages_${chatId}`,
    initialized: 'ndeip_chat_initialized',
};

// ─── Seed Data ────────────────────────────────────────────────
const SEED_CONVERSATIONS: Conversation[] = [
    { id: '1', name: 'Sarah Chen', message: 'See you at the village meeting! 🎉', time: 'Now', unread: 3, online: true, starred: true, folder: 'personal', pinned: true },
    { id: '2', name: 'Marcus Johnson', message: 'The presentation looks amazing', time: '15m', unread: 0, online: true, starred: true, folder: 'work' },
    { id: '3', name: 'Thandi Nkosi', message: 'Voice note 🎵 0:42', time: '1h', unread: 1, online: false, starred: true, folder: 'personal' },
    { id: '4', name: 'Dev Village', message: 'Alex: Just pushed the new build', time: '2h', unread: 12, online: false, isGroup: true, folder: 'work' },
    { id: '5', name: 'Mom ❤️', message: "Don't forget to eat!", time: '3h', unread: 0, online: false, starred: true, folder: 'personal' },
    { id: '6', name: 'Design Team', message: 'New mockups are ready 🎨', time: '5h', unread: 4, online: false, isGroup: true, folder: 'work' },
    { id: '7', name: 'Priya Sharma', message: 'Meeting at 3pm tomorrow?', time: '1d', unread: 0, online: true, folder: 'work' },
    { id: '8', name: 'Kai Chen', message: 'Check this out 📸', time: '2d', unread: 0, online: false, folder: 'personal', muted: true },
];

const SEED_MESSAGES: Record<string, Message[]> = {
    '1': [
        { id: 'm1', chatId: '1', text: 'Hey Sarah! How are you?', sent: true, time: '9:02 AM', timestamp: Date.now() - 3600000 * 3, status: 'read', type: 'text' },
        { id: 'm2', chatId: '1', text: "I'm great! Working on the village project 🌍", sent: false, time: '9:05 AM', timestamp: Date.now() - 3600000 * 2.9, status: 'read', type: 'text' },
        { id: 'm3', chatId: '1', text: 'That sounds amazing! Can I help?', sent: true, time: '9:06 AM', timestamp: Date.now() - 3600000 * 2.8, status: 'read', type: 'text' },
        { id: 'm4', chatId: '1', text: 'Absolutely! Join us at the village meeting tomorrow', sent: false, time: '9:10 AM', timestamp: Date.now() - 3600000 * 2.5, status: 'read', type: 'text' },
        { id: 'm5', chatId: '1', text: "I'll be there! What time?", sent: true, time: '9:12 AM', timestamp: Date.now() - 3600000 * 2.3, status: 'read', type: 'text' },
        { id: 'm6', chatId: '1', text: '3 PM at the community center. Bring your laptop!', sent: false, time: '9:15 AM', timestamp: Date.now() - 3600000 * 2, status: 'read', type: 'text' },
        { id: 'm7', chatId: '1', text: 'See you at the village meeting! 🎉', sent: false, time: '10:30 AM', timestamp: Date.now() - 3600000, status: 'read', type: 'text' },
    ],
    '2': [
        { id: 'm8', chatId: '2', text: 'Marcus, check out the new design system', sent: true, time: '2:00 PM', timestamp: Date.now() - 3600000 * 5, status: 'read', type: 'text' },
        { id: 'm9', chatId: '2', text: 'Wow, the glassmorphic theme is 🔥', sent: false, time: '2:03 PM', timestamp: Date.now() - 3600000 * 4.8, status: 'read', type: 'text' },
        { id: 'm10', chatId: '2', text: 'The presentation looks amazing', sent: false, time: '2:15 PM', timestamp: Date.now() - 3600000 * 4.5, status: 'read', type: 'text' },
    ],
    '3': [
        { id: 'm11', chatId: '3', text: 'Hey Thandi!', sent: true, time: '11:00 AM', timestamp: Date.now() - 7200000, status: 'read', type: 'text' },
        { id: 'm12', chatId: '3', text: 'Check out this voice note', sent: false, time: '11:02 AM', timestamp: Date.now() - 7100000, status: 'read', type: 'voice', duration: 42 },
    ],
    '5': [
        { id: 'm13', chatId: '5', text: 'Hi Mom! 💕', sent: true, time: '8:00 AM', timestamp: Date.now() - 3600000 * 8, status: 'read', type: 'text' },
        { id: 'm14', chatId: '5', text: "Don't forget to eat!", sent: false, time: '8:05 AM', timestamp: Date.now() - 3600000 * 7.9, status: 'read', type: 'text' },
    ],
};

// Auto-reply pool for simulated incoming messages
const AUTO_REPLIES = [
    "That's awesome! 🎉",
    "Sounds good to me 👍",
    "Let me check and get back to you",
    "Haha, love it! 😄",
    "Perfect, see you then!",
    "Thanks for letting me know 🙏",
    "Can we talk more about this later?",
    "Great idea!",
    "I'll send you the details shortly",
    "On my way! 🚶",
    "Miss you! ❤️",
    "That looks incredible 🔥",
    "Noted! Will do 👌",
    "Sure, what time works for you?",
    "Just saw this, one sec...",
];

// ─── Listeners ────────────────────────────────────────────────
type MessageListener = (message: Message) => void;
type ConversationListener = (conversations: Conversation[]) => void;

const messageListeners: Map<string, Set<MessageListener>> = new Map();
const conversationListeners: Set<ConversationListener> = new Set();

// ─── Helper ───────────────────────────────────────────────────
let msgCounter = 0;
function generateId(): string {
    return `msg_${Date.now()}_${++msgCounter}`;
}

function formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
}

// ─── ChatService ──────────────────────────────────────────────
class ChatServiceClass {
    private autoReplyTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();

    // ─── Initialize ───────────────────────────────────────────
    async initialize(): Promise<void> {
        const initialized = await AsyncStorage.getItem(KEYS.initialized);
        if (!initialized) {
            await this.seedData();
            await AsyncStorage.setItem(KEYS.initialized, 'true');
        }
    }

    private async seedData(): Promise<void> {
        await AsyncStorage.setItem(KEYS.conversations, JSON.stringify(SEED_CONVERSATIONS));
        for (const [chatId, messages] of Object.entries(SEED_MESSAGES)) {
            await AsyncStorage.setItem(KEYS.messages(chatId), JSON.stringify(messages));
        }
    }

    // ─── Conversations ────────────────────────────────────────
    async getConversations(): Promise<Conversation[]> {
        await this.initialize();
        const data = await AsyncStorage.getItem(KEYS.conversations);
        return data ? JSON.parse(data) : [];
    }

    async getConversation(chatId: string): Promise<Conversation | null> {
        const convos = await this.getConversations();
        return convos.find(c => c.id === chatId) || null;
    }

    private async updateConversationPreview(chatId: string, lastMessage: string, time: string): Promise<void> {
        const convos = await this.getConversations();
        const idx = convos.findIndex(c => c.id === chatId);
        if (idx >= 0) {
            convos[idx].message = lastMessage;
            convos[idx].time = time;
            // Move to top
            const [updated] = convos.splice(idx, 1);
            convos.unshift(updated);
            await AsyncStorage.setItem(KEYS.conversations, JSON.stringify(convos));
            this.notifyConversationListeners(convos);
        }
    }

    async incrementUnread(chatId: string): Promise<void> {
        const convos = await this.getConversations();
        const idx = convos.findIndex(c => c.id === chatId);
        if (idx >= 0) {
            convos[idx].unread = (convos[idx].unread || 0) + 1;
            await AsyncStorage.setItem(KEYS.conversations, JSON.stringify(convos));
            this.notifyConversationListeners(convos);
        }
    }

    async clearUnread(chatId: string): Promise<void> {
        const convos = await this.getConversations();
        const idx = convos.findIndex(c => c.id === chatId);
        if (idx >= 0) {
            convos[idx].unread = 0;
            await AsyncStorage.setItem(KEYS.conversations, JSON.stringify(convos));
            this.notifyConversationListeners(convos);
        }
    }

    // ─── Messages ─────────────────────────────────────────────
    async getMessages(chatId: string): Promise<Message[]> {
        await this.initialize();
        const data = await AsyncStorage.getItem(KEYS.messages(chatId));
        return data ? JSON.parse(data) : [];
    }

    async sendMessage(chatId: string, text: string): Promise<Message> {
        const now = new Date();
        const message: Message = {
            id: generateId(),
            chatId,
            text,
            sent: true,
            time: formatTime(now),
            timestamp: now.getTime(),
            status: 'sending',
            type: 'text',
        };

        // Optimistic append
        const messages = await this.getMessages(chatId);
        messages.push(message);
        await AsyncStorage.setItem(KEYS.messages(chatId), JSON.stringify(messages));
        this.notifyMessageListeners(chatId, message);

        // Simulate delivery status transitions
        this.simulateStatusTransitions(chatId, message.id);

        // Update conversation preview
        await this.updateConversationPreview(chatId, text, 'Now');

        // Schedule auto-reply
        this.scheduleAutoReply(chatId);

        return message;
    }

    async sendVoiceMessage(chatId: string, audioUri: string, duration: number): Promise<Message> {
        const now = new Date();
        const message: Message = {
            id: generateId(),
            chatId,
            sent: true,
            time: formatTime(now),
            timestamp: now.getTime(),
            status: 'sending',
            type: 'voice',
            audioUri,
            duration,
        };

        const messages = await this.getMessages(chatId);
        messages.push(message);
        await AsyncStorage.setItem(KEYS.messages(chatId), JSON.stringify(messages));
        this.notifyMessageListeners(chatId, message);

        this.simulateStatusTransitions(chatId, message.id);
        await this.updateConversationPreview(chatId, `🎵 Voice note (${Math.floor(duration)}s)`, 'Now');
        this.scheduleAutoReply(chatId);

        return message;
    }

    async sendMediaMessage(chatId: string, mediaUri: string, mediaType: 'image' | 'video'): Promise<Message> {
        const now = new Date();
        const message: Message = {
            id: generateId(),
            chatId,
            sent: true,
            time: formatTime(now),
            timestamp: now.getTime(),
            status: 'sending',
            type: mediaType,
            mediaUri,
        };

        const messages = await this.getMessages(chatId);
        messages.push(message);
        await AsyncStorage.setItem(KEYS.messages(chatId), JSON.stringify(messages));
        this.notifyMessageListeners(chatId, message);

        this.simulateStatusTransitions(chatId, message.id);
        await this.updateConversationPreview(chatId, mediaType === 'image' ? '📸 Photo' : '🎥 Video', 'Now');

        return message;
    }

    // ─── Status Simulation ────────────────────────────────────
    private simulateStatusTransitions(chatId: string, messageId: string): void {
        // sending → sent (0.5s)
        setTimeout(() => this.updateMessageStatus(chatId, messageId, 'sent'), 500);
        // sent → delivered (1.5s)
        setTimeout(() => this.updateMessageStatus(chatId, messageId, 'delivered'), 1500);
        // delivered → read (3s)
        setTimeout(() => this.updateMessageStatus(chatId, messageId, 'read'), 3000);
    }

    async updateMessageStatus(chatId: string, messageId: string, status: MessageStatus): Promise<void> {
        const messages = await this.getMessages(chatId);
        const idx = messages.findIndex(m => m.id === messageId);
        if (idx >= 0) {
            messages[idx].status = status;
            await AsyncStorage.setItem(KEYS.messages(chatId), JSON.stringify(messages));
            this.notifyMessageListeners(chatId, messages[idx]);
        }
    }

    // ─── Auto Reply ───────────────────────────────────────────
    private scheduleAutoReply(chatId: string): void {
        // Cancel any existing auto-reply for this chat
        const existing = this.autoReplyTimeouts.get(chatId);
        if (existing) clearTimeout(existing);

        const delay = 2000 + Math.random() * 2000; // 2-4 seconds
        const timeout = setTimeout(async () => {
            const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
            const now = new Date();
            const message: Message = {
                id: generateId(),
                chatId,
                text: reply,
                sent: false,
                time: formatTime(now),
                timestamp: now.getTime(),
                status: 'read',
                type: 'text',
            };

            const messages = await this.getMessages(chatId);
            messages.push(message);
            await AsyncStorage.setItem(KEYS.messages(chatId), JSON.stringify(messages));
            this.notifyMessageListeners(chatId, message);
            await this.updateConversationPreview(chatId, reply, 'Now');

            this.autoReplyTimeouts.delete(chatId);
        }, delay);

        this.autoReplyTimeouts.set(chatId, timeout);
    }

    // ─── Subscriptions ────────────────────────────────────────
    onMessage(chatId: string, listener: MessageListener): () => void {
        if (!messageListeners.has(chatId)) {
            messageListeners.set(chatId, new Set());
        }
        messageListeners.get(chatId)!.add(listener);

        return () => {
            messageListeners.get(chatId)?.delete(listener);
        };
    }

    onConversationsChange(listener: ConversationListener): () => void {
        conversationListeners.add(listener);
        return () => {
            conversationListeners.delete(listener);
        };
    }

    private notifyMessageListeners(chatId: string, message: Message): void {
        messageListeners.get(chatId)?.forEach(listener => listener(message));
    }

    private notifyConversationListeners(conversations: Conversation[]): void {
        conversationListeners.forEach(listener => listener(conversations));
    }

    // ─── Delete ───────────────────────────────────────────────
    async deleteMessage(chatId: string, messageId: string): Promise<void> {
        const messages = await this.getMessages(chatId);
        const filtered = messages.filter(m => m.id !== messageId);
        await AsyncStorage.setItem(KEYS.messages(chatId), JSON.stringify(filtered));
    }

    // ─── Reset (for testing) ──────────────────────────────────
    async reset(): Promise<void> {
        await AsyncStorage.removeItem(KEYS.initialized);
        const convos = await this.getConversations();
        for (const c of convos) {
            await AsyncStorage.removeItem(KEYS.messages(c.id));
        }
        await AsyncStorage.removeItem(KEYS.conversations);
    }
}

// Singleton
export const ChatService = new ChatServiceClass();
export default ChatService;
