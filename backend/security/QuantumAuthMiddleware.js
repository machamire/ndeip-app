/**
 * QuantumAuth Middleware Extensions
 * Express middleware and helper functions for QuantumAuth
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Express middleware for authentication
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.substring(7);
    
    // Use a default secret if QuantumAuth is not initialized yet
    const secret = process.env.JWT_SECRET || 'default-secret-key';
    const decoded = jwt.verify(token, secret);
    
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
function generateTokens(userId) {
  const sessionId = crypto.randomUUID();
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  
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

module.exports = {
  authenticate,
  generateTokens,
};