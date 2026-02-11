/**
 * Complete Database Seed Data & Setup Scripts
 * Continuation of DataSeeder class with all models
 */

// Continuing onboarding seed data...
            page: faker.random.arrayElement(['profile_setup', 'mesh_preferences', 'privacy_settings', 'ai_preferences']),
            viewedAt: faker.date.recent(7),
            timeSpent: faker.random.number({ min: 30, max: 300 }),
          })),
          interactions: Array.from({ length: faker.random.number({ min: 10, max: 50 }) }, () => ({
            type: faker.random.arrayElement(['click', 'tap', 'swipe', 'input']),
            element: faker.random.arrayElement(['next_button', 'skip_button', 'help_icon']),
            timestamp: faker.date.recent(7),
          })),
        },
        createdAt: user.createdAt,
      };
      
      onboardingRecords.push(record);
    }

    if (onboardingRecords.length > 0) {
      await QuantumOnboarding.insertMany(onboardingRecords);
      console.log(`✅ Created ${onboardingRecords.length} onboarding records`);
    }
  }

  async seedGroups(count) {
    console.log(`👥 Seeding ${count} groups...`);
    
    const groups = [];
    
    for (let i = 0; i < count; i++) {
      const createdBy = faker.random.arrayElement(this.users)._id;
      const memberCount = faker.random.number({ min: 3, max: 50 });
      const members = faker.random.arrayElements(this.users, memberCount);
      
      const group = {
        name: faker.company.companyName() + ' Group',
        description: faker.lorem.paragraph(),
        groupType: faker.random.arrayElement(['group', 'channel', 'community', 'study_group', 'work_team']),
        privacy: faker.random.arrayElement(['public', 'private', 'invite_only']),
        createdBy,
        members: members.map((member, index) => ({
          userId: member._id,
          joinedAt: faker.date.recent(30),
          role: index === 0 ? 'owner' : faker.random.arrayElement(['member', 'admin', 'moderator']),
          messageCount: faker.random.number({ min: 0, max: 100 }),
        })),
        analytics: {
          totalMembers: memberCount,
          totalMessages: faker.random.number({ min: 10, max: 1000 }),
          activeMembers: faker.random.number({ min: 1, max: memberCount }),
        },
        settings: {
          maxMembers: faker.random.arrayElement([50, 100, 256]),
          allowMemberInvites: faker.random.boolean(),
          allowMediaSharing: faker.random.boolean(),
        },
        isActive: true,
        createdAt: faker.date.between('2024-01-01', '2024-12-01'),
      };
      
      groups.push(group);
    }

    const createdGroups = await QuantumGroup.insertMany(groups);
    this.groups = createdGroups;
    
    console.log(`✅ Created ${this.groups.length} groups`);
  }

  async seedMessages(count) {
    console.log(`💬 Seeding ${count} messages...`);
    
    const messages = [];
    const messageTypes = ['text', 'media', 'voice_note', 'location', 'sticker', 'system'];
    
    for (let i = 0; i < count; i++) {
      const sender = faker.random.arrayElement(this.users);
      const messageType = faker.random.arrayElement(messageTypes);
      const isGroupMessage = faker.random.boolean();
      
      let chatId, recipientInfo = {};
      
      if (isGroupMessage && this.groups.length > 0) {
        const group = faker.random.arrayElement(this.groups);
        chatId = `group_${group._id}`;
        recipientInfo = {
          groupInfo: {
            isGroupMessage: true,
            groupId: group._id,
            recipientCount: group.members.length,
            deliveredCount: faker.random.number({ min: 1, max: group.members.length }),
            readCount: faker.random.number({ min: 0, max: group.members.length }),
          },
        };
      } else {
        const recipient = faker.random.arrayElement(this.users.filter(u => u._id !== sender._id));
        chatId = `dm_${[sender._id, recipient._id].sort().join('_')}`;
      }

      const message = {
        chatId,
        senderId: sender._id,
        senderUsername: sender.username,
        senderDisplayName: sender.profile.displayName,
        messageType,
        content: this.generateMessageContent(messageType),
        status: faker.random.arrayElement(['sent', 'delivered', 'read']),
        priority: faker.random.arrayElement(['normal', 'high']),
        reactions: this.generateReactions(),
        ...recipientInfo,
        metrics: {
          deliveryTime: faker.random.number({ min: 100, max: 5000 }),
          processingTime: faker.random.number({ min: 10, max: 500 }),
          retryCount: faker.random.number({ min: 0, max: 3 }),
        },
        deviceContext: {
          platform: faker.random.arrayElement(['ios', 'android', 'web']),
          appVersion: faker.system.semver(),
          networkType: faker.random.arrayElement(['wifi', 'cellular']),
        },
        aiProcessing: this.generateAIProcessing(messageType),
        isDeleted: faker.random.boolean() ? faker.random.boolean() : false, // 25% chance
        createdAt: faker.date.between('2024-01-01', '2024-12-01'),
      };
      
      messages.push(message);
    }

    // Batch insert messages
    const batchSize = 500;
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      const createdMessages = await QuantumMessage.insertMany(batch, { ordered: false });
      this.messages.push(...createdMessages);
    }

    console.log(`✅ Created ${this.messages.length} messages`);
  }

  generateMessageContent(messageType) {
    switch (messageType) {
      case 'text':
        return {
          text: faker.lorem.sentences(faker.random.number({ min: 1, max: 5 })),
          hashtags: faker.random.boolean() ? [faker.lorem.word()] : [],
          mentions: [],
        };
      case 'media':
        return {
          text: faker.random.boolean() ? faker.lorem.sentence() : '',
        };
      case 'voice_note':
        return {
          text: '[Voice Note]',
        };
      case 'location':
        return {
          text: 'Shared location',
        };
      case 'sticker':
        return {
          text: '',
        };
      case 'system':
        return {
          text: faker.random.arrayElement([
            'User joined the group',
            'User left the group',
            'Group name changed',
            'Admin added new member',
          ]),
        };
      default:
        return { text: faker.lorem.sentence() };
    }
  }

  generateReactions() {
    if (!faker.random.boolean()) return [];
    
    const reactionCount = faker.random.number({ min: 1, max: 8 });
    const reactions = [];
    const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉'];
    
    for (let i = 0; i < reactionCount; i++) {
      reactions.push({
        userId: faker.random.arrayElement(this.users)._id,
        emoji: faker.random.arrayElement(emojis),
        reactionType: 'emoji',
        addedAt: faker.date.recent(7),
      });
    }
    
    return reactions;
  }

  generateAIProcessing(messageType) {
    if (messageType !== 'text') return {};
    
    return {
      contentModeration: {
        isProcessed: faker.random.boolean(),
        isSafe: faker.random.boolean(0.95), // 95% safe
        confidenceScore: faker.random.number({ min: 0.8, max: 1.0, precision: 0.01 }),
        action: 'allow',
        processedAt: faker.date.recent(1),
      },
      sentimentAnalysis: {
        sentiment: faker.random.arrayElement(['positive', 'neutral', 'negative']),
        confidence: faker.random.number({ min: 0.6, max: 1.0, precision: 0.01 }),
        processedAt: faker.date.recent(1),
      },
      smartReply: {
        enabled: faker.random.boolean(),
        suggestions: faker.random.boolean() ? [
          faker.lorem.sentence(),
          faker.lorem.sentence(),
          faker.lorem.sentence(),
        ] : [],
        confidence: faker.random.number({ min: 0.7, max: 1.0, precision: 0.01 }),
      },
    };
  }

  async seedCalls(count) {
    console.log(`📞 Seeding ${count} calls...`);
    
    const calls = [];
    
    for (let i = 0; i < count; i++) {
      const initiator = faker.random.arrayElement(this.users);
      const participantCount = faker.random.number({ min: 1, max: 8 });
      const participants = [initiator, ...faker.random.arrayElements(
        this.users.filter(u => u._id !== initiator._id), 
        participantCount - 1
      )];
      
      const callDuration = faker.random.number({ min: 30, max: 3600 }); // 30 seconds to 1 hour
      const startedAt = faker.date.recent(30);
      const endedAt = new Date(startedAt.getTime() + (callDuration * 1000));
      
      const call = {
        callType: faker.random.arrayElement(['voice', 'video', 'group_voice', 'group_video']),
        initiator: initiator._id,
        participants: participants.map(p => ({
          userId: p._id,
          status: faker.random.arrayElement(['connected', 'disconnected', 'declined', 'missed']),
          joinedAt: faker.date.between(startedAt, endedAt),
          leftAt: endedAt,
          duration: faker.random.number({ min: 10, max: callDuration }),
          deviceInfo: {
            platform: faker.random.arrayElement(['ios', 'android', 'web']),
            camera: faker.random.boolean(),
            microphone: true,
          },
          qualityMetrics: {
            videoResolution: faker.random.arrayElement(['720p', '1080p', '480p']),
            audioQuality: faker.random.arrayElement(['good', 'fair', 'poor']),
            packetLoss: faker.random.number({ min: 0, max: 5, precision: 0.1 }),
            latency: faker.random.number({ min: 50, max: 300 }),
          },
        })),
        groupInfo: {
          isGroupCall: participantCount > 2,
          maxParticipants: 8,
        },
        callStatus: 'ended',
        startedAt,
        endedAt,
        duration: callDuration,
        endReason: faker.random.arrayElement(['completed', 'missed', 'declined', 'network_error']),
        quality: {
          overallRating: faker.random.number({ min: 3, max: 5 }),
          videoQuality: faker.random.arrayElement(['poor', 'fair', 'good', 'excellent']),
          audioQuality: faker.random.arrayElement(['poor', 'fair', 'good', 'excellent']),
          connectionStability: faker.random.arrayElement(['unstable', 'stable', 'very_stable']),
        },
        technical: {
          serverRegion: faker.random.arrayElement(['us-east-1', 'eu-west-1', 'ap-southeast-1']),
          networkType: faker.random.arrayElement(['wifi', 'cellular', 'ethernet']),
        },
        createdAt: startedAt,
      };
      
      calls.push(call);
    }

    await QuantumCall.insertMany(calls);
    console.log(`✅ Created ${calls.length} calls`);
  }

  async seedAIUsage(count) {
    console.log(`🤖 Seeding ${count} AI usage records...`);
    
    const aiUsage = [];
    const features = ['smart_replies', 'translation', 'content_moderation', 'sentiment_analysis', 'voice_enhancement'];
    const providers = ['openai', 'google', 'azure', 'anthropic'];
    
    for (let i = 0; i < count; i++) {
      const user = faker.random.arrayElement(this.users);
      const feature = faker.random.arrayElement(features);
      const provider = faker.random.arrayElement(providers);
      const inputLength = faker.random.number({ min: 10, max: 500 });
      const outputLength = faker.random.number({ min: 5, max: 200 });
      
      const usage = {
        userId: user._id,
        feature,
        provider,
        model: this.getModelForProvider(provider),
        input: {
          type: 'text',
          length: inputLength,
          language: 'en',
          contentType: 'message',
        },
        output: {
          type: 'text',
          length: outputLength,
          confidence: faker.random.number({ min: 0.7, max: 1.0, precision: 0.01 }),
          processingTime: faker.random.number({ min: 100, max: 2000 }),
        },
        cost: {
          tokens: {
            input: Math.ceil(inputLength / 4), // Rough approximation
            output: Math.ceil(outputLength / 4),
            total: Math.ceil((inputLength + outputLength) / 4),
          },
          pricing: {
            perToken: this.getTokenPrice(provider, feature),
            totalCost: faker.random.number({ min: 0.001, max: 0.05, precision: 0.001 }),
            currency: 'USD',
          },
        },
        performance: {
          latency: faker.random.number({ min: 200, max: 2000 }),
          throughput: faker.random.number({ min: 10, max: 100 }),
          errorRate: faker.random.number({ min: 0, max: 0.05, precision: 0.001 }),
          retryCount: faker.random.number({ min: 0, max: 2 }),
        },
        quality: {
          userRating: faker.random.arrayElement([3, 4, 5]),
          accuracy: faker.random.number({ min: 0.8, max: 1.0, precision: 0.01 }),
          relevance: faker.random.number({ min: 0.7, max: 1.0, precision: 0.01 }),
          helpfulness: faker.random.number({ min: 0.8, max: 1.0, precision: 0.01 }),
        },
        context: {
          messageId: faker.random.boolean() ? faker.random.arrayElement(this.messages)?._id : undefined,
          conversationLength: faker.random.number({ min: 1, max: 50 }),
          deviceInfo: {
            platform: faker.random.arrayElement(['ios', 'android', 'web']),
            version: faker.system.semver(),
          },
        },
        status: faker.random.arrayElement(['completed', 'failed']),
        createdAt: faker.date.recent(30),
      };
      
      aiUsage.push(usage);
    }

    await QuantumAIUsage.insertMany(aiUsage);
    console.log(`✅ Created ${aiUsage.length} AI usage records`);
  }

  getModelForProvider(provider) {
    const models = {
      openai: faker.random.arrayElement(['gpt-4', 'gpt-3.5-turbo', 'text-davinci-003']),
      google: faker.random.arrayElement(['palm-2', 'text-bison', 'chat-bison']),
      azure: faker.random.arrayElement(['gpt-4', 'gpt-35-turbo']),
      anthropic: faker.random.arrayElement(['claude-3', 'claude-2', 'claude-instant']),
    };
    return models[provider] || 'unknown';
  }

  getTokenPrice(provider, feature) {
    const basePrices = {
      openai: 0.0020,
      google: 0.0015,
      azure: 0.0025,
      anthropic: 0.0030,
    };
    
    const featureMultipliers = {
      smart_replies: 1.0,
      translation: 1.2,
      content_moderation: 0.8,
      sentiment_analysis: 0.9,
      voice_enhancement: 1.5,
    };
    
    return (basePrices[provider] || 0.002) * (featureMultipliers[feature] || 1.0);
  }

  // Generate realistic usage patterns
  async generateRealisticPatterns() {
    console.log('📊 Generating realistic usage patterns...');
    
    // Update user activity based on time zones
    const activeUsers = this.users.filter(() => faker.random.boolean(0.3)); // 30% active
    
    for (const user of activeUsers) {
      await QuantumUser.findByIdAndUpdate(user._id, {
        'auth.lastSeen': faker.date.recent(1),
        'profile.status': 'online',
      });
    }

    // Create message bursts (simulating conversations)
    const conversationBursts = [];
    for (let i = 0; i < 50; i++) {
      const participants = faker.random.arrayElements(this.users, 2);
      const messageCount = faker.random.number({ min: 5, max: 20 });
      const baseTime = faker.date.recent(1);
      
      for (let j = 0; j < messageCount; j++) {
        const sender = faker.random.arrayElement(participants);
        const chatId = `dm_${participants.map(p => p._id).sort().join('_')}`;
        
        conversationBursts.push({
          chatId,
          senderId: sender._id,
          messageType: 'text',
          content: { text: faker.lorem.sentence() },
          status: 'delivered',
          createdAt: new Date(baseTime.getTime() + (j * 30000)), // 30 seconds apart
        });
      }
    }
    
    if (conversationBursts.length > 0) {
      await QuantumMessage.insertMany(conversationBursts);
      console.log(`✅ Created ${conversationBursts.length} conversation burst messages`);
    }
  }

  // Create sample admin users for testing
  async createAdminUsers() {
    const adminUsers = [
      {
        username: 'superadmin',
        email: 'superadmin@ndeip.com',
        role: 'superadmin',
      },
      {
        username: 'moderator',
        email: 'moderator@ndeip.com',
        role: 'moderator',
      },
      {
        username: 'support',
        email: 'support@ndeip.com',
        role: 'support',
      },
    ];

    const hashedPassword = await bcrypt.hash('admin123!', 12);
    
    for (const adminData of adminUsers) {
      const admin = new QuantumUser({
        ...adminData,
        password: hashedPassword,
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          displayName: adminData.username,
          status: 'online',
        },
        subscription: {
          plan: 'quantum',
          status: 'active',
        },
        onboarding: {
          currentStep: 'completed',
          completionPercentage: 100,
          completedAt: new Date(),
        },
        auth: {
          isVerified: true,
          emailVerified: true,
          phoneVerified: true,
        },
        metadata: {
          tags: ['admin', 'staff'],
        },
      });
      
      await admin.save();
      console.log(`✅ Created admin user: ${adminData.username}`);
    }
  }
}

