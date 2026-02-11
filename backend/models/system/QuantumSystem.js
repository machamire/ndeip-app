/**
 * QuantumSystem Model - System health monitoring & performance
 * Tracks system metrics, performance, and health status for ndeip
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const QuantumSystemSchema = new mongoose.Schema({
  metricId: {
    type: String,
    unique: true,
    default: () => crypto.randomUUID(),
  },
  
  metricTypetype: String,
    enum: [
      'server_health',
      'database_performance',
      'api_response_time',
      'memory_usage',
      'cpu_usage',
      'disk_usage',
      'network_io',
      'active_connections',
      'queue_size',
      'error_rate',
      'uptime',
      'deployment',
      'backup_status',
      'cache_hit_rate',
      'feature_flag_change'
    ],
    required: true,
    
  },
  
  server: {
    hostname: String,
    region: String,
    environment: String, // development, staging, production
    version: String,
    instance: String,
  },
  
  metrics: {
    cpu: {
      usage: Number, // percentage
      cores: Number,
      loadAverage: [Number],
    },
    memory: {
      used: Number, // bytes
      total: Number,
      available: Number,
      percentage: Number,
    },
    disk: {
      used: Number, // bytes
      total: Number,
      available: Number,
      percentage: Number,
      iops: Number,
    },
    network: {
      bytesIn: Number,
      bytesOut: Number,
      packetsIn: Number,
      packetsOut: Number,
      errors: Number,
    },
    database: {
      connections: Number,
      queryTime: Number, // milliseconds
      slowQueries: Number,
      lockWaits: Number,
      cacheHitRate: Number,
    },
    application: {
      activeUsers: Number,
      requestsPerSecond: Number,
      responseTime: Number,
      errorRate: Number,
      queueSize: Number,
      throughput: Number,
    },
  },
  
  status: {
    overall: {
      type: String,
      enum: ['healthy', 'warning', 'critical', 'down'],
      default: 'healthy',
    },
    services: [{
      name: String,
      status: String,
      responseTime: Number,
      lastCheck: Date,
      error: String,
    }],
    alerts: [{
      level: String,
      message: String,
      timestamp: Date,
      acknowledged: Boolean,
      acknowledgedBy: String,
    }],
  },
  
  performance: {
    benchmarks: [{
      test: String,
      score: Number,
      unit: String,
      baseline: Number,
      deviation: Number,
    }],
    trends: [{
      metric: String,
      direction: String, // increasing, decreasing, stable
      rate: Number,
      period: String,
    }],
  },
  
  incidents: [{
    incidentId: String,
    title: String,
    description: String,
    severity: String,
    status: String,
    startedAt: Date,
    resolvedAt: Date,
    affectedServices: [String],
    rootCause: String,
    resolution: String,
  }],
  
  deployment: {
    version: String,
    deployedAt: Date,
    deployedBy: String,
    environment: String,
    status: String,
    rollbackPlan: String,
    healthChecks: [{
      name: String,
      status: String,
      message: String,
    }],
  },
  
  backup: {
    lastBackup: Date,
    backupSize: Number,
    status: String,
    location: String,
    retentionDays: Number,
    encrypted: Boolean,
  },
  
  monitoring: {
    source: String, // prometheus, datadog, newrelic, custom
    interval: Number, // seconds
    retention: Number, // days
    thresholds: {
      warning: Object,
      critical: Object,
    },
  },
}, {
  timestamps: true,
});

// System indexes
QuantumSystemSchema.index({ metricType: 1, createdAt: -1 });
QuantumSystemSchema.index({ 'server.environment': 1, 'server.hostname': 1 });
QuantumSystemSchema.index({ 'status.overall': 1 });
QuantumSystemSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

module.exports = mongoose.model('QuantumSystem', QuantumSystemSchema);