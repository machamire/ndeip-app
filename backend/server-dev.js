/**
 * Development Server - Simple version without Redis
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
require('dotenv').config();

// Import models
const models = require('./models');

class DevServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.initializeServer();
  }

  async initializeServer() {
    try {
      // Setup MongoDB connection
      await this.setupMongoDB();
      
      // Setup middleware
      this.setupMiddleware();
      
      // Setup routes
      this.setupRoutes();
      
      console.log('🚀 Development Server initialized successfully');
    } catch (error) {
      console.error('❌ Server initialization failed:', error);
      process.exit(1);
    }
  }

  // Setup MongoDB connection
  async setupMongoDB() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ndeip';
      
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log('✅ MongoDB connected successfully');
    } catch (error) {
      console.warn('⚠️ MongoDB connection failed, continuing without database:', error.message);
    }
  }

  // Setup middleware
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());

    // CORS
    this.app.use(cors({
      origin: process.env.CLIENT_ORIGIN || "*",
      credentials: true,
    }));

    // Compression
    this.app.use(compression());

    // Logging
    this.app.use(morgan('dev'));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  // Authentication middleware
  authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access token required' });
      }

      const token = authHeader.substring(7);
      const secret = process.env.JWT_SECRET || 'dev-secret';
      const decoded = jwt.verify(token, secret);
      
      req.user = {
        id: decoded.userId,
        sessionId: decoded.sessionId,
      };
      
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  // Generate JWT tokens
  generateTokens(userId) {
    const sessionId = uuidv4();
    const secret = process.env.JWT_SECRET || 'dev-secret';
    
    const accessTokenPayload = {
      userId,
      sessionId,
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60),
    };
    
    const refreshTokenPayload = {
      userId,
      sessionId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
    };
    
    const accessToken = jwt.sign(accessTokenPayload, secret);
    const refreshToken = jwt.sign(refreshTokenPayload, secret);
    
    return { accessToken, refreshToken, expiresIn: 15 * 60 };
  }

  // Setup routes
  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        environment: 'development',
      });
    });

    // Test route
    this.app.get('/api/test', (req, res) => {
      res.json({ 
        message: 'Development server is working!',
        models: Object.keys(models),
        modelCount: Object.keys(models).length,
      });
    });

    // Authentication routes
    this.app.post('/api/auth/register', this.handleRegister.bind(this));
    this.app.post('/api/auth/login', this.handleLogin.bind(this));
    this.app.post('/api/auth/refresh', this.handleRefreshToken.bind(this));
    this.app.post('/api/auth/logout', this.authenticate.bind(this), this.handleLogout.bind(this));

    // Protected test route
    this.app.get('/api/protected', this.authenticate.bind(this), (req, res) => {
      res.json({ 
        message: 'This is a protected route',
        user: req.user,
      });
    });
  }

  // Authentication handlers
  async handleRegister(req, res) {
    try {
      const { name, email, password, phone } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          error: 'Name, email, and password are required',
        });
      }

      // Check if user exists (if MongoDB is available)
      if (models.QuantumUser) {
        const existingUser = await models.QuantumUser.findOne({
          $or: [{ email }, { phone }],
        }).catch(() => null);

        if (existingUser) {
          return res.status(409).json({
            error: 'User already exists with this email or phone',
          });
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user (if MongoDB is available)
      let user = { _id: uuidv4(), name, email, phone };
      if (models.QuantumUser) {
        user = new models.QuantumUser({
          name,
          email,
          password: hashedPassword,
          phone,
          lastSeen: new Date(),
          isOnline: false,
        });
        await user.save().catch(() => {
          // If save fails, continue with mock user
          user = { _id: uuidv4(), name, email, phone };
        });
      }

      // Generate tokens
      const tokens = this.generateTokens(user._id);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        ...tokens,
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  async handleLogin(req, res) {
    try {
      const { email, password } = req.body;

      // For development, allow a test user
      if (email === 'test@example.com' && password === 'password') {
        const tokens = this.generateTokens('test-user-id');
        return res.json({
          message: 'Login successful',
          user: {
            id: 'test-user-id',
            name: 'Test User',
            email: 'test@example.com',
          },
          ...tokens,
        });
      }

      // Try to find user in database (if available)
      if (models.QuantumUser) {
        const user = await models.QuantumUser.findOne({ email }).catch(() => null);
        if (user) {
          const isValidPassword = await bcrypt.compare(password, user.password);
          if (isValidPassword) {
            const tokens = this.generateTokens(user._id);
            return res.json({
              message: 'Login successful',
              user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
              },
              ...tokens,
            });
          }
        }
      }

      res.status(401).json({ error: 'Invalid credentials' });
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

      const secret = process.env.JWT_SECRET || 'dev-secret';
      const decoded = jwt.verify(refreshToken, secret);
      const tokens = this.generateTokens(decoded.userId);

      res.json(tokens);
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }

  async handleLogout(req, res) {
    res.json({ message: 'Logout successful' });
  }

  // Start the server
  start() {
    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || '0.0.0.0';

    this.server.listen(PORT, HOST, () => {
      console.log(`
🚀 Development Server is running!
📡 Port: ${PORT}
🌐 Host: ${HOST}
🔥 Environment: development
📊 Process ID: ${process.pid}
⚡ Node.js: ${process.version}

🧪 Test endpoints:
   GET  /health
   GET  /api/test
   POST /api/auth/login (test@example.com / password)
   GET  /api/protected (requires auth)
      `);
    });
  }
}

const server = new DevServer();
server.start();

module.exports = DevServer;