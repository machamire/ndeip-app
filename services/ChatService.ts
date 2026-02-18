/**
 * ChatService — Real-time messaging via Supabase
 * 
 * Replaces AsyncStorage with Supabase Postgres + Realtime subscriptions.
 * Messages sync live between users.
 */
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
export type MessageType = 'text' | 'voice' | 'image' | 'video' | 'file' | 'system';

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    text?: string;
    type: MessageType;
    status: MessageStatus;
    audio_url?: string;
    media_url?: string;
    duration?: number;
    ephemeral?: boolean;
    consumed?: boolean;
    reply_to?: string;
    created_at: string;
    // Computed locally for UI compatibility
    sent?: boolean;
    time?: string;
    timestamp?: number;
    chatId?: string;
    kept?: boolean;
    scheduled?: boolean;
    scheduledTime?: string;
}

export interface Conversation {
    id: string;
    is_group: boolean;
    group_name?: string;
    group_avatar?: string;
    created_at: string;
    updated_at: string;
    // Computed fields for UI
    name: string;
    message: string;
    time: string;
    unread: number;
    avatar?: string;
    online?: boolean;
    muted?: boolean;
    pinned?: boolean;
    starred?: boolean;
    typing?: boolean;
    isGroup?: boolean;
    folder?: string;
    other_user_id?: string;
}

// ─── Listeners ────────────────────────────────────────────────
type MessageListener = (messages: Message[]) => void;
type ConversationListener = (conversations: Conversation[]) => void;

const messageListeners: Map<string, Set<MessageListener>> = new Map();
const conversationListeners: Set<ConversationListener> = new Set();

// Active channels
const activeChannels: Map<string, RealtimeChannel> = new Map();

// ─── Helpers ──────────────────────────────────────────────────
function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
}

function enrichMessage(msg: any, currentUserId: string): Message {
    return {
        ...msg,
        sent: msg.sender_id === currentUserId,
        time: formatTime(msg.created_at),
        timestamp: new Date(msg.created_at).getTime(),
        chatId: msg.conversation_id,
    };
}

// ─── ChatService ──────────────────────────────────────────────
class ChatServiceClass {
    private currentUserId: string | null = null;

    setCurrentUser(userId: string) {
        this.currentUserId = userId;
    }

    // ─── Conversations ────────────────────────────────────────
    async getConversations(): Promise<Conversation[]> {
        if (!this.currentUserId) return [];

        // Get conversations the current user is a member of
        const { data: memberships, error: memberError } = await supabase
            .from('conversation_members')
            .select('conversation_id, muted, pinned, starred, last_read_at')
            .eq('user_id', this.currentUserId);

        if (memberError || !memberships?.length) return [];

        const conversationIds = memberships.map(m => m.conversation_id);

        // Get conversation details
        const { data: conversations, error: convError } = await supabase
            .from('conversations')
            .select('*')
            .in('id', conversationIds)
            .order('updated_at', { ascending: false });

        if (convError || !conversations) return [];

        // Build enriched conversation list
        const enriched: Conversation[] = [];

        for (const conv of conversations) {
            const membership = memberships.find(m => m.conversation_id === conv.id);

            // Get the other user in 1:1 conversations
            let otherUser: any = null;
            let otherUserId: string | undefined;
            if (!conv.is_group) {
                const { data: otherMembers } = await supabase
                    .from('conversation_members')
                    .select('user_id')
                    .eq('conversation_id', conv.id)
                    .neq('user_id', this.currentUserId)
                    .limit(1);

                if (otherMembers?.[0]) {
                    otherUserId = otherMembers[0].user_id;
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('display_name, avatar_url, is_online')
                        .eq('id', otherUserId)
                        .single();
                    otherUser = profile;
                }
            }

            // Get latest message
            const { data: latestMsgs } = await supabase
                .from('messages')
                .select('text, type, created_at, sender_id')
                .eq('conversation_id', conv.id)
                .order('created_at', { ascending: false })
                .limit(1);

            const latestMsg = latestMsgs?.[0];

            // Count unread
            const { count: unreadCount } = await supabase
                .from('messages')
                .select('id', { count: 'exact', head: true })
                .eq('conversation_id', conv.id)
                .neq('sender_id', this.currentUserId)
                .gt('created_at', membership?.last_read_at || '1970-01-01');

            let lastMessageText = 'No messages yet';
            if (latestMsg) {
                if (latestMsg.type === 'voice') lastMessageText = '🎤 Voice message';
                else if (latestMsg.type === 'image') lastMessageText = '📷 Photo';
                else if (latestMsg.type === 'video') lastMessageText = '🎥 Video';
                else lastMessageText = latestMsg.text || '';
            }

            enriched.push({
                id: conv.id,
                is_group: conv.is_group,
                group_name: conv.group_name,
                group_avatar: conv.group_avatar,
                created_at: conv.created_at,
                updated_at: conv.updated_at,
                name: conv.is_group
                    ? (conv.group_name || 'Group')
                    : (otherUser?.display_name || 'Unknown'),
                message: lastMessageText,
                time: latestMsg ? formatTime(latestMsg.created_at) : '',
                unread: unreadCount || 0,
                avatar: conv.is_group ? conv.group_avatar : otherUser?.avatar_url,
                online: otherUser?.is_online || false,
                muted: membership?.muted || false,
                pinned: membership?.pinned || false,
                starred: membership?.starred || false,
                isGroup: conv.is_group,
                other_user_id: otherUserId,
            });
        }

        return enriched;
    }

