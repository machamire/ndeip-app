/**
 * Simple QuantumServer - Minimal working version
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');

class SimpleQuantumServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.initializeServer();
  }

  async initializeServer() {
    try {
      // Setup middleware
      this.setupMiddleware();
      
      // Setup routes
      this.setupRoutes();
      
      console.log('🚀 Simple QuantumServer initialized successfully');
    } catch (error) {
      console.error('❌ Server initialization failed:', error);
      process.exit(1);
    }
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Basic routes
    this.app.get('/api/test', (req, res) => {
      res.json({ message: 'Server is working!' });
    });
  }

  start() {
    const PORT = process.env.PORT || 3000;
    
    this.server.listen(PORT, () => {
      console.log(`🚀 Simple QuantumServer running on port ${PORT}`);
    });
  }
}

const server = new SimpleQuantumServer();
server.start();

module.exports = SimpleQuantumServer;