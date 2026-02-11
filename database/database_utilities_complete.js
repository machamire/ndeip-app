/**
 * Complete Database Utilities for ndeip
 * Connection management, admin dashboard aggregations, and comprehensive seed data
 */

// Continuing Redis connection and database utilities...
      this.redis.on('error', (err) => {
        console.error('❌ Redis connection error:', err);
      });

      this.redis.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });

      await this.redis.connect();
      
      // Test Redis connection
      await this.redis.ping();
      console.log('🔍 Redis connection test successful');
      
      return true;
    } catch (error) {
      console.error('❌ Redis connection failed:', error.message);
      return false;
    }
  }

  // Setup MongoDB event listeners
  setupMongoEventListeners() {
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      this.isConnected = false;
      
      // Attempt to reconnect
      setTimeout(() => {
        this.connectMongoDB();
      }, this.retryDelay);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
      this.isConnected = true;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  // Initialize all connections
  async initialize() {
    console.log('🚀 Initializing database connections...');
    
    const mongoConnected = await this.connectMongoDB();
    const redisConnected = await this.connectRedis();
    
    if (mongoConnected) {
      console.log('✅ Database initialization successful');
      return true;
    } else {
      console.error('❌ Database initialization failed');
      return false;
    }
  }

  // Health check
  async healthCheck() {
    const health = {
      mongodb: {
        connected: this.isConnected,
        status: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      },
      redis: {
        connected: this.redis ? this.redis.isOpen : false,
        status: this.redis ? 'connected' : 'disconnected',
      },
    };

    // Test MongoDB
    try {
      await mongoose.connection.db.admin().ping();
      health.mongodb.ping = 'success';
    } catch (error) {
      health.mongodb.ping = 'failed';
      health.mongodb.error = error.message;
    }

    // Test Redis
    if (this.redis) {
      try {
        const pong = await this.redis.ping();
        health.redis.ping = pong === 'PONG' ? 'success' : 'failed';
      } catch (error) {
        health.redis.ping = 'failed';
        health.redis.error = error.message;
      }
    }

    return health;
  }

  // Graceful disconnect
  async disconnect() {
    console.log('🔄 Closing database connections...');
    
    try {
      if (this.redis) {
        await this.redis.quit();
        console.log('✅ Redis connection closed');
      }
      
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
      
      this.isConnected = false;
    } catch (error) {
      console.error('❌ Error closing database connections:', error);
    }
  }

  // Get connection instance
  getMongoose() {
    return mongoose;
  }

  getRedis() {
    return this.redis;
  }
}

// Export singleton instance
const dbManager = new DatabaseManager();
module.exports = dbManager;

// =====================================
// database/aggregations.js - Admin Dashboard Queries
// =====================================

const QuantumUser = require('../models/QuantumUser');
const QuantumMessage = require('../models/QuantumMessage');
const QuantumGroup = require('../models/QuantumGroup');
const QuantumCall = require('../models/QuantumCall');
const QuantumAIUsage = require('../models/QuantumAIUsage');

