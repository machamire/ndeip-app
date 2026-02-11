/**
 * QuantumAIUsage Model
 * AI feature usage tracking and analytics
 */

const mongoose = require('mongoose');

const quantumAIUsageSchema = new mongoose.Schema({
  usageId: {
    type: String,
    required: true,
    
    168}
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumUser',
    required: true,
    
  },
  sessionId: {
    type: String,
    
  },
  aiFeature: {
    type: String,
    required: true,
    enum: [
      'message_enhancement',
      'translation',
      'sentiment_analysis',
      'content_moderation',
      'smart_reply',
      'voice_transcription',
      'image_analysis',
      'text_summarization',
      'language_detection',
      'spam_detection',
    ],
  },
  request: {
    inputType: {
      type: String,
      enum: ['text', 'image', 'audio', 'video', 'file'],
      required: true,
    },
    inputSize: Number, // in bytes
    inputLength: Number, // characters for text, duration for audio/video
    language: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  response: {
    outputType: {
      type: String,
      enum: ['text', 'json', 'binary', 'url'],
    },
    outputSize: Number,
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    processingTime: Number, // in milliseconds
    model: String,
    version: String,
  },
  usage: {
    tokensUsed: Number,
    creditsConsumed: {
      type: Number,
      default: 0,
    },
    cost: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
  },
  performance: {
    latency: Number, // in milliseconds
    throughput: Number, // requests per second
    errorRate: Number,
    cacheHit: {
      type: Boolean,
      default: false,
    },
  },
  quality: {
    userRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: String,
    accuracy: Number,
    relevance: Number,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  error: {
    code: String,
    message: String,
    details: mongoose.Schema.Types.Mixed,
  },
  timestamptype: Date,
    default: Date.now,
    
  },
}, {
  timestamps: true,
  collection: 'quantum_ai_usage',
});

// Indexes
quantumAIUsageSchema.index({ userId: 1, timestamp: -1 });
quantumAIUsageSchema.index({ aiFeature: 1, timestamp: -1 });
quantumAIUsageSchema.index({ status: 1 });
quantumAIUsageSchema.index({ 'usage.creditsConsumed': -1 });
quantumAIUsageSchema.index({ 'performance.latency': 1 });
quantumAIUsageSchema.index({ 'quality.userRating': -1 });

// Compound indexes
quantumAIUsageSchema.index({ userId: 1, aiFeature: 1, timestamp: -1 });
quantumAIUsageSchema.index({ aiFeature: 1, status: 1, timestamp: -1 });

// Methods
quantumAIUsageSchema.methods.markCompleted = function(response, usage, performance) {
  this.status = 'completed';
  this.response = { ...this.response, ...response };
  this.usage = { ...this.usage, ...usage };
  this.performance = { ...this.performance, ...performance };
  return this.save();
};

quantumAIUsageSchema.methods.markFailed = function(error) {
  this.status = 'failed';
  this.error = error;
  return this.save();
};

quantumAIUsageSchema.methods.addUserFeedback = function(rating, feedback) {
  this.quality.userRating = rating;
  this.quality.feedback = feedback;
  return this.save();
};

// Statics
quantumAIUsageSchema.statics.getUserUsage = function(userId, startDate, endDate) {
  const query = { userId };
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }
  return this.find(query).sort({ timestamp: -1 });
};

quantumAIUsageSchema.statics.getFeatureUsage = function(aiFeature, startDate, endDate) {
  const query = { aiFeature };
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }
  return this.find(query).sort({ timestamp: -1 });
};

quantumAIUsageSchema.statics.getUsageStats = function(startDate, endDate) {
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
        _id: '$aiFeature',
        totalRequests: { $sum: 1 },
        totalCredits: { $sum: '$usage.creditsConsumed' },
        totalCost: { $sum: '$usage.cost' },
        avgLatency: { $avg: '$performance.latency' },
        avgRating: { $avg: '$quality.userRating' },
        successRate: {
          $avg: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
          },
        },
      },
    },
    { $sort: { totalRequests: -1 } },
  ]);
};

quantumAIUsageSchema.statics.getUserCreditsUsed = function(userId, startDate, endDate) {
  const matchStage = { userId };
  if (startDate || endDate) {
    matchStage.timestamp = {};
    if (startDate) matchStage.timestamp.$gte = startDate;
    if (endDate) matchStage.timestamp.$lte = endDate;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalCredits: { $sum: '$usage.creditsConsumed' },
        totalCost: { $sum: '$usage.cost' },
        requestCount: { $sum: 1 },
      },
    },
  ]);
};

module.exports = mongoose.model('QuantumAIUsage', quantumAIUsageSchema);