/**
 * QuantumAdmin Model
 * Administrative functions and system management
 */

const mongoose = require('mongoose');

const quantumAdminSchema = new mongoose.Schema({
  adminId: {
    type: String,
    required: true,
    unique: true,
    
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumUser',
    required: true,
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator', 'support'],
    required: true,
  },
  permissions: [{
    type: String,
    enum: [
      'user_management',
      'system_config',
      'security_management',
      'analytics_access',
      'billing_management',
      'content_moderation',
      'support_access',
      'backup_management',
    ],
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  loginHistory: [{
    timestamp: Date,
    ipAddress: String,
    userAgent: String,
    location: String,
  }],
  actions: [{
    action: String,
    target: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    details: mongoose.Schema.Types.Mixed,
  }],
  settings: {
    notifications: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
    },
    language: {
      type: String,
      default: 'en',
    },
  },
}, {
  timestamps: true,
  collection: 'quantum_admins',
});

// Indexes
quantumAdminSchema.index({ adminId: 1 });
quantumAdminSchema.index({ userId: 1 });
quantumAdminSchema.index({ role: 1 });
quantumAdminSchema.index({ isActive: 1 });
quantumAdminSchema.index({ 'actions.timestamp': -1 });

// Methods
quantumAdminSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

quantumAdminSchema.methods.logAction = function(action, target, details = {}) {
  this.actions.push({
    action,
    target,
    details,
    timestamp: new Date(),
  });
  return this.save();
};

// Statics
quantumAdminSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

module.exports = mongoose.model('QuantumAdmin', quantumAdminSchema);