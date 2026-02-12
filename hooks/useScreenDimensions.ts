/**
 * useScreenDimensions — Safe alternative to module-level Dimensions.get('window')
 * 
 * Safely accesses screen dimensions after mount, avoiding crashes on web
 * where Dimensions may not be ready at module evaluation time.
 */
import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

interface ScreenDimensions {
    width: number;
    height: number;
    scale: number;
    fontScale: number;
}

const DEFAULTS: ScreenDimensions = {
    width: 375,
    height: 812,
    scale: 1,
    fontScale: 1,
};

export function useScreenDimensions(): ScreenDimensions {
    const [dimensions, setDimensions] = useState<ScreenDimensions>(() => {
        try {
            const { width, height, scale, fontScale } = Dimensions.get('window');
            return { width, height, scale, fontScale };
        } catch {
            return DEFAULTS;
        }
    });

    useEffect(() => {
        // Update on mount (in case initial value was fallback)
        try {
            const { width, height, scale, fontScale } = Dimensions.get('window');
            setDimensions({ width, height, scale, fontScale });
        } catch {
            // Keep defaults
        }

        // Listen for dimension changes (rotation, resize, etc.)
        const handler = ({ window }: { window: ScaledSize }) => {
            setDimensions({
                width: window.width,
                height: window.height,
                scale: window.scale,
                fontScale: window.fontScale,
            });
        };

        const subscription = Dimensions.addEventListener('change', handler);
        return () => subscription?.remove();
    }, []);

    return dimensions;
}

// Convenience breakpoints
export function useIsSmallScreen(): boolean {
    const { width } = useScreenDimensions();
    return width < 375;
}

export function useIsTablet(): boolean {
    const { width } = useScreenDimensions();
    return width >= 768;
}
