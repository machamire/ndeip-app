/**
 * MongoDB Database Connection & Utilities for ndeip
 * Includes connection management, aggregations for admin dashboard, and seed data
 */

const mongoose = require('mongoose');
const Redis = require('redis');

class DatabaseManager {
  constructor() {
    this.mongoose = mongoose;
    this.redis = null;
    this.isConnected = false;
    this.connectionRetries = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
  }

  // MongoDB Connection
  async connectMongoDB() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ndeip';
      
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: parseInt(process.env.MONGO_POOL_SIZE) || 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        bufferCommands: false,
      };

      await mongoose.connect(mongoUri, options);
      
      this.isConnected = true;
      this.connectionRetries = 0;
      
      console.log('✅ MongoDB connected successfully');
      console.log(`📊 Database: ${mongoose.connection.name}`);
      console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
      
      // Set up connection event listeners
      this.setupMongoEventListeners();
      
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      
      if (this.connectionRetries < this.maxRetries) {
        this.connectionRetries++;
        console.log(`🔄 Retrying connection in ${this.retryDelay / 1000}s... (${this.connectionRetries}/${this.maxRetries})`);
        
        setTimeout(() => {
          this.connectMongoDB();
        }, this.retryDelay);
      } else {
        console.error('💥 Maximum connection retries exceeded');
        process.exit(1);
      }
      
      return false;
    }
  }

  // Redis Connection
  async connectRedis() {
    try {
      this.redis = Redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        retryDelayOnFailover: 100,
        enableOfflineQueue: false,
        lazyConnect: true,
      });

      // Redis event listeners
      this.redis.on('connect', () => {
        console.log('✅ Redis connected successfully');
      });

      this.redis.on('error', (err) => {
        console.error('❌ Redis connection error:', err);
      });

      this.redis.on('end', () => {
        console.log('⚠️ Redis connection ended');
      });

      await this.redis.connect();
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
      setTimeout(() => {
        this.connectMongoDB();
      }, this.retryDelay);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
      this.isConnected = true;
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
        connected: this.redis ? this.redis.isReady : false,
      },
      timestamp: new Date().toISOString(),
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
        await this.redis.ping();
        health.redis.ping = 'success';
      } catch (error) {
        health.redis.ping = 'failed';
        health.redis.error = error.message;
      }
    }

    return health;
  }

  // Graceful shutdown
  async close() {
    console.log('🔄 Closing database connections...');
    
    if (this.redis) {
      await this.redis.quit();
      console.log('✅ Redis connection closed');
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
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

// Create singleton instance
const dbManager = new DatabaseManager();

module.exports = dbManager;