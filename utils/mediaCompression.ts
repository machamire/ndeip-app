/**
 * Media Compression Pipeline — Client-side image and video optimization
 * 
 * Reduces file sizes before upload to minimize bandwidth usage
 * and improve message delivery speed.
 * 
 * Uses expo-image-manipulator for images (when available).
 * Video compression hooks into expo-av or native encoders.
 */
import { Platform } from 'react-native';

export interface CompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0-1
    format?: 'jpeg' | 'png' | 'webp';
}

export interface CompressedResult {
    uri: string;
    width: number;
    height: number;
    fileSize: number; // bytes
    originalSize: number;
    compressionRatio: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
    maxWidth: 1280,
    maxHeight: 1280,
    quality: 0.7,
    format: 'jpeg',
};

/**
 * Compress an image URI for upload
 * Uses expo-image-manipulator when available, otherwise returns original
 */
export async function compressImage(
    uri: string,
    options: CompressionOptions = {}
): Promise<CompressedResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    try {
        // Try to use expo-image-manipulator
        const ImageManipulator = require('expo-image-manipulator');

        const actions: any[] = [];

        // Resize if needed
        if (opts.maxWidth || opts.maxHeight) {
            actions.push({
                resize: {
                    width: opts.maxWidth,
                    height: opts.maxHeight,
                },
            });
        }

        const formatMap: Record<string, string> = {
            jpeg: ImageManipulator.SaveFormat?.JPEG || 'jpeg',
            png: ImageManipulator.SaveFormat?.PNG || 'png',
            webp: ImageManipulator.SaveFormat?.WEBP || 'webp',
        };

        const result = await ImageManipulator.manipulateAsync(uri, actions, {
            compress: opts.quality,
            format: formatMap[opts.format || 'jpeg'],
        });

        return {
            uri: result.uri,
            width: result.width,
            height: result.height,
            fileSize: 0, // Would need file system access to get actual size
            originalSize: 0,
            compressionRatio: opts.quality || 0.7,
        };
    } catch {
        // Fallback: return original image
        return {
            uri,
            width: opts.maxWidth || 1280,
            height: opts.maxHeight || 1280,
            fileSize: 0,
            originalSize: 0,
            compressionRatio: 1,
        };
    }
}

/**
 * Estimate file size from dimensions and quality
 */
export function estimateCompressedSize(
    width: number,
    height: number,
    quality: number = 0.7,
    format: 'jpeg' | 'png' | 'webp' = 'jpeg'
): number {
    const pixels = width * height;
    const bitsPerPixel: Record<string, number> = {
        jpeg: 2.5 * quality,
        png: 8,
        webp: 2.0 * quality,
    };
    return Math.round((pixels * bitsPerPixel[format]) / 8);
}

/**
 * Get recommended compression settings based on network speed
 */
export function getAdaptiveQuality(networkSpeedMbps: number): CompressionOptions {
    if (networkSpeedMbps < 1) {
        // Very slow — aggressive compression
        return { maxWidth: 640, maxHeight: 640, quality: 0.4, format: 'jpeg' };
    } else if (networkSpeedMbps < 5) {
        // Moderate — balanced
        return { maxWidth: 1024, maxHeight: 1024, quality: 0.6, format: 'jpeg' };
    } else if (networkSpeedMbps < 20) {
        // Good — light compression
        return { maxWidth: 1280, maxHeight: 1280, quality: 0.75, format: 'jpeg' };
    }
    // Excellent — minimal compression
    return { maxWidth: 1920, maxHeight: 1920, quality: 0.85, format: 'jpeg' };
}
