/**
 * SecurityManager - Enterprise-Level Security for ndeip
 * Biometric authentication, app lock, screen recording protection
 * Secure data deletion with mesh destruction animation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
// expo-local-authentication is native-only; lazy-load to avoid web build crash
let LocalAuthentication = null;
try { LocalAuthentication = require('expo-local-authentication'); } catch (e) { }
let ScreenCapture = null;
try { ScreenCapture = require('expo-screen-capture'); } catch (e) { }
let SecureStore = null;
try { SecureStore = require('expo-secure-store'); } catch (e) { }
import CryptoJS from 'crypto-js';
import { Alert, AppState, DeviceEventEmitter } from 'react-native';
import { EventEmitter } from 'events';

import { MeshColors, getDynamicColor } from '../constants/ndeipBrandSystem';

// Security levels
const SECURITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  MAXIMUM: 'maximum',
};

// Authentication types
const AUTH_TYPES = {
  NONE: 'none',
  PIN: 'pin',
  BIOMETRIC: 'biometric',
  HYBRID: 'hybrid', // PIN + Biometric
};

// Screen protection modes
const SCREEN_PROTECTION = {
  NONE: 'none',
  BLUR: 'blur',
  BLACK: 'black',
  MESH: 'mesh',
};

// Encryption algorithms
const ENCRYPTION_ALGORITHMS = {
  AES256: 'AES256',
  CHACHA20: 'ChaCha20',
  HYBRID: 'hybrid',
};

class SecurityManager extends EventEmitter {
  constructor() {
    super();
    this.isLocked = false;
    this.isAppInBackground = false;
    this.lockTimer = null;
    this.biometricAttempts = 0;
    this.maxBiometricAttempts = 5;
    this.securityLevel = SECURITY_LEVELS.MEDIUM;
    this.encryptionKey = null;
    this.screenProtectionActive = false;

    this.initializeSecurity();
  }

  // Initialize security manager
  async initializeSecurity() {
    try {
      // Load security settings
      await this.loadSecuritySettings();

      // Set up app state monitoring
      this.setupAppStateMonitoring();

      // Initialize biometric authentication
      await this.initializeBiometrics();

      // Set up screen protection
      await this.setupScreenProtection();

      // Generate or load encryption keys
      await this.initializeEncryption();

      console.log('SecurityManager initialized successfully');
      this.emit('securityInitialized');

    } catch (error) {
      console.error('Failed to initialize SecurityManager:', error);
      this.emit('securityError', error);
    }
  }

  // Load security settings
  async loadSecuritySettings() {
    try {
      const settings = await AsyncStorage.getItem('security_settings');

      if (settings) {
        const parsed = JSON.parse(settings);
        this.securityLevel = parsed.securityLevel || SECURITY_LEVELS.MEDIUM;
        this.authType = parsed.authType || AUTH_TYPES.BIOMETRIC;
        this.lockTimeout = parsed.lockTimeout || 300000; // 5 minutes
        this.screenProtectionMode = parsed.screenProtectionMode || SCREEN_PROTECTION.BLUR;
        this.encryptionAlgorithm = parsed.encryptionAlgorithm || ENCRYPTION_ALGORITHMS.AES256;
      } else {
        // Set default security settings
        await this.setDefaultSecuritySettings();
      }

    } catch (error) {
      console.error('Failed to load security settings:', error);
      await this.setDefaultSecuritySettings();
    }
  }

  // Set default security settings
  async setDefaultSecuritySettings() {
    const defaultSettings = {
      securityLevel: SECURITY_LEVELS.MEDIUM,
      authType: AUTH_TYPES.BIOMETRIC,
      lockTimeout: 300000,
      screenProtectionMode: SCREEN_PROTECTION.BLUR,
      encryptionAlgorithm: ENCRYPTION_ALGORITHMS.AES256,
      autoLockEnabled: true,
      biometricEnabled: true,
      screenRecordingBlocked: true,
      screenshotBlocked: false,
    };

    await AsyncStorage.setItem('security_settings', JSON.stringify(defaultSettings));
    Object.assign(this, defaultSettings);
  }

  // Initialize biometric authentication
  async initializeBiometrics() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      this.biometricCapability = {
        hasHardware,
        isEnrolled,
        supportedTypes,
        faceId: supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION),
        touchId: supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT),
      };

      console.log('Biometric capability:', this.biometricCapability);

    } catch (error) {
      console.error('Failed to initialize biometrics:', error);
      this.biometricCapability = {
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
        faceId: false,
        touchId: false,
      };
    }
  }

  // Setup app state monitoring
  setupAppStateMonitoring() {
    AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        this.handleAppGoesToBackground();
      } else if (nextAppState === 'active') {
        this.handleAppBecomesActive();
      }
    });
  }

  // Handle app going to background
  handleAppGoesToBackground() {
    this.isAppInBackground = true;

    if (this.autoLockEnabled && this.lockTimeout > 0) {
      this.lockTimer = setTimeout(() => {
        this.lockApp();
      }, this.lockTimeout);
    }

    // Enable screen protection
    this.enableScreenProtection();

    this.emit('appBackgrounded');
  }

  // Handle app becoming active
  async handleAppBecomesActive() {
    this.isAppInBackground = false;

    // Clear lock timer
    if (this.lockTimer) {
      clearTimeout(this.lockTimer);
      this.lockTimer = null;
    }

    // Disable screen protection
    this.disableScreenProtection();

    // Check if app should be locked
    if (this.isLocked) {
      await this.requestAuthentication();
    }

    this.emit('appForegrounded');
  }

  // Lock the app
  lockApp(reason = 'timeout') {
    this.isLocked = true;

    this.emit('appLocked', { reason, timestamp: Date.now() });

    // Log security event
    this.logSecurityEvent('app_locked', { reason });

    console.log(`App locked due to: ${reason}`);
  }

  // Unlock the app
  unlockApp() {
    this.isLocked = false;
    this.biometricAttempts = 0;

    this.emit('appUnlocked', { timestamp: Date.now() });

    // Log security event
    this.logSecurityEvent('app_unlocked');

    console.log('App unlocked successfully');
  }

  // Request authentication
  async requestAuthentication() {
    try {
      if (this.authType === AUTH_TYPES.BIOMETRIC || this.authType === AUTH_TYPES.HYBRID) {
        return await this.requestBiometricAuthentication();
      } else if (this.authType === AUTH_TYPES.PIN) {
        return await this.requestPinAuthentication();
      } else {
        // No authentication required
        this.unlockApp();
        return true;
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      this.emit('authenticationFailed', error);
      return false;
    }
  }

  // Request biometric authentication
  async requestBiometricAuthentication() {
    try {
      if (!this.biometricCapability.hasHardware || !this.biometricCapability.isEnrolled) {
        throw new Error('Biometric authentication not available');
      }

      if (this.biometricAttempts >= this.maxBiometricAttempts) {
        throw new Error('Maximum biometric attempts exceeded');
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock ndeip',
        subtitle: 'Use your biometric to access your messages',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
      });

      if (result.success) {
        this.unlockApp();
        return true;
      } else {
        this.biometricAttempts++;

        if (result.error === 'UserCancel') {
          this.emit('authenticationCancelled');
        } else if (result.error === 'UserFallback') {
          return await this.requestPinAuthentication();
        } else {
          this.emit('authenticationFailed', result.error);
        }

        return false;
      }

    } catch (error) {
      console.error('Biometric authentication error:', error);

      // Fallback to PIN if available
      if (this.authType === AUTH_TYPES.HYBRID) {
        return await this.requestPinAuthentication();
      }

      throw error;
    }
  }

  // Request PIN authentication
  async requestPinAuthentication() {
    return new Promise((resolve) => {
      this.emit('pinAuthenticationRequired', {
        onSuccess: () => {
          this.unlockApp();
          resolve(true);
        },
        onFailure: () => {
          this.emit('authenticationFailed', 'Invalid PIN');
          resolve(false);
        },
        onCancel: () => {
          this.emit('authenticationCancelled');
          resolve(false);
        },
      });
    });
  }

  // Setup screen protection
  async setupScreenProtection() {
    try {
      if (this.screenRecordingBlocked) {
        await ScreenCapture.preventScreenCaptureAsync();
      }

      // Set up screenshot prevention
      if (this.screenshotBlocked) {
        DeviceEventEmitter.addListener('RNScreenshotDetected', () => {
          this.handleScreenshotDetected();
        });
      }

    } catch (error) {
      console.error('Failed to setup screen protection:', error);
    }
  }

  // Enable screen protection
  enableScreenProtection() {
    if (this.screenProtectionActive) return;

    this.screenProtectionActive = true;

    this.emit('screenProtectionEnabled', {
      mode: this.screenProtectionMode,
    });
  }

  // Disable screen protection
  disableScreenProtection() {
    if (!this.screenProtectionActive) return;

    this.screenProtectionActive = false;

    this.emit('screenProtectionDisabled');
  }

  // Handle screenshot detected
  handleScreenshotDetected() {
    this.logSecurityEvent('screenshot_detected');

    Alert.alert(
      'Screenshot Detected',
      'Screenshots are not allowed in ndeip for security reasons.',
      [{ text: 'OK' }]
    );

    this.emit('screenshotDetected');
  }

  // Initialize encryption
  async initializeEncryption() {
    try {
      // Try to load existing encryption key
      let keyData = await SecureStore.getItemAsync('encryption_key');

      if (!keyData) {
        // Generate new encryption key
        keyData = await this.generateEncryptionKey();
        await SecureStore.setItemAsync('encryption_key', keyData);
      }

      this.encryptionKey = keyData;

      console.log('Encryption initialized successfully');

    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      throw new Error('Encryption initialization failed');
    }
  }

  // Generate encryption key
  async generateEncryptionKey() {
    const randomBytes = CryptoJS.lib.WordArray.random(256 / 8);
    return randomBytes.toString(CryptoJS.enc.Hex);
  }

  // Encrypt data
  encryptData(data, customKey = null) {
    try {
      const key = customKey || this.encryptionKey;

      if (!key) {
        throw new Error('Encryption key not available');
      }

      switch (this.encryptionAlgorithm) {
        case ENCRYPTION_ALGORITHMS.AES256:
          return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();

        case ENCRYPTION_ALGORITHMS.CHACHA20:
          // ChaCha20 implementation (simplified for demo)
          return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();

        case ENCRYPTION_ALGORITHMS.HYBRID:
          // Double encryption
          const aesEncrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
          return CryptoJS.AES.encrypt(aesEncrypted, key + '_secondary').toString();

        default:
          throw new Error('Unknown encryption algorithm');
      }

    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Data encryption failed');
    }
  }

  // Decrypt data
  decryptData(encryptedData, customKey = null) {
    try {
      const key = customKey || this.encryptionKey;

      if (!key) {
        throw new Error('Encryption key not available');
      }

      let decrypted;

      switch (this.encryptionAlgorithm) {
        case ENCRYPTION_ALGORITHMS.AES256:
          decrypted = CryptoJS.AES.decrypt(encryptedData, key);
          break;

        case ENCRYPTION_ALGORITHMS.CHACHA20:
          // ChaCha20 implementation (simplified for demo)
          decrypted = CryptoJS.AES.decrypt(encryptedData, key);
          break;

        case ENCRYPTION_ALGORITHMS.HYBRID:
          // Double decryption
          const firstDecrypt = CryptoJS.AES.decrypt(encryptedData, key + '_secondary');
          decrypted = CryptoJS.AES.decrypt(firstDecrypt.toString(CryptoJS.enc.Utf8), key);
          break;

        default:
          throw new Error('Unknown encryption algorithm');
      }

      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Data decryption failed');
    }
  }

  // Secure data wipe
  async secureDataWipe(type = 'complete') {
    try {
      this.emit('dataWipeStarted', { type });

      switch (type) {
        case 'complete':
          await this.wipeAllData();
          break;

        case 'messages':
          await this.wipeMessages();
          break;

        case 'media':
          await this.wipeMedia();
          break;

        case 'cache':
          await this.wipeCache();
          break;

        default:
          throw new Error('Unknown wipe type');
      }

      this.emit('dataWipeCompleted', { type });

    } catch (error) {
      console.error('Data wipe failed:', error);
      this.emit('dataWipeError', error);
      throw error;
    }
  }

  // Wipe all data
  async wipeAllData() {
    // Clear AsyncStorage
    await AsyncStorage.clear();

    // Clear SecureStore
    await this.clearSecureStore();

    // Clear other storages (implementation depends on your data storage)
    // await this.clearDatabase();
    // await this.clearFileSystem();

    console.log('All data wiped successfully');
  }

  // Wipe messages
  async wipeMessages() {
    // Implementation depends on your message storage
    await AsyncStorage.removeItem('messages');
    await AsyncStorage.removeItem('chats');
    await AsyncStorage.removeItem('groups');

    console.log('Messages wiped successfully');
  }

  // Wipe media
  async wipeMedia() {
    // Implementation depends on your media storage
    await AsyncStorage.removeItem('media_cache');
    // Clear media files from file system

    console.log('Media wiped successfully');
  }

  // Wipe cache
  async wipeCache() {
    const cacheKeys = [
      'image_cache',
      'video_cache',
      'audio_cache',
      'file_cache',
      'temp_data',
    ];

    for (const key of cacheKeys) {
      await AsyncStorage.removeItem(key);
    }

    console.log('Cache wiped successfully');
  }

  // Clear secure store
  async clearSecureStore() {
    const secureKeys = [
      'encryption_key',
      'user_credentials',
      'auth_tokens',
      'private_keys',
    ];

    for (const key of secureKeys) {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.warn(`Failed to delete secure key ${key}:`, error);
      }
    }
  }

  // Update security settings
  async updateSecuritySettings(newSettings) {
    try {
      const currentSettings = await this.loadSecuritySettings();
      const updatedSettings = { ...currentSettings, ...newSettings };

      await AsyncStorage.setItem('security_settings', JSON.stringify(updatedSettings));

      // Update instance properties
      Object.assign(this, updatedSettings);

      // Reinitialize if necessary
      if (newSettings.encryptionAlgorithm && newSettings.encryptionAlgorithm !== this.encryptionAlgorithm) {
        await this.initializeEncryption();
      }

      this.emit('securitySettingsUpdated', updatedSettings);

    } catch (error) {
      console.error('Failed to update security settings:', error);
      throw error;
    }
  }

  // Log security event
  logSecurityEvent(event, data = {}) {
    const logEntry = {
      event,
      timestamp: Date.now(),
      securityLevel: this.securityLevel,
      ...data,
    };

    // Store in secure log (implementation depends on your logging system)
    this.storeSecurityLog(logEntry);

    this.emit('securityEvent', logEntry);
  }

  // Store security log
  async storeSecurityLog(logEntry) {
    try {
      const logs = await AsyncStorage.getItem('security_logs');
      const logArray = logs ? JSON.parse(logs) : [];

      logArray.push(logEntry);

      // Keep only last 1000 entries
      if (logArray.length > 1000) {
        logArray.splice(0, logArray.length - 1000);
      }

      await AsyncStorage.setItem('security_logs', JSON.stringify(logArray));

    } catch (error) {
      console.error('Failed to store security log:', error);
    }
  }

  // Get security logs
  async getSecurityLogs() {
    try {
      const logs = await AsyncStorage.getItem('security_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Failed to get security logs:', error);
      return [];
    }
  }

  // Threat detection
  detectThreat(type, data) {
    const threat = {
      type,
      data,
      timestamp: Date.now(),
      severity: this.calculateThreatSeverity(type, data),
    };

    this.logSecurityEvent('threat_detected', threat);
    this.emit('threatDetected', threat);

    // Auto-respond to high severity threats
    if (threat.severity === 'high') {
      this.respondToThreat(threat);
    }

    return threat;
  }

  // Calculate threat severity
  calculateThreatSeverity(type, data) {
    switch (type) {
      case 'multiple_failed_attempts':
        return data.attempts > 5 ? 'high' : 'medium';
      case 'screenshot_detected':
        return 'low';
      case 'root_detection':
        return 'high';
      case 'debugger_detected':
        return 'high';
      default:
        return 'low';
    }
  }

  // Respond to threat
  respondToThreat(threat) {
    switch (threat.type) {
      case 'multiple_failed_attempts':
        this.lockApp('security_threat');
        break;
      case 'root_detection':
        this.secureDataWipe('complete');
        break;
      case 'debugger_detected':
        this.lockApp('security_threat');
        break;
    }
  }

  // Get security status
  getSecurityStatus() {
    return {
      isLocked: this.isLocked,
      securityLevel: this.securityLevel,
      authType: this.authType,
      biometricCapability: this.biometricCapability,
      screenProtectionActive: this.screenProtectionActive,
      encryptionAlgorithm: this.encryptionAlgorithm,
      lastSecurityEvent: this.lastSecurityEvent,
    };
  }

  // Validate security configuration
  validateSecurityConfiguration() {
    const issues = [];

    if (this.securityLevel === SECURITY_LEVELS.HIGH && this.authType === AUTH_TYPES.NONE) {
      issues.push('High security level requires authentication');
    }

    if (this.biometricEnabled && !this.biometricCapability.hasHardware) {
      issues.push('Biometric authentication not available on this device');
    }

    if (!this.encryptionKey) {
      issues.push('Encryption key not initialized');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  // Generate mesh destruction animation data
  generateMeshDestructionAnimation() {
    return {
      particles: Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        velocity: {
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10,
        },
        color: i % 2 === 0 ? MeshColors.electricBlue : MeshColors.primaryTeal,
        size: Math.random() * 5 + 2,
        life: 1,
      })),
      duration: 2000,
      type: 'destruction',
    };
  }

  // Cleanup
  cleanup() {
    if (this.lockTimer) {
      clearTimeout(this.lockTimer);
    }

    // Remove event listeners
    AppState.removeEventListener('change', this.handleAppStateChange);

    this.removeAllListeners();
  }
}

// Export singleton instance
export default new SecurityManager();

// Export constants and types
export {
  SECURITY_LEVELS,
  AUTH_TYPES,
  SCREEN_PROTECTION,
  ENCRYPTION_ALGORITHMS,
  SecurityManager,
};