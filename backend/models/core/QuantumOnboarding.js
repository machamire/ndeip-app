/**
 * QuantumOnboarding Model - New User Registration & Setup Flow
 * Tracks user onboarding progress, validation steps, and initial setup
 * Supports admin dashboard analytics for registration trends
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

// Verification attempt schema
const VerificationAttemptSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['phone', 'email', 'captcha', 'device'],
    required: true,
  },
  method: {
    type: String,
    enum: ['sms', 'call', 'email', 'whatsapp', 'push'],
  },
  code: String,
  attemptedAt: {
    type: Date,
    default: Date.now,
  },
  isSuccessful: {
    type: Boolean,
    default: false,
  },
  failureReason: String,
  ipAddress: String,
  userAgent: String,
  deviceFingerprint: String,
}, { _id: false });

// Setup preference schema
const SetupPreferenceSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['mesh', 'privacy', 'ai', 'notifications', 'contacts'],
    required: true,
  },
  preferences: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
  timeSpent: Number, // in seconds
  helpRequested: {
    type: Boolean,
    default: false,
  },
  skipped: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

// Tutorial progress schema
const TutorialProgressSchema = new mongoose.Schema({
  section: {
    type: String,
    enum: [
      'welcome',
      'messaging_basics',
      'mesh_features',
      'voice_calls',
      'media_sharing',
      'groups',
      'privacy_controls',
      'ai_features',
      'customization',
      'completion'
    ],
    required: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
  timeSpent: Number, // in seconds
  interactions: Number,
  helpRequested: {
    type: Boolean,
    default: false,
  },
  skipped: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  feedback: String,
}, { _id: false });

// Contact sync attempt schema
const ContactSyncSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['phone', 'google', 'apple', 'facebook', 'manual'],
    required: true,
  },
  attemptedAt: {
    type: Date,
    default: Date.now,
  },
  isSuccessful: {
    type: Boolean,
    default: false,
  },
  contactsFound: {
    type: Number,
    default: 0,
  },
  contactsImported: {
    type: Number,
    default: 0,
  },
  permissionGranted: {
    type: Boolean,
    default: false,
  },
  errorMessage: String,
  skipped: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

// Main Onboarding Schema
const QuantumOnboardingSchema = new mongoose.Schema({
  // Basic Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumUser',
    required: true,
    unique: true,
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },

  // Registration Details
  registration: {
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    source: {
      type: String,
      enum: ['organic', 'referral', 'social_media', 'advertisement', 'word_of_mouth', 'other'],
      default: 'organic',
    },
    referralCode: String,
    referringUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuantumUser',
    },
    campaign: {
      id: String,
      name: String,
      medium: String,
      source: String,
    },
    deviceInfo: {
      platform: String,
      model: String,
      osVersion: String,
      appVersion: String,
      screenSize: String,
      language: String,
      timezone: String,
    },
    locationInfo: {
      country: String,
      region: String,
      city: String,
      ipAddress: String,
    },
  },

  // Current Progress
  currentStep: {
    type: String,
    enum: [
      'registration',
      'email_verification',
      'phone_verification',
      'profile_setup',
      'privacy_setup',
      'mesh_setup',
      'ai_setup',
      'contact_sync',
      'tutorial',
      'completed'
    ],
    default: 'registration',
  },

  // Step Progress Tracking
  steps: {
    registration: {
      completed: {
        type: Boolean,
        default: false,
      },
      completedAt: Date,
      attempts: {
        type: Number,
        default: 0,
      },
      timeSpent: Number,
    },
    emailVerification: {
      completed: {
        type: Boolean,
        default: false,
      },
      completedAt: Date,
      attempts: [VerificationAttemptSchema],
      timeSpent: Number,
    },
    phoneVerification: {
      completed: {
        type: Boolean,
        default: false,
      },
      completedAt: Date,
      attempts: [VerificationAttemptSchema],
      timeSpent: Number,
    },
    profileSetup: {
      completed: {
        type: Boolean,
        default: false,
      },
      completedAt: Date,
      fieldsCompleted: [String],
      avatarUploaded: {
        type: Boolean,
        default: false,
      },
      timeSpent: Number,
    },
    privacySetup: {
      completed: {
        type: Boolean,
        default: false,
      },
      completedAt: Date,
      preferences: [SetupPreferenceSchema],
      timeSpent: Number,
    },
    meshSetup: {
      completed: {
        type: Boolean,
        default: false,
      },
      completedAt: Date,
      preferences: [SetupPreferenceSchema],
      timeSpent: Number,
    },
    aiSetup: {
      completed: {
        type: Boolean,
        default: false,
      },
      completedAt: Date,
      preferences: [SetupPreferenceSchema],
      timeSpent: Number,
    },
    contactSync: {
      completed: {
        type: Boolean,
        default: false,
      },
      completedAt: Date,
      attempts: [ContactSyncSchema],
      timeSpent: Number,
    },
    tutorial: {
      completed: {
        type: Boolean,
        default: false,
      },
      completedAt: Date,
      progress: [TutorialProgressSchema],
      timeSpent: Number,
    },
  },

  // Overall Progress
  progress: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    stepsCompleted: {
      type: Number,
      default: 0,
    },
    totalSteps: {
      type: Number,
      default: 9,
    },
    estimatedTimeRemaining: Number, // in minutes
  },

  // Analytics & Metrics
  analytics: {
    totalTimeSpent: {
      type: Number,
      default: 0,
    },
    sessionCount: {
      type: Number,
      default: 1,
    },
    helpRequestCount: {
      type: Number,
      default: 0,
    },
    errorCount: {
      type: Number,
      default: 0,
    },
    dropOffPoints: [String],
    conversionEvents: [{
      event: String,
      timestamp: Date,
      value: mongoose.Schema.Types.Mixed,
    }],
  },

  // Completion Status
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: Date,
  abandonedAt: Date,
  abandonReason: String,

  // Feedback
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: String,
    suggestions: [String],
    wouldRecommend: Boolean,
    submittedAt: Date,
  },

  // Admin Notes
  adminNotes: [{
    note: String,
    addedBy: String,
    addedAt: {
      type: Date,
      default: Date.now,
    },
  }],

}, {
  timestamps: true,
});

// Indexes
QuantumOnboardingSchema.index({ userId: 1 }, { unique: true });
QuantumOnboardingSchema.index({ sessionId: 1 }, { unique: true });
QuantumOnboardingSchema.index({ currentStep: 1 });
QuantumOnboardingSchema.index({ isCompleted: 1 });
QuantumOnboardingSchema.index({ 'registration.source': 1 });
QuantumOnboardingSchema.index({ createdAt: 1 });

// Methods
QuantumOnboardingSchema.methods.updateProgress = function() {
  const steps = this.steps;
  let completed = 0;
  const total = Object.keys(steps).length;

  Object.values(steps).forEach(step => {
    if (step.completed) completed++;
  });

  this.progress.stepsCompleted = completed;
  this.progress.percentage = Math.round((completed / total) * 100);

  if (completed === total && !this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = new Date();
    this.currentStep = 'completed';
  }

  return this.save();
};

QuantumOnboardingSchema.methods.completeStep = function(stepName) {
  if (this.steps[stepName]) {
    this.steps[stepName].completed = true;
    this.steps[stepName].completedAt = new Date();
    
    // Move to next step
    const stepOrder = [
      'registration',
      'emailVerification', 
      'phoneVerification',
      'profileSetup',
      'privacySetup',
      'meshSetup',
      'aiSetup',
      'contactSync',
      'tutorial'
    ];
    
    const currentIndex = stepOrder.indexOf(stepName);
    if (currentIndex < stepOrder.length - 1) {
      this.currentStep = stepOrder[currentIndex + 1];
    }
    
    return this.updateProgress();
  }
  return Promise.resolve(this);
};

QuantumOnboardingSchema.methods.addAnalyticsEvent = function(event, value) {
  this.analytics.conversionEvents.push({
    event,
    timestamp: new Date(),
    value
  });
  return this.save();
};

// Static methods
QuantumOnboardingSchema.statics.getCompletionRate = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        completionRate: {
          $multiply: [{ $divide: ['$completed', '$total'] }, 100]
        }
      }
    }
  ]);
};

QuantumOnboardingSchema.statics.getDropOffAnalysis = function() {
  return this.aggregate([
    { $match: { isCompleted: false } },
    { $group: { _id: '$currentStep', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('QuantumOnboarding', QuantumOnboardingSchema);