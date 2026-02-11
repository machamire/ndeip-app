/**
 * ndeip Database Models Index
 * Exports all 18 MongoDB models for the messaging app
 */

// Core Communication Models (7)
const QuantumUser = require('./core/QuantumUser');
const QuantumOnboarding = require('./core/QuantumOnboarding');
const QuantumMessage = require('./core/QuantumMessage');
const QuantumGroup = require('./core/QuantumGroup');
const QuantumCall = require('./core/QuantumCall');
const QuantumMedia = require('./core/QuantumMedia');
const QuantumStatus = require('./core/QuantumStatus');

// System & Infrastructure Models (5)
const QuantumSecurity = require('./system/QuantumSecurity');
const QuantumSystem = require('./system/QuantumSystem');
const QuantumAdmin = require('./system/QuantumAdmin');
const QuantumAnalytics = require('./system/QuantumAnalytics');
const QuantumSession = require('./system/QuantumSession');

// Extended Feature Models (3)
const QuantumAIUsage = require('./features/QuantumAIUsage');
const QuantumNotification = require('./features/QuantumNotification');
const QuantumBilling = require('./features/QuantumBilling');

// Enterprise Models (3)
const QuantumNetwork = require('./enterprise/QuantumNetwork');
const QuantumDevice = require('./enterprise/QuantumDevice');
const QuantumBackup = require('./enterprise/QuantumBackup');

// Model Registry
const models = {
  // Core Communication Models
  QuantumUser,
  QuantumOnboarding,
  QuantumMessage,
  QuantumGroup,
  QuantumCall,
  QuantumMedia,
  QuantumStatus,
  
  // System & Infrastructure Models
  QuantumSecurity,
  QuantumSystem,
  QuantumAdmin,
  QuantumAnalytics,
  QuantumSession,
  
  // Extended Feature Models
  QuantumAIUsage,
  QuantumNotification,
  QuantumBilling,
  
  // Enterprise Models
  QuantumNetwork,
  QuantumDevice,
  QuantumBackup,
};

// Model validation
const validateModels = () => {
  const expectedModels = 18;
  const actualModels = Object.keys(models).length;
  
  if (actualModels !== expectedModels) {
    throw new Error(`Expected ${expectedModels} models, found ${actualModels}`);
  }
  
  console.log(`✅ All ${actualModels} ndeip database models loaded successfully`);
  return true;
};

// Database statistics
const getDatabaseStats = async () => {
  const stats = {};
  
  for (const [modelName, Model] of Object.entries(models)) {
    try {
      stats[modelName] = {
        count: await Model.countDocuments(),
        indexes: Object.keys(await Model.collection.getIndexes()).length,
        size: (await Model.collection.stats()).totalSize || 0,
      };
    } catch (error) {
      stats[modelName] = { error: error.message };
    }
  }
  
  return stats;
};

// Collection management
const initializeCollections = async () => {
  console.log('🚀 Initializing ndeip database collections...');
  
  const results = [];
  
  for (const [modelName, Model] of Object.entries(models)) {
    try {
      // Ensure indexes are created
      await Model.ensureIndexes();
      
      // Get collection info
      const stats = await Model.collection.stats().catch(() => ({ count: 0 }));
      
      results.push({
        model: modelName,
        collection: Model.collection.name,
        indexes: Object.keys(await Model.collection.getIndexes()).length,
        documents: stats.count || 0,
        status: 'ready',
      });
      
      console.log(`✅ ${modelName}: ${stats.count || 0} documents, indexes ready`);
      
    } catch (error) {
      console.error(`❌ ${modelName}: ${error.message}`);
      results.push({
        model: modelName,
        status: 'error',
        error: error.message,
      });
    }
  }
  
  console.log(`🎉 Database initialization complete! ${results.length} models ready.`);
  return results;
};

// Export everything
module.exports = {
  // All Models
  ...models,
  
  // Utility Functions
  validateModels,
  getDatabaseStats,
  initializeCollections,
  
  // Model Registry
  modelRegistry: models,
  modelCount: Object.keys(models).length,
  
  // Quick Access Collections
  coreModels: {
    QuantumUser,
    QuantumMessage,
    QuantumGroup,
    QuantumCall,
  },
  
  systemModels: {
    QuantumSecurity,
    QuantumSystem,
    QuantumAdmin,
    QuantumAnalytics,
  },
  
  extendedModels: {
    QuantumAIUsage,
    QuantumNotification,
    QuantumDevice,
    QuantumNetwork,
    QuantumBackup,
  },
};