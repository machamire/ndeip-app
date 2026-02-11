/**
 * QuantumUser Model - Methods & Utilities (Continuation)
 * Virtual fields, pre-save middleware, instance methods, and static methods
 */

// Virtual fields
QuantumUserSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`.trim();
});

QuantumUserSchema.virtual('displayNameOrFullName').get(function() {
  return this.profile.displayName || this.fullName;
});

QuantumUserSchema.virtual('isOnline').get(function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.auth.lastSeen > fiveMinutesAgo && this.profile.status === 'online';
});

QuantumUserSchema.virtual('isPremium').get(function() {
  return ['premium', 'quantum', 'enterprise'].includes(this.subscription.plan) && 
         this.subscription.status === 'active';
});

QuantumUserSchema.virtual('onboardingProgress').get(function() {
  return this.onboarding.completionPercentage;
});

QuantumUserSchema.virtual('isOnboardingComplete').get(function() {
  return this.onboarding.currentStep === 'completed';
});

QuantumUserSchema.virtual('accountAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // days
});

QuantumUserSchema.virtual('engagementLevel').get(function() {
  const analytics = this.usageAnalytics.engagementMetrics;
  if (!analytics || !analytics.engagementScore) return 'new';
  
  if (analytics.engagementScore >= 80) return 'high';
  if (analytics.engagementScore >= 60) return 'medium';
  if (analytics.engagementScore >= 30) return 'low';
  return 'inactive';
});

// Pre-save middleware
QuantumUserSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Set display name if not provided
  if (!this.profile.displayName) {
    this.profile.displayName = this.fullName;
  }

  // Generate referral code if not exists
  if (!this.referral.referralCode && this.isNew) {
    this.referral.referralCode = this.generateReferralCode();
  }

  // Update onboarding progress
  if (this.isModified('onboarding.completedSteps')) {
    this.updateOnboardingProgress();
  }

  // Update version
  if (this.isModified() && !this.isNew) {
    this.metadata.version += 1;
  }

  // Set location data if coordinates provided
  if (this.isModified('profile.location.coordinates')) {
    await this.updateLocationData();
  }

  next();
});

// Post-save middleware
QuantumUserSchema.post('save', function() {
  // Emit events for analytics
  if (this.wasNew) {
    this.constructor.emit('userRegistered', this);
  }
  
  if (this.isModified('onboarding.currentStep')) {
    this.constructor.emit('onboardingProgress', {
      userId: this._id,
      step: this.onboarding.currentStep,
      progress: this.onboarding.completionPercentage
    });
  }
});

// Instance methods
QuantumUserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

QuantumUserSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.auth.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.auth.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return token;
};

QuantumUserSchema.methods.generateVerificationToken = function(type = 'email') {
  const token = crypto.randomBytes(6).toString('hex').toUpperCase();
  if (type === 'email') {
    this.auth.emailVerificationToken = token;
  } else if (type === 'phone') {
    this.auth.phoneVerificationToken = token;
  }
  this.auth.verificationTokenExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  return token;
};

QuantumUserSchema.methods.generateTwoFactorSecret = function() {
  const secret = crypto.randomBytes(32).toString('base32');
  this.auth.twoFactorSecret = secret;
  return secret;
};

QuantumUserSchema.methods.generateBackupCodes = function() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  this.auth.backupCodes = codes;
  return codes;
};

QuantumUserSchema.methods.generateReferralCode = function() {
  const username = this.username.substring(0, 4).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${username}${random}`;
};

QuantumUserSchema.methods.updateLastSeen = function() {
  this.auth.lastSeen = new Date();
  return this.save({ validateBeforeSave: false });
};

QuantumUserSchema.methods.updateOnboardingProgress = function() {
  const totalSteps = this.onboarding.totalSteps;
  const completedSteps = this.onboarding.completedSteps.length;
  this.onboarding.completionPercentage = Math.round((completedSteps / totalSteps) * 100);
  
  if (completedSteps === totalSteps && this.onboarding.currentStep !== 'completed') {
    this.onboarding.currentStep = 'completed';
    this.onboarding.completedAt = new Date();
  }
};