// Export seeder instance
const dataSeeder = new DataSeeder();

// =====================================
// Migration Scripts
// =====================================

class DatabaseMigrations {
  constructor() {
    this.migrations = [];
  }

  // Add a migration
  addMigration(name, up, down) {
    this.migrations.push({ name, up, down, timestamp: new Date() });
  }

  // Run all pending migrations
  async runMigrations() {
    console.log('🔄 Running database migrations...');
    
    for (const migration of this.migrations) {
      try {
        console.log(`Running migration: ${migration.name}`);
        await migration.up();
        console.log(`✅ Migration completed: ${migration.name}`);
      } catch (error) {
        console.error(`❌ Migration failed: ${migration.name}`, error);
        throw error;
      }
    }
  }

  // Rollback migrations
  async rollbackMigrations(count = 1) {
    console.log(`🔄 Rolling back ${count} migrations...`);
    
    const toRollback = this.migrations.slice(-count).reverse();
    
    for (const migration of toRollback) {
      try {
        console.log(`Rolling back migration: ${migration.name}`);
        await migration.down();
        console.log(`✅ Rollback completed: ${migration.name}`);
      } catch (error) {
        console.error(`❌ Rollback failed: ${migration.name}`, error);
        throw error;
      }
    }
  }
}

// Initialize common migrations
const migrations = new DatabaseMigrations();

