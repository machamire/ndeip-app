/**
 * QuantumMessaging - Real-Time Messaging Service
 * Instant send with optimistic updates, smart retry with exponential backoff
 * Offline queue management and mesh loading indicators
 */

import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Import encryption utilities (placeholder for actual implementation)
import { encryptMessage, decryptMessage, generateKeyPair } from '../utils/encryption';
import { uploadMedia, compressMedia } from '../utils/mediaUtils';

// Storage keys
const STORAGE_KEYS = {
  PENDING_MESSAGES: 'ndeip_pending_messages',
  ENCRYPTION_KEYS: 'ndeip_encryption_keys',
  USER_PREFERENCES: 'ndeip_user_preferences',
  OFFLINE_QUEUE: 'ndeip_offline_queue',
  MESSAGE_CACHE: 'ndeip_message_cache',
};

// Message statuses
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
  ENCRYPTED: 'encrypted',
  QUEUED: 'queued',
};

// Message types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  FILE: 'file',
  LOCATION: 'location',
  CONTACT: 'contact',
  VOICE_NOTE: 'voice_note',
  SYSTEM: 'system',
};

class QuantumMessagingService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.isOnline = true;
    this.currentUser = null;
    this.messageQueue = new Map();
    this.retryQueue = new Map();
    this.eventListeners = new Map();
    this.encryptionKeys = new Map();
    this.messageCache = new Map();
    
    // Retry configuration
    this.retryConfig = {
      maxRetries: 5,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffFactor: 2,
    };
    
    this.initializeService();
  }

  // Initialize the messaging service
  async initializeService() {
    try {
      // Load offline data
      await this.loadOfflineData();
      
      // Setup network monitoring
      this.setupNetworkMonitoring();
      
      // Initialize socket connection
      await this.initializeSocket();
      
      console.log('QuantumMessaging service initialized');
    } catch (error) {
      console.error('Failed to initialize QuantumMessaging service:', error);
    }
  }

  // Load offline data from storage
  async loadOfflineData() {
    try {
      const [pendingMessages, encryptionKeys, offlineQueue] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PENDING_MESSAGES),
        AsyncStorage.getItem(STORAGE_KEYS.ENCRYPTION_KEYS),
        AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE),
      ]);

      if (pendingMessages) {
        const parsed = JSON.parse(pendingMessages);
        parsed.forEach(message => {
          this.messageQueue.set(message.id, message);
        });
      }

      if (encryptionKeys) {
        const parsed = JSON.parse(encryptionKeys);
        Object.entries(parsed).forEach(([userId, keys]) => {
          this.encryptionKeys.set(userId, keys);
        });
      }

      if (offlineQueue) {
        const parsed = JSON.parse(offlineQueue);
        parsed.forEach(message => {
          this.retryQueue.set(message.id, {
            ...message,
            retryCount: 0,
            nextRetry: Date.now(),
          });
        });
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  }

  // Save offline data to storage
  async saveOfflineData() {
    try {
      const pendingMessages = Array.from(this.messageQueue.values());
      const encryptionKeysObj = Object.fromEntries(this.encryptionKeys);
      const offlineQueue = Array.from(this.retryQueue.values());

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.PENDING_MESSAGES, JSON.stringify(pendingMessages)),
        AsyncStorage.setItem(STORAGE_KEYS.ENCRYPTION_KEYS, JSON.stringify(encryptionKeysObj)),
        AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(offlineQueue)),
      ]);
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  // Setup network monitoring
  setupNetworkMonitoring() {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected;
      
      if (!wasOnline && this.isOnline) {
        // Came back online
        this.handleConnectionRestored();
      } else if (wasOnline && !this.isOnline) {
        // Went offline
        this.handleConnectionLost();
      }
      
      this.emit('networkStatusChanged', { isOnline: this.isOnline });
    });
  }

  // Initialize socket connection
  async initializeSocket() {
    if (this.socket) {
      this.socket.disconnect();
    }

    const serverUrl = __DEV__ 
      ? 'http://localhost:3000' 
      : 'wss://api.ndeip.com';

    this.socket = io(serverUrl, {
      transports: ['websocket'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupSocketListeners();
  }

  // Setup socket event listeners
  setupSocketListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
      this.emit('connectionStatusChanged', { isConnected: true });
      this.processQueuedMessages();
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
      this.emit('connectionStatusChanged', { isConnected: false });
    });

    // Message events
    this.socket.on('message', (data) => {
      this.handleIncomingMessage(data);
    });

    this.socket.on('messageStatus', (data) => {
      this.handleMessageStatusUpdate(data);
    });

    this.socket.on('messageDelivered', (data) => {
      this.updateMessageStatus(data.messageId, MESSAGE_STATUS.DELIVERED);
    });

    this.socket.on('messageRead', (data) => {
      this.updateMessageStatus(data.messageId, MESSAGE_STATUS.READ);
    });

    // Typing events
    this.socket.on('userTyping', (data) => {
      this.emit('userTyping', data);
    });

    this.socket.on('userStoppedTyping', (data) => {
      this.emit('userStoppedTyping', data);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('socketError', error);
    });
  }

  // Authenticate user
  async authenticate(user) {
    this.currentUser = user;
    
    if (this.socket && this.isConnected) {
      this.socket.emit('authenticate', {
        userId: user.id,
        token: user.token,
      });
    }
    
    // Generate encryption keys if needed
    if (!this.encryptionKeys.has(user.id)) {
      const keyPair = await generateKeyPair();
      this.encryptionKeys.set(user.id, keyPair);
      await this.saveOfflineData();
    }
  }

  // Send message with optimistic updates
  async sendMessage(messageData, options = {}) {
    const {
      chatId,
      recipientId,
      groupId,
      type = MESSAGE_TYPES.TEXT,
      encrypt = true,
      priority = 'normal',
    } = options;

    // Create message object
    const message = {
      id: this.generateMessageId(),
      ...messageData,
      chatId,
      recipientId,
      groupId,
      type,
      senderId: this.currentUser?.id,
      timestamp: Date.now(),
      status: MESSAGE_STATUS.SENDING,
      priority,
      retryCount: 0,
    };

    try {
      // Encrypt message if needed
      if (encrypt && (recipientId || groupId)) {
        message.encrypted = true;
        message.content = await this.encryptMessageContent(message, recipientId || groupId);
      }

      // Add to message queue for optimistic update
      this.messageQueue.set(message.id, message);
      
      // Emit optimistic update
      this.emit('messageAdded', { message: { ...message } });

      // Send immediately if online, otherwise queue
      if (this.isOnline && this.isConnected) {
        await this.sendMessageToServer(message);
      } else {
        message.status = MESSAGE_STATUS.QUEUED;
        this.addToRetryQueue(message);
        this.emit('messageStatusChanged', { 
          messageId: message.id, 
          status: MESSAGE_STATUS.QUEUED 
        });
      }

      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      message.status = MESSAGE_STATUS.FAILED;
      this.emit('messageStatusChanged', { 
        messageId: message.id, 
        status: MESSAGE_STATUS.FAILED,
        error: error.message,
      });
      throw error;
    }
  }

  // Send message to server
  async sendMessageToServer(message) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Not connected to server'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Message send timeout'));
      }, 10000);

      this.socket.emit('sendMessage', message, (response) => {
        clearTimeout(timeout);
        
        if (response.success) {
          this.updateMessageStatus(message.id, MESSAGE_STATUS.SENT);
          this.messageQueue.delete(message.id);
          resolve(response);
        } else {
          this.handleMessageSendFailure(message, response.error);
          reject(new Error(response.error));
        }
      });
    });
  }

  // Handle message send failure
  async handleMessageSendFailure(message, error) {
    console.error('Message send failed:', error);
    
    if (this.shouldRetryMessage(message, error)) {
      this.addToRetryQueue(message);
    } else {
      this.updateMessageStatus(message.id, MESSAGE_STATUS.FAILED);
    }
  }

  // Determine if message should be retried
  shouldRetryMessage(message, error) {
    const retryableErrors = [
      'network_error',
      'timeout',
      'server_error',
      'rate_limit',
    ];
    
    return message.retryCount < this.retryConfig.maxRetries &&
           retryableErrors.some(e => error.includes(e));
  }

  // Add message to retry queue
  addToRetryQueue(message) {
    const delay = Math.min(
      this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, message.retryCount),
      this.retryConfig.maxDelay
    );
    
    this.retryQueue.set(message.id, {
      ...message,
      retryCount: message.retryCount + 1,
      nextRetry: Date.now() + delay,
    });
    
    this.scheduleRetry(message.id, delay);
    this.saveOfflineData();
  }

  // Schedule message retry
  scheduleRetry(messageId, delay) {
    setTimeout(async () => {
      const message = this.retryQueue.get(messageId);
      if (!message) return;

      if (this.isOnline && this.isConnected) {
        try {
          await this.sendMessageToServer(message);
          this.retryQueue.delete(messageId);
        } catch (error) {
          await this.handleMessageSendFailure(message, error.message);
        }
      } else {
        // Still offline, keep in queue
        this.scheduleRetry(messageId, this.retryConfig.baseDelay);
      }
    }, delay);
  }

  // Process queued messages when connection is restored
  async processQueuedMessages() {
    if (!this.isOnline || !this.isConnected) return;

    const now = Date.now();
    const messagesToProcess = Array.from(this.retryQueue.values())
      .filter(message => message.nextRetry <= now)
      .sort((a, b) => a.timestamp - b.timestamp);

    for (const message of messagesToProcess) {
      try {
        await this.sendMessageToServer(message);
        this.retryQueue.delete(message.id);
      } catch (error) {
        await this.handleMessageSendFailure(message, error.message);
      }
      
      // Add small delay between messages to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    await this.saveOfflineData();
  }

  // Send voice message
  async sendVoiceMessage(audioUri, options = {}) {
    try {
      // Compress audio
      const compressedUri = await this.compressAudio(audioUri);
      
      // Upload to server
      const uploadResult = await uploadMedia(compressedUri, 'audio');
      
      // Send message with audio URL
      return await this.sendMessage({
        audioUrl: uploadResult.url,
        duration: uploadResult.duration,
        waveform: uploadResult.waveform,
      }, {
        ...options,
        type: MESSAGE_TYPES.VOICE_NOTE,
      });
    } catch (error) {
      console.error('Failed to send voice message:', error);
      throw error;
    }
  }

  // Send media message
  async sendMediaMessage(mediaUri, mediaType, options = {}) {
    try {
      // Compress media
      const compressedUri = await compressMedia(mediaUri, mediaType);
      
      // Upload to server
      const uploadResult = await uploadMedia(compressedUri, mediaType);
      
      // Send message with media URL
      const messageData = {
        [mediaType === 'image' ? 'imageUrl' : 'videoUrl']: uploadResult.url,
        thumbnail: uploadResult.thumbnail,
        size: uploadResult.size,
        dimensions: uploadResult.dimensions,
      };
      
      if (options.caption) {
        messageData.caption = options.caption;
      }
      
      return await this.sendMessage(messageData, {
        ...options,
        type: mediaType === 'image' ? MESSAGE_TYPES.IMAGE : MESSAGE_TYPES.VIDEO,
      });
    } catch (error) {
      console.error('Failed to send media message:', error);
      throw error;
    }
  }

  // Send file message
  async sendFileMessage(fileUri, fileName, mimeType, options = {}) {
    try {
      const uploadResult = await uploadMedia(fileUri, 'file', {
        fileName,
        mimeType,
      });
      
      return await this.sendMessage({
        fileUrl: uploadResult.url,
        fileName,
        fileSize: uploadResult.size,
        mimeType,
      }, {
        ...options,
        type: MESSAGE_TYPES.FILE,
      });
    } catch (error) {
      console.error('Failed to send file message:', error);
      throw error;
    }
  }

  // Send location message
  async sendLocationMessage(location, options = {}) {
    return await this.sendMessage({
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
      locationName: location.name,
    }, {
      ...options,
      type: MESSAGE_TYPES.LOCATION,
    });
  }

  // Handle incoming message
  async handleIncomingMessage(messageData) {
    try {
      let message = { ...messageData };
      
      // Decrypt message if needed
      if (message.encrypted) {
        message.content = await this.decryptMessageContent(message);
        message.encrypted = false;
      }
      
      // Cache message
      this.messageCache.set(message.id, message);
      
      // Emit to listeners
      this.emit('messageReceived', { message });
      
      // Send delivery confirmation
      if (this.socket && this.isConnected) {
        this.socket.emit('messageDelivered', {
          messageId: message.id,
          chatId: message.chatId,
          senderId: message.senderId,
        });
      }
    } catch (error) {
      console.error('Failed to handle incoming message:', error);
    }
  }

  // Handle message status update
  handleMessageStatusUpdate(data) {
    const { messageId, status, timestamp } = data;
    
    this.emit('messageStatusChanged', {
      messageId,
      status,
      timestamp,
    });
  }

  // Update message status
  updateMessageStatus(messageId, status) {
    const message = this.messageQueue.get(messageId) || this.messageCache.get(messageId);
    
    if (message) {
      message.status = status;
      message.statusTimestamp = Date.now();
      
      this.emit('messageStatusChanged', {
        messageId,
        status,
        timestamp: message.statusTimestamp,
      });
    }
  }

  // Mark message as read
  markMessageAsRead(messageId, chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('messageRead', {
        messageId,
        chatId,
        readAt: Date.now(),
      });
    }
  }

  // Send typing indicator
  sendTypingIndicator(chatId, isTyping = true) {
    if (this.socket && this.isConnected) {
      this.socket.emit(isTyping ? 'startTyping' : 'stopTyping', {
        chatId,
        userId: this.currentUser?.id,
      });
    }
  }

  // Encrypt message content
  async encryptMessageContent(message, recipientId) {
    try {
      const keys = this.encryptionKeys.get(recipientId);
      if (!keys) {
        throw new Error('No encryption keys found for recipient');
      }
      
      return await encryptMessage(JSON.stringify(message.content), keys.publicKey);
    } catch (error) {
      console.error('Failed to encrypt message:', error);
      throw error;
    }
  }

  // Decrypt message content
  async decryptMessageContent(message) {
    try {
      const keys = this.encryptionKeys.get(this.currentUser?.id);
      if (!keys) {
        throw new Error('No encryption keys found for current user');
      }
      
      const decrypted = await decryptMessage(message.content, keys.privateKey);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to decrypt message:', error);
      throw error;
    }
  }

  // Compress audio
  async compressAudio(audioUri) {
    try {
      // Implement audio compression logic
      // This is a placeholder - actual implementation would use audio processing libraries
      return audioUri;
    } catch (error) {
      console.error('Failed to compress audio:', error);
      return audioUri;
    }
  }

  // Handle connection restored
  async handleConnectionRestored() {
    console.log('Connection restored, processing queued messages');
    await this.processQueuedMessages();
    this.emit('connectionRestored');
  }

  // Handle connection lost
  handleConnectionLost() {
    console.log('Connection lost, queueing messages for retry');
    this.emit('connectionLost');
  }

  // Get message history
  async getMessageHistory(chatId, options = {}) {
    const { limit = 50, before, after } = options;
    
    try {
      if (this.socket && this.isConnected) {
        return new Promise((resolve, reject) => {
          this.socket.emit('getMessageHistory', {
            chatId,
            limit,
            before,
            after,
          }, (response) => {
            if (response.success) {
              resolve(response.messages);
            } else {
              reject(new Error(response.error));
            }
          });
        });
      } else {
        throw new Error('Not connected to server');
      }
    } catch (error) {
      console.error('Failed to get message history:', error);
      throw error;
    }
  }

  // Get chat list
  async getChatList() {
    try {
      if (this.socket && this.isConnected) {
        return new Promise((resolve, reject) => {
          this.socket.emit('getChatList', (response) => {
            if (response.success) {
              resolve(response.chats);
            } else {
              reject(new Error(response.error));
            }
          });
        });
      } else {
        throw new Error('Not connected to server');
      }
    } catch (error) {
      console.error('Failed to get chat list:', error);
      throw error;
    }
  }

  // Delete message
  async deleteMessage(messageId, chatId, forEveryone = false) {
    try {
      if (this.socket && this.isConnected) {
        return new Promise((resolve, reject) => {
          this.socket.emit('deleteMessage', {
            messageId,
            chatId,
            forEveryone,
          }, (response) => {
            if (response.success) {
              this.emit('messageDeleted', { messageId, chatId, forEveryone });
              resolve(response);
            } else {
              reject(new Error(response.error));
            }
          });
        });
      } else {
        throw new Error('Not connected to server');
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }

  // Event management
  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
  }

  off(event, listener) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Generate unique message ID
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      isConnected: this.isConnected,
      queuedMessages: this.retryQueue.size,
      pendingMessages: this.messageQueue.size,
    };
  }

  // Clear message cache
  clearMessageCache() {
    this.messageCache.clear();
  }

  // Disconnect and cleanup
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.eventListeners.clear();
    this.saveOfflineData();
  }
}

