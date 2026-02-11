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