// Add sample migrations
migrations.addMigration(
  'add_user_mesh_preferences',
  async () => {
    await QuantumUser.updateMany(
      { 'meshPreferences.crystallineStyle': { $exists: false } },
      { $set: { 'meshPreferences.crystallineStyle': 'geometric' } }
    );
  },
  async () => {
    await QuantumUser.updateMany(
      {},
      { $unset: { 'meshPreferences.crystallineStyle': 1 } }
    );
  }
);

migrations.addMigration(
  'add_message_encryption_flags',
  async () => {
    await QuantumMessage.updateMany(
      { 'encryption.isEncrypted': { $exists: false } },
      { $set: { 'encryption.isEncrypted': true } }
    );
  },
  async () => {
    await QuantumMessage.updateMany(
      {},
      { $unset: { 'encryption': 1 } }
    );
  }
);

// =====================================
// Database Validation & Health Check
// =====================================

class DatabaseValidator {
  async validateSchema() {
    console.log('🔍 Validating database schema...');
    
    const validations = [];
    
    try {
      // Check required indexes
      const userIndexes = await QuantumUser.collection.getIndexes();
      const messageIndexes = await QuantumMessage.collection.getIndexes();
      
      validations.push({
        check: 'User indexes',
        status: Object.keys(userIndexes).length >= 5 ? 'pass' : 'fail',
        details: `Found ${Object.keys(userIndexes).length} indexes`,
      });
      
      validations.push({
        check: 'Message indexes',
        status: Object.keys(messageIndexes).length >= 8 ? 'pass' : 'fail',
        details: `Found ${Object.keys(messageIndexes).length} indexes`,
      });
      
      // Check data integrity
      const usersWithoutOnboarding = await QuantumUser.countDocuments({
        'onboarding.currentStep': { $exists: false },
      });
      
      validations.push({
        check: 'User onboarding data',
        status: usersWithoutOnboarding === 0 ? 'pass' : 'warning',
        details: `${usersWithoutOnboarding} users missing onboarding data`,
      });
      
      // Check orphaned data
      const orphanedMessages = await QuantumMessage.countDocuments({
        senderId: { $nin: await QuantumUser.distinct('_id') },
      });
      
      validations.push({
        check: 'Message data integrity',
        status: orphanedMessages === 0 ? 'pass' : 'warning',
        details: `${orphanedMessages} orphaned messages found`,
      });
      
      console.log('📊 Validation Results:');
      validations.forEach(v => {
        const icon = v.status === 'pass' ? '✅' : v.status === 'warning' ? '⚠️' : '❌';
        console.log(`${icon} ${v.check}: ${v.details}`);
      });
      
      return validations;
      
    } catch (error) {
      console.error('❌ Schema validation failed:', error);
      throw error;
    }
  }

