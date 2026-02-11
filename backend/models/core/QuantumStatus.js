/**
 * QuantumStatus Model - 24-hour status stories (Instagram-style)
 * Handles status updates with views, reactions, and analytics
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const QuantumStatusSchema = new mongoose.Schema({
  statusId: {
    type: String,
    unique: true,
    default: () => crypto.randomUUID(),
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumUser',
    required: true,
    
  },
  
  content: {
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio'],
      required: true,
    },
    text: String,
    mediaUrl: String,
    thumbnailUrl: String,
    duration: Number, // for video/audio
    backgroundColor: String,
    textColor: String,
    font: String,
  },
  
  privacy: {
    visibility: {
      type: String,
      enum: ['public', 'contacts', 'close_friends', 'custom'],
      default: 'contacts',
    },
    allowedViewers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumUser',
    }],
    blockedViewers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumUser',
    }],
  },
  
  interactions: {
    views: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuantumUser',
      },
      viewedAt: {
        type: Date,
        default: Date.now,
      },
      duration: Number, // how long they viewed it
    }],
    reactions: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuantumUser',
      },
      reaction: String, // emoji
      addedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    replies: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuantumUser',
      },
      content: String,
      mediaUrl: String,
      sentAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  
  analytics: {
    totalViews: {
      type: Number,
      default: 0,
    },
    uniqueViews: {
      type: Number,
      default: 0,
    },
    completionRate: Number, // percentage who viewed full duration
    avgViewDuration: Number,
    peakViewers: Number,
    impressions: Number,
  },
  
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    
  },
  
  isActive: {
    type: Boolean,
    default: true,
  },
  
  metadata: {
    deviceInfo: Object,
    location: Object,
    filters: [String],
    musicTrack: String,
    mentions: [String],
    hashtags: [String],
  },
}, {
  timestamps: true,
});

// Status indexes
QuantumStatusSchema.index({ userId: 1, createdAt: -1 });
QuantumStatusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
QuantumStatusSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('QuantumStatus', QuantumStatusSchema);