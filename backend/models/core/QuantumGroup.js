/**
 * QuantumGroup Model - Group chat management with analytics
 * Handles group creation, member management, and group analytics
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const QuantumGroupSchema = new mongoose.Schema({
  groupId: {
    type: String,
    unique: true,
    default: () => crypto.randomUUID(),
  },
  
  name: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true,
  },
  
  description: {
    type: String,
    maxlength: 500,
  },
  
  avatar: {
    url: String,
    thumbnailUrl: String,
    blurhash: String,
  },
  
  groupType: {
    type: String,
    enum: ['group', 'channel', 'community', 'study_group', 'work_team'],
    default: 'group',
  },
  
  privacy: {
    type: String,
    enum: ['public', 'private', 'invite_only'],
    default: 'private',
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumUser',
    required: true,
  },
  
  admins: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumUser',
    },
    promotedAt: Date,
    promotedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumUser',
    },
    permissions: [String],
  }],
  
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumUser',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumUser',
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin', 'owner'],
      default: 'member',
    },
    lastSeenAt: Date,
    messageCount: {
      type: Number,
      default: 0,
    },
    isMuted: {
      type: Boolean,
      default: false,
    },
    muteUntil: Date,
  }],
  
  settings: {
    maxMembers: {
      type: Number,
      default: 256,
    },
    allowMemberInvites: {
      type: Boolean,
      default: true,
    },
    requireAdminApproval: {
      type: Boolean,
      default: false,
    },
    allowMediaSharing: {
      type: Boolean,
      default: true,
    },
    allowVoiceMessages: {
      type: Boolean,
      default: true,
    },
    messageHistory: {
      type: String,
      enum: ['visible', 'hidden_for_new'],
      default: 'visible',
    },
    autoDeleteMessages: {
      enabled: {
        type: Boolean,
        default: false,
      },
      duration: Number, // in days
    },
  },
  
  analytics: {
    totalMessages: {
      type: Number,
      default: 0,
    },
    totalMembers: {
      type: Number,
      default: 0,
    },
    activeMembers: {
      type: Number,
      default: 0,
    },
    dailyStats: [{
      date: Date,
      messages: Number,
      activeUsers: Number,
      newMembers: Number,
      leftMembers: Number,
    }],
  },
  
  isActive: {
    type: Boolean,
    default: true,
  },
  
  isArchived: {
    type: Boolean,
    default: false,
  },
  
  archivedAt: Date,
}, {
  timestamps: true,
});

// Group indexes
QuantumGroupSchema.index({ groupId: 1 }, { unique: true });
QuantumGroupSchema.index({ createdBy: 1 });
QuantumGroupSchema.index({ 'members.userId': 1 });
QuantumGroupSchema.index({ groupType: 1, privacy: 1 });
QuantumGroupSchema.index({ isActive: 1, createdAt: -1 });

// Group methods
QuantumGroupSchema.methods.addMember = function(userId, invitedBy = null, role = 'member') {
  const existingMember = this.members.find(m => m.userId.equals(userId));
  if (existingMember) return false;
  
  this.members.push({
    userId,
    invitedBy,
    role,
    joinedAt: new Date(),
  });
  
  this.analytics.totalMembers = this.members.length;
  return this.save();
};

QuantumGroupSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(m => !m.userId.equals(userId));
  this.analytics.totalMembers = this.members.length;
  return this.save();
};

QuantumGroupSchema.methods.promoteToAdmin = function(userId, promotedBy) {
  const member = this.members.find(m => m.userId.equals(userId));
  if (member) {
    member.role = 'admin';
    this.admins.push({
      userId,
      promotedAt: new Date(),
      promotedBy,
      permissions: ['manage_members', 'delete_messages', 'change_settings'],
    });
  }
  return this.save();
};

module.exports = mongoose.model('QuantumGroup', QuantumGroupSchema);