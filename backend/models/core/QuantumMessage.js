/**
 * QuantumMessage Model - Complete messaging with AI integration
 * Handles text, media, voice messages with encryption and AI processing
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

// Message reaction schema
const MessageReactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumUser',
    required: true,
  },
  reaction: {
    type: String,
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

// Message attachment schema
const MessageAttachmentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'voice_note', 'sticker', 'gif'],
    required: true,
  },
  url: String,
  thumbnailUrl: String,
  filename: String,
  size: Number,
  mimeType: String,
  duration: Number, // for audio/video
  dimensions: {
    width: Number,
    height: Number,
  },
  blurhash: String,
}, { _id: false });

// Message edit schema
const MessageEditSchema = new mongoose.Schema({
  originalContent: String,
  editedAt: {
    type: Date,
    default: Date.now,
  },
  reason: String,
}, { _id: false });

// Message delivery status schema
const DeliveryStatusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumUser',
    required: true,
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

// AI processing schema
const AIProcessingSchema = new mongoose.Schema({
  smartReply: {
    suggestions: [String],
    confidence: Number,
    isProcessed: {
      type: Boolean,
      default: false,
    },
  },
  translation: {
    originalLanguage: String,
    targetLanguage: String,
    translatedText: String,
    confidence: Number,
    isProcessed: {
      type: Boolean,
      default: false,
    },
  },
  contentModeration: {
    isProcessed: {
      type: Boolean,
      default: false,
    },
    isSafe: {
      type: Boolean,
      default: true,
    },
    action: {
      type: String,
      enum: ['allow', 'flag', 'block', 'review'],
      default: 'allow',
    },
    confidenceScore: Number,
    flaggedContent: [String],
    categories: [String],
  },
  sentimentAnalysis: {
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
    },
    confidence: Number,
    emotions: [{
      emotion: String,
      intensity: Number,
    }],
    isProcessed: {
      type: Boolean,
      default: false,
    },
  },
}, { _id: false });

// Main Message Schema
const QuantumMessageSchema = new mongoose.Schema({
  // Message Identification
  messageId: {
    type: String,
    unique: true,
    default: () => crypto.randomUUID(),
  },
  
  chatId: {
    type: String,
    required: true,
  },
  
  threadId: String, // for threaded conversations
  
  replyToMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumMessage',
  },
  
  forwardedFromMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumMessage',
  },
  
  // Sender Information
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumUser',
    required: true,
  },
  
  senderDisplayName: String,
  
  // Message Type and Content
  messageType: {
    type: String,
    enum: ['text', 'media', 'voice_note', 'location', 'contact', 'sticker', 'system', 'call_log'],
    required: true,
  },
  
  content: {
    text: String,
    formattedText: String, // with markdown/formatting
    mentions: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuantumUser',
      },
      displayName: String,
      startIndex: Number,
      length: Number,
    }],
    hashtags: [String],
    links: [{
      url: String,
      title: String,
      description: String,
      image: String,
      domain: String,
    }],
  },
  
  // Attachments
  attachments: [MessageAttachmentSchema],
  
  // Location data (for location messages)
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    placeName: String,
  },
  
  // Contact data (for contact messages)
  contact: {
    name: String,
    phoneNumber: String,
    email: String,
    avatar: String,
  },
  
  // Message Status
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
    default: 'sending',
  },
  
  // Delivery tracking
  deliveryStatus: [DeliveryStatusSchema],
  
  // Group message info
  groupInfo: {
    isGroupMessage: {
      type: Boolean,
      default: false,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumGroup',
    },
    recipientIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumUser',
    }],
  },
  
  // Message interactions
  reactions: [MessageReactionSchema],
  
  // Message editing
  isEdited: {
    type: Boolean,
    default: false,
  },
  editHistory: [MessageEditSchema],
  
  // Message deletion
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumUser',
  },
  deletedFor: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumUser',
    },
    deletedAt: Date,
  }],
  
  // Ephemeral messages
  isEphemeral: {
    type: Boolean,
    default: false,
  },
  expiresAt: Date,
  
  // Message priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  
  // Encryption
  encryption: {
    isEncrypted: {
      type: Boolean,
      default: true,
    },
    algorithm: {
      type: String,
      default: 'AES-256-GCM',
    },
    keyId: String,
    iv: String,
  },
  
  // AI Processing
  aiProcessing: AIProcessingSchema,
  
  // Message metrics
  metrics: {
    deliveryTime: Number, // milliseconds from send to delivery
    processingTime: Number, // AI processing time
    readTime: Number, // time to first read
    engagementScore: Number, // based on reactions, replies, etc.
  },
  
  // Moderation
  moderation: {
    isReported: {
      type: Boolean,
      default: false,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    reports: [{
      reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuantumUser',
      },
      reason: String,
      reportedAt: Date,
      status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending',
      },
    }],
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumUser',
    },
    moderatedAt: Date,
    moderationAction: {
      type: String,
      enum: ['none', 'warning', 'hide', 'delete', 'ban_user'],
    },
  },
  
  // System message data
  systemMessage: {
    type: {
      type: String,
      enum: [
        'user_joined',
        'user_left',
        'user_added',
        'user_removed',
        'group_created',
        'group_renamed',
        'group_description_changed',
        'group_avatar_changed',
        'admin_promoted',
        'admin_demoted',
        'settings_changed'
      ],
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumUser',
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumUser',
    },
    metadata: Object,
  },
  
  // Call log data (for call_log messages)
  callLog: {
    callId: String,
    callType: {
      type: String,
      enum: ['voice', 'video', 'group_voice', 'group_video'],
    },
    duration: Number,
    participants: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuantumUser',
      },
      status: String,
    }],
    endReason: String,
  },
  
  // Message scheduling
  scheduledFor: Date,
  isScheduled: {
    type: Boolean,
    default: false,
  },
  
  // Message context
  context: {
    deviceInfo: {
      platform: String,
      version: String,
      browser: String,
    },
    networkInfo: {
      type: String, // wifi, cellular, etc.
      quality: String,
    },
    location: {
      country: String,
      region: String,
      city: String,
    },
  },
  
}, {
  timestamps: true,
});

// Indexes
QuantumMessageQuantumMessageSchema.index({ chatId: 1, createdAt: -1 });
QuantumMessageSchema.index({ senderId: 1, createdAt: -1 });
QuantumMessageSchema.index({ messageType: 1 });
QuantumMessageSchema.index({ status: 1 });
QuantumMessageSchema.index({ 'groupInfo.groupId': 1 });
QuantumMessageSchema.index({ isDeleted: 1, createdAt: -1 });
QuantumMessageSchema.index({ expiresAt: 1 }, { sparse: true });
QuantumMessageSchema.index({ scheduledFor: 1 }, { sparse: true });

// Compound indexes
QuantumMessageSchema.index({ chatId: 1, messageType: 1, createdAt: -1 });
QuantumMessageSchema.index({ senderId: 1, status: 1, createdAt: -1 });

// Methods
QuantumMessageSchema.methods.markAsDelivered = function(userId) {
  const existingStatus = this.deliveryStatus.find(ds => ds.userId.equals(userId));
  if (!existingStatus) {
    this.deliveryStatus.push({
      userId,
      status: 'delivered',
      timestamp: new Date(),
    });
  }
  return this.save();
};

QuantumMessageSchema.methods.markAsRead = function(userId) {
  const existingStatus = this.deliveryStatus.find(ds => ds.userId.equals(userId));
  if (existingStatus) {
    existingStatus.status = 'read';
    existingStatus.timestamp = new Date();
  } else {
    this.deliveryStatus.push({
      userId,
      status: 'read',
      timestamp: new Date(),
    });
  }
  
  // Update metrics
  if (!this.metrics.readTime) {
    this.metrics.readTime = Date.now() - this.createdAt.getTime();
  }
  
  return this.save();
};

QuantumMessageSchema.methods.addReaction = function(userId, reaction) {
  const existingReaction = this.reactions.find(r => r.userId.equals(userId));
  if (existingReaction) {
    existingReaction.reaction = reaction;
    existingReaction.addedAt = new Date();
  } else {
    this.reactions.push({
      userId,
      reaction,
      addedAt: new Date(),
    });
  }
  return this.save();
};

QuantumMessageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => !r.userId.equals(userId));
  return this.save();
};

QuantumMessageSchema.methods.editMessage = function(newContent, editReason = '') {
  this.editHistory.push({
    originalContent: this.content.text,
    editedAt: new Date(),
    reason: editReason,
  });
  
  this.content.text = newContent;
  this.isEdited = true;
  
  return this.save();
};

QuantumMessageSchema.methods.deleteForUser = function(userId) {
  const existingDeletion = this.deletedFor.find(d => d.userId.equals(userId));
  if (!existingDeletion) {
    this.deletedFor.push({
      userId,
      deletedAt: new Date(),
    });
  }
  return this.save();
};

QuantumMessageSchema.methods.deleteForEveryone = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

// Static methods
QuantumMessageSchema.statics.getMessageStats = async function(timeframe = 'day') {
  let matchStage = { isDeleted: false };
  
  if (timeframe === 'day') {
    matchStage.createdAt = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
  } else if (timeframe === 'week') {
    matchStage.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
  } else if (timeframe === 'month') {
    matchStage.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
  }
  
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        textMessages: {
          $sum: { $cond: [{ $eq: ['$messageType', 'text'] }, 1, 0] }
        },
        mediaMessages: {
          $sum: { $cond: [{ $eq: ['$messageType', 'media'] }, 1, 0] }
        },
        voiceMessages: {
          $sum: { $cond: [{ $eq: ['$messageType', 'voice_note'] }, 1, 0] }
        },
        avgDeliveryTime: { $avg: '$metrics.deliveryTime' },
        avgProcessingTime: { $avg: '$metrics.processingTime' },
        totalReactions: { $sum: { $size: '$reactions' } },
        reportedMessages: {
          $sum: { $cond: [{ $eq: ['$moderation.isReported', true] }, 1, 0] }
        },
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalMessages: 0,
    textMessages: 0,
    mediaMessages: 0,
    voiceMessages: 0,
    avgDeliveryTime: 0,
    avgProcessingTime: 0,
    totalReactions: 0,
    reportedMessages: 0,
  };
};

QuantumMessageSchema.statics.getEngagementStats = async function(chatId = null) {
  const matchStage = { isDeleted: false };
  if (chatId) matchStage.chatId = chatId;
  
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: '$senderId',
        messageCount: { $sum: 1 },
        reactionCount: { $sum: { $size: '$reactions' } },
        avgMessageLength: { $avg: { $strLenCP: '$content.text' } },
        mediaShared: {
          $sum: { $cond: [{ $gt: [{ $size: '$attachments' }, 0] }, 1, 0] }
        },
        lastActivity: { $max: '$createdAt' },
      }
    },
    { $sort: { messageCount: -1 } },
    { $limit: 50 }
  ];
  
  return this.aggregate(pipeline);
};

QuantumMessageSchema.statics.getContentModerationStats = async function() {
  const pipeline = [
    { 
      $match: { 
        'aiProcessing.contentModeration.isProcessed': true,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: '$aiProcessing.contentModeration.action',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$aiProcessing.contentModeration.confidenceScore' },
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

QuantumMessageSchema.statics.cleanupExpiredMessages = async function() {
  const result = await this.deleteMany({
    expiresAt: { $lte: new Date() },
    isEphemeral: true,
  });
  
  return result.deletedCount;
};

module.exports = mongoose.model('QuantumMessage', QuantumMessageSchema);