    // ─── Messages ─────────────────────────────────────────────
    async getMessages(conversationId: string): Promise<Message[]> {
        if (!this.currentUserId) return [];

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })
            .limit(100);

        if (error || !data) return [];

        // Mark messages as read
        await supabase
            .from('conversation_members')
            .update({ last_read_at: new Date().toISOString() })
            .eq('conversation_id', conversationId)
            .eq('user_id', this.currentUserId);

        return data.map(msg => enrichMessage(msg, this.currentUserId!));
    }

    // ─── Send Message ─────────────────────────────────────────
    async sendMessage(conversationId: string, text: string, type: MessageType = 'text'): Promise<Message | null> {
        if (!this.currentUserId || !text.trim()) return null;

        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: this.currentUserId,
                text: text.trim(),
                type,
                status: 'sent',
            })
            .select()
            .single();

        if (error) {
            console.error('Failed to send message:', error.message);
            return null;
        }

        // Update conversation timestamp
        await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);

        return enrichMessage(data, this.currentUserId);
    }

    // ─── Voice Message ────────────────────────────────────────
    async sendVoiceMessage(conversationId: string, audioUrl: string, duration: number): Promise<Message | null> {
        if (!this.currentUserId) return null;

        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: this.currentUserId,
                type: 'voice',
                audio_url: audioUrl,
                duration,
                status: 'sent',
            })
            .select()
            .single();

        if (error) return null;

        await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);

        return enrichMessage(data, this.currentUserId);
    }

    // ─── Media Message ────────────────────────────────────────
    async sendMediaMessage(conversationId: string, mediaUrl: string, type: 'image' | 'video'): Promise<Message | null> {
        if (!this.currentUserId) return null;

        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: this.currentUserId,
                type,
                media_url: mediaUrl,
                status: 'sent',
            })
            .select()
            .single();

        if (error) return null;

        await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);

        return enrichMessage(data, this.currentUserId);
    }

    // ─── Find or Create Conversation ──────────────────────────
    async findOrCreateConversation(otherUserId: string): Promise<string | null> {
        if (!this.currentUserId) return null;

        // Check if a 1:1 conversation already exists
        const { data: myConvs } = await supabase
            .from('conversation_members')
            .select('conversation_id')
            .eq('user_id', this.currentUserId);

        if (myConvs?.length) {
            const { data: theirConvs } = await supabase
                .from('conversation_members')
                .select('conversation_id')
                .eq('user_id', otherUserId)
                .in('conversation_id', myConvs.map(c => c.conversation_id));

            // Filter to 1:1 conversations only
            for (const tc of theirConvs || []) {
                const { data: conv } = await supabase
                    .from('conversations')
                    .select('id, is_group')
                    .eq('id', tc.conversation_id)
                    .eq('is_group', false)
                    .single();

                if (conv) return conv.id;
            }
        }

        // Create new conversation
        const { data: newConv, error: convError } = await supabase
            .from('conversations')
            .insert({ is_group: false })
            .select()
            .single();

        if (convError || !newConv) return null;

        // Add both users as members
        await supabase
            .from('conversation_members')
            .insert([
                { conversation_id: newConv.id, user_id: this.currentUserId },
                { conversation_id: newConv.id, user_id: otherUserId },
            ]);

        return newConv.id;
    }

    // ─── Get All Users (contacts) ─────────────────────────────
    async getAllUsers(): Promise<any[]> {
        if (!this.currentUserId) return [];

        const { data, error } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url, is_online, about')
            .neq('id', this.currentUserId)
            .order('display_name');

        if (error) return [];
        return data || [];
    }

    // ─── Real-Time Subscriptions ──────────────────────────────
    subscribeToMessages(conversationId: string, callback: MessageListener): () => void {
        const key = `msgs:${conversationId}`;

        // Don't double-subscribe
        if (activeChannels.has(key)) {
            // Just add the callback
            if (!messageListeners.has(conversationId)) {
                messageListeners.set(conversationId, new Set());
            }
            messageListeners.get(conversationId)!.add(callback);
            return () => {
                messageListeners.get(conversationId)?.delete(callback);
            };
        }

        if (!messageListeners.has(conversationId)) {
            messageListeners.set(conversationId, new Set());
        }
        messageListeners.get(conversationId)!.add(callback);

        const channel = supabase
            .channel(key)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    const newMsg = enrichMessage(payload.new, this.currentUserId || '');
                    const listeners = messageListeners.get(conversationId);
                    listeners?.forEach(cb => cb([newMsg]));
                }
            )
            .subscribe();

        activeChannels.set(key, channel);

        return () => {
            messageListeners.get(conversationId)?.delete(callback);
            if (messageListeners.get(conversationId)?.size === 0) {
                supabase.removeChannel(channel);
                activeChannels.delete(key);
                messageListeners.delete(conversationId);
            }
        };
    }

    subscribeToConversations(callback: ConversationListener): () => void {
        conversationListeners.add(callback);

        const channel = supabase
            .channel('conversation-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                },
                async () => {
                    // Refetch conversations when any message is added
                    const convs = await this.getConversations();
                    conversationListeners.forEach(cb => cb(convs));
                }
            )
            .subscribe();

        return () => {
            conversationListeners.delete(callback);
            if (conversationListeners.size === 0) {
                supabase.removeChannel(channel);
            }
        };
    }

    // ─── Message Operations ───────────────────────────────────
    async deleteMessage(conversationId: string, messageId: string): Promise<void> {
        await supabase
            .from('messages')
            .delete()
            .eq('id', messageId)
            .eq('sender_id', this.currentUserId);
    }

    async updateMessageStatus(messageId: string, status: MessageStatus): Promise<void> {
        await supabase
            .from('messages')
            .update({ status })
            .eq('id', messageId);
    }

    // ─── Conversation Operations ──────────────────────────────
    async muteConversation(conversationId: string, muted: boolean): Promise<void> {
        await supabase
            .from('conversation_members')
            .update({ muted })
            .eq('conversation_id', conversationId)
            .eq('user_id', this.currentUserId);
    }

    async pinConversation(conversationId: string, pinned: boolean): Promise<void> {
        await supabase
            .from('conversation_members')
            .update({ pinned })
            .eq('conversation_id', conversationId)
            .eq('user_id', this.currentUserId);
    }

    async starConversation(conversationId: string, starred: boolean): Promise<void> {
        await supabase
            .from('conversation_members')
            .update({ starred })
            .eq('conversation_id', conversationId)
            .eq('user_id', this.currentUserId);
    }

    // ─── Initialize (no-op now, kept for API compat) ──────────
    async initialize(): Promise<void> {
        // No-op — Supabase is always ready
    }

    // ─── Cleanup ──────────────────────────────────────────────
    cleanup() {
        activeChannels.forEach((channel) => {
            supabase.removeChannel(channel);
        });
        activeChannels.clear();
        messageListeners.clear();
        conversationListeners.clear();
    }
}

export const ChatService = new ChatServiceClass();
export default ChatService;
