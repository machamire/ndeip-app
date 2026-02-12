/**
 * Optimistic UI Helpers — Client-side state management for messaging
 * 
 * Provides hooks and utilities for optimistic updates:
 * - Messages appear instantly in the UI before server confirmation
 * - Failed messages show retry UI
 * - Server confirmations update the message status
 */
import { useState, useCallback, useRef } from 'react';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface OptimisticMessage {
    id: string;
    localId: string; // Client-generated temporary ID
    text?: string;
    sent: boolean;
    time: string;
    status: MessageStatus;
    type: 'text' | 'voice' | 'video';
    ephemeral?: boolean;
    duration?: number;
    // Optimistic metadata
    optimistic: boolean; // true until server confirms
    retryCount: number;
    createdAt: number;
}

let idCounter = 0;
function generateLocalId(): string {
    return `local_${Date.now()}_${++idCounter}`;
}

function getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
}

export function useOptimisticMessages(initialMessages: OptimisticMessage[] = []) {
    const [messages, setMessages] = useState<OptimisticMessage[]>(initialMessages);
    const pendingRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    /**
     * Add a message optimistically — appears instantly as 'sending'
     */
    const sendMessage = useCallback((text: string, type: 'text' | 'voice' | 'video' = 'text') => {
        const localId = generateLocalId();

        const newMsg: OptimisticMessage = {
            id: localId,
            localId,
            text: type === 'text' ? text : undefined,
            sent: true,
            time: getCurrentTime(),
            status: 'sending',
            type,
            optimistic: true,
            retryCount: 0,
            createdAt: Date.now(),
        };

        setMessages(prev => [...prev, newMsg]);

        // Simulate server confirmation after a delay (replace with real API call)
        const timeout = setTimeout(() => {
            setMessages(prev =>
                prev.map(m =>
                    m.localId === localId
                        ? { ...m, status: 'sent' as MessageStatus, optimistic: false }
                        : m
                )
            );
            pendingRef.current.delete(localId);
        }, 800 + Math.random() * 400);

        pendingRef.current.set(localId, timeout);
        return localId;
    }, []);

    /**
     * Simulate a delivery status update
     */
    const markDelivered = useCallback((localId: string) => {
        setMessages(prev =>
            prev.map(m =>
                m.localId === localId ? { ...m, status: 'delivered' as MessageStatus } : m
            )
        );
    }, []);

    /**
     * Simulate a read receipt
     */
    const markRead = useCallback((localId: string) => {
        setMessages(prev =>
            prev.map(m =>
                m.localId === localId ? { ...m, status: 'read' as MessageStatus } : m
            )
        );
    }, []);

    /**
     * Simulate a failed send
     */
    const markFailed = useCallback((localId: string) => {
        setMessages(prev =>
            prev.map(m =>
                m.localId === localId ? { ...m, status: 'failed' as MessageStatus, optimistic: true } : m
            )
        );
    }, []);

    /**
     * Retry a failed message
     */
    const retryMessage = useCallback((localId: string) => {
        setMessages(prev =>
            prev.map(m =>
                m.localId === localId
                    ? { ...m, status: 'sending' as MessageStatus, retryCount: m.retryCount + 1 }
                    : m
            )
        );

        // Simulate retry
        const timeout = setTimeout(() => {
            setMessages(prev =>
                prev.map(m =>
                    m.localId === localId
                        ? { ...m, status: 'sent' as MessageStatus, optimistic: false }
                        : m
                )
            );
        }, 800 + Math.random() * 400);

        pendingRef.current.set(localId, timeout);
    }, []);

    /**
     * Delete a message locally
     */
    const deleteMessage = useCallback((localId: string) => {
        setMessages(prev => prev.filter(m => m.localId !== localId));
        const timeout = pendingRef.current.get(localId);
        if (timeout) {
            clearTimeout(timeout);
            pendingRef.current.delete(localId);
        }
    }, []);

    return {
        messages,
        sendMessage,
        markDelivered,
        markRead,
        markFailed,
        retryMessage,
        deleteMessage,
    };
}
