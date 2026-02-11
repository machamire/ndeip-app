/**
 * QuantumDevice Model
 * Device management and tracking
 */

const mongoose = require('mongoose');

const quantumDeviceSchema = new mongoose.Schema({
  deviceId: {
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
    name: String,
    type: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'laptop', 'smartwatch', 'tv', 'iot'],
      required: true,
    },
    platform: {
      type: String,
      enum: ['ios', 'android', 'windows', 'macos', 'linux', 'web'],
      required: true,
    },
    model: String,
    manufacturer: String,
    version: String,
    buildNumber: String,
  },
  specifications: {
    cpu: {
      architecture: String,
      cores: Number,
      frequency: String,
    },
    memory: {
      total: Number, // in bytes
      available: Number,
    },
    storage: {
      total: Number, // in bytes
      available: Number,
      type: {
        type: String,
        enum: ['hdd', 'ssd', 'nvme', 'emmc'],
      },
    },
    display: {
      resolution: String,
      size: Number, // in inches
      density: Number, // DPI
      colorDepth: Number,
    },
    network: {
      wifi: Boolean,
      cellular: Boolean,
      bluetooth: Boolean,
      nfc: Boolean,
    },
    sensors: [String],
  },
  software: {
    os: {
      name: String,
      version: String,
      buildNumber: String,
      kernel: String,
    },
    app: {
      version: String,
      buildNumber: String,
      installDate: Date,
      lastUpdate: Date,
    },
    runtime: {
      name: String,
      version: String,
    },
    dependencies: [{
      name: String,
      version: String,
      type: {
        type: String,
        enum: ['system', 'app', 'plugin'],
      },
    }],
  },
  security: {
    encryption: {
      enabled: {
        type: Boolean,
        default: true,
      },
      algorithm: String,
      keySize: Number,
    },
    biometrics: {
      fingerprint: Boolean,
      faceId: Boolean,
      voiceId: Boolean,
    },
    screenLock: {
      enabled: Boolean,
      type: {
        type: String,
        enum: ['pin', 'pattern', 'password', 'biometric'],
      },
    },
    jailbroken: {
      type: Boolean,
      default: false,
    },
    rooted: {
      type: Boolean,
      default: false,
    },
    certificates: [{
      name: String,
      issuer: String,
      expiry: Date,
      fingerprint: String,
    }],
  },
  status: {
    online: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    batteryLevel: Number,
    charging: Boolean,
    networkType: {
      type: String,
      enum: ['wifi', '4g', '5g', 'ethernet', 'offline'],
    },
    location: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      timestamp: Date,
    },
  },
  permissions: {
    camera: Boolean,
    microphone: Boolean,
    location: Boolean,
    contacts: Boolean,
    storage: Boolean,
    notifications: Boolean,
    background: Boolean,
  },
  usage: {
    sessions: [{
      startTime: Date,
      endTime: Date,
      duration: Number, // in seconds
      activities: [String],
    }],
    totalTime: {
      type: Number,
      default: 0, // in seconds
    },
    lastActivity: Date,
    features: [{
      name: String,
      count: Number,
      lastUsed: Date,
    }],
  },
  performance: {
    metrics: [{
      timestamp: Date,
      cpu: Number,
      memory: Number,
      battery: Number,
      network: {
        latency: Number,
        bandwidth: Number,
        quality: {
          type: String,
          enum: ['poor', 'fair', 'good', 'excellent'],
        },
      },
    }],
    crashes: [{
      timestamp: Date,
      error: String,
      stackTrace: String,
      version: String,
    }],
    errors: [{
      timestamp: Date,
      type: String,
      message: String,
      context: mongoose.Schema.Types.Mixed,
    }],
  },
  settings: {
    notifications: {
      enabled: {
        type: Boolean,
        default: true,
      },
      sound: Boolean,
      vibration: Boolean,
      badge: Boolean,
    },
    privacy: {
      analytics: {
        type: Boolean,
        default: true,
      },
      crashReporting: {
        type: Boolean,
        default: true,
      },
      locationTracking: {
        type: Boolean,
        default: false,
      },
    },
    sync: {
      enabled: {
        type: Boolean,
        default: true,
      },
      frequency: {
        type: String,
        enum: ['realtime', 'hourly', 'daily', 'manual'],
        default: 'realtime',
      },
      wifiOnly: {
        type: Boolean,
        default: false,
      },
    },
  },
  compliance: {
    mdm: {
      enrolled: Boolean,
      profile: String,
      policies: [String],
    },
    restrictions: [{
      type: String,
      value: mongoose.Schema.Types.Mixed,
      enforced: Boolean,
    }],
    audit: {
      lastCheck: Date,
      status: {
        type: String,
        enum: ['compliant', 'non_compliant', 'unknown'],
      },
      violations: [String],
    },
  },
  metadata: {
    tags: [String],
    notes: String,
    customFields: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
  collection: 'quantum_devices',
});