QuantumUserSchema.methods.completeOnboardingStep = function(step, metadata = {}) {
  // Check if step already completed
  const existingStep = this.onboarding.completedSteps.find(s => s.step === step);
  if (existingStep) return false;

  // Add completed step
  this.onboarding.completedSteps.push({
    step,
    completedAt: new Date(),
    metadata
  });

  // Update current step to next in sequence
  const stepSequence = [
    'phone_verification',
    'email_verification',
    'profile_setup',
    'mesh_preferences',
    'privacy_settings',
    'ai_preferences',
    'contact_sync',
    'tutorial_intro',
    'first_message',
    'completed'
  ];

  const currentIndex = stepSequence.indexOf(step);
  if (currentIndex !== -1 && currentIndex < stepSequence.length - 1) {
    this.onboarding.currentStep = stepSequence[currentIndex + 1];
  }

  this.updateOnboardingProgress();
  return true;
};

QuantumUserSchema.methods.skipOnboardingStep = function(step, reason = '') {
  if (!this.onboarding.skippedSteps.includes(step)) {
    this.onboarding.skippedSteps.push(step);
  }
  
  // Move to next step
  return this.completeOnboardingStep(step, { skipped: true, reason });
};

QuantumUserSchema.methods.addDailyStats = function(stats) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existingStats = this.usageAnalytics.dailyStats.find(
    stat => stat.date.getTime() === today.getTime()
  );
  
  if (existingStats) {
    Object.assign(existingStats, stats);
  } else {
    this.usageAnalytics.dailyStats.push({
      date: today,
      ...stats,
    });
  }
  
  // Keep only last 90 days
  if (this.usageAnalytics.dailyStats.length > 90) {
    this.usageAnalytics.dailyStats = this.usageAnalytics.dailyStats
      .sort((a, b) => b.date - a.date)
      .slice(0, 90);
  }
  
  return this.save({ validateBeforeSave: false });
};

QuantumUserSchema.methods.updateEngagementMetrics = function(sessionData) {
  const metrics = this.usageAnalytics.engagementMetrics;
  
  metrics.sessionCount = (metrics.sessionCount || 0) + 1;
  metrics.lastEngagementDate = new Date();
  
  if (sessionData.duration) {
    const totalDuration = (metrics.averageSessionDuration || 0) * (metrics.sessionCount - 1);
    metrics.averageSessionDuration = (totalDuration + sessionData.duration) / metrics.sessionCount;
  }
  
  // Calculate engagement score (simplified algorithm)
  const recentActivity = Math.min(sessionData.actionsCount || 0, 100);
  const sessionLength = Math.min((sessionData.duration || 0) / 1000 / 60, 60); // max 60 minutes
  const featureUsage = Math.min((sessionData.featuresUsed || []).length, 10);
  
  const sessionScore = (recentActivity * 0.4) + (sessionLength * 0.3) + (featureUsage * 0.3);
  
  // Rolling average with previous score
  if (metrics.engagementScore) {
    metrics.engagementScore = (metrics.engagementScore * 0.7) + (sessionScore * 0.3);
  } else {
    metrics.engagementScore = sessionScore;
  }
  
  return this.save({ validateBeforeSave: false });
};

QuantumUserSchema.methods.updateMeshPreferences = function(preferences) {
  Object.assign(this.meshPreferences, preferences);
  return this.save();
};

QuantumUserSchema.methods.blockUser = function(userId, reason = '', reportedContent = []) {
  const existingBlock = this.privacySettings.blockedUsers.find(
    block => block.userId.toString() === userId.toString()
  );
  
  if (!existingBlock) {
    this.privacySettings.blockedUsers.push({
      userId,
      reason,
      reportedContent,
      blockedAt: new Date(),
    });
  }
  
  return this.save();
};

