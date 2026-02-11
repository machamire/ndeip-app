/**
 * QuantumNotification Model
 * Push notifications and alert management
 */

const mongoose = require('mongoose');

const quantumNotificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    required: true,
    
    178}
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumUser',
    required: true,
    
  },
  type: {
    type: String,
    required: true,
    enum: [
      'message',
      'call',
      'group_invite',
      'friend_request',
      'system_alert',
      'security_alert',
      'update_available',
      'maintenance',
      'promotional',
      'reminder',
    ],
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
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
    icon: String,
    image: String,
    sound: String,
    badge: Number,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  targeting: {
    devices: [{
      deviceId: String,
      platform: {
        type: String,
        enum: ['ios', 'android', 'web', 'desktop'],
      },
      token: String,
    }],
    channels: [{
      type: String,
      enum: ['push', 'email', 'sms', 'in_app'],
    }],
    conditions: {
      online: Boolean,
      timeZone: String,
      language: String,
      location: {
        country: String,
        region: String,
      },
    },
  },
  scheduling: {
    sendAt: Date,
    timezone: String,
    recurring: {
      enabled: {
        type: Boolean,
        default: false,
      },
      pattern: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'custom'],
      },
      interval: Number,
      endDate: Date,
    },
  },
  delivery: {
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed', 'cancelled'],
      default: 'pending',
    },
    sentAt: Date,
    deliveredAt: Date,
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    errors: [{
      timestamp: Date,
      error: String,
      code: String,
    }],
  },
  interaction: {
    opened: {
      type: Boolean,
      default: false,
    },
    openedAt: Date,
    clicked: {
      type: Boolean,
      default: false,
    },
    clickedAt: Date,
    dismissed: {
      type: Boolean,
      default: false,
    },
    dismissedAt: Date,
    actions: [{
      action: String,
      timestamp: Date,
      data: mongoose.Schema.Types.Mixed,
    }],
  },
  settings: {
    silent: {
      type: Boolean,
      default: false,
    },
    persistent: {
      type: Boolean,
      default: false,
    },
    vibrate: {
      type: Boolean,
      default: true,
    },
    lights: {
      type: Boolean,
      default: true,
    },
    ttl: Number, // Time to live in seconds
  },
  metadata: {
    campaign: String,
    source: String,
    medium: String,
    tags: [String],
    customData: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
  collection: 'quantum_notifications',
});

// Indexes
quantumNotificationSchema.index({ userId: 1, createdAt: -1 });
quantumNotificationSchema.index({ type: 1, createdAt: -1 });
quantumNotificationSchema.index({ priority: 1, 'delivery.status': 1 });
quantumNotificationSchema.index({ 'delivery.status': 1, 'scheduling.sendAt': 1 });
quantumNotificationSchema.index({ 'interaction.opened': 1 });
quantumNotificationSchema.index({ 'metadata.campaign': 1 });

// Compound indexes
quantumNotificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
quantumNotificationSchema.index({ 'delivery.status': 1, priority: 1, createdAt: -1 });

// TTL index for old notifications (90 days)
quantumNotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Methods
quantumNotificationSchema.methods.markSent = function() {
  this.delivery.status = 'sent';
  this.delivery.sentAt = new Date();
  this.delivery.attempts += 1;
  return this.save();
};

quantumNotificationSchema.methods.markDelivered = function() {
  this.delivery.status = 'delivered';
  this.delivery.deliveredAt = new Date();
  return this.save();
};

quantumNotificationSchema.methods.markFailed = function(error, code) {
  this.delivery.status = 'failed';
  this.delivery.attempts += 1;
  this.delivery.errors.push({
    timestamp: new Date(),
    error,
    code,
  });
  return this.save();
};

quantumNotificationSchema.methods.markOpened = function() {
  this.interaction.opened = true;
  this.interaction.openedAt = new Date();
  return this.save();
};

quantumNotificationSchema.methods.markClicked = function() {
  this.interaction.clicked = true;
  this.interaction.clickedAt = new Date();
  return this.save();
};

quantumNotificationSchema.methods.markDismissed = function() {
  this.interaction.dismissed = true;
  this.interaction.dismissedAt = new Date();
  return this.save();
};

quantumNotificationSchema.methods.addAction = function(action, data = {}) {
  this.interaction.actions.push({
    action,
    timestamp: new Date(),
    data,
  });
  return this.save();
};

quantumNotificationSchema.methods.canRetry = function() {
  return this.delivery.attempts < this.delivery.maxAttempts && 
         this.delivery.status === 'failed';
};

// Statics
quantumNotificationSchema.statics.findPending = function() {
  return this.find({
    'delivery.status': 'pending',
    $or: [
      { 'scheduling.sendAt': { $lte: new Date() } },
      { 'scheduling.sendAt': { $exists: false } },
    ],
  }).sort({ priority: -1, createdAt: 1 });
};

quantumNotificationSchema.statics.findUserNotifications = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

quantumNotificationSchema.statics.findUnreadNotifications = function(userId) {
  return this.find({
    userId,
    'interaction.opened': false,
    'delivery.status': 'delivered',
  }).sort({ createdAt: -1 });
};

quantumNotificationSchema.statics.getDeliveryStats = function(startDate, endDate) {
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = startDate;
    if (endDate) matchStage.createdAt.$lte = endDate;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$delivery.status',
        count: { $sum: 1 },
        avgAttempts: { $avg: '$delivery.attempts' },
      },
    },
  ]);
};

quantumNotificationSchema.statics.getEngagementStats = function(startDate, endDate) {
  const matchStage = { 'delivery.status': 'delivered' };
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = startDate;
    if (endDate) matchStage.createdAt.$lte = endDate;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalSent: { $sum: 1 },
        opened: { $sum: { $cond: ['$interaction.opened', 1, 0] } },
        clicked: { $sum: { $cond: ['$interaction.clicked', 1, 0] } },
        dismissed: { $sum: { $cond: ['$interaction.dismissed', 1, 0] } },
      },
    },
    {
      $project: {
        totalSent: 1,
        opened: 1,
        clicked: 1,
        dismissed: 1,
        openRate: { $divide: ['$opened', '$totalSent'] },
        clickRate: { $divide: ['$clicked', '$totalSent'] },
        dismissRate: { $divide: ['$dismissed', '$totalSent'] },
      },
    },
  ]);
};

// Pre-save middleware
quantumNotificationSchema.pre('save', function(next) {
  if (this.isNew && !this.scheduling.sendAt) {
    this.scheduling.sendAt = new Date();
  }
  next();
});

module.exports = mongoose.model('QuantumNotification', quantumNotificationSchema);