// Create singleton instance
const quantumMessaging = new QuantumMessagingService();

// Export service and types
export default quantumMessaging;
export { MESSAGE_STATUS, MESSAGE_TYPES };

// React hook for using the messaging service
export const useQuantumMessaging = () => {
  const [connectionStatus, setConnectionStatus] = React.useState(
    quantumMessaging.getConnectionStatus()
  );

  React.useEffect(() => {
    const handleConnectionChange = (status) => {
      setConnectionStatus(quantumMessaging.getConnectionStatus());
    };

    quantumMessaging.on('connectionStatusChanged', handleConnectionChange);
    quantumMessaging.on('networkStatusChanged', handleConnectionChange);

    return () => {
      quantumMessaging.off('connectionStatusChanged', handleConnectionChange);
      quantumMessaging.off('networkStatusChanged', handleConnectionChange);
    };
  }, []);

  return {
    service: quantumMessaging,
    connectionStatus,
    sendMessage: quantumMessaging.sendMessage.bind(quantumMessaging),
    sendVoiceMessage: quantumMessaging.sendVoiceMessage.bind(quantumMessaging),
    sendMediaMessage: quantumMessaging.sendMediaMessage.bind(quantumMessaging),
    markAsRead: quantumMessaging.markMessageAsRead.bind(quantumMessaging),
    sendTyping: quantumMessaging.sendTypingIndicator.bind(quantumMessaging),
  };
};