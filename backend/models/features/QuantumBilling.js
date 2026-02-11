/**
 * QuantumBilling Model
 * Billing, subscriptions, and payment management
 */

const mongoose = require('mongoose');

const quantumBillingSchema = new mongoose.Schema({
  billingId: {
    type: String,
    required: true,
    
    175}
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumUser',
    required: true,
    
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'suspended', 'trial'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: Date,
    renewalDate: Date,
    trialEndDate: Date,
    autoRenew: {
      type: Boolean,
      default: true,
    },
  },
  pricing: {
    currency: {
      type: String,
      default: 'USD',
    },
    amount: {
      type: Number,
      default: 0,
    },
    interval: {
      type: String,
      enum: ['monthly', 'yearly', 'one_time'],
      default: 'monthly',
    },
    discount: {
      code: String,
      percentage: Number,
      amount: Number,
      validUntil: Date,
    },
  },
  usage: {
    messages: {
      sent: {
        type: Number,
        default: 0,
      },
      limit: Number,
    },
    storage: {
      used: {
        type: Number,
        default: 0,
      }, // in bytes
      limit: Number,
    },
    aiCredits: {
      used: {
        type: Number,
        default: 0,
      },
      limit: Number,
      resetDate: Date,
    },
    calls: {
      minutes: {
        type: Number,
        default: 0,
      },
      limit: Number,
    },
  },
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto'],
    },
    provider: String, // stripe, paypal, etc.
    customerId: String,
    subscriptionId: String,
    lastPayment: {
      date: Date,
      amount: Number,
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
      },
      transactionId: String,
    },
    nextPayment: {
      date: Date,
      amount: Number,
    },
    failedAttempts: {
      type: Number,
      default: 0,
    },
  },
  invoices: [{
    invoiceId: String,
    date: Date,
    amount: Number,
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    },
    dueDate: Date,
    items: [{
      description: String,
      quantity: Number,
      unitPrice: Number,
      total: Number,
    }],
    paidAt: Date,
    downloadUrl: String,
  }],
  credits: {
    balance: {
      type: Number,
      default: 0,
    },
    transactions: [{
      type: {
        type: String,
        enum: ['purchase', 'usage', 'refund', 'bonus', 'expiry'],
      },
      amount: Number,
      description: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
      reference: String,
    }],
  },
  limits: {
    dailyMessages: Number,
    monthlyStorage: Number,
    concurrentCalls: Number,
    groupMembers: Number,
    fileUploadSize: Number,
  },
  notifications: {
    paymentReminders: {
      type: Boolean,
      default: true,
    },
    usageAlerts: {
      type: Boolean,
      default: true,
    },
    renewalNotices: {
      type: Boolean,
      default: true,
    },
  },
  metadata: {
    referralCode: String,
    promotions: [String],
    tags: [String],
    notes: String,
  },
}, {
  timestamps: true,
  collection: 'quantum_billing',
});

// Indexes
quantumBillingSchema.index({ userId: 1 });
quantumBillingSchema.index({ 'subscription.plan': 1 });
quantumBillingSchema.index({ 'subscription.status': 1 });
quantumBillingSchema.index({ 'subscription.renewalDate': 1 });
quantumBillingSchema.index({ 'payment.customerId': 1 });
quantumBillingSchema.index({ 'payment.subscriptionId': 1 });

// Methods
quantumBillingSchema.methods.addUsage = function(type, amount) {
  if (this.usage[type]) {
    if (type === 'messages') {
      this.usage.messages.sent += amount;
    } else if (type === 'storage') {
      this.usage.storage.used += amount;
    } else if (type === 'aiCredits') {
      this.usage.aiCredits.used += amount;
    } else if (type === 'calls') {
      this.usage.calls.minutes += amount;
    }
  }
  return this.save();
};

quantumBillingSchema.methods.checkLimit = function(type, amount = 0) {
  const usage = this.usage[type];
  if (!usage || !usage.limit) return true;
  
  if (type === 'messages') {
    return (usage.sent + amount) <= usage.limit;
  } else if (type === 'storage') {
    return (usage.used + amount) <= usage.limit;
  } else if (type === 'aiCredits') {
    return (usage.used + amount) <= usage.limit;
  } else if (type === 'calls') {
    return (usage.minutes + amount) <= usage.limit;
  }
  
  return true;
};

