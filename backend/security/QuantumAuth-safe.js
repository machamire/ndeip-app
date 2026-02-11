/**
 * QuantumAuth - Safe version without Redis dependency
 * Basic authentication for development
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const EventEmitter = require('events');

class QuantumAuth extends EventEmitter {
  constructor() {
    super();
    this.redis = null;
    this.masterKey = null;
    this.derivedKeys = null;
    
    this.initializeAuth();
  }

  // Initialize authentication system
  async initializeAuth() {
    try {
      // Initialize master key
      await this.initializeMasterKey();
      
      console.log('✅ QuantumAuth initialized successfully (Redis-free mode)');
      this.emit('initialized');
      
    } catch (error) {
      console.error('Failed to initialize QuantumAuth:', error);
      this.emit('error', error);
    }
  }

  // Initialize master key
  async initializeMasterKey() {
    try {
      // Try to load existing master key
      const existingKey = process.env.MASTER_KEY;
      
      if (existingKey) {
        this.masterKey = Buffer.from(existingKey, 'hex');
      } else {
        // Generate new master key
        this.masterKey = crypto.randomBytes(32);
        console.warn('Generated new master key. Store securely:', this.masterKey.toString('hex'));
      }
      
      // Derive additional keys
      this.deriveKeys();
      
    } catch (error) {
      console.error('Failed to initialize master key:', error);
      throw new Error('Master key initialization failed');
    }
  }

  // Derive additional encryption keys
  deriveKeys() {
    this.derivedKeys = {
      sessionKey: this.deriveKey(this.masterKey, 'session', 32),
      tokenKey: this.deriveKey(this.masterKey, 'token', 32),
      encryptionKey: this.deriveKey(this.masterKey, 'encryption', 32),
      signingKey: this.deriveKey(this.masterKey, 'signing', 64),
    };
  }

  // Derive key using HKDF
  deriveKey(masterKey, info, length) {
    const salt = crypto.createHash('sha256').update(info).digest();
    return crypto.hkdfSync('sha256', masterKey, salt, info, length);
  }

  // Express middleware for authentication
  authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access token required' });
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, this.derivedKeys?.tokenKey || process.env.JWT_SECRET || 'default-secret');
      
      // Add user info to request
      req.user = {
        id: decoded.userId,
        sessionId: decoded.sessionId,
      };
      
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  // Generate JWT tokens for Express routes
  generateTokens(userId) {
    const sessionId = crypto.randomUUID();
    const secret = this.derivedKeys?.tokenKey || process.env.JWT_SECRET || 'default-secret';
    
    const accessTokenPayload = {
      userId,
      sessionId,
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
    };
    
    const refreshTokenPayload = {
      userId,
      sessionId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
    };
    
    const accessToken = jwt.sign(accessTokenPayload, secret, {
      algorithm: 'HS256',
    });
    
    const refreshToken = jwt.sign(refreshTokenPayload, secret, {
      algorithm: 'HS256',
    });
    
    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes
    };
  }

  // Verify JWT token
  async verifyToken(token) {
    try {
      const secret = this.derivedKeys?.tokenKey || process.env.JWT_SECRET || 'default-secret';
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new Error('Invalid token');
    }
  }

  // Cleanup
  async cleanup() {
    this.removeAllListeners();
  }
}

// Export singleton instance
module.exports = new QuantumAuth();