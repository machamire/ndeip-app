/**
 * QuantumMedia Model - Media file management with processing
 * Handles file uploads, processing, and storage management
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const QuantumMediaSchema = new mongoose.Schema({
  mediaId: {
    type: String,
    unique: true,
    default: () => crypto.randomUUID(),
  },
  
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumUser',
    required: true,
  },
  
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuantumMessage',
  },
  
  mediaType: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'voice_note', 'sticker', 'gif'],
    required: true,
  },
  
  originalFile: {
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number, // in bytes
    url: String,
    hash: String, // for deduplication
  },
  
  processedFiles: [{
    variant: String, // thumbnail, compressed, hd, etc.
    url: String,
    size: Number,
    dimensions: {
      width: Number,
      height: Number,
    },
    quality: String,
    format: String,
  }],
  
  metadata: {
    duration: Number, // for audio/video
    dimensions: {
      width: Number,
      height: Number,
    },
    bitrate: Number,
    framerate: Number,
    colorSpace: String,
    blurhash: String,
    waveform: [Number], // for audio visualization
    exif: Object, // image metadata
    location: {
      latitude: Number,
      longitude: Number,
    },
  },
  
  storage: {
    provider: String, // aws, gcp, azure, local
    bucket: String,
    key: String,
    region: String,
    cdn: {
      enabled: {
        type: Boolean,
        default: true,
      },
      url: String,
      provider: String,
    },
  },
  
  processing: {
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    startedAt: Date,
    completedAt: Date,
    errorMessage: String,
    steps: [{
      step: String,
      status: String,
      startedAt: Date,
      completedAt: Date,
      error: String,
    }],
  },
  
  compression: {
    original: {
      size: Number,
      quality: String,
    },
    compressed: {
      size: Number,
      quality: String,
      algorithm: String,
      compressionRatio: Number,
    },
  },
  
  security: {
    isEncrypted: {
      type: Boolean,
      default: true,
    },
    encryptionAlgorithm: String,
    keyId: String,
    scanResults: {
      virusScanned: {
        type: Boolean,
        default: false,
      },
      virusScanResult: String,
      scannedAt: Date,
      contentModeration: {
        isScanned: {
          type: Boolean,
          default: false,
        },
        isSafe: {
          type: Boolean,
          default: true,
        },
        flaggedContent: [String],
        confidence: Number,
      },
    },
  },
  
  usage: {
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastAccessed: Date,
    bandwidth: {
      total: Number, // bytes transferred
      cost: Number, // estimated cost
    },
    hotlinkProtection: {
      type: Boolean,
      default: true,
    },
  },
  
  expiration: {
    expiresAt: Date,
    isExpired: {
      type: Boolean,
      default: false,
    },
    autoDelete: {
      type: Boolean,
      default: false,
    },
  },
  
  tags: [String],
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
}, {
  timestamps: true,
});

// Media indexes
QuantumMediaSchema.index({ mediaId: 1 }, { unique: true });
QuantumMediaSchema.index({ uploadedBy: 1, createdAt: -1 });
QuantumMediaSchema.index({ messageId: 1 });
QuantumMediaSchema.index({ mediaType: 1 });
QuantumMediaSchema.index({ 'originalFile.hash': 1 });
QuantumMediaSchema.index({ 'processing.status': 1 });
QuantumMediaSchema.index({ expiresAt: 1 }, { sparse: true });

// Media methods
QuantumMediaSchema.methods.markAsProcessed = function(processedFiles = []) {
  this.processing.status = 'completed';
  this.processing.completedAt = new Date();
  this.processedFiles = processedFiles;
  return this.save();
};

QuantumMediaSchema.methods.markAsFailed = function(errorMessage) {
  this.processing.status = 'failed';
  this.processing.errorMessage = errorMessage;
  this.processing.completedAt = new Date();
  return this.save();
};

QuantumMediaSchema.methods.incrementDownload = function() {
  this.usage.downloadCount += 1;
  this.usage.lastAccessed = new Date();
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('QuantumMedia', QuantumMediaSchema);