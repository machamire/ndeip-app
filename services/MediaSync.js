/**
 * MediaSync - Seamless Media Synchronization for ndeip
 * Progressive upload, mesh progress visualization, smart retry logic
 * Offline queue management and real-time sync status
 */

// expo-file-system is native-only; lazy-load to avoid web build crash
let FileSystem = null;
try { FileSystem = require('expo-file-system'); } catch (e) { }
import NetInfo from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from 'events';
import { MeshColors, getDynamicColor } from '../constants/ndeipBrandSystem';
import MediaCompression from '../utils/MediaCompression';

// Sync status constants
const SYNC_STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
};

// Upload priority levels
const UPLOAD_PRIORITY = {
  CRITICAL: 1,    // Messages being sent
  HIGH: 2,        // Status updates
  NORMAL: 3,      // Media sharing
  LOW: 4,         // Backup uploads
};

// Retry configuration
const RETRY_CONFIG = {
  maxAttempts: 5,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitterRange: 0.1,
};

// Sync settings
const SYNC_SETTINGS = {
  maxConcurrentUploads: 3,
  chunkSize: 1024 * 1024, // 1MB chunks
  timeoutMs: 30000,
  offlineQueueLimit: 100,
  compressionEnabled: true,
  wifiOnlyUploads: false,
};

class MediaSync extends EventEmitter {
  constructor() {
    super();
    this.uploadQueue = new Map();
    this.activeUploads = new Map();
    this.offlineQueue = [];
    this.isOnline = true;
    this.syncSettings = { ...SYNC_SETTINGS };
    this.meshPattern = this.generateSyncMesh();
    this.retryTimers = new Map();

    this.initializeSync();
  }

  // Initialize sync service
  async initializeSync() {
    try {
      // Load offline queue from storage
      await this.loadOfflineQueue();

      // Set up network monitoring
      this.setupNetworkMonitoring();

      // Start periodic sync check
      this.startPeriodicSync();

      // Load user sync settings
      await this.loadSyncSettings();

      console.log('MediaSync initialized successfully');

    } catch (error) {
      console.error('Failed to initialize MediaSync:', error);
    }
  }

  // Generate mesh pattern for sync visualization
  generateSyncMesh() {
    const nodes = [];
    const connections = [];

    // Create sync nodes
    for (let i = 0; i < 15; i++) {
      nodes.push({
        id: `sync_node_${i}`,
        x: (i % 5) * 25,
        y: Math.floor(i / 5) * 35,
        type: i < 5 ? 'device' : i < 10 ? 'server' : 'cloud',
        status: 'idle',
        dataFlow: 0,
      });
    }

    // Create data flow connections
    for (let i = 0; i < 5; i++) {
      // Device to server connections
      connections.push({
        from: nodes[i],
        to: nodes[i + 5],
        type: 'upload',
        strength: 0,
        active: false,
      });

      // Server to cloud connections
      connections.push({
        from: nodes[i + 5],
        to: nodes[i + 10],
        type: 'sync',
        strength: 0,
        active: false,
      });
    }

    return { nodes, connections };
  }

