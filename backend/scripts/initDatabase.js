/**
 * Database Initialization Script for ndeip
 * Creates MongoDB database, collections, and indexes
 */

require('dotenv').config();
const mongoose = require('mongoose');
const models = require('../models');

class DatabaseInitializer {
  constructor() {
    this.connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/ndeip';
  }

  async initialize() {
    try {
      console.log('🚀 Starting ndeip database initialization...');
      
      // Connect to MongoDB
      await this.connectToDatabase();
      
      // Initialize collections and indexes
      await this.initializeCollections();
      
      // Create sample data (optional)
      if (process.env.CREATE_SAMPLE_DATA === 'true') {
        await this.createSampleData();
      }
      
      console.log('✅ Database initialization completed successfully!');
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      process.exit(1);
    } finally {
      await mongoose.connection.close();
      console.log('👋 Database connection closed');
    }
  }

  async connectToDatabase() {
    console.log('📡 Connecting to MongoDB...');
    
    await mongoose.connect(this.connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log(`✅ Connected to MongoDB: ${mongoose.connection.name}`);
    console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
  }

  async initializeCollections() {
    console.log('📋 Initializing collections and indexes...');
    
    const modelNames = Object.keys(models.modelRegistry);
    console.log(`📊 Found ${modelNames.length} models to initialize`);
    
    for (const modelName of modelNames) {
      try {
        const Model = models.modelRegistry[modelName];
        
        // Ensure indexes are created
        await Model.ensureIndexes();
        
        // Get collection stats
        const stats = await Model.collection.stats().catch(() => ({ count: 0 }));
        const indexes = await Model.collection.getIndexes();
        
        console.log(`✅ ${modelName}:`);
        console.log(`   📄 Documents: ${stats.count || 0}`);
        console.log(`   🔍 Indexes: ${Object.keys(indexes).length}`);
        
      } catch (error) {
        console.error(`❌ Failed to initialize ${modelName}:`, error.message);
      }
    }
  }

  async createSampleData() {
    console.log('🎭 Creating sample data...');
    
    try {
      // Create sample admin user
      const adminUser = new models.QuantumUser({
        username: 'admin',
        email: 'admin@ndeip.com',
        phoneNumber: '+1234567890',
        password: 'Admin123!',
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          displayName: 'ndeip Admin',
          about: 'System Administrator',
        },
        auth: {
          isVerified: true,
          emailVerified: true,
          phoneVerified: true,
        },
        subscription: {
          plan: 'quantum',
          status: 'active',
        },
      });
      
      await adminUser.save();
      console.log('✅ Created admin user');
      
      // Create sample regular user
      const regularUser = new models.QuantumUser({
        username: 'testuser',
        email: 'test@ndeip.com',
        phoneNumber: '+1234567891',
        password: 'Test123!',
        profile: {
          firstName: 'Test',
          lastName: 'User',
          displayName: 'Test User',
          about: 'Testing the ndeip app',
        },
        auth: {
          isVerified: true,
          emailVerified: true,
          phoneVerified: true,
        },
      });
      
      await regularUser.save();
      console.log('✅ Created test user');
      
      console.log('🎉 Sample data created successfully!');
      
    } catch (error) {
      if (error.code === 11000) {
        console.log('ℹ️ Sample data already exists, skipping...');
      } else {
        console.error('❌ Failed to create sample data:', error.message);
      }
    }
  }

  async dropDatabase() {
    console.log('⚠️ Dropping database...');
    await mongoose.connection.dropDatabase();
    console.log('✅ Database dropped');
  }

  async showDatabaseInfo() {
    console.log('\n📊 Database Information:');
    console.log(`Database: ${mongoose.connection.name}`);
    console.log(`Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
    const stats = await mongoose.connection.db.stats();
    console.log(`Collections: ${stats.collections}`);
    console.log(`Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Indexes: ${stats.indexes}`);
    console.log(`Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'init';
  
  const initializer = new DatabaseInitializer();
  
  switch (command) {
    case 'init':
      await initializer.initialize();
      break;
      
    case 'drop':
      console.log('⚠️ WARNING: This will delete all data!');
      console.log('Type "yes" to confirm:');
      
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question('Confirm: ', async (answer) => {
        if (answer.toLowerCase() === 'yes') {
          await initializer.connectToDatabase();
          await initializer.dropDatabase();
        } else {
          console.log('❌ Operation cancelled');
        }
        rl.close();
        process.exit(0);
      });
      break;
      
    case 'info':
      await initializer.connectToDatabase();
      await initializer.showDatabaseInfo();
      await mongoose.connection.close();
      break;
      
    case 'reset':
      await initializer.connectToDatabase();
      await initializer.dropDatabase();
      await initializer.initialize();
      break;
      
    default:
      console.log('Usage: node initDatabase.js [command]');
      console.log('Commands:');
      console.log('  init   - Initialize database (default)');
      console.log('  drop   - Drop database');
      console.log('  info   - Show database info');
      console.log('  reset  - Drop and reinitialize database');
      process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseInitializer;