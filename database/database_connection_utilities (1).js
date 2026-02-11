/**
 * MongoDB Database Connection & Utilities for ndeip
 * Includes connection management, aggregations for admin dashboard, and seed data
 */

// =====================================
// database/connection.js
// =====================================

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
        console.error('❌ Redis connection