// Indexes
quantumDeviceSchema.index({ deviceId: 1 });
quantumDeviceSchema.index({ userId: 1, 'status.lastSeen': -1 });
quantumDeviceSchema.index({ 'deviceInfo.type': 1, 'deviceInfo.platform': 1 });
quantumDeviceSchema.index({ 'status.online': 1 });
quantumDeviceSchema.index({ 'security.jailbroken': 1, 'security.rooted': 1 });

// Methods
quantumDeviceSchema.methods.updateStatus = function(statusUpdate) {
  this.status = { ...this.status, ...statusUpdate };
  this.status.lastSeen = new Date();
  return this.save();
};

quantumDeviceSchema.methods.addSession = function(startTime, endTime, activities = []) {
  const duration = Math.floor((endTime - startTime) / 1000);
  this.usage.sessions.push({
    startTime,
    endTime,
    duration,
    activities,
  });
  this.usage.totalTime += duration;
  this.usage.lastActivity = endTime;
  return this.save();
};

quantumDeviceSchema.methods.recordCrash = function(error, stackTrace, version) {
  this.performance.crashes.push({
    timestamp: new Date(),
    error,
    stackTrace,
    version,
  });
  return this.save();
};

quantumDeviceSchema.methods.recordError = function(type, message, context = {}) {
  this.performance.errors.push({
    timestamp: new Date(),
    type,
    message,
    context,
  });
  return this.save();
};

quantumDeviceSchema.methods.addPerformanceMetric = function(metrics) {
  this.performance.metrics.push({
    timestamp: new Date(),
    ...metrics,
  });
  
  // Keep only last 100 metrics
  if (this.performance.metrics.length > 100) {
    this.performance.metrics = this.performance.metrics.slice(-100);
  }
  
  return this.save();
};

quantumDeviceSchema.methods.updateFeatureUsage = function(featureName) {
  const feature = this.usage.features.find(f => f.name === featureName);
  if (feature) {
    feature.count += 1;
    feature.lastUsed = new Date();
  } else {
    this.usage.features.push({
      name: featureName,
      count: 1,
      lastUsed: new Date(),
    });
  }
  return this.save();
};

quantumDeviceSchema.methods.isSecure = function() {
  return !this.security.jailbroken && 
         !this.security.rooted && 
         this.security.encryption.enabled &&
         this.security.screenLock.enabled;
};

quantumDeviceSchema.methods.getAveragePerformance = function() {
  const metrics = this.performance.metrics;
  if (metrics.length === 0) return null;
  
  const totals = metrics.reduce((acc, metric) => ({
    cpu: acc.cpu + (metric.cpu || 0),
    memory: acc.memory + (metric.memory || 0),
    battery: acc.battery + (metric.battery || 0),
  }), { cpu: 0, memory: 0, battery: 0 });
  
  return {
    cpu: totals.cpu / metrics.length,
    memory: totals.memory / metrics.length,
    battery: totals.battery / metrics.length,
  };
};

// Statics
quantumDeviceSchema.statics.findOnlineDevices = function() {
  return this.find({ 'status.online': true });
};

quantumDeviceSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ 'status.lastSeen': -1 });
};

quantumDeviceSchema.statics.findByPlatform = function(platform) {
  return this.find({ 'deviceInfo.platform': platform });
};

quantumDeviceSchema.statics.findInsecureDevices = function() {
  return this.find({
    $or: [
      { 'security.jailbroken': true },
      { 'security.rooted': true },
      { 'security.encryption.enabled': false },
      { 'security.screenLock.enabled': false },
    ],
  });
};

quantumDeviceSchema.statics.getDeviceStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: {
          type: '$deviceInfo.type',
          platform: '$deviceInfo.platform',
        },
        count: { $sum: 1 },
        onlineCount: {
          $sum: { $cond: ['$status.online', 1, 0] },
        },
        avgBattery: { $avg: '$status.batteryLevel' },
        secureCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$security.jailbroken', false] },
                  { $eq: ['$security.rooted', false] },
                  { $eq: ['$security.encryption.enabled', true] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

quantumDeviceSchema.statics.findStaleDevices = function(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.find({
    'status.lastSeen': { $lt: cutoffDate },
  });
};

// Pre-save middleware
quantumDeviceSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status.online) {
    this.status.lastSeen = new Date();
  }
  next();
});

module.exports = mongoose.model('QuantumDevice', quantumDeviceSchema);