class AdminAnalytics {
  // Real-time dashboard metrics
  async getDashboardMetrics() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsersToday,
      activeUsersWeek,
      todayMessages,
      weekMessages,
      monthMessages,
      activeCalls,
      totalGroups,
      aiRequests,
    ] = await Promise.all([
      this.getTotalUsers(),
      this.getActiveUsers(today),
      this.getActiveUsers(thisWeek),
      this.getMessageCount(today),
      this.getMessageCount(thisWeek),
      this.getMessageCount(thisMonth),
      this.getActiveCalls(),
      this.getTotalGroups(),
      this.getAIRequests(today),
    ]);

    return {
      users: {
        total: totalUsers,
        activeToday: activeUsersToday,
        activeWeek: activeUsersWeek,
        growth: {
          daily: await this.getUserGrowth('day'),
          weekly: await this.getUserGrowth('week'),
          monthly: await this.getUserGrowth('month'),
        },
      },
      messages: {
        today: todayMessages,
        week: weekMessages,
        month: monthMessages,
        perSecond: Math.round(todayMessages / (24 * 60 * 60)),
        deliveryRate: await this.getDeliveryRate(),
      },
      calls: {
        active: activeCalls,
        todayTotal: await this.getCallCount(today),
        avgDuration: await this.getAvgCallDuration(),
        successRate: await this.getCallSuccessRate(),
      },
      groups: {
        total: totalGroups,
        activeToday: await this.getActiveGroups(today),
        avgSize: await this.getAvgGroupSize(),
      },
      ai: {
        requests: aiRequests,
        cost: await this.getAICost(today),
        accuracy: await this.getAIAccuracy(),
        topFeatures: await this.getTopAIFeatures(),
      },
      system: {
        uptime: process.uptime(),
        timestamp: now,
      },
    };
  }

  // User Analytics
  async getTotalUsers() {
    return await QuantumUser.countDocuments({ isActive: true, isDeleted: false });
  }

  async getActiveUsers(since) {
    return await QuantumUser.countDocuments({
      'auth.lastSeen': { $gte: since },
      isActive: true,
      isDeleted: false,
    });
  }

  async getUserGrowth(period) {
    const now = new Date();
    let startDate, endDate, previousStartDate;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = now;
        previousStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const [current, previous] = await Promise.all([
      QuantumUser.countDocuments({
        createdAt: { $gte: startDate, $lt: endDate },
        isActive: true,
        isDeleted: false,
      }),
      QuantumUser.countDocuments({
        createdAt: { $gte: previousStartDate, $lt: startDate },
        isActive: true,
        isDeleted: false,
      }),
    ]);

    const growthRate = previous > 0 ? ((current - previous) / previous) * 100 : 0;

    return {
      current,
      previous,
      growthRate: Math.round(growthRate * 100) / 100,
    };
  }

  async getUserLocationStats() {
    const pipeline = [
      {
        $match: { 
          isActive: true, 
          isDeleted: false,
          'profile.location.countryCode': { $exists: true },
        },
      },
      {
        $group: {
          _id: '$profile.location.countryCode',
          count: { $sum: 1 },
          country: { $first: '$profile.location.country' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ];

    return await QuantumUser.aggregate(pipeline);
  }

  // Message Analytics
  async getMessageCount(since) {
    return await QuantumMessage.countDocuments({
      createdAt: { $gte: since },
      isDeleted: false,
    });
  }

  async getDeliveryRate() {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          delivered: {
            $sum: {
              $cond: [
                { $in: ['$status', ['delivered', 'read']] },
                1,
                0,
              ],
            },
          },
        },
      },
    ];

    const result = await QuantumMessage.aggregate(pipeline);
    if (result.length === 0) return 100;

    const { total, delivered } = result[0];
    return Math.round((delivered / total) * 100 * 100) / 100;
  }

  async getMessageTypeBreakdown(since = new Date(Date.now() - 24 * 60 * 60 * 1000)) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: since },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$messageType',
          count: { $sum: 1 },
          avgSize: { $avg: { $strLenCP: '$content.text' } },
        },
      },
      { $sort: { count: -1 } },
    ];

    return await QuantumMessage.aggregate(pipeline);
  }

  // Call Analytics
  async getActiveCalls() {
    return await QuantumCall.countDocuments({
      callStatus: 'active',
    });
  }

  async getCallCount(since) {
    return await QuantumCall.countDocuments({
      createdAt: { $gte: since },
    });
  }

  async getAvgCallDuration() {
    const pipeline = [
      {
        $match: {
          callStatus: 'ended',
          duration: { $gt: 0 },
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' },
        },
      },
    ];

    const result = await QuantumCall.aggregate(pipeline);
    return result.length > 0 ? Math.round(result[0].avgDuration) : 0;
  }

  async getCallSuccessRate() {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          successful: {
            $sum: {
              $cond: [
                { $eq: ['$endReason', 'completed'] },
                1,
                0,
              ],
            },
          },
        },
      },
    ];

    const result = await QuantumCall.aggregate(pipeline);
    if (result.length === 0) return 100;

    const { total, successful } = result[0];
    return Math.round((successful / total) * 100 * 100) / 100;
  }

  // Group Analytics
  async getTotalGroups() {
    return await QuantumGroup.countDocuments({ isActive: true });
  }

  async getActiveGroups(since) {
    // Groups with messages in the specified timeframe
    const activeGroupIds = await QuantumMessage.distinct('groupInfo.groupId', {
      'groupInfo.isGroupMessage': true,
      createdAt: { $gte: since },
      isDeleted: false,
    });

    return activeGroupIds.length;
  }

  async getAvgGroupSize() {
    const pipeline = [
      {
        $match: { isActive: true },
      },
      {
        $group: {
          _id: null,
          avgSize: { $avg: { $size: '$members' } },
        },
      },
    ];

    const result = await QuantumGroup.aggregate(pipeline);
    return result.length > 0 ? Math.round(result[0].avgSize * 10) / 10 : 0;
  }

  // AI Analytics
  async getAIRequests(since) {
    return await QuantumAIUsage.countDocuments({
      createdAt: { $gte: since },
      status: 'completed',
    });
  }

  async getAICost(since) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: since },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$cost.pricing.totalCost' },
        },
      },
    ];

    const result = await QuantumAIUsage.aggregate(pipeline);
    return result.length > 0 ? Math.round(result[0].totalCost * 100) / 100 : 0;
  }

  async getAIAccuracy() {
    const pipeline = [
      {
        $match: {
          status: 'completed',
          'quality.accuracy': { $exists: true },
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: null,
          avgAccuracy: { $avg: '$quality.accuracy' },
        },
      },
    ];

    const result = await QuantumAIUsage.aggregate(pipeline);
    return result.length > 0 ? Math.round(result[0].avgAccuracy * 100 * 100) / 100 : 0;
  }

  async getTopAIFeatures() {
    const pipeline = [
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: '$feature',
          count: { $sum: 1 },
          avgLatency: { $avg: '$performance.latency' },
          totalCost: { $sum: '$cost.pricing.totalCost' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ];

    return await QuantumAIUsage.aggregate(pipeline);
  }

  // Real-time activity feed
  async getRecentActivity(limit = 50) {
    const activities = [];

    // Recent user registrations
    const recentUsers = await QuantumUser.find({
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
      isActive: true,
    })
    .select('username profile.displayName createdAt profile.location.country')
    .sort({ createdAt: -1 })
    .limit(10);

    recentUsers.forEach(user => {
      activities.push({
        type: 'user_registered',
        timestamp: user.createdAt,
        data: {
          username: user.username,
          displayName: user.profile.displayName,
          country: user.profile.location?.country,
        },
      });
    });

    // Recent groups created
    const recentGroups = await QuantumGroup.find({
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
      isActive: true,
    })
    .populate('createdBy', 'username profile.displayName')
    .select('name groupType createdAt createdBy')
    .sort({ createdAt: -1 })
    .limit(10);

    recentGroups.forEach(group => {
      activities.push({
        type: 'group_created',
        timestamp: group.createdAt,
        data: {
          groupName: group.name,
          groupType: group.groupType,
          createdBy: group.createdBy?.profile?.displayName || group.createdBy?.username,
        },
      });
    });

    // Sort by timestamp and limit
    activities.sort((a, b) => b.timestamp - a.timestamp);
    return activities.slice(0, limit);
  }

  // Performance metrics
  async getPerformanceMetrics() {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          'metrics.deliveryTime': { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          avgDeliveryTime: { $avg: '$metrics.deliveryTime' },
          avgProcessingTime: { $avg: '$metrics.processingTime' },
          maxDeliveryTime: { $max: '$metrics.deliveryTime' },
          minDeliveryTime: { $min: '$metrics.deliveryTime' },
          totalRetries: { $sum: '$metrics.retryCount' },
        },
      },
    ];

    const result = await QuantumMessage.aggregate(pipeline);
    return result.length > 0 ? result[0] : {
      avgDeliveryTime: 0,
      avgProcessingTime: 0,
      maxDeliveryTime: 0,
      minDeliveryTime: 0,
      totalRetries: 0,
    };
  }

  // Security analytics
  async getSecurityMetrics() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      reportedMessages,
      blockedUsers,
      failedLogins,
      suspiciousActivity,
    ] = await Promise.all([
      QuantumMessage.countDocuments({
        'moderation.isReported': true,
        createdAt: { $gte: since },
      }),
      QuantumUser.countDocuments({
        isBanned: true,
        'auth.lockoutUntil': { $gte: new Date() },
      }),
      // This would come from your security logs
      0, // Placeholder
      0, // Placeholder
    ]);

    return {
      reportedMessages,
      blockedUsers,
      failedLogins,
      suspiciousActivity,
      threatLevel: this.calculateThreatLevel(reportedMessages, blockedUsers, failedLogins),
    };
  }

  calculateThreatLevel(reported, blocked, failed) {
    const score = (reported * 1) + (blocked * 5) + (failed * 2);
    if (score > 50) return 'high';
    if (score > 20) return 'medium';
    return 'low';
  }

  // Export data for analytics
  async exportUserData(format = 'json', filters = {}) {
    const query = { isActive: true, isDeleted: false, ...filters };
    
    const users = await QuantumUser.find(query)
      .select('username email profile createdAt auth.lastSeen subscription')
      .lean();

    if (format === 'csv') {
      return this.convertToCSV(users);
    }
    
    return users;
  }

  convertToCSV(data) {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }
}

