/**
 * QuantumBackup Model
 * Data backup and recovery management
 */

const mongoose = require('mongoose');

const quantumBackupSchema = new mongoose.Schema({
  backupId: {
    type: String,
    required: true,
    unique: true,
    
  },
  type: {
    type: String,
    enum: ['full', 'incremental', 'differential', 'snapshot'],
    required: true,
  },
  source: {
    type: {
      type: String,
      enum: ['database', 'files', 'user_data', 'system', 'application'],
      required: true,
    },
    identifier: String, // database name, user ID, etc.
    path: String,
    size: Number, // in bytes
  },
  destination: {
    provider: {
      type: String,
      enum: ['aws_s3', 'google_cloud', 'azure_blob', 'local', 'ftp', 'sftp'],
      required: true,
    },
    bucket: String,
    path: String,
    region: String,
    encryption: {
      enabled: {
        type: Boolean,
        default: true,
      },
      algorithm: String,
      keyId: String,
    },
  },
  schedule: {
    frequency: {
      type: String,
      enum: ['manual', 'hourly', 'daily', 'weekly', 'monthly'],
      default: 'daily',
    },
    time: String, // HH:MM format
    timezone: String,
    daysOfWeek: [Number], // 0-6, Sunday = 0
    daysOfMonth: [Number], // 1-31
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  execution: {
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    startTime: Date,
    endTime: Date,
    duration: Number, // in seconds
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    bytesProcessed: {
      type: Number,
      default: 0,
    },
    filesProcessed: {
      type: Number,
      default: 0,
    },
    errors: [{
      timestamp: Date,
      error: String,
      file: String,
      severity: {
        type: String,
        enum: ['warning', 'error', 'critical'],
      },
    }],
  },
  metadata: {
    checksum: String,
    compression: {
      enabled: {
        type: Boolean,
        default: true,
      },
      algorithm: {
        type: String,
        enum: ['gzip', 'bzip2', 'lz4', 'zstd'],
        default: 'gzip',
      },
      ratio: Number,
    },
    deduplication: {
      enabled: {
        type: Boolean,
        default: false,
      },
      savings: Number, // percentage
    },
    tags: [String],
    description: String,
  },
  retention: {
    policy: {
      type: String,
      enum: ['days', 'weeks', 'months', 'years', 'forever'],
      default: 'months',
    },
    value: {
      type: Number,
      default: 3,
    },
    autoDelete: {
      type: Boolean,
      default: true,
    },
    deleteAfter: Date,
  },
  verification: {
    enabled: {
      type: Boolean,
      default: true,
    },
    method: {
      type: String,
      enum: ['checksum', 'restore_test', 'file_count'],
      default: 'checksum',
    },
    lastVerified: Date,
    status: {
      type: String,
      enum: ['pending', 'passed', 'failed', 'skipped'],
    },
    errors: [String],
  },
  recovery: {
    restorable: {
      type: Boolean,
      default: true,
    },
    restorePoints: [{
      timestamp: Date,
      description: String,
      size: Number,
      files: Number,
    }],
    lastRestore: {
      timestamp: Date,
      destination: String,
      status: {
        type: String,
        enum: ['completed', 'failed', 'partial'],
      },
      duration: Number,
      errors: [String],
    },
  },
  monitoring: {
    alerts: {
      onFailure: {
        type: Boolean,
        default: true,
      },
      onSuccess: {
        type: Boolean,
        default: false,
      },
      onLongRunning: {
        type: Boolean,
        default: true,
      },
      threshold: Number, // minutes
    },
    notifications: [String], // email addresses or webhook URLs
    metrics: {
      successRate: Number,
      avgDuration: Number,
      avgSize: Number,
      lastSuccess: Date,
      lastFailure: Date,
    },
  },
  dependencies: [{
    backupId: String,
    type: {
      type: String,
      enum: ['prerequisite', 'chain', 'parallel'],
    },
    required: {
      type: Boolean,
      default: true,
    },
  }],
  compliance: {
    regulations: [{
      type: String,
      enum: ['GDPR', 'HIPAA', 'SOX', 'PCI_DSS'],
    }],
    dataClassification: {
      type: String,
      enum: ['public', 'internal', 'confidential', 'restricted'],
      default: 'internal',
    },
    auditTrail: [{
      action: String,
      user: String,
      timestamp: Date,
      details: mongoose.Schema.Types.Mixed,
    }],
  },
}, {
  timestamps: true,
  collection: 'quantum_backups',
});

// Indexes
quantumBackupSchema.index({ backupId: 1 });
quantumBackupSchema.index({ 'source.type': 1, 'source.identifier': 1 });
quantumBackupSchema.index({ 'execution.status': 1 });
quantumBackupSchema.index({ 'schedule.frequency': 1, 'schedule.enabled': 1 });
quantumBackupSchema.index({ 'retention.deleteAfter': 1 });
quantumBackupSchema.index({ createdAt: -1 });

// Methods
quantumBackupSchema.methods.start = function() {
  this.execution.status = 'running';
  this.execution.startTime = new Date();
  this.execution.progress = 0;
  return this.save();
};

quantumBackupSchema.methods.updateProgress = function(progress, bytesProcessed, filesProcessed) {
  this.execution.progress = Math.min(100, Math.max(0, progress));
  if (bytesProcessed !== undefined) this.execution.bytesProcessed = bytesProcessed;
  if (filesProcessed !== undefined) this.execution.filesProcessed = filesProcessed;
  return this.save();
};

quantumBackupSchema.methods.complete = function(checksum, finalSize) {
  this.execution.status = 'completed';
  this.execution.endTime = new Date();
  this.execution.progress = 100;
  this.execution.duration = Math.floor((this.execution.endTime - this.execution.startTime) / 1000);
  
  if (checksum) this.metadata.checksum = checksum;
  if (finalSize) this.source.size = finalSize;
  
  // Calculate compression ratio
  if (this.metadata.compression.enabled && this.execution.bytesProcessed > 0) {
    this.metadata.compression.ratio = (this.source.size / this.execution.bytesProcessed) * 100;
  }
  
  // Set delete date based on retention policy
  this.setDeleteDate();
  
  // Update monitoring metrics
  this.monitoring.metrics.lastSuccess = new Date();
  
  return this.save();
};

quantumBackupSchema.methods.fail = function(error) {
  this.execution.status = 'failed';
  this.execution.endTime = new Date();
  this.execution.duration = Math.floor((this.execution.endTime - this.execution.startTime) / 1000);
  
  this.execution.errors.push({
    timestamp: new Date(),
    error: error.toString(),
    severity: 'critical',
  });
  
  this.monitoring.metrics.lastFailure = new Date();
  
  return this.save();
};

quantumBackupSchema.methods.addError = function(error, file, severity = 'error') {
  this.execution.errors.push({
    timestamp: new Date(),
    error,
    file,
    severity,
  });
  return this.save();
};

quantumBackupSchema.methods.verify = function() {
  this.verification.lastVerified = new Date();
  this.verification.status = 'pending';
  return this.save();
};

quantumBackupSchema.methods.setDeleteDate = function() {
  if (!this.retention.autoDelete) return;
  
  const deleteDate = new Date();
  switch (this.retention.policy) {
    case 'days':
      deleteDate.setDate(deleteDate.getDate() + this.retention.value);
      break;
    case 'weeks':
      deleteDate.setDate(deleteDate.getDate() + (this.retention.value * 7));
      break;
    case 'months':
      deleteDate.setMonth(deleteDate.getMonth() + this.retention.value);
      break;
    case 'years':
      deleteDate.setFullYear(deleteDate.getFullYear() + this.retention.value);
      break;
    case 'forever':
      return; // No delete date
  }
  
  this.retention.deleteAfter = deleteDate;
};

quantumBackupSchema.methods.isExpired = function() {
  return this.retention.deleteAfter && new Date() > this.retention.deleteAfter;
};

quantumBackupSchema.methods.canRestore = function() {
  return this.recovery.restorable && 
         this.execution.status === 'completed' &&
         this.verification.status === 'passed';
};

// Statics
quantumBackupSchema.statics.findPendingBackups = function() {
  return this.find({
    'execution.status': 'pending',
    'schedule.enabled': true,
  }).sort({ createdAt: 1 });
};

quantumBackupSchema.statics.findExpiredBackups = function() {
  return this.find({
    'retention.deleteAfter': { $lte: new Date() },
    'retention.autoDelete': true,
  });
};

quantumBackupSchema.statics.findBySource = function(sourceType, identifier) {
  return this.find({
    'source.type': sourceType,
    'source.identifier': identifier,
  }).sort({ createdAt: -1 });
};

quantumBackupSchema.statics.getBackupStats = function(startDate, endDate) {
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
        _id: '$execution.status',
        count: { $sum: 1 },
        totalSize: { $sum: '$source.size' },
        avgDuration: { $avg: '$execution.duration' },
        totalErrors: { $sum: { $size: '$execution.errors' } },
      },
    },
  ]);
};

quantumBackupSchema.statics.findFailedBackups = function(hours = 24) {
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - hours);
  
  return this.find({
    'execution.status': 'failed',
    'execution.endTime': { $gte: cutoffDate },
  });
};

quantumBackupSchema.statics.getStorageUsage = function() {
  return this.aggregate([
    {
      $match: {
        'execution.status': 'completed',
      },
    },
    {
      $group: {
        _id: '$destination.provider',
        totalSize: { $sum: '$source.size' },
        backupCount: { $sum: 1 },
        avgSize: { $avg: '$source.size' },
      },
    },
    { $sort: { totalSize: -1 } },
  ]);
};

// Pre-save middleware
quantumBackupSchema.pre('save', function(next) {
  if (this.isNew) {
    this.setDeleteDate();
  }
  next();
});

module.exports = mongoose.model('QuantumBackup', quantumBackupSchema);