  // Queue media for upload
  async queueUpload(mediaFile, options = {}) {
    try {
      const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Validate file
      const fileInfo = await FileSystem.getInfoAsync(mediaFile.uri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Compress media if enabled
      let processedFile = mediaFile;
      if (this.syncSettings.compressionEnabled) {
        const compressed = await MediaCompression.smartCompress(mediaFile.uri, {
          onProgress: (progress) => {
            this.emit('compressionProgress', {
              uploadId,
              progress,
              meshPattern: this.generateProgressMesh(progress.progress),
            });
          },
        });

        processedFile = {
          ...mediaFile,
          uri: compressed.uri,
          size: compressed.size,
          compressed: true,
          originalSize: fileInfo.size,
          compressionRatio: compressed.compressionRatio,
        };
      }

      // Create upload item
      const uploadItem = {
        id: uploadId,
        file: processedFile,
        status: SYNC_STATUS.PENDING,
        priority: options.priority || UPLOAD_PRIORITY.NORMAL,
        chatId: options.chatId,
        messageId: options.messageId,
        uploadType: options.uploadType || 'media',
        createdAt: Date.now(),
        attempts: 0,
        progress: 0,
        error: null,
        meshVisualization: this.generateUploadMesh(uploadId),
        metadata: {
          ...options.metadata,
          deviceId: options.deviceId,
          timestamp: Date.now(),
        },
      };

      // Add to queue
      this.uploadQueue.set(uploadId, uploadItem);

      // Save to offline storage
      await this.saveOfflineQueue();

      // Start upload if online
      if (this.isOnline) {
        this.processUploadQueue();
      }

      this.emit('uploadQueued', uploadItem);

      return uploadId;

    } catch (error) {
      console.error('Failed to queue upload:', error);
      throw new Error(`Upload queue failed: ${error.message}`);
    }
  }

  // Process upload queue
  async processUploadQueue() {
    if (this.activeUploads.size >= this.syncSettings.maxConcurrentUploads) {
      return;
    }

    // Get next upload by priority
    const pendingUploads = Array.from(this.uploadQueue.values())
      .filter(upload => upload.status === SYNC_STATUS.PENDING)
      .sort((a, b) => a.priority - b.priority);

    if (pendingUploads.length === 0) {
      return;
    }

    const nextUpload = pendingUploads[0];
    await this.startUpload(nextUpload);
  }

  // Start individual upload
  async startUpload(uploadItem) {
    try {
      uploadItem.status = SYNC_STATUS.UPLOADING;
      uploadItem.startedAt = Date.now();
      this.activeUploads.set(uploadItem.id, uploadItem);

      this.emit('uploadStarted', uploadItem);

      // Update mesh visualization
      this.updateUploadMesh(uploadItem.id, 'uploading');

      // Upload with progress tracking
      const result = await this.uploadFile(uploadItem);

      // Mark as completed
      uploadItem.status = SYNC_STATUS.COMPLETED;
      uploadItem.completedAt = Date.now();
      uploadItem.result = result;
      uploadItem.progress = 100;

      // Remove from active uploads
      this.activeUploads.delete(uploadItem.id);
      this.uploadQueue.delete(uploadItem.id);

      // Update mesh visualization
      this.updateUploadMesh(uploadItem.id, 'completed');

      this.emit('uploadCompleted', uploadItem);

      // Save updated queue
      await this.saveOfflineQueue();

      // Process next upload
      this.processUploadQueue();

    } catch (error) {
      console.error('Upload failed:', error);
      await this.handleUploadError(uploadItem, error);
    }
  }

  // Upload file with chunked upload
  async uploadFile(uploadItem) {
    const { file } = uploadItem;
    const fileInfo = await FileSystem.getInfoAsync(file.uri);
    const totalSize = fileInfo.size;
    const chunkSize = this.syncSettings.chunkSize;
    const totalChunks = Math.ceil(totalSize / chunkSize);

    let uploadedBytes = 0;
    const uploadResults = [];

    // Initialize upload session
    const uploadSession = await this.initializeUploadSession(uploadItem);

    // Upload chunks
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, totalSize);
      const chunkData = await this.readFileChunk(file.uri, start, end);

      // Upload chunk with retry logic
      const chunkResult = await this.uploadChunkWithRetry(
        uploadSession.sessionId,
        chunkIndex,
        chunkData,
        uploadItem
      );

      uploadResults.push(chunkResult);
      uploadedBytes += (end - start);

      // Update progress
      const progress = (uploadedBytes / totalSize) * 100;
      uploadItem.progress = progress;

      this.emit('uploadProgress', {
        uploadId: uploadItem.id,
        progress,
        uploadedBytes,
        totalBytes: totalSize,
        meshFlow: this.generateProgressMesh(progress),
      });

      // Update mesh visualization
      this.updateUploadMesh(uploadItem.id, 'uploading', progress);
    }

    // Finalize upload
    const finalResult = await this.finalizeUpload(uploadSession.sessionId, uploadResults);

