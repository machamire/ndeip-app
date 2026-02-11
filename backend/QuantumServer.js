/**
 * QuantumServer - Ultra-fast Node.js Server with Redis Caching
 * Real-time everything with Socket.io, auto-scaling, health monitoring
 * Container-ready architecture for production deployment
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const redis = require('redis');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cluster = require('cluster');
const os = require('os');

// Import custom modules
const QuantumAuth = require('./security/QuantumAuth');
const models = require('./models');
const dbManager = require('./database/connection');
const AIService = require('./services/AIService');

class QuantumServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server, {
      cors: {
        origin: process.env.CLIENT_ORIGIN || "*",
        methods: ["GET", "POST"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });
    
    this.redis = null;
    this.activeConnections = new Map();
    this.rooms = new Map();
    this.messageQueue = [];
    this.healthMetrics = {
      startTime: Date.now(),
      totalRequests: 0,
      activeConnections: 0,
      messagesDelivered: 0,
      errorsCount: 0,
      avgResponseTime: 0,
    };
    
    this.initializeServer();
  }

  // Initialize the server
  async initializeServer() {
    try {
      // Setup Redis connection
      await this.setupRedis();
      
      // Setup MongoDB connection
      await this.setupMongoDB();
      
      // Setup middleware
      this.setupMiddleware();
      
      // Setup routes
      this.setupRoutes();
      
      // Setup Socket.io
      this.setupSocketIO();
      
      // Setup health monitoring
      this.setupHealthMonitoring();
      
      // Setup graceful shutdown
      this.setupGracefulShutdown();
      
      console.log('��� QuantumServer initialized successfully');
    } catch (error) {
      console.error('❌ QuantumServer initialization failed:', error);
      process.exit(1);
    }
  }

  // Setup Redis connection
  async setupRedis() {
    try {
      this.redis = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        retryDelayOnFailover: 100,
        enableOfflineQueue: false,
      });

      this.redis.on('connect', () => {
        console.log('✅ Redis connected successfully');
      });

      this.redis.on('error', (err) => {
        console.error('❌ Redis connection error:', err);
      });

      await this.redis.connect();
      
      // Test Redis connection
      await this.redis.set('quantum_server_test', 'connected');
      const testValue = await this.redis.get('quantum_server_test');
      
      if (testValue === 'connected') {
        console.log('✅ Redis test successful');
        if (this.redis) await this.redis.del('quantum_server_test');
      }
    } catch (error) {
      console.error('❌ Redis setup failed:', error);
      console.warn('⚠️ Redis setup failed, running without Redis cache:', error.message);
      this.redis = null; // Set to null to indicate Redis is not available
      // Don't throw error, allow server to continue without Redis
    }
  }

  // Setup MongoDB connection
  async setupMongoDB() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ndeip';
      
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log('✅ MongoDB connected successfully');

      // Handle MongoDB connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
      });
    } catch (error) {
      console.error('❌ MongoDB setup failed:', error);
      console.warn('⚠️ MongoDB setup failed, running without MongoDB:', error.message);
      // Don't throw error, allow server to continue without MongoDB
    }
  }

  // Setup middleware
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS
    this.app.use(cors({
      origin: process.env.CLIENT_ORIGIN || "*",
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP',
        retryAfter: '15 minutes',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Compression
    this.app.use(compression());

    // Logging
    this.app.use(morgan('combined'));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request metrics
    this.app.use((req, res, next) => {
      const startTime = Date.now();
      this.healthMetrics.totalRequests++;
      
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        this.updateAverageResponseTime(responseTime);
      });
      
      next();
    });

    // Error handling middleware
    this.app.use((error, req, res, next) => {
      this.healthMetrics.errorsCount++;
      console.error('Server error:', error);
      
      res.status(error.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : error.message,
        requestId: req.headers['x-request-id'] || uuidv4(),
      });
    });
  }

  // Setup API routes
  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        metrics: this.healthMetrics,
        version: process.env.npm_package_version || '1.0.0',
      });
    });

    // Authentication routes
    this.app.post('/api/auth/register', this.handleRegister.bind(this));
    this.app.post('/api/auth/login', this.handleLogin.bind(this));
    this.app.post('/api/auth/refresh', this.handleRefreshToken.bind(this));
    this.app.post('/api/auth/logout', QuantumAuth.authenticate, this.handleLogout.bind(this));

    // User routes
    this.app.get('/api/users/profile', QuantumAuth.authenticate, this.getUserProfile.bind(this));
    this.app.put('/api/users/profile', QuantumAuth.authenticate, this.updateUserProfile.bind(this));
    this.app.get('/api/users/contacts', QuantumAuth.authenticate, this.getUserContacts.bind(this));

    // Message routes
    this.app.get('/api/messages/:chatId', QuantumAuth.authenticate, this.getMessages.bind(this));
    this.app.post('/api/messages', QuantumAuth.authenticate, this.sendMessage.bind(this));
    this.app.delete('/api/messages/:messageId', QuantumAuth.authenticate, this.deleteMessage.bind(this));

    // Chat routes
    this.app.get('/api/chats', QuantumAuth.authenticate, this.getChats.bind(this));
    this.app.post('/api/chats', QuantumAuth.authenticate, this.createChat.bind(this));
    this.app.put('/api/chats/:chatId', QuantumAuth.authenticate, this.updateChat.bind(this));

    // Media routes
    this.app.post('/api/media/upload', QuantumAuth.authenticate, this.handleMediaUpload.bind(this));
    this.app.get('/api/media/:mediaId', this.getMedia.bind(this));

    // Call routes
    this.app.post('/api/calls/initiate', QuantumAuth.authenticate, this.initiateCall.bind(this));
    this.app.post('/api/calls/:callId/answer', QuantumAuth.authenticate, this.answerCall.bind(this));
    this.app.post('/api/calls/:callId/end', QuantumAuth.authenticate, this.endCall.bind(this));

    // Status routes
    this.app.get('/api/status', QuantumAuth.authenticate, this.getStatuses.bind(this));
    this.app.post('/api/status', QuantumAuth.authenticate, this.createStatus.bind(this));

    // AI Service routes (future-ready)
    this.app.post('/api/ai/translate', QuantumAuth.authenticate, AIService.translateMessage.bind(AIService));
    this.app.post('/api/ai/smart-reply', QuantumAuth.authenticate, AIService.generateSmartReply.bind(AIService));
  }

  // Setup Socket.io for real-time communication
  setupSocketIO() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await models.QuantumUser.findById(decoded.userId).select('-password');
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.userData = user;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket) => {
      this.handleSocketConnection(socket);
    });
  }

  // Handle socket connection
  handleSocketConnection(socket) {
    const userId = socket.userId;
    console.log(`✅ User ${userId} connected`);

    // Store connection
    this.activeConnections.set(userId, socket);
    this.healthMetrics.activeConnections = this.activeConnections.size;

    // Update user online status
    this.updateUserOnlineStatus(userId, true);

    // Join user to their personal room
    socket.join(`user:${userId}`);

    // Load user's chat rooms
    this.loadUserChatRooms(socket, userId);

    // Socket event handlers
    socket.on('join_chat', (chatId) => this.handleJoinChat(socket, chatId));
    socket.on('leave_chat', (chatId) => this.handleLeaveChat(socket, chatId));
    socket.on('send_message', (data) => this.handleSendMessage(socket, data));
    socket.on('typing_start', (data) => this.handleTypingStart(socket, data));
    socket.on('typing_stop', (data) => this.handleTypingStop(socket, data));
    socket.on('message_read', (data) => this.handleMessageRead(socket, data));
    socket.on('call_signal', (data) => this.handleCallSignal(socket, data));
    socket.on('disconnect', () => this.handleSocketDisconnection(socket));

    // Send pending messages
    this.sendPendingMessages(userId);
  }

  // Handle socket disconnection
  handleSocketDisconnection(socket) {
    const userId = socket.userId;
    console.log(`❌ User ${userId} disconnected`);

    // Remove connection
    this.activeConnections.delete(userId);
    this.healthMetrics.activeConnections = this.activeConnections.size;

    // Update user offline status (with delay)
    setTimeout(() => {
      if (!this.activeConnections.has(userId)) {
        this.updateUserOnlineStatus(userId, false);
      }
    }, 30000); // 30 second delay
  }

  // Handle join chat room
  handleJoinChat(socket, chatId) {
    socket.join(`chat:${chatId}`);
    console.log(`User ${socket.userId} joined chat ${chatId}`);
  }

  // Handle leave chat room
  handleLeaveChat(socket, chatId) {
    socket.leave(`chat:${chatId}`);
    console.log(`User ${socket.userId} left chat ${chatId}`);
  }

  // Handle real-time message sending
  async handleSendMessage(socket, data) {
    try {
      const { chatId, content, type, replyTo } = data;
      const senderId = socket.userId;

      // Create message object
      const message = {
        _id: uuidv4(),
        chatId,
        senderId,
        content,
        type: type || 'text',
        replyTo,
        timestamp: new Date(),
        deliveredTo: [],
        readBy: [],
      };

      // Save to database
      await this.saveMessage(message);

      // Cache in Redis
      await this.cacheMessage(message);

      // Broadcast to chat room
      this.io.to(`chat:${chatId}`).emit('new_message', message);

      // Send push notifications to offline users
      await this.sendMessageNotifications(chatId, message, senderId);

      // Update metrics
      this.healthMetrics.messagesDelivered++;

      // Send delivery confirmation
      socket.emit('message_delivered', {
        messageId: message._id,
        timestamp: message.timestamp,
      });

    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('message_error', {
        error: 'Failed to send message',
        originalData: data,
      });
    }
  }

  // Handle typing indicators
  handleTypingStart(socket, data) {
    const { chatId } = data;
    socket.to(`chat:${chatId}`).emit('user_typing', {
      userId: socket.userId,
      chatId,
      isTyping: true,
    });
  }

  handleTypingStop(socket, data) {
    const { chatId } = data;
    socket.to(`chat:${chatId}`).emit('user_typing', {
      userId: socket.userId,
      chatId,
      isTyping: false,
    });
  }

  // Handle message read receipts
  async handleMessageRead(socket, data) {
    try {
      const { messageId, chatId } = data;
      const userId = socket.userId;

      // Update message read status
      await this.markMessageAsRead(messageId, userId);

      // Broadcast read receipt
      socket.to(`chat:${chatId}`).emit('message_read', {
        messageId,
        readBy: userId,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Message read error:', error);
    }
  }

  // Handle call signaling
  handleCallSignal(socket, data) {
    const { targetUserId, signal, type } = data;
    const targetSocket = this.activeConnections.get(targetUserId);

    if (targetSocket) {
      targetSocket.emit('call_signal', {
        fromUserId: socket.userId,
        signal,
        type,
      });
    }
  }

  // Authentication handlers
  async handleRegister(req, res) {
    try {
      const { name, email, password, phone } = req.body;

      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({
          error: 'Name, email, and password are required',
        });
      }

      // Check if user exists
      const existingUser = await models.QuantumUser.findOne({
        $or: [{ email }, { phone }],
      });

      if (existingUser) {
        return res.status(409).json({
          error: 'User already exists with this email or phone',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = new models.QuantumUser({
        name,
        email,
        password: hashedPassword,
        phone,
        profilePicture: null,
        lastSeen: new Date(),
        isOnline: false,
      });

      await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = QuantumAuth.generateTokens(user._id);

      // Cache user data
      await this.cacheUserData(user._id, user);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  async handleLogin(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await models.QuantumUser.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate tokens
      const { accessToken, refreshToken } = QuantumAuth.generateTokens(user._id);

      // Update last login
      user.lastSeen = new Date();
      await user.save();

      // Cache user data
      await this.cacheUserData(user._id, user);

      res.json({
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          profilePicture: user.profilePicture,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  async handleRefreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const { accessToken, refreshToken: newRefreshToken } = QuantumAuth.generateTokens(decoded.userId);

      res.json({
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }

  async handleLogout(req, res) {
    try {
      const userId = req.user.id;
      
      // Update user offline status
      await this.updateUserOnlineStatus(userId, false);
      
      // Clear cached user data
      if (this.redis) await this.redis.del(`user:${userId}`);
      
      res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  // Helper methods
  async saveMessage(message) {
    // In production, save to MongoDB
    console.log('Saving message:', message._id);
  }

  async cacheMessage(message) {
    if (this.redis) await this.redis.setex(
      `message:${message._id}`,
      3600, // 1 hour
      JSON.stringify(message)
    );
  }

  async cacheUserData(userId, userData) {
    if (this.redis) await this.redis.setex(
      `user:${userId}`,
      1800, // 30 minutes
      JSON.stringify(userData)
    );
  }

  async updateUserOnlineStatus(userId, isOnline) {
    try {
      await models.QuantumUser.findByIdAndUpdate(userId, {
        isOnline,
        lastSeen: new Date(),
      });

      // Broadcast status change
      this.io.emit('user_status_change', {
        userId,
        isOnline,
        lastSeen: new Date(),
      });
    } catch (error) {
      console.error('Update online status error:', error);
    }
  }

  updateAverageResponseTime(responseTime) {
    const { avgResponseTime, totalRequests } = this.healthMetrics;
    this.healthMetrics.avgResponseTime = 
      (avgResponseTime * (totalRequests - 1) + responseTime) / totalRequests;
  }

  // Setup health monitoring
  setupHealthMonitoring() {
    setInterval(() => {
      this.logHealthMetrics();
    }, 60000); // Log every minute

    setInterval(() => {
      this.cleanupExpiredData();
    }, 300000); // Cleanup every 5 minutes
  }

  logHealthMetrics() {
    console.log('🔍 Health Metrics:', {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      activeConnections: this.healthMetrics.activeConnections,
      totalRequests: this.healthMetrics.totalRequests,
      avgResponseTime: Math.round(this.healthMetrics.avgResponseTime),
      errorsCount: this.healthMetrics.errorsCount,
    });
  }

  async cleanupExpiredData() {
    try {
      // Cleanup expired Redis keys
      if (this.redis) {
        const expiredKeys = await this.redis.keys('*:expired:*');
        if (expiredKeys.length > 0) {
          await this.redis.del(expiredKeys);
        }
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  // Setup graceful shutdown
  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`\n📤 ${signal} received. Starting graceful shutdown...`);
      
      // Stop accepting new connections
      this.server.close(() => {
        console.log('✅ HTTP server closed');
      });

      // Close Socket.io
      this.io.close(() => {
        console.log('✅ Socket.io server closed');
      });

      // Close Redis connection
      if (this.redis) {
        await this.redis.quit();
        console.log('✅ Redis connection closed');
      }

      // Close MongoDB connection
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');

      console.log('👋 Graceful shutdown completed');
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  // Start the server
  start() {
    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || '0.0.0.0';

    this.server.listen(PORT, HOST, () => {
      console.log(`
🚀 QuantumServer is running!
📡 Port: ${PORT}
🌐 Host: ${HOST}
🔥 Environment: ${process.env.NODE_ENV || 'development'}
📊 Process ID: ${process.pid}
⚡ Node.js: ${process.version}
      `);
    });
  }

  // Placeholder methods for missing handlers
  async getUserProfile(req, res) {
    res.json({ message: 'Get user profile endpoint' });
  }

  async updateUserProfile(req, res) {
    res.json({ message: 'Update user profile endpoint' });
  }

  async getUserContacts(req, res) {
    res.json({ message: 'Get user contacts endpoint' });
  }

  async getMessages(req, res) {
    res.json({ message: 'Get messages endpoint' });
  }

  async sendMessage(req, res) {
    res.json({ message: 'Send message endpoint' });
  }

  async deleteMessage(req, res) {
    res.json({ message: 'Delete message endpoint' });
  }

  async getChats(req, res) {
    res.json({ message: 'Get chats endpoint' });
  }

  async createChat(req, res) {
    res.json({ message: 'Create chat endpoint' });
  }

  async updateChat(req, res) {
    res.json({ message: 'Update chat endpoint' });
  }

  async handleMediaUpload(req, res) {
    res.json({ message: 'Media upload endpoint' });
  }

  async getMedia(req, res) {
    res.json({ message: 'Get media endpoint' });
  }

  async initiateCall(req, res) {
    res.json({ message: 'Initiate call endpoint' });
  }

  async answerCall(req, res) {
    res.json({ message: 'Answer call endpoint' });
  }

  async endCall(req, res) {
    res.json({ message: 'End call endpoint' });
  }

  async getStatuses(req, res) {
    res.json({ message: 'Get statuses endpoint' });
  }

  async createStatus(req, res) {
    res.json({ message: 'Create status endpoint' });
  }

  async loadUserChatRooms(socket, userId) {
    // Load and join user's chat rooms
    console.log(`Loading chat rooms for user ${userId}`);
  }

  async sendPendingMessages(userId) {
    // Send any pending messages to the user
    console.log(`Sending pending messages to user ${userId}`);
  }

  async sendMessageNotifications(chatId, message, senderId) {
    // Send push notifications
    console.log(`Sending notifications for message ${message._id}`);
  }

  async markMessageAsRead(messageId, userId) {
    // Mark message as read
    console.log(`Marking message ${messageId} as read by ${userId}`);
  }
}

// Cluster management for production
if (cluster.isMaster && process.env.NODE_ENV === 'production') {
  const numCPUs = os.cpus().length;
  console.log(`🚀 Starting ${numCPUs} worker processes...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`🔄 Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // Worker process or development mode
  const server = new QuantumServer();
  server.start();
}

module.exports = QuantumServer;