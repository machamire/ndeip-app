/**
 * QuantumSession Model
 * User session management and tracking
 */

const mongoose = require('mongoose');

const quantumSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumUser',
    required: true,
    
  },
  deviceInfo: {
    userAgent: String,
    platform: String,
    browser: String,
    version: String,
    mobile: Boolean,
    deviceId: String,
  },
  location: {
    ipAddress: {
      type: String,
      required: true,
    },
    country: String,
    region: String,
    city: String,
    timezone: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  authentication: {
    method: {
      type: String,
      enum: ['password', '2fa', 'biometric', 'oauth', 'sso'],
      required: true,
    },
    twoFactorUsed: {
      type: Boolean,
      default: false,
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  activity: {
    startTime: {
      type: Date,
      default: Date.now,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    endTime: Date,
    duration: Number, // in seconds
    pageViews: {
      type: Number,
      default: 0,
    },
    actions: {
      type: Number,
      default: 0,
    },
  },
  status: {
    type: String,
    enum: ['active', 'idle', 'expired', 'terminated'],
    default: 'active',
  },
  security: {
    encrypted: {
      type: Boolean,
      default: true,
    },
    secureConnection: {
      type: Boolean,
      default: false,
    },
    threats: [{
      type: String,
      timestamp: Date,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
      },
      details: mongoose.Schema.Types.Mixed,
    }],
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
  collection: 'quantum_sessions',
});

// Indexes
quantumSessionSchema.index({ sessionId: 1 });
quantumSessionSchema.index({ userId: 1, 'activity.startTime': -1 });
quantumSessionSchema.index({ status: 1 });
quantumSessionSchema.index({ 'activity.lastActivity': -1 });
quantumSessionSchema.index({ 'location.ipAddress': 1 });
quantumSessionSchema.index({ 'authentication.riskScore': -1 });

// TTL index for expired sessions (30 days)
quantumSessionSchema.index({ 'activity.lastActivity': 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Methods
quantumSessionSchema.methods.updateActivity = function() {
  this.activity.lastActivity = new Date();
  this.activity.actions += 1;
  if (this.status === 'idle') {
    this.status = 'active';
  }
  return this.save();
};

quantumSessionSchema.methods.terminate = function(reason = 'user_logout') {
  this.status = 'terminated';
  this.activity.endTime = new Date();
  this.activity.duration = Math.floor((this.activity.endTime - this.activity.startTime) / 1000);
  this.metadata.terminationReason = reason;
  return this.save();
};

quantumSessionSchema.methods.addThreat = function(threatType, severity, details = {}) {
  this.security.threats.push({
    type: threatType,
    timestamp: new Date(),
    severity,
    details,
  });
  
  // Update risk score based on threat severity
  const severityScores = { low: 5, medium: 15, high: 30, critical: 50 };
  this.authentication.riskScore = Math.min(100, this.authentication.riskScore + severityScores[severity]);
  
  return this.save();
};

quantumSessionSchema.methods.isExpired = function(timeoutMinutes = 30) {
  const timeout = timeoutMinutes * 60 * 1000; // Convert to milliseconds
  const now = new Date();
  return (now - this.activity.lastActivity) > timeout;
};

// Statics
quantumSessionSchema.statics.findActiveSessions = function(userId) {
  return this.find({
    userId,
    status: { $in: ['active', 'idle'] },
  }).sort({ 'activity.lastActivity': -1 });
};

quantumSessionSchema.statics.findByIpAddress = function(ipAddress) {
  return this.find({ 'location.ipAddress': ipAddress }).sort({ 'activity.startTime': -1 });
};

quantumSessionSchema.statics.getHighRiskSessions = function(minRiskScore = 50) {
  return this.find({
    'authentication.riskScore': { $gte: minRiskScore },
    status: { $in: ['active', 'idle'] },
  }).sort({ 'authentication.riskScore': -1 });
};

quantumSessionSchema.statics.cleanupExpiredSessions = function(timeoutMinutes = 30) {
  const cutoffTime = new Date(Date.now() - (timeoutMinutes * 60 * 1000));
  return this.updateMany(
    {
      'activity.lastActivity': { $lt: cutoffTime },
      status: { $in: ['active', 'idle'] },
    },
    {
      $set: {
        status: 'expired',
        'activity.endTime': new Date(),
      },
    }
  );
};

// Pre-save middleware
quantumSessionSchema.pre('save', function(next) {
  if (this.isModified('activity.lastActivity') && this.activity.startTime) {
    this.activity.duration = Math.floor((this.activity.lastActivity - this.activity.startTime) / 1000);
  }
  next();
});

module.exports = mongoose.model('QuantumSession', quantumSessionSchema);