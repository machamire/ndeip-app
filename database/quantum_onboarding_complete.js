/**
 * QuantumOnboarding Model - Complete Implementation (Continuation)
 * Registration tracking, verification, setup preferences, and analytics
 */

    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    utmTerm: String,
    utmContent: String,
    deviceInfo: {
      platform: String, // ios, android, web
      deviceModel: String,
      osVersion: String,
      appVersion: String,
      screenResolution: String,
      timezone: String,
      language: String,
    },
    networkInfo: {
      ipAddress: String,
      country: String,
      countryCode: String,
      region: String,
      city: String,
      isp: String,
      connectionType: String, // wifi, cellular, ethernet
    },
  },

  // Current Progress
  currentStep: {
    type: String,
    enum: [
      'registration_started',
      'phone_verification',
      'email_verification',
      'profile_setup',
      'mesh_preferences',
      'privacy_settings',
      'ai_preferences',
      'notification_setup',
      'contact_sync',
      'tutorial_intro',
      'first_message',
      'onboarding_complete'
    ],
    default: 'registration_started',
  },
  
  stepProgress: {
    totalSteps: {
      type: Number,
      default: 11,
    },
    completedSteps: {
      type: Number,
      default: 0,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    currentStepStartedAt: {
      type: Date,
      default: Date.now,
    },
    estimatedTimeRemaining: Number, // in seconds
  },

  // Verification Process
  verification: {
    phone: {
      isRequired: {
        type: Boolean,
        default: true,
      },
      isCompleted: {
        type: Boolean,
        default: false,
      },
      attempts: [VerificationAttemptSchema],
      completedAt: Date,
      totalAttempts: {
        type: Number,
        default: 0,
      },
      lastAttemptAt: Date,
      lockedUntil: Date,
      preferredMethod: {
        type: String,
        enum: ['sms', 'call', 'whatsapp'],
        default: 'sms',
      },
    },
    email: {
      isRequired: {
        type: Boolean,
        default: true,
      },
      isCompleted: {
        type: Boolean,
        default: false,
      },
      attempts: [VerificationAttemptSchema],
      completedAt: Date,
      totalAttempts: {
        type: Number,
        default: 0,
      },
      lastAttemptAt: Date,
      lockedUntil: Date,
    },
    captcha: {
      isRequired: {
        type: Boolean,
        default: false,
      },
      isCompleted: {
        type: Boolean,
        default: false,
      },
      attempts: [VerificationAttemptSchema],
      completedAt: Date,
      provider: String, // recaptcha, hcaptcha, etc.
    },
    deviceVerification: {
      isRequired: {
        type: Boolean,
        default: false,
      },
      isCompleted: {
        type: Boolean,
        default: false,
      },
      deviceFingerprint: String,
      riskScore: Number,
      completedAt: Date,
    },
  },

  // Profile Setup
  profileSetup: {
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    timeSpent: Number, // in seconds
    fields: {
      firstName: {
        completed: Boolean,
        timeSpent: Number,
      },
      lastName: {
        completed: Boolean,
        timeSpent: Number,
      },
      username: {
        completed: Boolean,
        timeSpent: Number,
        attemptsCount: Number,
        rejectedUsernames: [String],
      },
      avatar: {
        completed: Boolean,
        timeSpent: Number,
        source: String, // camera, gallery, default, skip
      },
      about: {
        completed: Boolean,
        timeSpent: Number,
        skipped: Boolean,
      },
      dateOfBirth: {
        completed: Boolean,
        timeSpent: Number,
        skipped: Boolean,
      },
    },
    helpRequested: [String], // array of field names where help was requested
  },

  // Setup Preferences
  setupPreferences: [SetupPreferenceSchema],

  // Tutorial Progress
  tutorial: {
    isStarted: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    startedAt: Date,
    completedAt: Date,
    totalTimeSpent: Number, // in seconds
    sectionsCompleted: {
      type: Number,
      default: 0,
    },
    totalSections: {
      type: Number,
      default: 10,
    },
    progress: [TutorialProgressSchema],
    overallRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: String,
    improvementSuggestions: [String],
  },

  // Contact Sync
  contactSync: {
    isAttempted: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    attempts: [ContactSyncSchema],
    totalContactsFound: {
      type: Number,
      default: 0,
    },
    totalContactsImported: {
      type: Number,
      default: 0,
    },
    completedAt: Date,
    skipped: {
      type: Boolean,
      default: false,
    },
    skipReason: String,
  },

  // First Interaction
  firstInteraction: {
    messageType: {
      type: String,
      enum: ['text', 'voice', 'media', 'sticker', 'emoji'],
    },
    sentAt: Date,
    recipientType: {
      type: String,
      enum: ['contact', 'group', 'broadcast'],
    },
    isSuccessful: {
      type: Boolean,
      default: false,
    },
    deliveryTime: Number, // in milliseconds
    responseReceived: {
      type: Boolean,
      default: false,
    },
    responseTime: Number, // in milliseconds
  },

  // Completion Status
  completion: {
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    totalTimeSpent: Number, // in seconds
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    stepsSkipped: [String],
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    welcomeRewardClaimed: {
      type: Boolean,
      default: false,
    },
  },

  // User Experience Metrics
  userExperience: {
    difficulty: {
      type: String,
      enum: ['very_easy', 'easy', 'moderate', 'difficult', 'very_difficult'],
    },
    satisfaction: {
      type: Number,
      min: 1,
      max: 10,
    },
    likelyToRecommend: {
      type: Number,
      min: 0,
      max: 10,
    },
    mostHelpfulFeature: String,
    mostConfusingStep: String,
    improvementSuggestions: [String],
    additionalFeedback: String,
    followUpContact: {
      type: Boolean,
      default: false,
    },
  },

  // Abandonment Tracking
  abandonment: {
    isAbandoned: {
      type: Boolean,
      default: false,
    },
    abandonedAt: Date,
    abandonedStep: String,
    timeBeforeAbandonment: Number, // in seconds
    reason: {
      type: String,
      enum: [
        'too_complicated',
        'too_long',
        'technical_issues',
        'privacy_concerns',
        'not_interested',
        'found_alternative',
        'other'
      ],
    },
    returnAttempts: [{
      attemptedAt: Date,
      stepResumed: String,
      completed: Boolean,
    }],
    recoveryEmailSent: {
      type: Boolean,
      default: false,
    },
    recoveryEmailOpenedAt: Date,
  },

  // A/B Testing
  experiments: [{
    experimentId: String,
    variant: String,
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    completed: Boolean,
    conversionEvent: String,
    convertedAt: Date,
  }],

  // Analytics & Metrics
  analytics: {
    pageViews: [{
      page: String,
      viewedAt: Date,
      timeSpent: Number,
      previousPage: String,
      nextPage: String,
    }],
    interactions: [{
      type: String, // click, tap, swipe, etc.
      element: String,
      timestamp: Date,
      value: String,
    }],
    errors: [{
      type: String,
      message: String,
      stack: String,
      timestamp: Date,
      resolved: Boolean,
    }],
    performance: {
      loadTimes: [{
        step: String,
        loadTime: Number, // in milliseconds
        timestamp: Date,
      }],
      averageLoadTime: Number,
      slowestStep: String,
      fastestStep: String,
    },
  },

  // Admin Notes
  adminNotes: [{
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumUser',
    },
    note: String,
    category: {
      type: String,
      enum: ['support', 'fraud', 'technical', 'feedback', 'other'],
    },
    isInternal: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],

  // System Fields
  isActive: {
    type: Boolean,
    default: true,
  },
  metadata: {
    version: {
      type: Number,
      default: 1,
    },
    migrationFlags: [String],
    debugInfo: Object,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for performance
QuantumOnboardingSchema.index({ userId: 1 }, { unique: true });
QuantumOnboardingSchema.index({ sessionId: 1 }, { unique: true });
QuantumOnboardingSchema.index({ currentStep: 1 });
QuantumOnboardingSchema.index({ 'completion.isCompleted': 1 });
QuantumOnboardingSchema.index({ 'abandonment.isAbandoned': 1 });
QuantumOnboardingSchema.index({ 'registration.startedAt': 1 });
QuantumOnboardingSchema.index({ 'completion.completedAt': 1 });

// Compound indexes
QuantumOnboardingSchema.index({ currentStep: 1, 'registration.startedAt': 1 });
QuantumOnboardingSchema.index({ 'completion.isCompleted': 1, 'completion.completedAt': 1 });
QuantumOnboardingSchema.index({ 'registration.source': 1, 'completion.isCompleted': 1 });

// Virtual fields
QuantumOnboardingSchema.virtual('timeSpentOnboarding').get(function() {
  if (this.completion.completedAt && this.registration.startedAt) {
    return Math.floor((this.completion.completedAt - this.registration.startedAt) / 1000);
  }
  return null;
});

QuantumOnboardingSchema.virtual('isStuck').get(function() {
  if (this.completion.isCompleted) return false;
  
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  return this.stepProgress.currentStepStartedAt < thirtyMinutesAgo;
});

QuantumOnboardingSchema.virtual('progressPercentage').get(function() {
  return this.stepProgress.completionPercentage;
});

QuantumOnboardingSchema.virtual('estimatedCompletion').get(function() {
  if (this.completion.isCompleted) return null;
  
  const avgTimePerStep = this.timeSpentOnboarding / this.stepProgress.completedSteps || 300; // 5 minutes default
  const remainingSteps = this.stepProgress.totalSteps - this.stepProgress.completedSteps;
  
  return new Date(Date.now() + (remainingSteps * avgTimePerStep * 1000));
});

// Pre-save middleware
QuantumOnboardingSchema.pre('save', function(next) {
  // Update completion percentage
  this.stepProgress.completionPercentage = Math.round(
    (this.stepProgress.completedSteps / this.stepProgress.totalSteps) * 100
  );
  
  // Check if onboarding is complete
  if (this.stepProgress.completionPercentage === 100 && !this.completion.isCompleted) {
    this.completion.isCompleted = true;
    this.completion.completedAt = new Date();
    this.currentStep = 'onboarding_complete';
  }
  
  // Update total time spent
  if (this.completion.completedAt && this.registration.startedAt) {
    this.completion.totalTimeSpent = Math.floor(
      (this.completion.completedAt - this.registration.startedAt) / 1000
    );
  }
  
  // Update version
  if (this.isModified() && !this.isNew) {
    this.metadata.version += 1;
  }
  
  next();
});

// Post-save middleware
QuantumOnboardingSchema.post('save', function() {
  // Emit events for analytics
  if (this.isModified('currentStep')) {
    this.constructor.emit('stepChanged', {
      userId: this.userId,
      fromStep: this.getPrevious('currentStep'),
      toStep: this.currentStep,
      timestamp: new Date(),
    });
  }
  
  if (this.completion.isCompleted && this.isModified('completion.isCompleted')) {
    this.constructor.emit('onboardingCompleted', {
      userId: this.userId,
      timeSpent: this.completion.totalTimeSpent,
      completionRate: this.completion.completionRate,
      timestamp: this.completion.completedAt,
    });
  }
  
  if (this.abandonment.isAbandoned && this.isModified('abandonment.isAbandoned')) {
    this.constructor.emit('onboardingAbandoned', {
      userId: this.userId,
      step: this.abandonment.abandonedStep,
      reason: this.abandonment.reason,
      timestamp: this.abandonment.abandonedAt,
    });
  }
});

// Instance methods
QuantumOnboardingSchema.methods.advanceToStep = function(step, metadata = {}) {
  const stepSequence = [
    'registration_started',
    'phone_verification',
    'email_verification',
    'profile_setup',
    'mesh_preferences',
    'privacy_settings',
    'ai_preferences',
    'notification_setup',
    'contact_sync',
    'tutorial_intro',
    'first_message',
    'onboarding_complete'
  ];
  
  const currentIndex = stepSequence.indexOf(this.currentStep);
  const nextIndex = stepSequence.indexOf(step);
  
  if (nextIndex > currentIndex) {
    this.currentStep = step;
    this.stepProgress.completedSteps = nextIndex;
    this.stepProgress.currentStepStartedAt = new Date();
    
    // Add metadata if provided
    if (Object.keys(metadata).length > 0) {
      this.analytics.interactions.push({
        type: 'step_advance',
        element: step,
        timestamp: new Date(),
        value: JSON.stringify(metadata),
      });
    }
    
    return true;
  }
  
  return false;
};

QuantumOnboardingSchema.methods.completeStep = function(step, data = {}) {
  switch (step) {
    case 'phone_verification':
      this.verification.phone.isCompleted = true;
      this.verification.phone.completedAt = new Date();
      break;
      
    case 'email_verification':
      this.verification.email.isCompleted = true;
      this.verification.email.completedAt = new Date();
      break;
      
    case 'profile_setup':
      this.profileSetup.isCompleted = true;
      this.profileSetup.completedAt = new Date();
      if (data.timeSpent) this.profileSetup.timeSpent = data.timeSpent;
      break;
      
    case 'contact_sync':
      this.contactSync.isCompleted = true;
      this.contactSync.completedAt = new Date();
      if (data.contactsImported) {
        this.contactSync.totalContactsImported = data.contactsImported;
      }
      break;
      
    case 'tutorial_intro':
      this.tutorial.isCompleted = true;
      this.tutorial.completedAt = new Date();
      if (data.timeSpent) this.tutorial.totalTimeSpent = data.timeSpent;
      break;
      
    case 'first_message':
      this.firstInteraction.sentAt = new Date();
      this.firstInteraction.isSuccessful = true;
      if (data.messageType) this.firstInteraction.messageType = data.messageType;
      if (data.deliveryTime) this.firstInteraction.deliveryTime = data.deliveryTime;
      break;
  }
  
  // Advance to next step
  return this.advanceToNextStep();
};

QuantumOnboardingSchema.methods.advanceToNextStep = function() {
  const stepSequence = [
    'registration_started',
    'phone_verification',
    'email_verification',
    'profile_setup',
    'mesh_preferences',
    'privacy_settings',
    'ai_preferences',
    'notification_setup',
    'contact_sync',
    'tutorial_intro',
    'first_message',
    'onboarding_complete'
  ];
  
  const currentIndex = stepSequence.indexOf(this.currentStep);
  if (currentIndex < stepSequence.length - 1) {
    const nextStep = stepSequence[currentIndex + 1];
    return this.advanceToStep(nextStep);
  }
  
  return false;
};

QuantumOnboardingSchema.methods.skipStep = function(step, reason = '') {
  this.completion.stepsSkipped.push(step);
  
  // Add skip tracking to analytics
  this.analytics.interactions.push({
    type: 'step_skip',
    element: step,
    timestamp: new Date(),
    value: reason,
  });
  
  return this.advanceToNextStep();
};

QuantumOnboardingSchema.methods.addVerificationAttempt = function(type, attemptData) {
  const verification = this.verification[type];
  if (!verification) return false;
  
  verification.attempts.push({
    type,
    ...attemptData,
    attemptedAt: new Date(),
  });
  
  verification.totalAttempts += 1;
  verification.lastAttemptAt = new Date();
  
  // Lock if too many failed attempts
  if (verification.totalAttempts >= 5) {
    verification.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  }
  
  return true;
};

QuantumOnboardingSchema.methods.addTutorialProgress = function(section, data = {}) {
  this.tutorial.progress.push({
    section,
    ...data,
    startedAt: new Date(),
  });
  
  if (!this.tutorial.isStarted) {
    this.tutorial.isStarted = true;
    this.tutorial.startedAt = new Date();
  }
  
  return true;
};

QuantumOnboardingSchema.methods.completeTutorialSection = function(section, data = {}) {
  const progress = this.tutorial.progress.find(p => p.section === section);
  if (progress) {
    progress.completedAt = new Date();
    if (data.timeSpent) progress.timeSpent = data.timeSpent;
    if (data.rating) progress.rating = data.rating;
    if (data.feedback) progress.feedback = data.feedback;
    
    this.tutorial.sectionsCompleted += 1;
    
    // Complete tutorial if all sections done
    if (this.tutorial.sectionsCompleted >= this.tutorial.totalSections) {
      this.tutorial.isCompleted = true;
      this.tutorial.completedAt = new Date();
    }
  }
  
  return true;
};

QuantumOnboardingSchema.methods.addContactSyncAttempt = function(syncData) {
  this.contactSync.attempts.push({
    ...syncData,
    attemptedAt: new Date(),
  });
  
  this.contactSync.isAttempted = true;
  
  if (syncData.isSuccessful) {
    this.contactSync.isCompleted = true;
    this.contactSync.completedAt = new Date();
    
    if (syncData.contactsFound) {
      this.contactSync.totalContactsFound += syncData.contactsFound;
    }
    if (syncData.contactsImported) {
      this.contactSync.totalContactsImported += syncData.contactsImported;
    }
  }
  
  return true;
};

QuantumOnboardingSchema.methods.markAbandoned = function(reason = '', step = null) {
  this.abandonment.isAbandoned = true;
  this.abandonment.abandonedAt = new Date();
  this.abandonment.abandonedStep = step || this.currentStep;
  this.abandonment.reason = reason;
  
  if (this.registration.startedAt) {
    this.abandonment.timeBeforeAbandonment = Math.floor(
      (Date.now() - this.registration.startedAt) / 1000
    );
  }
  
  return this.save();
};

QuantumOnboardingSchema.methods.addReturnAttempt = function(stepResumed) {
  this.abandonment.returnAttempts.push({
    attemptedAt: new Date(),
    stepResumed,
    completed: false,
  });
  
  // Unmark as abandoned if they return
  this.abandonment.isAbandoned = false;
  
  return true;
};

QuantumOnboardingSchema.methods.addPageView = function(page, previousPage = null) {
  this.analytics.pageViews.push({
    page,
    viewedAt: new Date(),
    previousPage,
  });
  
  return true;
};

QuantumOnboardingSchema.methods.addInteraction = function(type, element, value = '') {
  this.analytics.interactions.push({
    type,
    element,
    timestamp: new Date(),
    value,
  });
  
  return true;
};

QuantumOnboardingSchema.methods.addError = function(type, message, stack = '') {
  this.analytics.errors.push({
    type,
    message,
    stack,
    timestamp: new Date(),
    resolved: false,
  });
  
  return true;
};

QuantumOnboardingSchema.methods.addPerformanceMetric = function(step, loadTime) {
  this.analytics.performance.loadTimes.push({
    step,
    loadTime,
    timestamp: new Date(),
  });
  
  // Update averages
  const loadTimes = this.analytics.performance.loadTimes;
  this.analytics.performance.averageLoadTime = 
    loadTimes.reduce((sum, lt) => sum + lt.loadTime, 0) / loadTimes.length;
    
  // Update slowest/fastest
  const sorted = loadTimes.sort((a, b) => b.loadTime - a.loadTime);
  this.analytics.performance.slowestStep = sorted[0]?.step;
  this.analytics.performance.fastestStep = sorted[sorted.length - 1]?.step;
  
  return true;
};

QuantumOnboardingSchema.methods.addExperiment = function(experimentId, variant) {
  this.experiments.push({
    experimentId,
    variant,
    assignedAt: new Date(),
    completed: false,
  });
  
  return true;
};

QuantumOnboardingSchema.methods.completeExperiment = function(experimentId, conversionEvent) {
  const experiment = this.experiments.find(e => e.experimentId === experimentId);
  if (experiment) {
    experiment.completed = true;
    experiment.conversionEvent = conversionEvent;
    experiment.convertedAt = new Date();
  }
  
  return true;
};

QuantumOnboardingSchema.methods.addAdminNote = function(adminId, note, category = 'other') {
  this.adminNotes.push({
    adminId,
    note,
    category,
    createdAt: new Date(),
  });
  
  return this.save();
};

QuantumOnboardingSchema.methods.toSummary = function() {
  return {
    userId: this.userId,
    currentStep: this.currentStep,
    progress: this.stepProgress.completionPercentage,
    isCompleted: this.completion.isCompleted,
    isAbandoned: this.abandonment.isAbandoned,
    timeSpent: this.timeSpentOnboarding,
    source: this.registration.source,
    startedAt: this.registration.startedAt,
    completedAt: this.completion.completedAt,
  };
};

// Static methods
QuantumOnboardingSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId, isActive: true });
};

