/**
 * useHaptics — Platform-safe haptic feedback utility
 * 
 * Provides haptic feedback hooks for interactive elements.
 * Falls back silently on web or when Haptics is unavailable.
 */
import { Platform } from 'react-native';

// Lazy import to avoid web crashes
let Haptics: any = null;
if (Platform.OS !== 'web') {
    try {
        Haptics = require('expo-haptics');
    } catch {
        // expo-haptics not installed
    }
}

type ImpactStyle = 'light' | 'medium' | 'heavy';
type NotificationType = 'success' | 'warning' | 'error';

export function useHaptics() {
    const impact = (style: ImpactStyle = 'medium') => {
        if (!Haptics) return;
        const map: Record<ImpactStyle, any> = {
            light: Haptics.ImpactFeedbackStyle?.Light,
            medium: Haptics.ImpactFeedbackStyle?.Medium,
            heavy: Haptics.ImpactFeedbackStyle?.Heavy,
        };
        Haptics.impactAsync?.(map[style]);
    };

    const notification = (type: NotificationType = 'success') => {
        if (!Haptics) return;
        const map: Record<NotificationType, any> = {
            success: Haptics.NotificationFeedbackType?.Success,
            warning: Haptics.NotificationFeedbackType?.Warning,
            error: Haptics.NotificationFeedbackType?.Error,
        };
        Haptics.notificationAsync?.(map[type]);
    };

    const selection = () => {
        if (!Haptics) return;
        Haptics.selectionAsync?.();
    };

    return { impact, notification, selection };
}

// Common haptic patterns
export const HapticPatterns = {
    /** Tap on interactive element */
    tap: () => {
        if (!Haptics) return;
        Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle?.Light);
    },
    /** Message sent */
    messageSent: () => {
        if (!Haptics) return;
        Haptics.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
    },
    /** Error occurred */
    error: () => {
        if (!Haptics) return;
        Haptics.notificationAsync?.(Haptics.NotificationFeedbackType?.Error);
    },
    /** Long press / hold */
    longPress: () => {
        if (!Haptics) return;
        Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle?.Heavy);
    },
    /** List item selection */
    select: () => {
        if (!Haptics) return;
        Haptics.selectionAsync?.();
    },
};