QuantumUserSchema.methods.unblockUser = function(userId) {
  this.privacySettings.blockedUsers = this.privacySettings.blockedUsers.filter(
    block => block.userId.toString() !== userId.toString()
  );
  
  return this.save();
};

QuantumUserSchema.methods.isBlocked = function(userId) {
  return this.privacySettings.blockedUsers.some(
    block => block.userId.toString() === userId.toString()
  );
};

QuantumUserSchema.methods.addContact = function(contactId, options = {}) {
  const existingContact = this.contacts.find(
    contact => contact.contactId.toString() === contactId.toString()
  );
  
  if (!existingContact) {
    this.contacts.push({
      contactId,
      ...options,
      addedAt: new Date(),
    });
  }
  
  return this.save();
};

QuantumUserSchema.methods.removeContact = function(contactId) {
  this.contacts = this.contacts.filter(
    contact => contact.contactId.toString() !== contactId.toString()
  );
  
  return this.save();
};

QuantumUserSchema.methods.updateContactInteraction = function(contactId, interactionData) {
  const contact = this.contacts.find(
    c => c.contactId.toString() === contactId.toString()
  );
  
  if (contact) {
    if (!contact.interactionStats) {
      contact.interactionStats = {
        totalMessages: 0,
        totalCalls: 0,
        lastInteraction: new Date(),
        averageResponseTime: 0,
        interactionScore: 0,
      };
    }
    
    Object.assign(contact.interactionStats, interactionData);
    contact.interactionStats.lastInteraction = new Date();
    
    return this.save({ validateBeforeSave: false });
  }
  
  return false;
};

QuantumUserSchema.methods.addTrustedDevice = function(deviceInfo) {
  const deviceId = crypto.createHash('sha256')
    .update(deviceInfo.userAgent + deviceInfo.platform)
    .digest('hex');
  
  const existingDevice = this.auth.trustedDevices.find(d => d.deviceId === deviceId);
  
  if (!existingDevice) {
    this.auth.trustedDevices.push({
      deviceId,
      deviceName: deviceInfo.deviceName || 'Unknown Device',
      platform: deviceInfo.platform,
      addedAt: new Date(),
      lastUsed: new Date(),
      isActive: true,
    });
  } else {
    existingDevice.lastUsed = new Date();
    existingDevice.isActive = true;
  }
  
  return this.save();
};

QuantumUserSchema.methods.revokeTrustedDevice = function(deviceId) {
  const device = this.auth.trustedDevices.find(d => d.deviceId === deviceId);
  if (device) {
    device.isActive = false;
  }
  return this.save();
};

QuantumUserSchema.methods.addSession = function(sessionData) {
  // Remove old inactive sessions (keep last 10)
  this.auth.sessions = this.auth.sessions
    .filter(s => s.isActive)
    .sort((a, b) => b.lastActivity - a.lastActivity)
    .slice(0, 9);
  
  // Add new session
  this.auth.sessions.push({
    ...sessionData,
    createdAt: new Date(),
    lastActivity: new Date(),
    isActive: true,
  });
  
  return this.save({ validateBeforeSave: false });
};

QuantumUserSchema.methods.updateSessionActivity = function(sessionId) {
  const session = this.auth.sessions.find(s => s.sessionId === sessionId);
  if (session) {
    session.lastActivity = new Date();
    return this.save({ validateBeforeSave: false });
  }
  return false;
};

QuantumUserSchema.methods.revokeSession = function(sessionId) {
  const session = this.auth.sessions.find(s => s.sessionId === sessionId);
  if (session) {
    session.isActive = false;
  }
  return this.save();
};

QuantumUserSchema.methods.revokeAllSessions = function() {
  this.auth.sessions.forEach(session => {
    session.isActive = false;
  });
  return this.save();
};