QuantumOnboardingSchema.statics.findBySessionId = function(sessionId) {
  return this.findOne({ sessionId, isActive: true });
};

QuantumOnboardingSchema.statics.findIncompleteOnboarding = function() {
  return this.find({
    'completion.isCompleted': false,
    'abandonment.isAbandoned': false,
    isActive: true,
  });
};

QuantumOnboardingSchema.statics.findStuckUsers = function() {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  return this.find({
    'completion.isCompleted': false,
    'abandonment.isAbandoned': false,
    'stepProgress.currentStepStartedAt': { $lt: thirtyMinutesAgo },
    isActive: true,
  });
};

QuantumOnboardingSchema.statics.findAbandonedUsers = function(days = 1) {
  const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
  return this.find({
    'abandonment.isAbandoned': true,
    'abandonment.abandonedAt': { $gte: cutoffDate },
    isActive: true,
  });
};

QuantumOnboardingSchema.statics.getCompletionStats = async function(timeframe = 'day') {
  let matchStage = { isActive: true };
  
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
        _id: null,
        totalStarted: { $sum: 1 },
        totalCompleted: {
          $sum: { $cond: [{ $eq: ['$completion.isCompleted', true] }, 1, 0] }
        },
        totalAbandoned: {
          $sum: { $cond: [{ $eq: ['$abandonment.isAbandoned', true] }, 1, 0] }
        },
        avgCompletionTime: {
          $avg: '$completion.totalTimeSpent'
        },
        avgCompletionRate: {
          $avg: '$stepProgress.completionPercentage'
        },
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalStarted: 0,
    totalCompleted: 0,
    totalAbandoned: 0,
    avgCompletionTime: 0,
    avgCompletionRate: 0,
  };
};

QuantumOnboardingSchema.statics.getStepAnalytics = async function() {
  const pipeline = [
    { $match: { isActive: true } },
    { $unwind: '$analytics.pageViews' },
    {
      $group: {
        _id: '$analytics.pageViews.page',
        totalViews: { $sum: 1 },
        avgTimeSpent: { $avg: '$analytics.pageViews.timeSpent' },
        uniqueUsers: { $addToSet: '$userId' },
      }
    },
    {
      $project: {
        step: '$_id',
        totalViews: 1,
        avgTimeSpent: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
      }
    },
    { $sort: { totalViews: -1 } }
  ];
  
  return this.aggregate(pipeline);
};

QuantumOnboardingSchema.statics.getSourceAnalytics = async function() {
  const pipeline = [
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$registration.source',
        count: { $sum: 1 },
        completionRate: {
          $avg: { $cond: [{ $eq: ['$completion.isCompleted', true] }, 100, 0] }
        },
        avgTimeToComplete: {
          $avg: '$completion.totalTimeSpent'
        },
      }
    },
    { $sort: { count: -1 }