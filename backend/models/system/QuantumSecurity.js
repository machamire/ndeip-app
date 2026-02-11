/**
 * QuantumSecurity Model - Security events & threat detection
 * Tracks security events, threats, and audit logs for ndeip
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const QuantumSecuritySchema = new mongoose.Schema({
  eventId: {
    type: String,
    unique: true,
    default: () => crypto.randomUUID(),
  },
  
  eventTypetype: String,
    enum: [
      'login_attempt',
      'login_success',
      'login_failure',
      'password_change',
      'account_lockout',
      'suspicious_activity',
      'brute_force_attempt',
      'ip_blocked',
      'device_blocked',
      'data_breach_attempt',
      'privilege_escalation',
      'unauthorized_access',
      'security_alert',
      'audit_log_access',
      'encryption_key_rotation',
      'two_factor_bypass_attempt',
      'account_takeover_attempt',
      'malicious_file_upload',
      'sql_injection_attempt',
      'xss_attempt',
      'csrf_attempt'
    ],
    required: true,
    
  },
  
  severitytype: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumUser',
    
  },
  
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumUser',
  },
  
  targetResource: {
    resourceType: String, // user, message, group, file, etc.
    resourceId: String,
    action: String, // create, read, update, delete, access
  },
  
  requestInfoipAddress: {
      type: String,
      required: true,
      
    },
    userAgent: String,
    method: String, // GET, POST, PUT, DELETE
    endpoint: String,
    parameters: Object,
    headers: Object,
    requestId: String,
  },
  
  location: {
    country: String,
    countryCode: String,
    region: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    isp: String,
    organization: String,
    asn: String,
  },
  
  deviceInfo: {
    fingerprint: String,
    platform: String,
    browser: String,
    version: String,
    language: String,
    timezone: String,
    screenResolution: String,
    isMobile: Boolean,
    isTrusted: Boolean,
  },
  
  threatIndicatorsriskScore: {
      type: Number,
      min: 0,
      max: 100,
      
    },
    indicators: [String], // tor_exit_node, vpn, proxy, bot, etc.
    behaviorAnomalies: [String],
    patternMatches: [String],
    blacklistHits: [String],
    reputation: {
      score: Number,
      source: String,
      lastUpdated: Date,
    },
  },
  
  response: {
    action: {
      type: String,
      enum: ['allow', 'block', 'challenge', 'monitor', 'escalate'],
      required: true,
    },
    reason: String,
    automated: {
      type: Boolean,
      default: true,
    },
    responseTime: Number, // milliseconds
    additionalMeasures: [String],
  },
  
  investigation: {
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'false_positive', 'escalated'],
      default: 'open',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumUser',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    notes: [String],
    evidence: [String],
    resolution: String,
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumUser',
    },
  },
  
  relatedEvents: [{
    eventId: String,
    relationship: String, // related, duplicate, chain, etc.
    confidence: Number,
  }],
  
  compliance: {
    regulations: [String], // GDPR, CCPA, HIPAA, etc.
    dataClassification: String,
    retentionPeriod: Number, // days
    anonymized: {
      type: Boolean,
      default: false,
    },
    anonymizedAt: Date,
  },
  
  metadata: {
    source: String, // system, user_report, external_feed
    confidence: Number,
    falsePositiveRate: Number,
    correlationId: String,
    sessionId: String,
    experimentId: String,
  },
}, {
  timestamps: true,
});

// Security indexes
QuantumSecuritySchema.index({ eventType: 1, createdAt: -1 });
QuantumSecuritySchema.index({ severity: 1, createdAt: -1 });
QuantumSecuritySchema.index({ 'requestInfo.ipAddress': 1, createdAt: -1 });
QuantumSecuritySchema.index({ 'threatIndicators.riskScore': 1 });
QuantumSecuritySchema.index({ 'investigation.status': 1 });

module.exports = mongoose.model('QuantumSecurity', QuantumSecuritySchema);