/**
 * QuantumAnalytics Model
 * System analytics and metrics tracking
 */

const mongoose = require('mongoose');

const quantumAnalyticsSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    
    170}
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'user_action',
      'system_event',
      'performance_metric',
      'error_event',
      'security_event',
      'business_metric',
    ],
  },
  category: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumUser',
    sparse: true,
  },
  sessionId: {
    type: String,
    sparse: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  metrics: {
    duration: Number,
    count: {
      type: Number,
      default: 1,
    },
    value: Number,
    size: Number,
  },
  context: {
    userAgent: String,
    ipAddress: String,
    platform: String,
    version: String,
    location: {
      country: String,
      region: String,
      city: String,
    },
  },
  timestamptype: Date,
    default: Date.now,
    
  },
  processed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  collection: 'quantum_analytics',
});

// Indexes
quantumAnalyticsSchema.index({ eventType: 1, timestamp: -1 });
quantumAnalyticsSchema.index({ category: 1, action: 1 });
quantumAnalyticsSchema.index({ userId: 1, timestamp: -1 });
quantumAnalyticsSchema.index({ sessionId: 1 });
quantumAnalyticsSchema.index({ processed: 1 });
quantumAnalyticsSchema.index({ timestamp: -1 });

// Compound indexes for common queries
quantumAnalyticsSchema.index({ eventType: 1, category: 1, timestamp: -1 });
quantumAnalyticsSchema.index({ userId: 1, eventType: 1, timestamp: -1 });

// Methods
quantumAnalyticsSchema.methods.markProcessed = function() {
  this.processed = true;
  return this.save();
};

// Statics
quantumAnalyticsSchema.statics.getEventsByType = function(eventType, startDate, endDate) {
  const query = { eventType };
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }
  return this.find(query).sort({ timestamp: -1 });
};

quantumAnalyticsSchema.statics.getUserMetrics = function(userId, startDate, endDate) {
  const query = { userId };
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }
  return this.find(query).sort({ timestamp: -1 });
};

quantumAnalyticsSchema.statics.getAggregatedMetrics = function(groupBy, startDate, endDate) {
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.timestamp = {};
    if (startDate) matchStage.timestamp.$gte = startDate;
    if (endDate) matchStage.timestamp.$lte = endDate;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: `$${groupBy}`,
        count: { $sum: 1 },
        totalValue: { $sum: '$metrics.value' },
        avgDuration: { $avg: '$metrics.duration' },
        firstEvent: { $min: '$timestamp' },
        lastEvent: { $max: '$timestamp' },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

module.exports = mongoose.model('QuantumAnalytics', quantumAnalyticsSchema);