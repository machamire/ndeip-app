/**
 * QuantumMessage Static Methods & Additional Database Models
 * Continuation of QuantumMessage model + Group, Call, Media, AIUsage models
 */

// Continuing QuantumMessage static methods
    matchStage.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
  }
  
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        textMessages: {
          $sum: { $cond: [{ $eq: ['$messageType', 'text'] }, 1, 0] }
        },
        mediaMessages: {
          $sum: { $cond: [{ $eq: ['$messageType', 'media'] }, 1, 0] }
        },
        voiceMessages: {
          $sum: { $cond: [{ $eq: ['$messageType', 'voice_note'] }, 1, 0] }
        },
        avgDeliveryTime: { $avg: '$metrics.deliveryTime' },
        avgProcessingTime: { $avg: '$metrics.processingTime' },
        totalReactions: { $sum: { $size: '$reactions' } },
        reportedMessages: {
          $sum: { $cond: [{ $eq: ['$moderation.isReported', true] }, 1, 0] }
        },
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalMessages: 0,
    textMessages: 0,
    mediaMessages: 0,
    voiceMessages: 0,
    avgDeliveryTime: 0,
    avgProcessingTime: 0,
    totalReactions: 0,
    reportedMessages: 0,
  };
};

QuantumMessageSchema.statics.getEngagementStats = async function(chatId = null) {
  const matchStage = { isDeleted: false };
  if (chatId) matchStage.chatId = chatId;
  
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: '$senderId',
        messageCount: { $sum: 1 },
        reactionCount: { $sum: { $size: '$reactions' } },
        avgMessageLength: { $avg: { $strLenCP: '$content.text' } },
        mediaShared: {
          $sum: { $cond: [{ $gt: [{ $size: '$attachments' }, 0] }, 1, 0] }
        },
        lastActivity: { $max: '$createdAt' },
      }
    },
    { $sort: { messageCount: -1 } },
    { $limit: 50 }
  ];
  
  return this.aggregate(pipeline);
};

QuantumMessageSchema.statics.getContentModerationStats = async function() {
  const pipeline = [
    { 
      $match: { 
        'aiProcessing.contentModeration.isProcessed': true,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: '$aiProcessing.contentModeration.action',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$aiProcessing.contentModeration.confidenceScore' },
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

QuantumMessageSchema.statics.cleanupExpiredMessages = async function() {
  const result = await this.deleteMany({
    expiresAt: { $lte: new Date() },
    isEphemeral: true,
  });
  
  return result.deletedCount;
};

// Export QuantumMessage model
module.exports = mongoose.model('QuantumMessage', QuantumMessageSchema);

// =====================================
// QuantumGroup Model
// =====================================

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

// Export QuantumGroup model
const QuantumGroup = mongoose.model('QuantumGroup', QuantumGroupSchema);

// =====================================
// QuantumCall Model
// =====================================

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

// Export QuantumCall model
const QuantumCall = mongoose.model('QuantumCall', QuantumCallSchema);

// =====================================
// QuantumMedia Model
// =====================================

const QuantumMediaSchema = new mongoose.Schema({
  mediaId: {
    type: String,
    unique: true,
    default: () => crypto.randomUUID(),
  },
  
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumUser',
    required: true,
  },
  
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumMessage',
  },
  
  mediaType: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'voice_note', 'sticker', 'gif'],
    required: true,
  },
  
  originalFile: {
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number, // in bytes
    url: String,
    hash: String, // for deduplication
  },
  
  processedFiles: [{
    variant: String, // thumbnail, compressed, hd, etc.
    url: String,
    size: Number,
    dimensions: {
      width: Number,
      height: Number,
    },
    quality: String,
    format: String,
  }],
  
  metadata: {
    duration: Number, // for audio/video
    dimensions: {
      width: Number,
      height: Number,
    },
    bitrate: Number,
    framerate: Number,
    colorSpace: String,
    blurhash: String,
    waveform: [Number], // for audio visualization
    exif: Object, // image metadata
    location: {
      latitude: Number,
      longitude: Number,
    },
  },
  
  storage: {
    provider: String, // aws, gcp, azure, local
    bucket: String,
    key: String,
    region: String,
    cdn: {
      enabled: {
        type: Boolean,
        default: true,
      },
      url: String,
      provider: String,
    },
  },
  
  processing: {
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    startedAt: Date,
    completedAt: Date,
    errorMessage: String,
    steps: [{
      step: String,
      status: String,
      startedAt: Date,
      completedAt: Date,
      error: String,
    }],
  },
  
  compression: {
    original: {
      size: Number,
      quality: String,
    },
    compressed: {
      size: Number,
      quality: String,
      algorithm: String,
      compressionRatio: Number,
    },
  },
  
  security: {
    isEncrypted: {
      type: Boolean,
      default: true,
    },
    encryptionAlgorithm: String,
    keyId: String,
    scanResults: {
      virusScanned: {
        type: Boolean,
        default: false,
      },
      virusScanResult: String,
      scannedAt: Date,
      contentModeration: {
        isScanned: {
          type: Boolean,
          default: false,
        },
        isSafe: {
          type: Boolean,
          default: true,
        },
        flaggedContent: [String],
        confidence: Number,
      },
    },
  },
  
  usage: {
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastAccessed: Date,
    bandwidth: {
      total: Number, // bytes transferred
      cost: Number, // estimated cost
    },
    hotlinkProtection: {
      type: Boolean,
      default: true,
    },
  },
  
  expiration: {
    expiresAt: Date,
    isExpired: {
      type: Boolean,
      default: false,
    },
    autoDelete: {
      type: Boolean,
      default: false,
    },
  },
  
  tags: [String],
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
}, {
  timestamps: true,
});

