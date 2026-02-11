/**
 * Final 3 Database Models to Complete the 15-Model ndeip Database
 * QuantumNetwork, QuantumDevice, QuantumBackup
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

// =====================================
// QuantumNetwork Model - Network Performance & Connectivity
// =====================================

const QuantumNetworkSchema = new mongoose.Schema({
  networkId: {
    type: String,
    unique: true,
    default: () => crypto.randomUUID(),
  },
  
  // Connection Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumUser',
    index: true,
  },
  
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumSession',
  },
  
  // Network Details
  connection: {
    type: {
      type: String,
      enum: ['wifi', 'cellular', 'ethernet', 'unknown'],
      required: true,
    },
    speed: {
      download: Number, // Mbps
      upload: Number, // Mbps
      ping: Number, // ms
    },
    quality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
    },
    carrier: String, // for cellular
    ssid: String, // for wifi (hashed for privacy)
    ipAddress: String, // hashed
    publicIp: String, // hashed
    region: String,
    country: String,
    city: String,
    isp: String,
  },
  
  // Performance Metrics
  performance: {
    latency: {
      min: Number,
      max: Number,
      avg: Number,
      current: Number,
    },
    bandwidth: {
      downstream: Number, // Kbps
      upstream: Number, // Kbps
      utilization: Number, // percentage
    },
    packetLoss: {
      percentage: Number,
      count: Number,
    },
    jitter: Number, // ms
    mtu: Number, // bytes
    signalStrength: Number, // dBm for cellular/wifi
  },
  
  // Call Quality Metrics
  callMetrics: {
    videoQuality: {
      resolution: String, // 720p, 1080p, etc.
      framerate: Number,
      bitrate: Number,
      packetsLost: Number,
      packetsReceived: Number,
    },
    audioQuality: {
      codec: String,
      bitrate: Number,
      jitter: Number,
      packetsLost: Number,
      packetsReceived: Number,
      echoCancellation: Boolean,
      noiseSuppression: Boolean,
    },
    overallScore: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  
  // Message Delivery Performance
  messageMetrics: {
    deliveryTime: {
      avg: Number, // ms
      p50: Number,
      p95: Number,
      p99: Number,
    },
    throughput: {
      messagesPerSecond: Number,
      bytesPerSecond: Number,
    },
    reliability: {
      successRate: Number, // percentage
      retryRate: Number,
      failureReasons: [String],
    },
  },
  
  // Network Events
  events: [{
    eventType: {
      type: String,
      enum: [
        'connection_established',
        'connection_lost',
        'network_changed',
        'quality_degraded',
        'quality_improved',
        'timeout',
        'dns_failure',
        'ssl_error',
        'bandwidth_limited'
      ],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    details: Object,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    impact: String,
  }],
  
  // Optimization Suggestions
  optimization: {
    recommendations: [String],
    adaptations: [{
      type: String, // quality_reduction, compression_increase, etc.
      applied: Boolean,
      timestamp: Date,
      effectiveness: Number, // 0-1 scale
    }],
    currentSettings: {
      videoQuality: String,
      audioQuality: String,
      compressionLevel: String,
      bufferSize: Number,
    },
  },
  
  // Geographic & ISP Information
  location: {
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    accuracy: Number, // meters
    provider: String, // gps, network, passive
    timezone: String,
    networkRegion: String,
  },
  
  // Device Network Configuration
  deviceConfig: {
    userAgent: String,
    platform: String,
    capabilities: {
      webRTC: Boolean,
      h264: Boolean,
      vp8: Boolean,
      vp9: Boolean,
      av1: Boolean,
      opus: Boolean,
    },
    constraints: {
      maxBandwidth: Number,
      maxResolution: String,
      batteryOptimization: Boolean,
    },
  },
  
  // Quality of Service
  qosMetrics: {
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'critical'],
      default: 'normal',
    },
    allocation: {
      voice: Number, // percentage of bandwidth
      video: Number,
      data: Number,
      background: Number,
    },
    limits: {
      maxConcurrentCalls: Number,
      maxVideoStreams: Number,
      dataRateLimit: Number, // bytes/second
    },
  },
  
  // Analytics Period
  period: {
    start: {
      type: Date,
      required: true,
    },
    end: Date,
    duration: Number, // seconds
  },
  
  // Aggregated Statistics
  statistics: {
    totalDataUsed: Number, // bytes
    totalCalls: Number,
    totalMessages: Number,
    avgCallDuration: Number, // seconds
    peakBandwidthUsage: Number,
    costEstimate: {
      amount: Number,
      currency: String,
    },
  },
}, {
  timestamps: true,
});

// Network indexes
QuantumNetworkSchema.index({ networkId: 1 }, { unique: true });
QuantumNetworkSchema.index({ userId: 1, 'period.start': -1 });
QuantumNetworkSchema.index({ 'connection.type': 1, 'performance.latency.avg': 1 });
QuantumNetworkSchema.index({ 'connection.country': 1, 'connection.isp': 1 });

const QuantumNetwork = mongoose.model('QuantumNetwork', QuantumNetworkSchema);

// =====================================
// QuantumDevice Model - Device Information & Management
// =====================================

const QuantumDeviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    unique: true,
    required: true,
  },
  
  // User Association
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumUser',
    required: true,
    index: true,
  },
  
  // Device Identification
  identification: {
    fingerprint: {
      type: String,
      unique: true,
      required: true,
    },
    name: String, // User-defined device name
    type: {
      type: String,
      enum: ['smartphone', 'tablet', 'desktop', 'laptop', 'smart_tv', 'watch', 'other'],
    },
    manufacturer: String,
    model: String,
    brand: String,
  },
  
  // Operating System
  operatingSystem: {
    name: {
      type: String,
      enum: ['iOS', 'Android', 'Windows', 'macOS', 'Linux', 'Web'],
    },
    version: String,
    build: String,
    kernel: String,
    architecture: String, // arm64, x86_64, etc.
  },
  
  // Hardware Specifications
  hardware: {
    processor: {
      model: String,
      cores: Number,
      speed: Number, // GHz
      architecture: String,
    },
    memory: {
      total: Number, // GB
      available: Number,
      type: String, // DDR4, LPDDR5, etc.
    },
    storage: {
      total: Number, // GB
      available: Number,
      type: String, // SSD, HDD, eMMC, etc.
    },
    display