QuantumUserSchema.methods.unlockAchievement = function(achievementType, progress = 100) {
  const existingAchievement = this.achievements.find(a => a.type === achievementType);
  
  if (!existingAchievement) {
    this.achievements.push({
      type: achievementType,
      unlockedAt: progress >= 100 ? new Date() : null,
      progress,
      isVisible: true,
    });
  } else if (existingAchievement.progress < progress) {
    existingAchievement.progress = progress;
    if (progress >= 100 && !existingAchievement.unlockedAt) {
      existingAchievement.unlockedAt = new Date();
    }
  }
  
  return this.save({ validateBeforeSave: false });
};

QuantumUserSchema.methods.addReferral = function(referredUserId) {
  this.referral.referrals.push({
    userId: referredUserId,
    dateReferred: new Date(),
    rewardEarned: 0,
    status: 'pending',
  });
  
  this.referral.totalReferrals += 1;
  return this.save();
};

QuantumUserSchema.methods.updateLocationData = async function() {
  // This would typically use a geocoding service
  // For now, we'll just update the location fields if they exist
  if (this.profile.location.coordinates) {
    // Placeholder for reverse geocoding
    // In production, you'd call a service like Google Maps API
  }
};

QuantumUserSchema.methods.toSafeObject = function() {
  const user = this.toObject();
  
  // Remove sensitive fields
  delete user.password;
  delete user.auth.twoFactorSecret;
  delete user.auth.backupCodes;
  delete user.auth.passwordResetToken;
  delete user.auth.emailVerificationToken;
  delete user.auth.phoneVerificationToken;
  delete user.auth.sessions;
  delete user.auth.trustedDevices;
  
  return user;
};

QuantumUserSchema.methods.toPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    profile: {
      displayName: this.displayNameOrFullName,
      avatar: this.profile.avatar,
      about: this.profile.about,
      status: this.profile.status,
      customStatus: this.profile.customStatus,
    },
    isOnline: this.isOnline,
    lastSeen: this.auth.lastSeen,
    achievements: this.achievements.filter(a => a.isVisible && a.unlockedAt),
    meshPreferences: {
      crystallineStyle: this.meshPreferences.crystallineStyle,
      colorScheme: this.meshPreferences.colorScheme,
    },
  };
};

QuantumUserSchema.methods.toMinimalProfile = function() {
  return {
    id: this._id,
    username: this.username,
    displayName: this.displayNameOrFullName,
    avatar: this.profile.avatar?.thumbnailUrl || this.profile.avatar?.url,
    isOnline: this.isOnline,
    status: this.profile.status,
  };
};

QuantumUserSchema.methods.toAdminView = function() {
  const user = this.toSafeObject();
  
  // Add admin-specific fields
  user.adminMetrics = {
    accountAge: this.accountAge,
    engagementLevel: this.engagementLevel,
    onboardingProgress: this.onboardingProgress,
    totalSessions: this.auth.sessions.length,
    lastLogin: this.auth.lastLogin,
    subscription: this.subscription,
    referralStats: {
      totalReferrals: this.referral.totalReferrals,
      totalRewards: this.referral.totalRewards,
    },
  };
  
  return user;
};

// Static methods
QuantumUserSchema.statics.findByUsername = function(username) {
  return this.findOne({ username, isActive: true, isDeleted: false });
};

QuantumUserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email, isActive: true, isDeleted: false });
};

QuantumUserSchema.statics.findByPhoneNumber = function(phoneNumber) {
  return this.findOne({ phoneNumber, isActive: true, isDeleted: false });
};

QuantumUserSchema.statics.findByReferralCode = function(referralCode) {
  return this.findOne({ 
    'referral.referralCode': referralCode, 
    isActive: true, 
    isDeleted: false 
  });
};

QuantumUserSchema.statics.findByResetToken = function(token) {
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
    
  return this.findOne({
    'auth.passwordResetToken': hashedToken,
    'auth.passwordResetExpires': { $gt: Date.now() },
    isActive: true,
    isDeleted: false,
  });
};