// Export singleton instance
const adminAnalytics = new AdminAnalytics();
module.exports = adminAnalytics;

// =====================================
// database/seed.js - Comprehensive Test Data
// =====================================

const faker = require('faker');
const bcrypt = require('bcrypt');
const QuantumUser = require('../models/QuantumUser');
const QuantumOnboarding = require('../models/QuantumOnboarding');
const QuantumMessage = require('../models/QuantumMessage');
const QuantumGroup = require('../models/QuantumGroup');
const QuantumCall = require('../models/QuantumCall');
const QuantumAIUsage = require('../models/QuantumAIUsage');

class DataSeeder {
  constructor() {
    this.users = [];
    this.groups = [];
    this.messages = [];
  }

  async seedDatabase(options = {}) {
    const {
      userCount = 1000,
      messageCount = 10000,
      groupCount = 100,
      callCount = 500,
      aiUsageCount = 2000,
      clearExisting = false,
    } = options;

    console.log('🌱 Starting database seeding...');

    if (clearExisting) {
      await this.clearDatabase();
    }

    try {
      // Seed in order of dependencies
      await this.seedUsers(userCount);
      await this.seedOnboarding();
      await this.seedGroups(groupCount);
      await this.seedMessages(messageCount);
      await this.seedCalls(callCount);
      await this.seedAIUsage(aiUsageCount);

      console.log('✅ Database seeding completed successfully!');
      
      return {
        users: this.users.length,
        groups: this.groups.length,
        messages: this.messages.length,
        success: true,
      };
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  async clearDatabase() {
    console.log('🧹 Clearing existing data...');
    
    await Promise.all([
      QuantumUser.deleteMany({}),
      QuantumOnboarding.deleteMany({}),
      QuantumMessage.deleteMany({}),
      QuantumGroup.deleteMany({}),
      QuantumCall.deleteMany({}),
      QuantumAIUsage.deleteMany({}),
    ]);
    
    console.log('✅ Database cleared');
  }

  async seedUsers(count) {
    console.log(`👥 Seeding ${count} users...`);
    
    const users = [];
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    
    // Create admin user
    const adminUser = {
      username: 'admin',
      email: 'admin@ndeip.com',
      phoneNumber: '+1234567890',
      password: hashedPassword,
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        displayName: 'Admin',
        about: 'System Administrator',
        status: 'online',
        language: 'en',
        timezone: 'UTC',
        location: {
          country: 'United States',
          countryCode: 'US',
          city: 'New York',
        },
      },
      subscription: {
        plan: 'quantum',
        status: 'active',
        startDate: new Date(),
      },
      onboarding: {
        currentStep: 'completed',
        completionPercentage: 100,
        completedAt: new Date(),
      },
      isActive: true,
      createdAt: faker.date.between('2024-01-01', '2024-12-01'),
    };
    
    users.push(adminUser);

    // Create regular users
    for (let i = 1; i < count; i++) {
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`;
      
      const user = {
        username,
        email: faker.internet.email(firstName, lastName),
        phoneNumber: faker.phone.phoneNumber('+###########'),
        password: hashedPassword,
        profile: {
          firstName,
          lastName,
          displayName: `${firstName} ${lastName}`,
          about: faker.lorem.sentence(),
          status: faker.random.arrayElement(['online', 'away', 'busy', 'offline']),
          language: faker.random.arrayElement(['en', 'es', 'fr', 'de', 'pt']),
          timezone: faker.random.arrayElement(['UTC', 'EST', 'PST', 'GMT', 'CET']),
          location: {
            country: faker.address.country(),
            countryCode: faker.address.countryCode(),
            city: faker.address.city(),
          },
        },
        meshPreferences: {
          intensity: faker.random.number({ min: 0.1, max: 1.0, precision: 0.1 }),
          animationSpeed: faker.random.number({ min: 0.5, max: 2.0, precision: 0.1 }),
          crystallineStyle: faker.random.arrayElement(['geometric', 'flowing', 'organic', 'radiant']),
          colorScheme: {
            primary: faker.internet.color(),
            secondary: faker.internet.color(),
            accent: faker.internet.color(),
          },
        },
        subscription: {
          plan: faker.random.arrayElement(['free', 'premium', 'quantum']),
          status: 'active',
          startDate: faker.date.recent(30),
        },
        onboarding: {
          currentStep: faker.random.arrayElement(['completed', 'first_message', 'tutorial_intro']),
          completionPercentage: faker.random.number({ min: 60, max: 100 }),
          completedAt: faker.random.boolean() ? faker.date.recent(7) : null,
        },
        auth: {
          isVerified: faker.random.boolean(),
          emailVerified: faker.random.boolean(),
          phoneVerified: faker.random.boolean(),
          lastSeen: faker.date.recent(1),
          lastLogin: faker.date.recent(2),
        },
        isActive: true,
        createdAt: faker.date.between('2024-01-01', '2024-12-01'),
      };
      
      users.push(user);
    }

    // Batch insert users
    const batchSize = 100;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const createdUsers = await QuantumUser.insertMany(batch, { ordered: false });
      this.users.push(...createdUsers);
    }

    console.log(`✅ Created ${this.users.length} users`);
  }

  async seedOnboarding() {
    console.log('📝 Seeding onboarding data...');
    
    const onboardingRecords = [];
    
    // Create onboarding records for users who haven't completed
    const incompleteUsers = this.users.filter(user => 
      user.onboarding.currentStep !== 'completed'
    );

    for (const user of incompleteUsers.slice(0, 200)) {
      const record = {
        userId: user._id,
        sessionId: faker.random.uuid(),
        currentStep: user.onboarding.currentStep,
        stepProgress: {
          completedSteps: faker.random.number({ min: 3, max: 8 }),
          totalSteps: 10,
          completionPercentage: user.onboarding.completionPercentage,
        },
        registration: {
          startedAt: user.createdAt,
          source: faker.random.arrayElement(['organic', 'referral', 'social_media', 'advertisement']),
          deviceInfo: {
            platform: faker.random.arrayElement(['ios', 'android', 'web']),
            deviceModel: faker.random.arrayElement(['iPhone 12', 'Samsung Galaxy S21', 'Pixel 5']),
            osVersion: faker.system.semver(),
          },
          networkInfo: {
            country: user.profile.location.country,
            countryCode: user.profile.location.countryCode,
            city: user.profile.location.city,
          },
        },
        verification: {
          phone: {
            isCompleted: user.auth.phoneVerified,
            totalAttempts: faker.random.number({ min: 1, max: 3 }),
          },
          email: {
            isCompleted: user.auth.emailVerified,
            totalAttempts: faker.random.number({ min: 1, max: 2 }),
          },
        },
        tutorial: {
          isStarted: faker.random.boolean(),
          sectionsCompleted: faker.random.number({ min: 0, max: 8 }),
          totalSections: 10,
        },
        analytics: {
          pageViews: Array.from({ length: faker.random.number({ min: 5, max: 20 }) }, () => ({
            page: faker.random.arrayElement(['profile_setup', 