    return {
      sessionId: uploadSession.sessionId,
      uploadUrl: finalResult.url,
      fileId: finalResult.fileId,
      thumbnailUrl: finalResult.thumbnailUrl,
      uploadedAt: Date.now(),
      chunks: uploadResults.length,
      totalSize: uploadedBytes,
    };
  }

  // Initialize upload session
  async initializeUploadSession(uploadItem) {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/upload/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAuthToken()}`,
      },
      body: JSON.stringify({
        fileName: uploadItem.file.name,
        fileSize: uploadItem.file.size,
        fileType: uploadItem.file.type,
        chatId: uploadItem.chatId,
        messageId: uploadItem.messageId,
        uploadType: uploadItem.uploadType,
        metadata: uploadItem.metadata,
      }),
    });

    if (!response.ok) {
      throw new Error(`Upload session failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // Upload single chunk with retry
  async uploadChunkWithRetry(sessionId, chunkIndex, chunkData, uploadItem) {
    let attempt = 0;
    let lastError;

    while (attempt < RETRY_CONFIG.maxAttempts) {
      try {
        const formData = new FormData();
        formData.append('sessionId', sessionId);
        formData.append('chunkIndex', chunkIndex.toString());
        formData.append('chunk', {
          uri: `data:application/octet-stream;base64,${chunkData}`,
          type: 'application/octet-stream',
          name: `chunk_${chunkIndex}`,
        });

        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/upload/chunk`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${await this.getAuthToken()}`,
          },
          body: formData,
          timeout: this.syncSettings.timeoutMs,
        });

        if (!response.ok) {
          throw new Error(`Chunk upload failed: ${response.statusText}`);
        }

        return await response.json();

      } catch (error) {
        lastError = error;
        attempt++;

        if (attempt < RETRY_CONFIG.maxAttempts) {
          const delay = this.calculateRetryDelay(attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  // Read file chunk as base64
  async readFileChunk(fileUri, start, end) {
    // Note: This is a simplified implementation
    // In practice, you'd need native module support for chunked reading
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Calculate chunk position in base64 (rough approximation)
    const base64ChunkSize = Math.ceil((end - start) * 4 / 3);
    const base64Start = Math.ceil(start * 4 / 3);

    return fileContent.substr(base64Start, base64ChunkSize);
  }

  // Finalize upload
  async finalizeUpload(sessionId, chunks) {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/upload/finalize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAuthToken()}`,
      },
      body: JSON.stringify({
        sessionId,
        chunks: chunks.map(chunk => chunk.chunkId),
      }),
    });

    if (!response.ok) {
      throw new Error(`Upload finalization failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // Handle upload error with retry logic
  async handleUploadError(uploadItem, error) {
    uploadItem.attempts++;
    uploadItem.error = error.message;
    uploadItem.lastAttemptAt = Date.now();

    if (uploadItem.attempts >= RETRY_CONFIG.maxAttempts) {
      // Max attempts reached
      uploadItem.status = SYNC_STATUS.FAILED;
      this.activeUploads.delete(uploadItem.id);

      this.emit('uploadFailed', uploadItem);
      this.updateUploadMesh(uploadItem.id, 'failed');

    } else {
      // Schedule retry
      uploadItem.status = SYNC_STATUS.PENDING;
      this.activeUploads.delete(uploadItem.id);

      const retryDelay = this.calculateRetryDelay(uploadItem.attempts);
      const retryTimer = setTimeout(() => {
        this.retryTimers.delete(uploadItem.id);
        if (this.isOnline) {
          this.processUploadQueue();
        }
      }, retryDelay);

      this.retryTimers.set(uploadItem.id, retryTimer);

      this.emit('uploadRetryScheduled', {
        uploadId: uploadItem.id,
        attempt: uploadItem.attempts,
        retryDelay,
      });
    }

    await this.saveOfflineQueue();
  }

  // Calculate retry delay with exponential backoff
  calculateRetryDelay(attempt) {
    const delay = Math.min(
      RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1),
      RETRY_CONFIG.maxDelay
    );

    // Add jitter to prevent thundering herd
    const jitter = delay * RETRY_CONFIG.jitterRange * (Math.random() - 0.5);

    return Math.round(delay + jitter);
  }

  // Network monitoring
  setupNetworkMonitoring() {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected;

      if (!wasOnline && this.isOnline) {
        // Came back online
        this.emit('connectionRestored');
        this.processUploadQueue();
        this.updateMeshConnectivity(true);

      } else if (wasOnline && !this.isOnline) {
        // Went offline
        this.emit('connectionLost');
        this.pauseActiveUploads();
        this.updateMeshConnectivity(false);
      }

      this.emit('connectivityChanged', {
        isOnline: this.isOnline,
        connectionType: state.type,
        isWifiRestricted: this.syncSettings.wifiOnlyUploads && state.type !== 'wifi',
      });
    });
  }

  // Pause active uploads
  pauseActiveUploads() {
    this.activeUploads.forEach(upload => {
      upload.status = SYNC_STATUS.PAUSED;
      this.updateUploadMesh(upload.id, 'paused');
    });

    this.activeUploads.clear();
  }

  // Generate mesh pattern for upload visualization
  generateUploadMesh(uploadId) {
    return {
      id: uploadId,
      particles: Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        },
        color: MeshColors.electricBlue,
        size: Math.random() * 3 + 1,
        active: false,
      })),
      connections: [],
      flowDirection: 'up',
      intensity: 0,
    };
  }

  // Update upload mesh visualization
  updateUploadMesh(uploadId, status, progress = 0) {
    const meshData = {
      uploadId,
      status,
      progress,
      timestamp: Date.now(),
    };

    switch (status) {
      case 'uploading':
        meshData.color = MeshColors.electricBlue;
        meshData.intensity = progress / 100;
        meshData.flowActive = true;
        break;

      case 'completed':
        meshData.color = '#00FF88';
        meshData.intensity = 1;
        meshData.pulseEffect = true;
        break;

      case 'failed':
        meshData.color = '#C83232';
        meshData.intensity = 0.7;
        meshData.errorEffect = true;
        break;

      case 'paused':
        meshData.color = '#FFA500';
        meshData.intensity = 0.3;
        meshData.pausedEffect = true;
        break;
    }

    this.emit('meshUpdate', meshData);
  }

  // Generate progress mesh pattern
  generateProgressMesh(progress) {
    const progressRatio = progress / 100;

    return {
      dataFlow: progressRatio,
      activeNodes: Math.floor(this.meshPattern.nodes.length * progressRatio),
      connectionIntensity: progressRatio,
      crystallineGlow: progressRatio > 0.8,
      particleCount: Math.floor(progressRatio * 50),
      flowSpeed: Math.max(0.1, progressRatio),
    };
  }

  // Update mesh connectivity visualization
  updateMeshConnectivity(isConnected) {
    this.emit('meshConnectivity', {
      connected: isConnected,
      networkStrength: isConnected ? 1 : 0,
      connectionColor: isConnected ? MeshColors.electricBlue : '#C83232',
      pulseRate: isConnected ? 'normal' : 'slow',
      crystallinePattern: isConnected ? 'active' : 'dormant',
    });
  }

  // Storage management
  async saveOfflineQueue() {
    try {
      const queueData = {
        uploads: Array.from(this.uploadQueue.values()),
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem('media_sync_queue', JSON.stringify(queueData));

    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  async loadOfflineQueue() {
    try {
      const queueData = await AsyncStorage.getItem('media_sync_queue');

      if (queueData) {
        const parsed = JSON.parse(queueData);

        parsed.uploads.forEach(upload => {
          // Reset uploading status to pending
          if (upload.status === SYNC_STATUS.UPLOADING) {
            upload.status = SYNC_STATUS.PENDING;
          }

          this.uploadQueue.set(upload.id, upload);
        });

        console.log(`Loaded ${parsed.uploads.length} items from offline queue`);
      }

    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  // Settings management
  async loadSyncSettings() {
    try {
      const settings = await AsyncStorage.getItem('media_sync_settings');

      if (settings) {
        this.syncSettings = { ...this.syncSettings, ...JSON.parse(settings) };
      }

    } catch (error) {
      console.error('Failed to load sync settings:', error);
    }
  }

  async updateSyncSettings(newSettings) {
    try {
      this.syncSettings = { ...this.syncSettings, ...newSettings };
      await AsyncStorage.setItem('media_sync_settings', JSON.stringify(this.syncSettings));

      this.emit('settingsUpdated', this.syncSettings);

    } catch (error) {
      console.error('Failed to update sync settings:', error);
    }
  }

  // Utility methods
  async getAuthToken() {
    return await AsyncStorage.getItem('auth_token');
  }

  startPeriodicSync() {
    setInterval(() => {
      if (this.isOnline && this.uploadQueue.size > 0) {
        this.processUploadQueue();
      }
    }, 30000); // Check every 30 seconds
  }

  // Public API methods
  async pauseUpload(uploadId) {
    const upload = this.uploadQueue.get(uploadId);
    if (upload && upload.status === SYNC_STATUS.UPLOADING) {
      upload.status = SYNC_STATUS.PAUSED;
      this.activeUploads.delete(uploadId);
      this.updateUploadMesh(uploadId, 'paused');

      this.emit('uploadPaused', upload);
    }
  }

  async resumeUpload(uploadId) {
    const upload = this.uploadQueue.get(uploadId);
    if (upload && upload.status === SYNC_STATUS.PAUSED) {
      upload.status = SYNC_STATUS.PENDING;

      if (this.isOnline) {
        this.processUploadQueue();
      }

      this.emit('uploadResumed', upload);
    }
  }

  async cancelUpload(uploadId) {
    const upload = this.uploadQueue.get(uploadId);
    if (upload) {
      upload.status = SYNC_STATUS.CANCELLED;
      this.activeUploads.delete(uploadId);
      this.uploadQueue.delete(uploadId);

      // Clear retry timer if exists
      if (this.retryTimers.has(uploadId)) {
        clearTimeout(this.retryTimers.get(uploadId));
        this.retryTimers.delete(uploadId);
      }

      this.updateUploadMesh(uploadId, 'cancelled');
      this.emit('uploadCancelled', upload);

      await this.saveOfflineQueue();
    }
  }

  getUploadStatus(uploadId) {
    return this.uploadQueue.get(uploadId) || null;
  }

  getAllUploads() {
    return Array.from(this.uploadQueue.values());
  }

  getActiveUploads() {
    return Array.from(this.activeUploads.values());
  }

  clearCompletedUploads() {
    const completed = [];

    this.uploadQueue.forEach((upload, id) => {
      if (upload.status === SYNC_STATUS.COMPLETED) {
        completed.push(upload);
        this.uploadQueue.delete(id);
      }
    });

    this.saveOfflineQueue();
    return completed;
  }

  getSyncStatistics() {
    const uploads = Array.from(this.uploadQueue.values());

    return {
      total: uploads.length,
      pending: uploads.filter(u => u.status === SYNC_STATUS.PENDING).length,
      uploading: uploads.filter(u => u.status === SYNC_STATUS.UPLOADING).length,
      completed: uploads.filter(u => u.status === SYNC_STATUS.COMPLETED).length,
      failed: uploads.filter(u => u.status === SYNC_STATUS.FAILED).length,
      paused: uploads.filter(u => u.status === SYNC_STATUS.PAUSED).length,
      totalBytes: uploads.reduce((sum, u) => sum + (u.file.size || 0), 0),
      uploadedBytes: uploads
        .filter(u => u.status === SYNC_STATUS.COMPLETED)
        .reduce((sum, u) => sum + (u.file.size || 0), 0),
      meshVisualization: this.generateStatisticsMesh(uploads),
    };
  }

  generateStatisticsMesh(uploads) {
    const stats = uploads.reduce((acc, upload) => {
      acc[upload.status] = (acc[upload.status] || 0) + 1;
      return acc;
    }, {});

    const total = uploads.length;

    return {
      completionRatio: total > 0 ? (stats.completed || 0) / total : 0,
      activeRatio: total > 0 ? (stats.uploading || 0) / total : 0,
      errorRatio: total > 0 ? (stats.failed || 0) / total : 0,
      meshHealth: this.calculateMeshHealth(stats),
      visualIntensity: Math.min(1, total / 10),
    };
  }

  calculateMeshHealth(stats) {
    const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    if (total === 0) return 1;

    const completed = stats.completed || 0;
    const failed = stats.failed || 0;

    return Math.max(0, (completed - failed * 0.5) / total);
  }
}

// Export singleton instance
export default new MediaSync();

// Export constants and types
export {
  SYNC_STATUS,
  UPLOAD_PRIORITY,
  RETRY_CONFIG,
  SYNC_SETTINGS,
  MediaSync,
};