// Media indexes
QuantumMediaSchema.index({ mediaId: 1 }, { unique: true });
QuantumMediaSchema.index({ uploadedBy: 1, createdAt: -1 });
QuantumMediaSchema.index({ messageId: 1 });
QuantumMediaSchema.index({ mediaType: 1 });
QuantumMediaSchema.index({ 'originalFile.hash': 1 });
QuantumMediaSchema.index({ 'processing.status': 1 });
QuantumMediaSchema.index({ expiresAt: 1 }, { sparse: true });

// Media methods
QuantumMediaSchema.methods.markAsProcessed = function(processedFiles = []) {
  this.processing.status = 'completed';
  this.processing.completedAt = new Date();
  this.processedFiles = processedFiles;
  return this.save();
};

QuantumMediaSchema.methods.markAsFailed = function(errorMessage) {
  this.processing.status = 'failed';
  this.processing.errorMessage = errorMessage;
  this.processing.completedAt = new Date();
  return this.save();
};

QuantumMediaSchema.methods.incrementDownload = function() {
  this.usage.downloadCount += 1;
  this.usage.lastAccessed = new Date();
  return this.save({ validateBeforeSave: false });
};

// Export QuantumMedia model
const QuantumMedia = mongoose.model('QuantumMedia', QuantumMediaSchema);

// =====================================
// QuantumAIUsage Model
// =====================================

const QuantumAIUsageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumUser',
    required: true,
  },
  
  sessionId: String,
  
  feature: {
    type: String,
    enum: [
      'smart_replies',
      'translation',
      'content_moderation',
      'sentiment_analysis',
      'voice_enhancement',
      'image_recognition',
      'text_summarization',
      'language_detection'
    ],
    required: true,
  },
  
  provider: {
    type: String,
    enum: ['openai', 'google', 'azure', 'anthropic', 'local'],
    required: true,
  },
  
  model: String, // gpt-4, claude-3, etc.
  
  input: {
    type: String,
    length: Number,
    language: String,
    contentType: String,
  },
  
  output: {
    type: String,
    length: Number,
    confidence: Number,
    processingTime: Number, // milliseconds
  },
  
  cost: {
    tokens: {
      input: Number,
      output: Number,
      total: Number,
    },
    pricing: {
      perToken: Number,
      totalCost: Number,
      currency: String,
    },
  },
  
  performance: {
    latency: Number, // milliseconds
    throughput: Number, // tokens per second
    errorRate: Number,
    retryCount: {
      type: Number,
      default: 0,
    },
  },
  
  quality: {
    userRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    accuracy: Number, // 0-1
    relevance: Number, // 0-1
    helpfulness: Number, // 0-1
    userFeedback: String,
  },
  
  context: {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumMessage',
    },
    chatId: String,
    conversationLength: Number,
    userPreferences: Object,
    deviceInfo: {
      platform: String,
      version: String,
    },
  },
  
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  
  error: {
    code: String,
    message: String,
    details: Object,
  },
  
  metadata: {
    experimentId: String,
    version: String,
    flags: [String],
    debugInfo: Object,
  },
}, {
  timestamps: true,
});

// AI Usage indexes
QuantumAIUsageSchema.index({ userId: 1, createdAt: -1 });
QuantumAIUsageSchema.index({ feature: 1, createdAt: -1 });
QuantumAIUsageSchema.index({ provider: 1, feature: 1 });
QuantumAIUsageSchema.index({ status: 1 });
QuantumAIUsageSchema.index({ 'context.messageId': 1 });

// AI Usage static methods
QuantumAIUsageSchema.statics.getUsageStats = async function(timeframe = 'day') {
  let matchStage = { status: 'completed' };
  
  if (timeframe === 'day') {
    matchStage.createdAt = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
  } else if (timeframe === 'week') {
    matchStage.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
  } else if (timeframe === 'month') {
    matchStage.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
  }
  
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: '$feature',
        totalRequests: { $sum: 1 },
        totalCost: { $sum: '$cost.pricing.totalCost' },
        avgLatency: { $avg: '$performance.latency' },
        avgRating: { $avg: '$quality.userRating' },
        avgAccuracy: { $avg: '$quality.accuracy' },
        totalTokens: { $sum: '$cost.tokens.total' },
        uniqueUsers: { $addToSet: '$userId' },
      }
    },
    {
      $project: {
        feature: '$_id',
        totalRequests: 1,
        totalCost: 1,
        avgLatency: 1,
        avgRating: 1,
        avgAccuracy: 1,
        totalTokens: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
      }
    },
    { $sort: { totalRequests: -1 } }
  ];
  
  return this.aggregate(pipeline);
};

QuantumAIUsageSchema.statics.getCostAnalysis = async function(userId = null) {
  const matchStage = { status: 'completed' };
  if (userId) matchStage.userId = userId;
  
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: {
          provider: '$provider',
          feature: '$feature',
        },
        totalCost: { $sum: '$cost.pricing.totalCost' },
        totalTokens: { $sum: '$cost.tokens.total' },
        requestCount: { $sum: 1 },
        avgCostPerRequest: { $avg: '$cost.pricing.totalCost' },
      }
    },
    { $sort: { totalCost: -1 } }
  ];
  
  return this.aggregate(pipeline);
};

// Export QuantumAIUsage model
const QuantumAIUsage = mongoose.model('QuantumAIUsage', QuantumAIUsageSchema);

// Export all models
module.exports = {
  QuantumMessage: require('./QuantumMessage'), // From previous artifact
  QuantumGroup,
  QuantumCall,
  QuantumMedia,
  QuantumAIUsage,
};