QuantumUserSchema.statics.findByVerificationToken = function(token, type = 'email') {
  const query = {
    'auth.verificationTokenExpires': { $gt: Date.now() },
    isActive: true,
    isDeleted: false,
  };
  
  if (type === 'email') {
    query['auth.emailVerificationToken'] = token;
  } else if (type === 'phone') {
    query['auth.phoneVerificationToken'] = token;
  }
  
  return this.findOne(query);
};

QuantumUserSchema.statics.getActiveUsers = function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.find({
    'auth.lastSeen': { $gte: fiveMinutesAgo },
    'profile.status': { $ne: 'offline' },
    isActive: true,
    isDeleted: false,
  });
};

QuantumUserSchema.statics.getOnlineUsers = function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.find({
    'auth.lastSeen': { $gte: fiveMinutesAgo },
    'profile.status': 'online',
    isActive: true,
    isDeleted: false,
  });
};

QuantumUserSchema.statics.getUsersByMeshPreference = function(preference, value) {
  const query = {
    [`meshPreferences.${preference}`]: value,
    isActive: true,
    isDeleted: false,
  };
  return this.find(query);
};

QuantumUserSchema.statics.getUsersBySubscription = function(plan) {
  return this.find({
    'subscription.plan': plan,
    'subscription.status': 'active',
    isActive: true,
    isDeleted: false,
  });
};

QuantumUserSchema.statics.getNewUsers = function(days = 7) {
  const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
  return this.find({
    createdAt: { $gte: startDate },
    isActive: true,
    isDeleted: false,
  });
};

QuantumUserSchema.statics.getUsersCompletingOnboarding = function(step) {
  return this.find({
    'onboarding.currentStep': step,
    isActive: true,
    isDeleted: false,
  });
};

QuantumUserSchema.statics.getEngagementStats = async function() {
  const pipeline = [
    {
      $match: { 
        isActive: true, 
        isDeleted: false 
      }
    },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: {
            $cond: [
              { 
                $gte: ['$auth.lastSeen', new Date(Date.now() - 24 * 60 * 60 * 1000)]
              },
              1,
              0
            ]
          }
        },
        onboardingComplete: {
          $sum: {
            $cond: [
              { $eq: ['$onboarding.currentStep', 'completed'] },
              1,
              0
            ]
          }
        },
        premiumUsers: {
          $sum: {
            $cond: [
              { 
                $and: [
                  { $in: ['$subscription.plan', ['premium', 'quantum', 'enterprise']] },
                  { $eq: ['$subscription.status', 'active'] }
                ]
              },
              1,
              0
            ]
          }
        },
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalUsers: 0,
    activeUsers: 0,
    onboardingComplete: 0,
    premiumUsers: 0,
  };
};

QuantumUserSchema.statics.getLocationStats = async function() {
  const pipeline = [
    {
      $match: { 
        isActive: true, 
        isDeleted: false,
        'profile.location.countryCode': { $exists: true }
      }
    },
    {
      $group: {
        _id: '$profile.location.countryCode',
        count: { $sum: 1 },
        country: { $first: '$profile.location.country' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 50
    }
  ];
  
  return this.aggregate(pipeline);
};

QuantumUserSchema.statics.getMeshPreferenceStats = async function() {
  const pipeline = [
    {
      $match: { 
        isActive: true, 
        isDeleted: false 
      }
    },
    {
      $group: {
        _id: '$meshPreferences.crystallineStyle',
        count: { $sum: 1 },
        avgIntensity: { $avg: '$meshPreferences.intensity' },
        avgAnimationSpeed: { $avg: '$meshPreferences.animationSpeed' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Event emitters (for analytics and notifications)
QuantumUserSchema.statics.EventEmitter = require('events');
const userEvents = new QuantumUserSchema.statics.EventEmitter();

// Export the model
module.exports = mongoose.model('QuantumUser', QuantumUserSchema);
module.exports.userEvents = userEvents;