quantumBillingSchema.methods.addCredit = function(amount, type, description, reference) {
  this.credits.balance += amount;
  this.credits.transactions.push({
    type,
    amount,
    description,
    reference,
    timestamp: new Date(),
  });
  return this.save();
};

quantumBillingSchema.methods.deductCredit = function(amount, description, reference) {
  if (this.credits.balance >= amount) {
    this.credits.balance -= amount;
    this.credits.transactions.push({
      type: 'usage',
      amount: -amount,
      description,
      reference,
      timestamp: new Date(),
    });
    return this.save();
  }
  throw new Error('Insufficient credits');
};

quantumBillingSchema.methods.updateSubscription = function(plan, status) {
  this.subscription.plan = plan;
  this.subscription.status = status;
  
  // Set limits based on plan
  const planLimits = {
    free: {
      dailyMessages: 100,
      monthlyStorage: 1024 * 1024 * 100, // 100MB
      concurrentCalls: 1,
      groupMembers: 10,
      fileUploadSize: 1024 * 1024 * 10, // 10MB
    },
    basic: {
      dailyMessages: 1000,
      monthlyStorage: 1024 * 1024 * 1024, // 1GB
      concurrentCalls: 3,
      groupMembers: 50,
      fileUploadSize: 1024 * 1024 * 50, // 50MB
    },
    premium: {
      dailyMessages: 10000,
      monthlyStorage: 1024 * 1024 * 1024 * 10, // 10GB
      concurrentCalls: 10,
      groupMembers: 200,
      fileUploadSize: 1024 * 1024 * 200, // 200MB
    },
    enterprise: {
      dailyMessages: -1, // unlimited
      monthlyStorage: -1, // unlimited
      concurrentCalls: -1, // unlimited
      groupMembers: -1, // unlimited
      fileUploadSize: 1024 * 1024 * 1024, // 1GB
    },
  };
  
  this.limits = planLimits[plan] || planLimits.free;
  return this.save();
};

quantumBillingSchema.methods.isTrialExpired = function() {
  return this.subscription.trialEndDate && 
         new Date() > this.subscription.trialEndDate;
};

quantumBillingSchema.methods.isSubscriptionExpired = function() {
  return this.subscription.endDate && 
         new Date() > this.subscription.endDate;
};

quantumBillingSchema.methods.getDaysUntilRenewal = function() {
  if (!this.subscription.renewalDate) return null;
  const now = new Date();
  const renewal = new Date(this.subscription.renewalDate);
  return Math.ceil((renewal - now) / (1000 * 60 * 60 * 24));
};

// Statics
quantumBillingSchema.statics.findByPlan = function(plan) {
  return this.find({ 'subscription.plan': plan });
};

quantumBillingSchema.statics.findExpiringSoon = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    'subscription.renewalDate': { $lte: futureDate },
    'subscription.status': 'active',
    'subscription.autoRenew': false,
  });
};

quantumBillingSchema.statics.findFailedPayments = function() {
  return this.find({
    'payment.lastPayment.status': 'failed',
    'payment.failedAttempts': { $gte: 1 },
  });
};

quantumBillingSchema.statics.getRevenueStats = function(startDate, endDate) {
  const matchStage = {
    'payment.lastPayment.status': 'completed',
  };
  
  if (startDate || endDate) {
    matchStage['payment.lastPayment.date'] = {};
    if (startDate) matchStage['payment.lastPayment.date'].$gte = startDate;
    if (endDate) matchStage['payment.lastPayment.date'].$lte = endDate;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$subscription.plan',
        totalRevenue: { $sum: '$payment.lastPayment.amount' },
        customerCount: { $sum: 1 },
        avgRevenue: { $avg: '$payment.lastPayment.amount' },
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);
};

// Pre-save middleware
quantumBillingSchema.pre('save', function(next) {
  if (this.isNew) {
    // Set initial limits based on plan
    this.updateSubscription(this.subscription.plan, this.subscription.status);
  }
  next();
});

module.exports = mongoose.model('QuantumBilling', quantumBillingSchema);