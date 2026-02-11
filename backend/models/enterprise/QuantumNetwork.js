/**
 * QuantumNetwork Model
 * Network topology and infrastructure management
 */

const mongoose = require('mongoose');

const quantumNetworkSchema = new mongoose.Schema({
  networkId: {
    type: String,
    required: true,
    unique: true,
    
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['enterprise', 'organization', 'team', 'personal'],
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'suspended'],
    default: 'active',
  },
  configuration: {
    region: {
      type: String,
      required: true,
    },
    dataCenter: String,
    tier: {
      type: String,
      enum: ['basic', 'standard', 'premium', 'enterprise'],
      default: 'standard',
    },
    encryption: {
      enabled: {
        type: Boolean,
        default: true,
      },
      algorithm: {
        type: String,
        default: 'AES-256-GCM',
      },
      keyRotation: {
        type: Boolean,
        default: true,
      },
    },
    backup: {
      enabled: {
        type: Boolean,
        default: true,
      },
      frequency: {
        type: String,
        enum: ['hourly', 'daily', 'weekly'],
        default: 'daily',
      },
      retention: {
        type: Number,
        default: 30, // days
      },
    },
  },
  infrastructure: {
    servers: [{
      serverId: String,
      type: {
        type: String,
        enum: ['web', 'api', 'database', 'cache', 'storage', 'compute'],
      },
      location: String,
      status: {
        type: String,
        enum: ['online', 'offline', 'maintenance', 'error'],
        default: 'online',
      },
      specs: {
        cpu: String,
        memory: String,
        storage: String,
        network: String,
      },
      metrics: {
        cpuUsage: Number,
        memoryUsage: Number,
        diskUsage: Number,
        networkIn: Number,
        networkOut: Number,
        uptime: Number,
      },
      lastHealthCheck: Date,
    }],
    loadBalancers: [{
      id: String,
      type: String,
      algorithm: {
        type: String,
        enum: ['round_robin', 'least_connections', 'ip_hash', 'weighted'],
        default: 'round_robin',
      },
      targets: [String],
      healthCheck: {
        enabled: Boolean,
        interval: Number,
        timeout: Number,
        path: String,
      },
    }],
    databases: [{
      id: String,
      type: {
        type: String,
        enum: ['mongodb', 'redis', 'postgresql', 'mysql'],
      },
      cluster: Boolean,
      replicas: Number,
      sharding: Boolean,
      backup: {
        enabled: Boolean,
        schedule: String,
        retention: Number,
      },
    }],
  },
  security: {
    firewall: {
      enabled: {
        type: Boolean,
        default: true,
      },
      rules: [{
        name: String,
        action: {
          type: String,
          enum: ['allow', 'deny'],
        },
        protocol: String,
        port: String,
        source: String,
        destination: String,
      }],
    },
    ddosProtection: {
      enabled: {
        type: Boolean,
        default: true,
      },
      threshold: Number,
      action: {
        type: String,
        enum: ['block', 'challenge', 'rate_limit'],
        default: 'rate_limit',
      },
    },
    ssl: {
      enabled: {
        type: Boolean,
        default: true,
      },
      certificate: String,
      expiry: Date,
      autoRenewal: {
        type: Boolean,
        default: true,
      },
    },
    vpn: {
      enabled: Boolean,
      protocol: String,
      endpoints: [String],
    },
  },
  monitoring: {
    enabled: {
      type: Boolean,
      default: true,
    },
    metrics: [{
      name: String,
      type: {
        type: String,
        enum: ['counter', 'gauge', 'histogram'],
      },
      value: Number,
      timestamp: Date,
      tags: mongoose.Schema.Types.Mixed,
    }],
    alerts: [{
      name: String,
      condition: String,
      threshold: Number,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
      },
      enabled: {
        type: Boolean,
        default: true,
      },
      notifications: [String],
    }],
    uptime: {
      percentage: Number,
      lastDowntime: Date,
      downtimeReason: String,
    },
  },
  performance: {
    latency: {
      avg: Number,
      p95: Number,
      p99: Number,
    },
    throughput: {
      requests: Number,
      bandwidth: Number,
    },
    availability: {
      percentage: Number,
      sla: Number,
    },
    errors: {
      rate: Number,
      count: Number,
    },
  },
  costs: {
    monthly: {
      compute: Number,
      storage: Number,
      network: Number,
      total: Number,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    billing: {
      model: {
        type: String,
        enum: ['pay_as_you_go', 'reserved', 'spot'],
        default: 'pay_as_you_go',
      },
      cycle: {
        type: String,
        enum: ['hourly', 'daily', 'monthly'],
        default: 'monthly',
      },
    },
  },
  compliance: {
    standards: [{
      type: String,
      enum: ['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI_DSS'],
    }],
    audits: [{
      type: String,
      date: Date,
      status: {
        type: String,
        enum: ['passed', 'failed', 'pending'],
      },
      findings: [String],
      remediation: [String],
    }],
    dataRetention: {
      policy: String,
      period: Number, // days
      autoDelete: Boolean,
    },
  },
  metadata: {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumUser',
    },
    administrators: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumUser',
    }],
    tags: [String],
    description: String,
    documentation: String,
  },
}, {
  timestamps: true,
  collection: 'quantum_networks',
});

