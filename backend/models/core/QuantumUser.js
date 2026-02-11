/**
 * QuantumUser Model - Advanced User Management for ndeip
 * Stores mesh preferences, privacy settings, usage analytics, and AI preferences
 * Designed for MongoDB/Mongoose with advanced user profiling
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const validator = require('validator');

// Mesh preference schema
const MeshPreferenceSchema = new mongoose.Schema({
  intensity: {
    type: Number,
    default: 0.7,
    min: 0,
    max: 1,
  },
  animationSpeed: {
    type: Number,
    default: 1.0,
    min: 0.5,
    max: 2.0,
  },
  crystallineStyle: {
    type: String,
    enum: ['geometric', 'flowing', 'organic', 'radiant', 'natural', 'neon'],
    default: 'geometric',
  },
  colorScheme: {
    primary: {
      type: String,
      default: '#003B3B',
      validate: {
        validator: function(v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: 'Invalid color format',
      },
    },
    secondary: {
      type: String,
      default: '#0A71EF',
      validate: {
        validator: function(v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: 'Invalid color format',
      },
    },
    accent: {
      type: String,
      default: '#320096',
      validate: {
        validator: function(v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: 'Invalid color format',
      },
    },
  },
  particleCount: {
    type: Number,
    default: 15,
    min: 5,
    max: 50,
  },
  interactionEffects: {
    type: Boolean,
    default: true,
  },
  backgroundMesh: {
    type: Boolean,
    default: true,
  },
  customPatterns: [{
    name: String,
    pattern: String, // SVG pattern data
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, { _id: false });

// Privacy settings schema
const PrivacySettingsSchema = new mongoose.Schema({
  lastSeen: {
    type: String,
    enum: ['everyone', 'contacts', 'nobody'],
    default: 'contacts',
  },
  profilePhoto: {
    type: String,
    enum: ['everyone', 'contacts', 'nobody'],
    default: 'contacts',
  },
  status: {
    type: String,
    enum: ['everyone', 'contacts', 'nobody'],
    default: 'contacts',
  },
  about: {
    type: String,
    enum: ['everyone', 'contacts', 'nobody'],
    default: 'contacts',
  },
  readReceipts: {
    type: Boolean,
    default: true,
  },
  onlineStatus: {
    type: Boolean,
    default: true,
  },
  typingIndicator: {
    type: Boolean,
    default: true,
  },
  groupAdd: {
    type: String,
    enum: ['everyone', 'contacts', 'admin'],
    default: 'contacts',
  },
  callPrivacy: {
    type: String,
    enum: ['everyone', 'contacts', 'nobody'],
    default: 'contacts',
  },
  blockedUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumUser',
    },
    blockedAt: {
      type: Date,
      default: Date.now,
    },
    reason: String,
  }],
  dataSharing: {
    analytics: {
      type: Boolean,
      default: true,
    },
    crashReports: {
      type: Boolean,
      default: true,
    },
    usageStats: {
      type: Boolean,
      default: false,
    },
  },
  encryption: {
    level: {
      type: String,
      enum: ['standard', 'enhanced', 'maximum'],
      default: 'enhanced',
    },
    backupEncryption: {
      type: Boolean,
      default: true,
    },
  },
}, { _id: false });

// Usage analytics schema
const UsageAnalyticsSchema = new mongoose.Schema({
  dailyStats: [{
    date: {
      type: Date,
      default: Date.now,
    },
    messagesSent: {
      type: Number,
      default: 0,
    },
    messagesReceived: {
      type: Number,
      default: 0,
    },
    callsMade: {
      type: Number,
      default: 0,
    },
    callsReceived: {
      type: Number,
      default: 0,
    },
    voiceNotesSent: {
      type: Number,
      default: 0,
    },
    mediaShared: {
      type: Number,
      default: 0,
    },
    statusUpdates: {
      type: Number,
      default: 0,
    },
    timeSpent: {
      type: Number, // in minutes
      default: 0,
    },
    activeChats: {
      type: Number,
      default: 0,
    },
    meshInteractions: {
      type: Number,
      default: 0,
    },
  }],
  weeklyAggregates: [{
    weekStart: Date,
    totalMessages: Number,
    totalCalls: Number,
    totalTimeSpent: Number,
    averageResponseTime: Number, // in seconds
    mostActiveHour: Number,
    favoriteFeatures: [String],
  }],
  preferences: {
    favoriteContacts: [{
      contactId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuantumUser',
      },
      interactionScore: Number,
      lastInteraction: Date,
    }],
    communicationPatterns: {
      preferredMessageType: {
        type: String,
        enum: ['text', 'voice', 'media', 'call'],
        default: 'text',
      },
      averageResponseTime: Number,
      mostActiveTimeRange: {
        start: Number, // hour 0-23
	end: Number, // hour 0-23
      },
      deviceUsage: {
        platform: String, // ios, android
        deviceModel: String,
        appVersion: String,
        osVersion: String,
        screenSize: {
          width: Number,
          height: Number,
        },
        networkType: String, // wifi, cellular, etc.
      },
    },
  },
  performanceMetrics: {
    appLaunchTime: Number,
    messageDeliveryTime: Number,
    callConnectionTime: Number,
    crashReports: [{
      timestamp: Date,
      error: String,
      stackTrace: String,
      deviceInfo: Object,
    }],
  },
}, { _id: false });

// AI preferences schema
const AIPreferencesSchema = new mongoose.Schema({
  smartReplies: {
    enabled: {
      type: Boolean,
      default: true,
    },
    suggestions: {
      type: Number,
      default: 3,
      min: 1,
      max: 5,
    },
    learningEnabled: {
      type: Boolean,
      default: true,
    },
  },
  autoTranslation: {
    enabled: {
      type: Boolean,
      default: false,
    },
    targetLanguage: {
      type: String,
      default: 'en',
    },
    autoDetect: {
      type: Boolean,
      default: true,
    },
  },
  contentModeration: {
    spamDetection: {
      type: Boolean,
      default: true,
    },
    inappropriateContent: {
      type: Boolean,
      default: true,
    },
    sensitivityLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  personalAssistant: {
    enabled: {
      type: Boolean,
      default: false,
    },
    reminderSuggestions: {
      type: Boolean,
      default: true,
    },
    smartScheduling: {
      type: Boolean,
      default: false,
    },
  },
  voiceEnhancements: {
    noiseReduction: {
      type: Boolean,
      default: true,
    },
    voiceToText: {
      type: Boolean,
      default: true,
    },
    textToVoice: {
      type: Boolean,
      default: false,
    },
  },
  dataProcessingConsent: {
    personalizedFeatures: {
      type: Boolean,
      default: true,
    },
    behaviorAnalysis: {
      type: Boolean,
      default: false,
    },
    dataRetention: {
      type: String,
      enum: ['30days', '90days', '1year', 'indefinite'],
      default: '90days',
    },
  },
}, { _id: false });

// Main User Schema
const QuantumUserSchema = new mongoose.Schema({
  // Basic Information
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9_.-]+$/.test(v);
      },
      message: 'Username can only contain letters, numbers, dots, hyphens, and underscores',
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email address'],
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return validator.isMobilePhone(v);
      },
      message: 'Invalid phone number',
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: function(v) {
        // At least one uppercase, one lowercase, one number, one special char
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(v);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  },

  // Profile Information
  profile: {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    avatar: {
      url: String,
      thumbnailUrl: String,
      blurhash: String, // For progressive image loading
    },
    about: {
      type: String,
      maxlength: 500,
      default: 'Hey there! I am using ndeip.',
    },
    status: {
      type: String,
      enum: ['online', 'away', 'busy', 'offline'],
      default: 'offline',
    },
    language: {
      type: String,
      default: 'en',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
  },

  // Authentication & Security
  auth: {
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: String,
    backupCodes: [String],
    lastLogin: Date,
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockoutUntil: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    sessions: [{
      sessionId: String,
      deviceInfo: {
        platform: String,
        deviceModel: String,
        appVersion: String,
        ipAddress: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      lastActivity: {
        type: Date,
        default: Date.now,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    }],
  },

  // Mesh Preferences
  meshPreferences: {
    type: MeshPreferenceSchema,
    default: () => ({}),
  },

  // Privacy Settings
  privacySettings: {
    type: PrivacySettingsSchema,
    default: () => ({}),
  },

  // Usage Analytics
  usageAnalytics: {
    type: UsageAnalyticsSchema,
    default: () => ({}),
  },

  // AI Preferences
  aiPreferences: {
    type: AIPreferencesSchema,
    default: () => ({}),
  },

  // Contacts & Relationships
  contacts: [{
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumUser',
    },
    nickname: String,
    addedAt: {
      type: Date,
      default: Date.now,
    },
    relationship: {
      type: String,
      enum: ['friend', 'family', 'colleague', 'other'],
      default: 'friend',
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    customRingtone: String,
    notificationSettings: {
      muted: {
        type: Boolean,
        default: false,
      },
      muteUntil: Date,
      customSound: String,
      vibration: {
        type: Boolean,
        default: true,
      },
    },
  }],

  // Groups & Channels
  groups: [{
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    },
    role: {
      type: String,
      enum: ['member', 'admin', 'owner'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    notificationSettings: {
      muted: {
        type: Boolean,
        default: false,
      },
      muteUntil: Date,
      mentions: {
        type: Boolean,
        default: true,
      },
    },
  }],

  // App Settings
  appSettings: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
    },
    notifications: {
      enabled: {
        type: Boolean,
        default: true,
      },
      sound: {
        type: Boolean,
        default: true,
      },
      vibration: {
        type: Boolean,
        default: true,
      },
      preview: {
        type: Boolean,
        default: true,
      },
      groupNotifications: {
        type: Boolean,
        default: true,
      },
    },
    media: {
      autoDownload: {
        wifi: {
          photos: {
            type: Boolean,
            default: true,
          },
          videos: {
            type: Boolean,
            default: true,
          },
          documents: {
            type: Boolean,
            default: true,
          },
        },
        cellular: {
          photos: {
            type: Boolean,
            default: false,
          },
          videos: {
            type: Boolean,
            default: false,
          },
          documents: {
            type: Boolean,
            default: false,
          },
        },
      },
      compression: {
        photos: {
          type: String,
          enum: ['none', 'low', 'medium', 'high'],
          default: 'medium',
        },
        videos: {
          type: String,
          enum: ['none', 'low', 'medium', 'high'],
          default: 'medium',
        },
      },
    },
    calls: {
      lowDataMode: {
        type: Boolean,
        default: false,
      },
      callWaiting: {
        type: Boolean,
        default: true,
      },
      defaultCamera: {
        type: String,
        enum: ['front', 'back'],
        default: 'front',
      },
    },
    chat: {
      enterToSend: {
        type: Boolean,
        default: false,
      },
      fontSize: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium',
      },
      wallpaper: String,
      showTypingIndicator: {
        type: Boolean,
        default: true,
      },
    },
  },

  // Subscription & Billing
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium', 'quantum'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'cancelled'],
      default: 'active',
    },
    startDate: Date,
    endDate: Date,
    autoRenew: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      provider: String,
      last4: String,
    },
    features: [{
      feature: String,
      enabled: Boolean,
      limit: Number,
    }],
  },

  // System Fields
  isActive: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
  metadata: {
    createdBy: String,
    updatedBy: String,
    version: {
      type: Number,
      default: 1,
    },
    tags: [String],
    notes: String,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for performance
QuantumUserQuantumUserQuantumUserQuantumUserSchema.index({ 'profile.status': 1 });
QuantumUserSchema.index({ 'auth.lastSeen': 1 });
QuantumUserSchema.index({ isActive: 1, isDeleted: 1 });
QuantumUserSchema.index({ 'subscription.plan': 1, 'subscription.status': 1 });

// Compound indexes
QuantumUserSchema.index({ username: 1, isActive: 1 });
QuantumUserSchema.index({ email: 1, 'auth.isVerified': 1 });

// Virtual fields
QuantumUserSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`.trim();
});

QuantumUserSchema.virtual('displayNameOrFullName').get(function() {
  return this.profile.displayName || this.fullName;
});

QuantumUserSchema.virtual('isOnline').get(function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.auth.lastSeen > fiveMinutesAgo && this.profile.status === 'online';
});

QuantumUserSchema.virtual('isPremium').get(function() {
  return ['premium', 'quantum'].includes(this.subscription.plan) && 
         this.subscription.status === 'active';
});

// Pre-save middleware
QuantumUserSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Set display name if not provided
  if (!this.profile.displayName) {
    this.profile.displayName = this.fullName;
  }

  // Update version
  if (this.isModified() && !this.isNew) {
    this.metadata.version += 1;
  }

  next();
});

// Instance methods
QuantumUserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

QuantumUserSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.auth.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.auth.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return token;
};

QuantumUserSchema.methods.generateTwoFactorSecret = function() {
  const secret = crypto.randomBytes(32).toString('base32');
  this.auth.twoFactorSecret = secret;
  return secret;
};

QuantumUserSchema.methods.generateBackupCodes = function() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  this.auth.backupCodes = codes;
  return codes;
};

QuantumUserSchema.methods.updateLastSeen = function() {
  this.auth.lastSeen = new Date();
  return this.save({ validateBeforeSave: false });
};

QuantumUserSchema.methods.addDailyStats = function(stats) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existingStats = this.usageAnalytics.dailyStats.find(
    stat => stat.date.getTime() === today.getTime()
  );
  
  if (existingStats) {
    Object.assign(existingStats, stats);
  } else {
    this.usageAnalytics.dailyStats.push({
      date: today,
      ...stats,
    });
  }
  
  // Keep only last 30 days
  if (this.usageAnalytics.dailyStats.length > 30) {
    this.usageAnalytics.dailyStats = this.usageAnalytics.dailyStats
      .sort((a, b) => b.date - a.date)
      .slice(0, 30);
  }
  
  return this.save({ validateBeforeSave: false });
};

QuantumUserSchema.methods.updateMeshPreferences = function(preferences) {
  Object.assign(this.meshPreferences, preferences);
  return this.save();
};

QuantumUserSchema.methods.blockUser = function(userId, reason = '') {
  const existingBlock = this.privacySettings.blockedUsers.find(
    block => block.userId.toString() === userId.toString()
  );
  
  if (!existingBlock) {
    this.privacySettings.blockedUsers.push({
      userId,
      reason,
      blockedAt: new Date(),
    });
  }
  
  return this.save();
};

QuantumUserSchema.methods.unblockUser = function(userId) {
  this.privacySettings.blockedUsers = this.privacySettings.blockedUsers.filter(
    block => block.userId.toString() !== userId.toString()
  );
  
  return this.save();
};

QuantumUserSchema.methods.isBlocked = function(userId) {
  return this.privacySettings.blockedUsers.some(
    block => block.userId.toString() === userId.toString()
  );
};

QuantumUserSchema.methods.addContact = function(contactId, options = {}) {
  const existingContact = this.contacts.find(
    contact => contact.contactId.toString() === contactId.toString()
  );
  
  if (!existingContact) {
    this.contacts.push({
      contactId,
      ...options,
    });
  }
  
  return this.save();
};

QuantumUserSchema.methods.removeContact = function(contactId) {
  this.contacts = this.contacts.filter(
    contact => contact.contactId.toString() !== contactId.toString()
  );
  
  return this.save();
};

QuantumUserSchema.methods.toSafeObject = function() {
  const user = this.toObject();
  
  // Remove sensitive fields
  delete user.password;
  delete user.auth.twoFactorSecret;
  delete user.auth.backupCodes;
  delete user.auth.passwordResetToken;
  delete user.auth.sessions;
  
  return user;
};

QuantumUserSchema.methods.toPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    profile: {
      displayName: this.displayNameOrFullName,
      avatar: this.profile.avatar,
      about: this.profile.about,
      status: this.profile.status,
    },
    isOnline: this.isOnline,
    lastSeen: this.auth.lastSeen,
  };
};

// Static methods
QuantumUserSchema.statics.findByUsername = function(username) {
  return this.findOne({ username, isActive: true, isDeleted: false });
};

QuantumUserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email, isActive: true, isDeleted: false });
};

QuantumUserSchema.statics.findByPhoneNumber = function(phoneNumber) {
  return this.findOne({ phoneNumber, isActive: true, isDeleted: false });
};

QuantumUserSchema.statics.findByResetToken = function(token) {
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
    
  return this.findOne({
    'auth.passwordResetToken': hashedToken,
    'auth.passwordResetExpires': { $gt: Date.now() },
    isActive: true,
    isDeleted: false,
  });
};

QuantumUserSchema.statics.getActiveUsers = function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.find({
    'auth.lastSeen': { $gte: fiveMinutesAgo },
    'profile.status': 'online',
    isActive: true,
    isDeleted: false,
  });
};

QuantumUserSchema.statics.getUsersByMeshPreference = function(preference) {
  return this.find({
    [`meshPreferences.${preference}`]: { $exists: true },
    isActive: true,
    isDeleted: false,
  });
};

// Export the model
module.exports = mongoose.model('QuantumUser', QuantumUserSchema);