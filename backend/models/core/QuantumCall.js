/**
 * QuantumCall Model - Voice/video call logs with quality metrics
 * Tracks call sessions, participants, and quality analytics
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const QuantumCallSchema = new mongoose.Schema({
  callId: {
    type: String,
    unique: true,
    default: () => crypto.randomUUID(),
  },
  
  callType: {
    type: String,
    enum: ['voice', 'video', 'group_voice', 'group_video'],
    required: true,
  },
  
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumUser',
    required: true,
  },
  
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumUser',
    },
    status: {
      type: String,
      enum: ['calling', 'ringing', 'connected', 'disconnected', 'declined', 'missed'],
      default: 'calling',
    },
    joinedAt: Date,
    leftAt: Date,
    duration: Number, // in seconds
    deviceInfo: {
      platform: String,
      browser: String,
      camera: Boolean,
      microphone: Boolean,
    },
    qualityMetrics: {
      videoResolution: String,
      audioQuality: String,
      bandwidth: Number,
      packetLoss: Number,
      latency: Number,
    },
  }],
  
  groupInfo: {
    isGroupCall: {
      type: Boolean,
      default: false,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumGroup',
    },
    maxParticipants: {
      type: Number,
      default: 8,
    },
  },
  
  callStatus: {
    type: String,
    enum: ['initiating', 'ringing', 'active', 'ended', 'failed'],
    default: 'initiating',
  },
  
  startedAt: Date,
  endedAt: Date,
  
  duration: {
    type: Number, // in seconds
    default: 0,
  },
  
  endReason: {
    type: String,
    enum: ['completed', 'missed', 'declined', 'failed', 'network_error', 'timeout'],
  },
  
  quality: {
    overallRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    videoQuality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
    },
    audioQuality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
    },
    connectionStability: {
      type: String,
      enum: ['unstable', 'stable', 'very_stable'],
    },
  },
  
  recording: {
    isRecorded: {
      type: Boolean,
      default: false,
    },
    recordingUrl: String,
    duration: Number,
    size: Number,
    consentGiven: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuantumUser',
      },
      consentedAt: Date,
    }],
  },
  
  technical: {
    webrtcStats: Object,
    serverRegion: String,
    bandwidth: {
      upload: Number,
      download: Number,
    },
    networkType: String,
    errors: [String],
  },
  
  billing: {
    duration: Number, // billable duration
    cost: Number,
    currency: String,
    tier: String, // free, premium, enterprise
  },
}, {
  timestamps: true,
});

// Call indexes
QuantumCallSchema.index({ callId: 1 }, { unique: true });
QuantumCallSchema.index({ initiator: 1, createdAt: -1 });
QuantumCallSchema.index({ 'participants.userId': 1 });
QuantumCallSchema.index({ callStatus: 1, createdAt: -1 });
QuantumCallSchema.index({ 'groupInfo.groupId': 1 });

// Call methods
QuantumCallSchema.methods.addParticipant = function(userId, deviceInfo = {}) {
  const existingParticipant = this.participants.find(p => p.userId.equals(userId));
  if (existingParticipant) return false;
  
  this.participants.push({
    userId,
    status: 'calling',
    deviceInfo,
  });
  
  return this.save();
};

QuantumCallSchema.methods.updateParticipantStatus = function(userId, status) {
  const participant = this.participants.find(p => p.userId.equals(userId));
  if (participant) {
    participant.status = status;
    
    if (status === 'connected' && !participant.joinedAt) {
      participant.joinedAt = new Date();
    } else if (status === 'disconnected' && !participant.leftAt) {
      participant.leftAt = new Date();
      participant.duration = Math.floor((new Date() - participant.joinedAt) / 1000);
    }
  }
  
  return this.save();
};

QuantumCallSchema.methods.endCall = function(reason = 'completed') {
  this.callStatus = 'ended';
  this.endedAt = new Date();
  this.endReason = reason;
  
  if (this.startedAt) {
    this.duration = Math.floor((this.endedAt - this.startedAt) / 1000);
  }
  
  // Update all connected participants
  this.participants.forEach(participant => {
    if (participant.status === 'connected' && !participant.leftAt) {
      participant.status = 'disconnected';
      participant.leftAt = this.endedAt;
      participant.duration = Math.floor((this.endedAt - participant.joinedAt) / 1000);
    }
  });
  
  return this.save();
};

module.exports = mongoose.model('QuantumCall', QuantumCallSchema);