  async performHealthCheck() {
    console.log('🏥 Performing database health check...');
    
    const health = {
      timestamp: new Date(),
      status: 'healthy',
      metrics: {},
      issues: [],
    };
    
    try {
      // Check collection sizes
      health.metrics.userCount = await QuantumUser.countDocuments();
      health.metrics.messageCount = await QuantumMessage.countDocuments();
      health.metrics.groupCount = await QuantumGroup.countDocuments();
      health.metrics.callCount = await QuantumCall.countDocuments();
      
      // Check database size
      const stats = await mongoose.connection.db.stats();
      health.metrics.dbSize = stats.dataSize;
      health.metrics.indexSize = stats.indexSize;
      health.metrics.avgObjectSize = stats.avgObjSize;
      
      // Check for potential issues
      if (health.metrics.dbSize > 1000000000) { // 1GB
        health.issues.push('Database size exceeding 1GB - consider archiving old data');
      }
      
      if (health.metrics.messageCount > 1000000) { // 1M messages
        health.issues.push('High message count - monitor performance');
      }
      
      // Performance checks
      const slowQueries = await this.detectSlowQueries();
      if (slowQueries.length > 0) {
        health.issues.push(`${slowQueries.length} slow queries detected`);
      }
      
      health.status = health.issues.length === 0 ? 'healthy' : 'warning';
      
      console.log(`📊 Database Health: ${health.status.toUpperCase()}`);
      console.log(`👥 Users: ${health.metrics.userCount.toLocaleString()}`);
      console.log(`💬 Messages: ${health.metrics.messageCount.toLocaleString()}`);
      console.log(`👥 Groups: ${health.metrics.groupCount.toLocaleString()}`);
      console.log(`📞 Calls: ${health.metrics.callCount.toLocaleString()}`);
      console.log(`💾 DB Size: ${(health.metrics.dbSize / 1024 / 1024).toFixed(2)} MB`);
      
      if (health.issues.length > 0) {
        console.log('⚠️ Issues found:');
        health.issues.forEach(issue => console.log(`  - ${issue}`));
      }
      
      return health;
      
    } catch (error) {
      health.status = 'error';
      health.error = error.message;
      console.error('❌ Health check failed:', error);
      return health;
    }
  }

