/**
 * QuantumNotification Model - Push Notification Tracking & Management
 * Tracks all notifications sent, delivery status, user engagement
 * Supports admin dashboard analytics for notification performance
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

// Notification action schema
const NotificationActionSchema = new mongoose.Schema({
  actionId: String,
  title: String,
  type: {
    type: String,
    enum: ['button', 'input', 'dismiss'],
    default: 'button',
  },
  icon: String,
  url: String,
  payload: Object,
}, { _id: false });

// Device token schema
const DeviceTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    enum: ['ios', 'android', 'web'],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastUsed: {
    type: Date,
    default: Date.now,
  },
  appVersion: String,
  osVersion: String,
}, { _id: false });

// Notification engagement schema
const NotificationEngagementSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['delivered', 'opened', 'clicked', 'dismissed', 'failed'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  platform: String,
  deviceInfo: Object,
  location: {
    country: String,
    city: String,
    timezone: String,
  },
  actionData: Object, // Additional data based on action type
}, { _id: false });

// Main Notification Schema
const QuantumNotificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    unique: true,
    default: () => crypto.randomUUID(),
  },
  
  // Target Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumUser',
    required: true,
    index: true,
  },
  
  deviceTokens: [DeviceTokenSchema],
  
  // Notification Content
  content: {
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    body: {
      type: String,
      required: true,
      maxlength: 500,
    },
    subtitle: String,
    badge: Number,
    sound: {
      type: String,
      default: 'default',
    },
    icon: String,
    image: String,
    data: Object, // Custom payload data
  },
  
  // Notification Type & Context
  type: {
    type: String,
    enum: [
      'message',
      'call',
      'group_invite',
      'friend_request',
      'mention',
      'reaction',
      'status_update',
      'system_alert',
      'promotional',
      'reminder',
      'security_alert',
      'feature_announcement',
      'app_update',
      'backup_reminder',
      'subscription_renewal'
    ],
    required: true,
    index: true,
  },
  
  category: {
    type: String,
    enum: ['communication', 'social', 'system', 'marketing', 'security'],
    required: true,
  },
  
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal',
    index: true,
  },
  
  // Context Data
  contextData: {
    sourceId: String, // messageId, callId, etc.
    sourceType: String, // message, call, group, etc.
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumUser',
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumGroup',
    },
    chatId: String,
    metadata: Object,
  },
  
  // Delivery Configuration
  delivery: {
    scheduledFor: Date, // For scheduled notifications
    timezoneSensitive: {
      type: Boolean,
      default: false,
    },
    respectQuietHours: {
      type: Boolean,
      default: true,
    },
    batchId: String, // For bulk notifications
    maxRetries: {
      type: Number,
      default: 3,
    },
    retryInterval: {
      type: Number,
      default: 300, // seconds
    },
  },
  
  // Platform Specific Settings
  platformSettings: {
    ios: {
      alert: Object,
      badge: Number,
      sound: String,
      threadId: String,
      category: String,
      contentAvailable: Boolean,
      mutableContent: Boolean,
    },
    android: {
      channelId: String,
      notificationId: Number,
      tag: String,
      group: String,
      groupSummary: Boolean,
      priority: String,
      visibility: String,
      color: String,
      smallIcon: String,
      largeIcon: String,
    },
    web: {
      icon: String,
      badge: String,
      image: String,
      tag: String,
      requireInteraction: Boolean,
      silent: Boolean,
      vibrate: [Number],
    },
  },
  
  // Actions & Buttons
  actions: [NotificationActionSchema],
  
  // Delivery Status
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'sending', 'sent', 'delivered', 'failed', 'cancelled'],
    default: 'pending',
    index: true,
  },
  
  // Engagement Tracking
  engagement: [NotificationEngagementSchema],
  
  // Delivery Results
  deliveryResults: [{
    platform: String,
    token: String,
    status: String, // success, failure, invalid_token
    timestamp: Date,
    errorCode: String,
    errorMessage: String,
    providerResponse: Object,
  }],
  
  // Analytics & Metrics
  analytics: {
    deliveryRate: {
      type: Number,
      default: 0,
    },
    openRate: {
      type: Number,
      default: 0,
    },
    clickRate: {
      type: Number,
      default: 0,
    },
    conversionRate: {
      type: Number,
      default: 0,
    },
    totalDelivered: {
      type: Number,
      default: 0,
    },
    totalOpened: {
      type: Number,
      default: 0,
    },
    totalClicked: {
      type: Number,
      default: 0,
    },
    avgEngagementTime: Number, // seconds
    bounceRate: Number,
  },
  
  // A/B Testing
  experiment: {
    experimentId: String,
    variant: String,
    controlGroup: {
      type: Boolean,
      default: false,
    },
    testMetrics: Object,
  },
  
  // Provider Information
  provider: {
    name: {
      type: String,
      enum: ['fcm', 'apns', 'web_push', 'custom'],
      default: 'fcm',
    },
    messageId: String, // Provider's message ID
    batchId: String,
    cost: {
      amount: Number,
      currency: String,
    },
  },
  
  // Compliance & Privacy
  compliance: {
    consentRequired: {
      type: Boolean,
      default: true,
    },
    consentGiven: {
      type: Boolean,
      default: false,
    },
    consentTimestamp: Date,
    dataRetention: {
      type: Number,
      default: 90, // days
    },
    canUnsubscribe: {
      type: Boolean,
      default: true,
    },
  },
  
  // User Preferences Applied
  userPreferences: {
    notificationsEnabled: Boolean,
    soundEnabled: Boolean,
    vibrationEnabled: Boolean,
    previewEnabled: Boolean,
    quietHoursEnabled: Boolean,
    quietHoursStart: String,
    quietHoursEnd: String,
  },
  
  // Error Handling
  errors: [{
    errorType: String,
    errorMessage: String,
    timestamp: Date,
    context: Object,
    resolved: {
      type: Boolean,
      default: false,
    },
  }],
  
  // Campaign Information (for promotional notifications)
  campaign: {
    campaignId: String,
    campaignName: String,
    segmentId: String,
    segmentCriteria: Object,
    utmParameters: {
      source: String,
      medium: String,
      campaign: String,
      term: String,
      content: String,
    },
  },
  
  // Automation & Triggers
  automation: {
    isAutomated: {
      type: Boolean,
      default: false,
    },
    triggerId: String,
    triggerType: String, // event_based, time_based, behavior_based
    triggerConditions: Object,
    workflowId: String,
  },
  
  // System Fields
  sentAt: Date,
  deliveredAt: Date,
  firstOpenedAt: Date,
  lastEngagementAt: Date,
  
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  },
  
  metadata: {
    version: {
      type: Number,
      default: 1,
    },
    source: String, // system, admin, api, automation
    requestId: String,
    correlationId: String,
    debugInfo: Object,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for performance
QuantumNotificationSchema.index({ notificationId: 1 }, { unique: true });
QuantumNotificationSchema.index({ userId: 1, createdAt: -1 });
QuantumNotificationSchema.index({ type: 1, status: 1 });
QuantumNotificationSchema.index({ status: 1, createdAt: -1 });
QuantumNotificationSchema.index({ priority: 1, createdAt: -1 });
QuantumNotificationSchema.index({ 'delivery.scheduledFor': 1 });
QuantumNotificationSchema.index({ 'campaign.campaignId': 1 });
QuantumNotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound indexes
QuantumNotificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
QuantumNotificationSchema.index({ status: 1, 'delivery.scheduledFor': 1 });
QuantumNotificationSchema.index({ 'provider.name': 1, status: 1 });

// Virtual fields
QuantumNotificationSchema.virtual('isDelivered').get(function() {
  return this.status === 'delivered' || this.totalDelivered > 0;
});

QuantumNotificationSchema.virtual('isOpened').get(function() {
  return this.analytics.totalOpened > 0;
});

QuantumNotificationSchema.virtual('timeToOpen').get(function() {
  if (this.sentAt && this.firstOpenedAt) {
    return Math.floor((this.firstOpenedAt - this.sentAt) / 1000); // seconds
  }
  return null;
});

QuantumNotificationSchema.virtual('effectiveOpenRate').get(function() {
  if (this.analytics.totalDelivered > 0) {
    return (this.analytics.totalOpened / this.analytics.totalDelivered) * 100;
  }
  return 0;
});

// Pre-save middleware
QuantumNotificationSchema.pre('save', function(next) {
  // Calculate analytics
  if (this.deliveryResults && this.engagement) {
    const delivered = this.deliveryResults.filter(r => r.status === 'success').length;
    const opened = this.engagement.filter(e => e.action === 'opened').length;
    const clicked = this.engagement.filter(e => e.action === 'clicked').length;
    
    this.analytics.totalDelivered = delivered;
    this.analytics.totalOpened = opened;
    this.analytics.totalClicked = clicked;
    
    if (delivered > 0) {
      this.analytics.deliveryRate = 100;
      this.analytics.openRate = (opened / delivered) * 100;
      this.analytics.clickRate = (clicked / delivered) * 100;
    }
  }
  
  // Set sent timestamp
  if (this.status === 'sent' && !this.sentAt) {
    this.sentAt = new Date();
  }
  
  // Set delivered timestamp
  if (this.status === 'delivered' && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
  
  next();
});

// Instance methods
QuantumNotificationSchema.methods.markAsDelivered = function(platform, token, providerResponse = {}) {
  this.deliveryResults.push({
    platform,
    token,
    status: 'success',
    timestamp: new Date(),
    providerResponse,
  });
  
  if (this.status === 'sending') {
    this.status = 'delivered';
    this.deliveredAt = new Date();
  }
  
  return this.save();
};

QuantumNotificationSchema.methods.markAsFailed = function(platform, token, errorCode, errorMessage) {
  this.deliveryResults.push({
    platform,
    token,
    status: 'failure',
    timestamp: new Date(),
    errorCode,
    errorMessage,
  });
  
  this.errors.push({
    errorType: 'delivery_failure',
    errorMessage: `${platform}: ${errorMessage}`,
    timestamp: new Date(),
    context: { platform, token, errorCode },
  });
  
  // Mark as failed if all delivery attempts failed
  const totalAttempts = this.deliveryResults.length;
  const failedAttempts = this.deliveryResults.filter(r => r.status === 'failure').length;
  
  if (failedAttempts === totalAttempts && totalAttempts >= this.delivery.maxRetries) {
    this.status = 'failed';
  }
  
  return this.save();
};

QuantumNotificationSchema.methods.addEngagement = function(action, platform, deviceInfo = {}, actionData = {}) {
  this.engagement.push({
    action,
    platform,
    deviceInfo,
    actionData,
    timestamp: new Date(),
  });
  
  // Update timestamps
  if (action === 'opened' && !this.firstOpenedAt) {
    this.firstOpenedAt = new Date();
  }
  
  this.lastEngagementAt = new Date();
  
  return this.save();
};

QuantumNotificationSchema.methods.schedule = function(scheduledTime) {
  this.delivery.scheduledFor = scheduledTime;
  this.status = 'scheduled';
  return this.save();
};

QuantumNotificationSchema.methods.cancel = function(reason = '') {
  this.status = 'cancelled';
  this.errors.push({
    errorType: 'cancelled',
    errorMessage: reason || 'Notification cancelled',
    timestamp: new Date(),
  });
  return this.save();
};

QuantumNotificationSchema.methods.clone = function(modifications = {}) {
  const clone = this.toObject();
  delete clone._id;
  delete clone.notificationId;
  delete clone.deliveryResults;
  delete clone.engagement;
  delete clone.sentAt;
  delete clone.deliveredAt;
  delete clone.firstOpenedAt;
  delete clone.lastEngagementAt;
  
  // Reset analytics
  clone.analytics = {
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
  };
  
  clone.status = 'pending';
  Object.assign(clone, modifications);
  
  return new this.constructor(clone);
};

// Static methods
QuantumNotificationSchema.statics.findPendingNotifications = function() {
  return this.find({
    status: 'pending',
    $or: [
      { 'delivery.scheduledFor': { $exists: false } },
      { 'delivery.scheduledFor': { $lte: new Date() } },
    ],
  }).sort({ priority: -1, createdAt: 1 });
};

QuantumNotificationSchema.statics.findFailedNotifications = function(retryable = true) {
  const query = { status: 'failed' };
  
  if (retryable) {
    query['errors.0.timestamp'] = {
      $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    };
  }
  
  return this.find(query);
};

QuantumNotificationSchema.statics.getEngagementStats = async function(timeframe = 'day', filters = {}) {
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case 'hour':
      startDate = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
  
  const matchStage = {
    createdAt: { $gte: startDate },
    ...filters,
  };
  
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalSent: { $sum: 1 },
        totalDelivered: { $sum: '$analytics.totalDelivered' },
        totalOpened: { $sum: '$analytics.totalOpened' },
        totalClicked: { $sum: '$analytics.totalClicked' },
        avgDeliveryRate: { $avg: '$analytics.deliveryRate' },
        avgOpenRate: { $avg: '$analytics.openRate' },
        avgClickRate: { $avg: '$analytics.clickRate' },
        byType: {
          $push: {
            type: '$type',
            delivered: '$analytics.totalDelivered',
            opened: '$analytics.totalOpened',
          },
        },
        byPriority: {
          $push: {
            priority: '$priority',
            delivered: '$analytics.totalDelivered',
            opened: '$analytics.totalOpened',
          },
        },
      },
    },
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalSent: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    avgDeliveryRate: 0,
    avgOpenRate: 0,
    avgClickRate: 0,
    byType: [],
    byPriority: [],
  };
};

QuantumNotificationSchema.statics.getCampaignStats = async function(campaignId) {
  const pipeline = [
    { $match: { 'campaign.campaignId': campaignId } },
    {
      $group: {
        _id: null,
        totalSent: { $sum: 1 },
        totalDelivered: { $sum: '$analytics.totalDelivered' },
        totalOpened: { $sum: '$analytics.totalOpened' },
        totalClicked: { $sum: '$analytics.totalClicked' },
        totalCost: { $sum: '$provider.cost.amount' },
        avgEngagementTime: { $avg: '$analytics.avgEngagementTime' },
        conversionRate: { $avg: '$analytics.conversionRate' },
      },
    },
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {};
};

QuantumNotificationSchema.statics.getDeviceTokenStats = async function() {
  const pipeline = [
    { $unwind: '$deviceTokens' },
    { $match: { 'deviceTokens.isActive': true } },
    {
      $group: {
        _id: '$deviceTokens.platform',
        count: { $sum: 1 },
        lastUsed: { $max: '$deviceTokens.lastUsed' },
      },
    },
  ];
  
  return this.aggregate(pipeline);
};

QuantumNotificationSchema.statics.cleanupExpiredTokens = async function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const result = await this.updateMany(
    { 'deviceTokens.lastUsed': { $lt: thirtyDaysAgo } },
    { $pull: { deviceTokens: { lastUsed: { $lt: thirtyDaysAgo } } } }
  );
  
  return result.modifiedCount;
};

// Export the model
module.exports = mongoose.model('QuantumNotification', QuantumNotificationSchema);