// Indexes
quantumNetworkSchema.index({ networkId: 1 });
quantumNetworkSchema.index({ type: 1, status: 1 });
quantumNetworkSchema.index({ 'configuration.region': 1 });
quantumNetworkSchema.index({ 'metadata.owner': 1 });
quantumNetworkSchema.index({ 'infrastructure.servers.status': 1 });

// Methods
quantumNetworkSchema.methods.addServer = function(serverConfig) {
  this.infrastructure.servers.push({
    ...serverConfig,
    lastHealthCheck: new Date(),
  });
  return this.save();
};

quantumNetworkSchema.methods.updateServerMetrics = function(serverId, metrics) {
  const server = this.infrastructure.servers.id(serverId);
  if (server) {
    server.metrics = { ...server.metrics, ...metrics };
    server.lastHealthCheck = new Date();
    return this.save();
  }
  throw new Error('Server not found');
};

quantumNetworkSchema.methods.addAlert = function(alertConfig) {
  this.monitoring.alerts.push(alertConfig);
  return this.save();
};

quantumNetworkSchema.methods.updatePerformance = function(metrics) {
  this.performance = { ...this.performance, ...metrics };
  return this.save();
};

quantumNetworkSchema.methods.calculateUptime = function() {
  const servers = this.infrastructure.servers;
  const onlineServers = servers.filter(s => s.status === 'online').length;
  const totalServers = servers.length;
  
  if (totalServers === 0) return 100;
  return (onlineServers / totalServers) * 100;
};

quantumNetworkSchema.methods.getHealthStatus = function() {
  const uptime = this.calculateUptime();
  const criticalAlerts = this.monitoring.alerts.filter(
    a => a.severity === 'critical' && a.enabled
  ).length;
  
  if (uptime < 50 || criticalAlerts > 0) return 'critical';
  if (uptime < 80) return 'warning';
  return 'healthy';
};

// Statics
quantumNetworkSchema.statics.findByRegion = function(region) {
  return this.find({ 'configuration.region': region, status: 'active' });
};

quantumNetworkSchema.statics.findByOwner = function(userId) {
  return this.find({ 'metadata.owner': userId });
};

quantumNetworkSchema.statics.getNetworkStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        activeCount: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
        },
        avgUptime: { $avg: '$monitoring.uptime.percentage' },
        totalCost: { $sum: '$costs.monthly.total' },
      },
    },
  ]);
};

quantumNetworkSchema.statics.findUnhealthyNetworks = function() {
  return this.find({
    $or: [
      { 'monitoring.uptime.percentage': { $lt: 95 } },
      { 'infrastructure.servers.status': 'error' },
      { status: { $in: ['maintenance', 'suspended'] } },
    ],
  });
};

// Pre-save middleware
quantumNetworkSchema.pre('save', function(next) {
  if (this.isModified('infrastructure.servers')) {
    this.monitoring.uptime.percentage = this.calculateUptime();
  }
  next();
});

module.exports = mongoose.model('QuantumNetwork', quantumNetworkSchema);