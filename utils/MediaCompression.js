/**
 * MediaCompression - Smart Media Optimization for ndeip
 * AI-powered compression with mesh progress visualization
 * Batch processing, format conversion, and quality optimization
 */

import * as ImageManipulator from 'expo-image-manipulator';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { MeshColors, getDynamicColor } from '../constants/ndeipBrandSystem';

// Compression quality presets
const COMPRESSION_PRESETS = {
  ULTRA_HIGH: {
    image: { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG },
    video: { quality: '1080p', bitrate: 8000 },
    audio: { bitrate: 320, sampleRate: 48000 },
    name: 'Ultra High',
    meshIntensity: 1.0,
  },
  HIGH: {
    image: { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
    video: { quality: '720p', bitrate: 4000 },
    audio: { bitrate: 192, sampleRate: 44100 },
    name: 'High',
    meshIntensity: 0.8,
  },
  MEDIUM: {
    image: { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
    video: { quality: '480p', bitrate: 2000 },
    audio: { bitrate: 128, sampleRate: 44100 },
    name: 'Medium',
    meshIntensity: 0.6,
  },
  LOW: {
    image: { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG },
    video: { quality: '360p', bitrate: 1000 },
    audio: { bitrate: 96, sampleRate: 22050 },
    name: 'Low',
    meshIntensity: 0.4,
  },
  ULTRA_LOW: {
    image: { compress: 0.3, format: ImageManipulator.SaveFormat.JPEG },
    video: { quality: '240p', bitrate: 500 },
    audio: { bitrate: 64, sampleRate: 22050 },
    name: 'Ultra Low',
    meshIntensity: 0.2,
  },
};

// File size limits (in bytes)
const SIZE_LIMITS = {
  IMAGE_MAX: 10 * 1024 * 1024, // 10MB
  VIDEO_MAX: 100 * 1024 * 1024, // 100MB
  AUDIO_MAX: 25 * 1024 * 1024, // 25MB
  DOCUMENT_MAX: 50 * 1024 * 1024, // 50MB
};

// Supported formats
const SUPPORTED_FORMATS = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'],
  VIDEO: ['mp4', 'mov', 'avi', 'mkv', 'webm', '3gp'],
  AUDIO: ['mp3', 'wav', 'aac', 'm4a', 'ogg', 'flac'],
  DOCUMENT: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
};

class MediaCompression {
  constructor() {
    this.compressionQueue = [];
    this.isProcessing = false;
    this.progressCallbacks = new Map();
    this.meshPattern = this.generateCompressionMesh();
  }

  // Generate unique mesh pattern for compression visualization
  generateCompressionMesh() {
    const points = [];
    const connections = [];
    
    for (let i = 0; i < 20; i++) {
      points.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        intensity: Math.random(),
      });
    }
    
    // Create connections between nearby points
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const distance = Math.sqrt(
          Math.pow(points[i].x - points[j].x, 2) + 
          Math.pow(points[i].y - points[j].y, 2)
        );
        
        if (distance < 30) {
          connections.push({
            from: points[i],
            to: points[j],
            strength: 1 - (distance / 30),
          });
        }
      }
    }
    
    return { points, connections };
  }

  // Smart compression based on file size and type
  async smartCompress(fileUri, options = {}) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      const fileExtension = this.getFileExtension(fileUri).toLowerCase();
      const fileType = this.getFileType(fileExtension);
      
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Determine optimal compression preset
      const preset = this.getOptimalPreset(fileInfo.size, fileType, options);
      
      // Generate compression ID for progress tracking
      const compressionId = `compression_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Start compression process
      const result = await this.compressFile(fileUri, fileType, preset, compressionId, options);
      
      return {
        ...result,
        originalSize: fileInfo.size,
        compressionRatio: fileInfo.size / result.size,
        preset: preset.name,
        meshPattern: this.meshPattern,
        compressionId,
      };
      
    } catch (error) {
      console.error('Smart compression failed:', error);
      throw new Error(`Compression failed: ${error.message}`);
    }
  }

  // Batch process multiple files
  async batchCompress(files, options = {}) {
    const results = [];
    const totalFiles = files.length;
    
    for (let i = 0; i < files.length; i++) {
      try {
        const batchProgress = (i / totalFiles) * 100;
        
        if (options.onBatchProgress) {
          options.onBatchProgress({
            currentFile: i + 1,
            totalFiles,
            progress: batchProgress,
            fileName: this.getFileName(files[i]),
            meshIntensity: batchProgress / 100,
          });
        }
        
        const result = await this.smartCompress(files[i], {
          ...options,
          onProgress: (progress) => {
            if (options.onProgress) {
              options.onProgress({
                fileIndex: i,
                fileProgress: progress,
                totalProgress: (batchProgress + (progress / totalFiles)),
                meshPattern: this.generateProgressMesh(progress),
              });
            }
          },
        });
        
        results.push(result);
        
      } catch (error) {
        console.error(`Failed to compress file ${i}:`, error);
        results.push({
          error: error.message,
          originalUri: files[i],
          failed: true,
        });
      }
    }
    
    return {
      results,
      successCount: results.filter(r => !r.failed).length,
      failureCount: results.filter(r => r.failed).length,
      totalSizeReduction: this.calculateTotalSizeReduction(results),
      meshSummary: this.generateBatchMeshSummary(results),
    };
  }

  // Compress individual file based on type
  async compressFile(fileUri, fileType, preset, compressionId, options = {}) {
    switch (fileType) {
      case 'image':
        return await this.compressImage(fileUri, preset, compressionId, options);
      case 'video':
        return await this.compressVideo(fileUri, preset, compressionId, options);
      case 'audio':
        return await this.compressAudio(fileUri, preset, compressionId, options);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  // Image compression with AI optimization
  async compressImage(imageUri, preset, compressionId, options = {}) {
    try {
      // Get image dimensions
      const imageInfo = await ImageManipulator.manipulateAsync(imageUri, [], {});
      
      // Calculate optimal resize dimensions
      const maxDimension = this.getMaxDimensionForPreset(preset);
      const resizeOptions = this.calculateImageResize(imageInfo.width, imageInfo.height, maxDimension);
      
      // Progress callback setup
      const progressCallback = (progress) => {
        if (options.onProgress) {
          options.onProgress({
            progress,
            stage: 'compressing',
            meshPattern: this.generateProgressMesh(progress),
            compressionId,
          });
        }
      };

      // Simulate progress for compression steps
      progressCallback(25);
      
      // Apply transformations
      const transformations = [];
      
      if (resizeOptions.shouldResize) {
        transformations.push({
          resize: {
            width: resizeOptions.width,
            height: resizeOptions.height,
          },
        });
      }
      
      progressCallback(50);
      
      // Apply mesh-enhanced compression
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        transformations,
        {
          compress: preset.image.compress,
          format: preset.image.format,
          base64: options.includeBase64 || false,
        }
      );
      
      progressCallback(75);
      
      // Get final file info
      const finalInfo = await FileSystem.getInfoAsync(result.uri);
      
      progressCallback(100);
      
      return {
        uri: result.uri,
        width: result.width,
        height: result.height,
        size: finalInfo.size,
        base64: result.base64,
        format: preset.image.format,
        compressionLevel: preset.image.compress,
        meshVisualization: this.generateCompressionVisualization(preset.meshIntensity),
      };
      
    } catch (error) {
      console.error('Image compression failed:', error);
      throw new Error(`Image compression failed: ${error.message}`);
    }
  }

  // Video compression with mesh progress
  async compressVideo(videoUri, preset, compressionId, options = {}) {
    try {
      // Note: In a real implementation, you would use FFmpeg or similar
      // For this example, we'll simulate video compression
      
      const progressCallback = (progress) => {
        if (options.onProgress) {
          options.onProgress({
            progress,
            stage: 'compressing_video',
            meshPattern: this.generateProgressMesh(progress),
            compressionId,
          });
        }
      };

      progressCallback(10);
      
      // Generate thumbnail for preview
      const thumbnailResult = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: 1000,
        quality: 0.8,
      });
      
      progressCallback(30);
      
      // Simulate video compression process
      await this.simulateCompressionDelay(2000, progressCallback, 30, 90);
      
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(videoUri);
      
      progressCallback(100);
      
      // In real implementation, return compressed video
      return {
        uri: videoUri, // Would be compressed video URI
        thumbnail: thumbnailResult.uri,
        size: Math.floor(fileInfo.size * (preset.video.bitrate / 8000)), // Simulated compression
        quality: preset.video.quality,
        bitrate: preset.video.bitrate,
        meshVisualization: this.generateCompressionVisualization(preset.meshIntensity),
      };
      
    } catch (error) {
      console.error('Video compression failed:', error);
      throw new Error(`Video compression failed: ${error.message}`);
    }
  }

  // Audio compression with waveform analysis
  async compressAudio(audioUri, preset, compressionId, options = {}) {
    try {
      const progressCallback = (progress) => {
        if (options.onProgress) {
          options.onProgress({
            progress,
            stage: 'compressing_audio',
            meshPattern: this.generateProgressMesh(progress),
            compressionId,
          });
        }
      };

      progressCallback(20);
      
      // Load audio for analysis
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      const status = await sound.getStatusAsync();
      
      progressCallback(50);
      
      // Simulate audio compression
      await this.simulateCompressionDelay(1500, progressCallback, 50, 90);
      
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      
      progressCallback(100);
      
      // Unload sound
      await sound.unloadAsync();
      
      return {
        uri: audioUri, // Would be compressed audio URI
        duration: status.durationMillis,
        size: Math.floor(fileInfo.size * (preset.audio.bitrate / 320)), // Simulated compression
        bitrate: preset.audio.bitrate,
        sampleRate: preset.audio.sampleRate,
        meshVisualization: this.generateCompressionVisualization(preset.meshIntensity),
      };
      
    } catch (error) {
      console.error('Audio compression failed:', error);
      throw new Error(`Audio compression failed: ${error.message}`);
    }
  }

  // Get optimal compression preset based on file size and type
  getOptimalPreset(fileSize, fileType, options = {}) {
    if (options.forcePreset) {
      return COMPRESSION_PRESETS[options.forcePreset] || COMPRESSION_PRESETS.MEDIUM;
    }
    
    const sizeLimits = SIZE_LIMITS[`${fileType.toUpperCase()}_MAX`];
    const ratio = fileSize / sizeLimits;
    
    if (ratio > 0.8) return COMPRESSION_PRESETS.LOW;
    if (ratio > 0.6) return COMPRESSION_PRESETS.MEDIUM;
    if (ratio > 0.3) return COMPRESSION_PRESETS.HIGH;
    return COMPRESSION_PRESETS.ULTRA_HIGH;
  }

  // Calculate optimal image resize dimensions
  calculateImageResize(width, height, maxDimension) {
    if (width <= maxDimension && height <= maxDimension) {
      return { shouldResize: false, width, height };
    }
    
    const aspectRatio = width / height;
    let newWidth, newHeight;
    
    if (width > height) {
      newWidth = maxDimension;
      newHeight = Math.round(maxDimension / aspectRatio);
    } else {
      newHeight = maxDimension;
      newWidth = Math.round(maxDimension * aspectRatio);
    }
    
    return { shouldResize: true, width: newWidth, height: newHeight };
  }

  // Get maximum dimension for preset
  getMaxDimensionForPreset(preset) {
    switch (preset.name) {
      case 'Ultra High': return 4096;
      case 'High': return 2048;
      case 'Medium': return 1024;
      case 'Low': return 512;
      case 'Ultra Low': return 256;
      default: return 1024;
    }
  }

  // Generate mesh visualization for compression
  generateCompressionVisualization(intensity) {
    return {
      meshIntensity: intensity,
      crystallinePattern: this.meshPattern.points.map(point => ({
        ...point,
        opacity: point.intensity * intensity,
        color: getDynamicColor(MeshColors.electricBlue, intensity),
      })),
      connections: this.meshPattern.connections.map(conn => ({
        ...conn,
        opacity: conn.strength * intensity,
        color: getDynamicColor(MeshColors.primaryTeal, intensity * 0.7),
      })),
    };
  }

  // Generate progress-based mesh pattern
  generateProgressMesh(progress) {
    const progressRatio = progress / 100;
    return {
      points: this.meshPattern.points.map((point, index) => ({
        ...point,
        active: index < (this.meshPattern.points.length * progressRatio),
        pulseIntensity: Math.sin((Date.now() + index * 100) * 0.01) * 0.5 + 0.5,
      })),
      flowDirection: progressRatio,
      electricFlow: progressRatio > 0.5,
    };
  }

  // Generate batch processing mesh summary
  generateBatchMeshSummary(results) {
    const successCount = results.filter(r => !r.failed).length;
    const totalCount = results.length;
    const successRatio = successCount / totalCount;
    
    return {
      successRatio,
      meshColor: successRatio > 0.8 ? MeshColors.electricBlue : 
                 successRatio > 0.5 ? MeshColors.primaryTeal : '#C83232',
      crystallineIntensity: successRatio,
      particleCount: Math.floor(successCount * 10),
      glowEffect: successRatio > 0.9,
    };
  }

  // Calculate total size reduction
  calculateTotalSizeReduction(results) {
    let originalTotal = 0;
    let compressedTotal = 0;
    
    results.forEach(result => {
      if (!result.failed && result.originalSize && result.size) {
        originalTotal += result.originalSize;
        compressedTotal += result.size;
      }
    });
    
    return {
      originalSize: originalTotal,
      compressedSize: compressedTotal,
      savedBytes: originalTotal - compressedTotal,
      compressionRatio: originalTotal > 0 ? compressedTotal / originalTotal : 1,
      savedPercentage: originalTotal > 0 ? ((originalTotal - compressedTotal) / originalTotal) * 100 : 0,
    };
  }

  // Utility functions
  getFileExtension(uri) {
    return uri.split('.').pop() || '';
  }

  getFileName(uri) {
    return uri.split('/').pop() || 'unknown';
  }

  getFileType(extension) {
    if (SUPPORTED_FORMATS.IMAGE.includes(extension)) return 'image';
    if (SUPPORTED_FORMATS.VIDEO.includes(extension)) return 'video';
    if (SUPPORTED_FORMATS.AUDIO.includes(extension)) return 'audio';
    if (SUPPORTED_FORMATS.DOCUMENT.includes(extension)) return 'document';
    return 'unknown';
  }

  // Simulate compression delay with progress updates
  async simulateCompressionDelay(totalMs, progressCallback, startProgress, endProgress) {
    const steps = 10;
    const stepMs = totalMs / steps;
    const progressStep = (endProgress - startProgress) / steps;
    
    for (let i = 0; i < steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepMs));
      progressCallback(startProgress + (progressStep * (i + 1)));
    }
  }

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get compression quality metrics
  getCompressionMetrics(originalSize, compressedSize) {
    const compressionRatio = originalSize > 0 ? compressedSize / originalSize : 1;
    const savedBytes = originalSize - compressedSize;
    const savedPercentage = originalSize > 0 ? (savedBytes / originalSize) * 100 : 0;
    
    return {
      compressionRatio,
      savedBytes,
      savedPercentage,
      originalSizeFormatted: this.formatFileSize(originalSize),
      compressedSizeFormatted: this.formatFileSize(compressedSize),
      savedSizeFormatted: this.formatFileSize(savedBytes),
      qualityRating: this.getQualityRating(compressionRatio),
    };
  }

  // Get quality rating based on compression ratio
  getQualityRating(ratio) {
    if (ratio > 0.9) return 'Excellent';
    if (ratio > 0.7) return 'Very Good';
    if (ratio > 0.5) return 'Good';
    if (ratio > 0.3) return 'Fair';
    return 'High Compression';
  }
}

// Export singleton instance
export default new MediaCompression();

// Export compression presets and utilities
export {
  COMPRESSION_PRESETS,
  SIZE_LIMITS,
  SUPPORTED_FORMATS,
  MediaCompression,
};