  async detectSlowQueries() {
    // This would integrate with MongoDB profiler in production
    // For now, return empty array
    return [];
  }

  async optimizeDatabase() {
    console.log('⚡ Optimizing database...');
    
    try {
      // Rebuild indexes
      await QuantumUser.collection.reIndex();
      await QuantumMessage.collection.reIndex();
      await QuantumGroup.collection.reIndex();
      
      console.log('✅ Indexes rebuilt');
      
      // Compact collections (if supported)
      try {
        await mongoose.connection.db.command({ compact: 'quantumusers' });
        await mongoose.connection.db.command({ compact: 'quantummessages' });
        console.log('✅ Collections compacted');
      } catch (error) {
        console.log('⚠️ Collection compaction not supported or failed');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Database optimization failed:', error);
      throw error;
    }
  }
}

// =====================================
// Export everything
// =====================================

module.exports = {
  DatabaseManager: require('./connection'), // From previous artifact
  AdminAnalytics: adminAnalytics,
  DataSeeder: dataSeeder,
  DatabaseMigrations: migrations,
  DatabaseValidator: new DatabaseValidator(),
  
  // Utility functions
  async initializeDatabase(options = {}) {
    const dbManager = require('./connection');
    
    console.log('🚀 Initializing ndeip database...');
    
    // Connect to databases
    const connected = await dbManager.initialize();
    if (!connected) {
      throw new Error('Failed to connect to databases');
    }
    
    // Run migrations if requested
    if (options.runMigrations) {
      await migrations.runMigrations();
    }
    
    // Seed data if requested
    if (options.seedData) {
      await dataSeeder.seedDatabase({
        userCount: options.userCount || 1000,
        messageCount: options.messageCount || 10000,
        groupCount: options.groupCount || 100,
        clearExisting: options.clearExisting || false,
      });
      
      await dataSeeder.generateRealisticPatterns();
      await dataSeeder.createAdminUsers();
    }
    
    // Validate schema
    if (options.validateSchema) {
      const validator = new DatabaseValidator();
      await validator.validateSchema();
      await validator.performHealthCheck();
    }
    
    console.log('✅ Database initialization complete!');
    
    return {
      dbManager,
      analytics: adminAnal