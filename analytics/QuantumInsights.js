/**
 * QuantumInsights - Privacy-First Analytics System
 * User experience metrics, feature usage analytics, business intelligence
 * No personal data collection with mesh visualization insights
 */

const crypto = require('crypto');
const EventEmitter = require('events');

class QuantumInsights extends EventEmitter {
  constructor() {
    super();
    
    this.isEnabled = process.env.ANALYTICS_ENABLED !== 'false';
    this.environment = process.env.NODE_ENV || 'development';
    this.batchSize = parseInt(process.env.ANALYTICS_BATCH_SIZE) || 100;
    this.flushInterval = parseInt(process.env.ANALYTICS_FLUSH_INTERVAL) || 30000; // 30 seconds
    
    // Privacy-first configuration
    this.privacyConfig = {
      enablePersonalData: false,
      enableBehaviorAnalytics: true,
      enablePerformanceMetrics: true,
      enableErrorTracking: true,
      enableFeatureUsage: true,
      dataRetentionDays: 90,
      anonymizeImmediately: true,
    };

    // Analytics storage
    this.eventQueue = [];
    this.sessionStore = new Map();
    this.aggregatedMetrics = new Map();
    this.userSegments = new Map();
    
    // Mesh-specific analytics
    this.meshMetrics = {
      interactions: new Map(),
      performance: new Map(),
      patterns: new Map(),
      accessibility: new Map(),
    };

    // Real-time insights
    this.realTimeMetrics = {
      activeUsers: 0,
      currentSessions: 0,
      messagesPerMinute: 0,
      callsActive: 0,
      errorRate: 0,
      averageResponseTime: 0,
    };

    this.initializeAnalytics();
  }

  // Initialize analytics system
  initializeAnalytics() {
    if (!this.isEnabled) {
      console.log('📊 QuantumInsights disabled');
      return;
    }

    try {
      // Setup periodic data flushing
      this.flushTimer = setInterval(() => {
        this.flushAnalytics();
      }, this.flushInterval);

      // Setup metric aggregation
      this.aggregationTimer = setInterval(() => {
        this.aggregateMetrics();
      }, 60000); // Every minute

      // Setup cleanup for expired data
      this.cleanupTimer = setInterval(() => {
        this.cleanupExpiredData();
      }, 24 * 60 * 60 * 1000); // Daily

      console.log('📊 QuantumInsights initialized successfully');
    } catch (error) {
      console.error('❌ QuantumInsights initialization failed:', error);
    }
  }

  // ===============================
  // USER EXPERIENCE METRICS
  // ===============================

  // Track user session start
  trackSessionStart(sessionData) {
    if (!this.isEnabled) return;

    const sessionId = this.generateSessionId();
    const anonymizedData = this.anonymizeUserData(sessionData);
    
    const session = {
      sessionId,
      startTime: Date.now(),
      platform: anonymizedData.platform,
      appVersion: anonymizedData.appVersion,
      deviceType: anonymizedData.deviceType,
      networkType: anonymizedData.networkType,
      meshTheme: anonymizedData.meshTheme,
      features: [],
      interactions: [],
      errors: [],
      meshEvents: [],
    };

    this.sessionStore.set(sessionId, session);
    this.realTimeMetrics.activeUsers++;
    this.realTimeMetrics.currentSessions++;

    this.trackEvent('session_start', {
      sessionId,
      platform: session.platform,
      appVersion: session.appVersion,
      meshTheme: session.meshTheme,
    });

    return sessionId;
  }

  // Track user session end
  trackSessionEnd(sessionId, endData = {}) {
    if (!this.isEnabled || !sessionId) return;

    const session = this.sessionStore.get(sessionId);
    if (!session) return;

    const endTime = Date.now();
    const duration = endTime - session.startTime;

    const sessionMetrics = {
      sessionId,
      duration,
      featuresUsed: session.features.length,
      totalInteractions: session.interactions.length,
      errorsEncountered: session.errors.length,
      meshInteractions: session.meshEvents.length,
      endReason: endData.reason || 'normal',
      meshPatternChanges: this.countMeshPatternChanges(session),
    };

    this.trackEvent('session_end', sessionMetrics);
    this.sessionStore.delete(sessionId);
    this.realTimeMetrics.currentSessions = Math.max(0, this.realTimeMetrics.currentSessions - 1);

    return sessionMetrics;
  }

  // Track screen views with mesh context
  trackScreenView(screenName, sessionId, meshContext = {}) {
    if (!this.isEnabled) return;

    const viewData = {
      screen: screenName,
      sessionId: this.anonymizeSessionId(sessionId),
      timestamp: Date.now(),
      loadTime: meshContext.loadTime,
      meshPattern: meshContext.pattern,
      meshIntensity: meshContext.intensity,
      accessibility: meshContext.accessibility,
    };

    this.trackEvent('screen_view', viewData);

    // Update session
    const session = this.sessionStore.get(sessionId);
    if (session) {
      session.interactions.push({
        type: 'screen_view',
        screen: screenName,
        timestamp: Date.now(),
        meshContext,
      });
    }
  }

  // Track user interactions with mesh elements
  trackMeshInteraction(interactionType, sessionId, meshData = {}) {
    if (!this.isEnabled) return;

    const interaction = {
      type: interactionType,
      sessionId: this.anonymizeSessionId(sessionId),
      timestamp: Date.now(),
      meshPattern: meshData.pattern,
      meshVariant: meshData.variant,
      intensity: meshData.intensity,
      duration: meshData.duration,
      successful: meshData.successful !== false,
      accessibilityMode: meshData.accessibilityMode,
    };

    this.trackEvent('mesh_interaction', interaction);

    // Store in mesh-specific metrics
    const key = `${interactionType}_${meshData.pattern}`;
    const current = this.meshMetrics.interactions.get(key) || 0;
    this.meshMetrics.interactions.set(key, current + 1);

    // Update session
    const session = this.sessionStore.get(sessionId);
    if (session) {
      session.meshEvents.push(interaction);
    }
  }

  // ===============================
  // FEATURE USAGE ANALYTICS
  // ===============================

  // Track feature usage
  trackFeatureUsage(featureName, sessionId, usageData = {}) {
    if (!this.isEnabled) return;

    const usage = {
      feature: featureName,
      sessionId: this.anonymizeSessionId(sessionId),
      timestamp: Date.now(),
      context: usageData.context,
      success: usageData.success !== false,
      duration: usageData.duration,
      meshEnhanced: usageData.meshEnhanced === true,
      accessibility: usageData.accessibility,
    };

    this.trackEvent('feature_usage', usage);

    // Update session
    const session = this.sessionStore.get(sessionId);
    if (session) {
      if (!session.features.includes(featureName)) {
        session.features.push(featureName);
      }
    }

    // Update feature metrics
    this.updateFeatureMetrics(featureName, usage);
  }

  // Track messaging features
  trackMessageSent(messageType, sessionId, messageData = {}) {
    this.trackFeatureUsage('message_send', sessionId, {
      context: messageType,
      success: true,
      meshEnhanced: messageData.meshEffects === true,
      duration: messageData.compositionTime,
    });

    // Update real-time metrics
    this.updateRealTimeMessaging();
  }

  trackMessageReceived(messageType, sessionId, messageData = {}) {
    this.trackFeatureUsage('message_receive', sessionId, {
      context: messageType,
      success: true,
      meshEnhanced: messageData.meshEffects === true,
    });
  }

  // Track call features
  trackCallInitiated(callType, sessionId, callData = {}) {
    this.trackFeatureUsage('call_initiate', sessionId, {
      context: callType,
      success: callData.connected === true,
      duration: callData.setupTime,
      meshEnhanced: callData.meshEffects === true,
    });

    if (callData.connected) {
      this.realTimeMetrics.callsActive++;
    }
  }

  trackCallEnded(callType, sessionId, callData = {}) {
    this.trackFeatureUsage('call_end', sessionId, {
      context: callType,
      success: true,
      duration: callData.duration,
      meshEnhanced: callData.meshEffects === true,
    });

    this.realTimeMetrics.callsActive = Math.max(0, this.realTimeMetrics.callsActive - 1);
  }

  // Track status features
  trackStatusCreated(statusType, sessionId, statusData = {}) {
    this.trackFeatureUsage('status_create', sessionId, {
      context: statusType,
      success: true,
      meshEnhanced: statusData.meshEffects === true,
      duration: statusData.creationTime,
    });
  }

  trackStatusViewed(statusType, sessionId, viewData = {}) {
    this.trackFeatureUsage('status_view', sessionId, {
      context: statusType,
      success: true,
      duration: viewData.viewDuration,
      meshEnhanced: viewData.meshEffects === true,
    });
  }

  // ===============================
  // PERFORMANCE METRICS
  // ===============================

  // Track app performance
  trackPerformanceMetric(metricName, value, context = {}) {
    if (!this.isEnabled) return;

    const metric = {
      metric: metricName,
      value,
      timestamp: Date.now(),
      context,
      platform: context.platform,
      deviceType: context.deviceType,
      meshIntensity: context.meshIntensity,
    };

    this.trackEvent('performance_metric', metric);

    // Store in performance aggregation
    this.updatePerformanceAggregation(metricName, value);

    // Update real-time metrics
    if (metricName === 'api_response_time') {
      this.updateAverageResponseTime(value);
    }
  }

  // Track mesh rendering performance
  trackMeshPerformance(meshType, performanceData) {
    if (!this.isEnabled) return;

    const meshPerf = {
      meshType,
      fps: performanceData.fps,
      renderTime: performanceData.renderTime,
      memoryUsage: performanceData.memoryUsage,
      complexity: performanceData.complexity,
      animationCount: performanceData.animationCount,
      timestamp: Date.now(),
    };

    this.trackEvent('mesh_performance', meshPerf);

    // Store in mesh metrics
    const key = `${meshType}_performance`;
    const current = this.meshMetrics.performance.get(key) || [];
    current.push(meshPerf);
    
    // Keep only last 100 measurements
    if (current.length > 100) {
      current.splice(0, current.length - 100);
    }
    
    this.meshMetrics.performance.set(key, current);
  }

  // Track loading times
  trackLoadTime(component, loadTime, context = {}) {
    this.trackPerformanceMetric('load_time', loadTime, {
      component,
      ...context,
    });
  }

  // Track memory usage
  trackMemoryUsage(component, memoryUsage, context = {}) {
    this.trackPerformanceMetric('memory_usage', memoryUsage, {
      component,
      ...context,
    });
  }

  // ===============================
  // ERROR TRACKING
  // ===============================

  // Track application errors
  trackError(error, sessionId, context = {}) {
    if (!this.isEnabled) return;

    const errorData = {
      errorType: error.name || 'UnknownError',
      errorMessage: this.sanitizeErrorMessage(error.message),
      stackTrace: this.sanitizeStackTrace(error.stack),
      sessionId: this.anonymizeSessionId(sessionId),
      timestamp: Date.now(),
      component: context.component,
      action: context.action,
      meshContext: context.meshContext,
      severity: context.severity || 'error',
    };

    this.trackEvent('error', errorData);

    // Update session
    const session = this.sessionStore.get(sessionId);
    if (session) {
      session.errors.push({
        type: errorData.errorType,
        timestamp: Date.now(),
        component: context.component,
      });
    }

    // Update real-time error rate
    this.updateErrorRate();
  }

  // Track mesh-specific errors
  trackMeshError(meshComponent, error, context = {}) {
    this.trackError(error, context.sessionId, {
      component: 'mesh_system',
      action: 'mesh_render',
      meshContext: {
        component: meshComponent,
        pattern: context.pattern,
        intensity: context.intensity,
        variant: context.variant,
      },
      severity: 'warning',
    });
  }

  // ===============================
  // BUSINESS INTELLIGENCE
  // ===============================

  // Track user engagement metrics
  trackEngagement(engagementType, sessionId, engagementData = {}) {
    if (!this.isEnabled) return;

    const engagement = {
      type: engagementType,
      sessionId: this.anonymizeSessionId(sessionId),
      timestamp: Date.now(),
      duration: engagementData.duration,
      depth: engagementData.depth,
      meshInteractions: engagementData.meshInteractions || 0,
      featureCount: engagementData.featureCount || 0,
    };

    this.trackEvent('user_engagement', engagement);
  }

  // Track retention metrics
  trackRetention(retentionType, userData = {}) {
    if (!this.isEnabled) return;

    const retention = {
      type: retentionType,
      timestamp: Date.now(),
      daysSinceInstall: userData.daysSinceInstall,
      daysSinceLastUse: userData.daysSinceLastUse,
      totalSessions: userData.totalSessions,
      meshThemeChanges: userData.meshThemeChanges || 0,
    };

    this.trackEvent('user_retention', retention);
  }

  // Track conversion events
  trackConversion(conversionType, conversionData = {}) {
    if (!this.isEnabled) return;

    const conversion = {
      type: conversionType,
      timestamp: Date.now(),
      value: conversionData.value,
      currency: conversionData.currency,
      subscriptionTier: conversionData.subscriptionTier,
      meshCustomization: conversionData.meshCustomization === true,
    };

    this.trackEvent('conversion', conversion);
  }

  // ===============================
  // MESH VISUALIZATION INSIGHTS
  // ===============================

  // Analyze mesh usage patterns
  analyzeMeshPatterns() {
    const patterns = {
      popularPatterns: this.getPopularMeshPatterns(),
      performanceByPattern: this.getMeshPerformanceByPattern(),
      accessibilityUsage: this.getMeshAccessibilityUsage(),
      customizationTrends: this.getMeshCustomizationTrends(),
    };

    return {
      patterns,
      insights: this.generateMeshInsights(patterns),
      recommendations: this.generateMeshRecommendations(patterns),
    };
  }

  // Get popular mesh patterns
  getPopularMeshPatterns() {
    const patterns = new Map();
    
    for (const [key, count] of this.meshMetrics.interactions.entries()) {
      const [type, pattern] = key.split('_');
      if (pattern) {
        const current = patterns.get(pattern) || 0;
        patterns.set(pattern, current + count);
      }
    }

    return Array.from(patterns.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([pattern, count]) => ({ pattern, count }));
  }

  // Analyze mesh performance by pattern
  getMeshPerformanceByPattern() {
    const performance = new Map();
    
    for (const [key, measurements] of this.meshMetrics.performance.entries()) {
      const pattern = key.replace('_performance', '');
      
      if (measurements.length > 0) {
        const avgFps = measurements.reduce((sum, m) => sum + m.fps, 0) / measurements.length;
        const avgRenderTime = measurements.reduce((sum, m) => sum + m.renderTime, 0) / measurements.length;
        
        performance.set(pattern, {
          averageFps: Math.round(avgFps),
          averageRenderTime: Math.round(avgRenderTime),
          sampleCount: measurements.length,
        });
      }
    }

    return Object.fromEntries(performance);
  }

  // Get mesh accessibility usage statistics
  getMeshAccessibilityUsage() {
    const accessibility = {
      highContrast: 0,
      reducedMotion: 0,
      total: 0,
    };

    // Count accessibility features from stored data
    for (const [sessionId, session] of this.sessionStore.entries()) {
      accessibility.total++;
      
      session.meshEvents.forEach(event => {
        if (event.accessibilityMode) {
          if (event.accessibilityMode.includes('highContrast')) {
            accessibility.highContrast++;
          }
          if (event.accessibilityMode.includes('reducedMotion')) {
            accessibility.reducedMotion++;
          }
        }
      });
    }

    return accessibility;
  }

  // Analyze mesh customization trends
  getMeshCustomizationTrends() {
    const trends = {
      themeChanges: 0,
      patternChanges: 0,
      intensityAdjustments: 0,
      colorCustomizations: 0,
    };

    // Analyze customization events from aggregated data
    // This would be populated from tracked events
    
    return trends;
  }

  // Generate insights from mesh analytics
  generateMeshInsights(patterns) {
    const insights = [];

    // Performance insights
    const performanceData = patterns.performanceByPattern;
    const lowPerformancePatterns = Object.entries(performanceData)
      .filter(([pattern, data]) => data.averageFps < 30)
      .map(([pattern]) => pattern);

    if (lowPerformancePatterns.length > 0) {
      insights.push({
        type: 'performance',
        severity: 'warning',
        message: `Mesh patterns with low performance detected: ${lowPerformancePatterns.join(', ')}`,
        recommendation: 'Consider optimizing these patterns or providing performance alternatives',
      });
    }

    // Usage insights
    const popularPatterns = patterns.popularPatterns;
    if (popularPatterns.length > 0) {
      insights.push({
        type: 'usage',
        severity: 'info',
        message: `Most popular mesh pattern: ${popularPatterns[0].pattern} (${popularPatterns[0].count} interactions)`,
        recommendation: 'Consider featuring this pattern more prominently',
      });
    }

    // Accessibility insights
    const accessibilityData = patterns.accessibilityUsage;
    const accessibilityUsage = accessibilityData.total > 0 ? 
      (accessibilityData.highContrast + accessibilityData.reducedMotion) / accessibilityData.total : 0;

    if (accessibilityUsage > 0.1) {
      insights.push({
        type: 'accessibility',
        severity: 'info',
        message: `${Math.round(accessibilityUsage * 100)}% of users utilize accessibility features`,
        recommendation: 'Continue prioritizing accessibility in mesh design',
      });
    }

    return insights;
  }

  // Generate mesh recommendations
  generateMeshRecommendations(patterns) {
    const recommendations = [];

    // Performance recommendations
    const avgFps = Object.values(patterns.performanceByPattern)
      .reduce((sum, data) => sum + data.averageFps, 0) / 
      Object.keys(patterns.performanceByPattern).length || 0;

    if (avgFps < 45) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        title: 'Optimize Mesh Rendering Performance',
        description: 'Average FPS is below optimal. Consider reducing mesh complexity or implementing adaptive quality.',
        impact: 'high',
      });
    }

    // User experience recommendations
    const interactionCount = Array.from(this.meshMetrics.interactions.values())
      .reduce((sum, count) => sum + count, 0);

    if (interactionCount < 100) {
      recommendations.push({
        category: 'engagement',
        priority: 'medium',
        title: 'Increase Mesh Interactivity',
        description: 'Low mesh interaction rates. Consider adding more interactive mesh elements.',
        impact: 'medium',
      });
    }

    return recommendations;
  }

  // ===============================
  // REAL-TIME ANALYTICS
  // ===============================

  // Get real-time dashboard data
  getRealTimeDashboard() {
    return {
      users: {
        active: this.realTimeMetrics.activeUsers,
        sessions: this.realTimeMetrics.currentSessions,
      },
      activity: {
        messagesPerMinute: this.realTimeMetrics.messagesPerMinute,
        activeCalls: this.realTimeMetrics.callsActive,
      },
      performance: {
        errorRate: this.realTimeMetrics.errorRate,
        avgResponseTime: this.realTimeMetrics.averageResponseTime,
      },
      mesh: {
        interactions: this.getMeshInteractionRate(),
        patterns: this.getActiveMeshPatterns(),
        performance: this.getCurrentMeshPerformance(),
      },
      timestamp: Date.now(),
    };
  }

  // Get current mesh interaction rate
  getMeshInteractionRate() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    let interactions = 0;
    for (const session of this.sessionStore.values()) {
      interactions += session.meshEvents.filter(
        event => event.timestamp > oneMinuteAgo
      ).length;
    }

    return interactions;
  }

  // Get currently active mesh patterns
  getActiveMeshPatterns() {
    const patterns = new Set();
    
    for (const session of this.sessionStore.values()) {
      session.meshEvents.forEach(event => {
        if (event.meshPattern) {
          patterns.add(event.meshPattern);
        }
      });
    }

    return Array.from(patterns);
  }

  // Get current mesh performance snapshot
  getCurrentMeshPerformance() {
    const recentPerformance = [];
    const fiveMinutesAgo = Date.now() - 300000;

    for (const measurements of this.meshMetrics.performance.values()) {
      const recent = measurements.filter(m => m.timestamp > fiveMinutesAgo);
      recentPerformance.push(...recent);
    }

    if (recentPerformance.length === 0) {
      return { avgFps: 0, avgRenderTime: 0, sampleCount: 0 };
    }

    const avgFps = recentPerformance.reduce((sum, m) => sum + m.fps, 0) / recentPerformance.length;
    const avgRenderTime = recentPerformance.reduce((sum, m) => sum + m.renderTime, 0) / recentPerformance.length;

    return {
      avgFps: Math.round(avgFps),
      avgRenderTime: Math.round(avgRenderTime),
      sampleCount: recentPerformance.length,
    };
  }

  // ===============================
  // UTILITY FUNCTIONS
  // ===============================

  // Generate anonymous session ID
  generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
  }

  // Anonymize session ID for events
  anonymizeSessionId(sessionId) {
    if (!sessionId) return null;
    return crypto.createHash('sha256').update(sessionId).digest('hex').substring(0, 16);
  }

  // Anonymize user data
  anonymizeUserData(userData) {
    return {
      platform: userData.platform,
      appVersion: userData.appVersion,
      deviceType: this.categorizeDevice(userData.deviceInfo),
      networkType: userData.networkType,
      meshTheme: userData.meshTheme,
      // Remove any potentially identifying information
    };
  }

  // Categorize device for analytics
  categorizeDevice(deviceInfo) {
    if (!deviceInfo) return 'unknown';
    
    if (deviceInfo.isTablet) return 'tablet';
    if (deviceInfo.platform === 'ios') return 'iphone';
    if (deviceInfo.platform === 'android') return 'android';
    return 'unknown';
  }

  // Sanitize error messages
  sanitizeErrorMessage(message) {
    if (!message) return 'No message';
    
    // Remove potential user data from error messages
    return message
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[email]')
      .replace(/\b\d{10,}\b/g, '[phone]')
      .replace(/\b[A-Za-z0-9]{20,}\b/g, '[token]');
  }

  // Sanitize stack traces
  sanitizeStackTrace(stack) {
    if (!stack) return null;
    
    // Keep only the first few lines and remove file paths
    return stack
      .split('\n')
      .slice(0, 5)
      .map(line => line.replace(/\/.*?\//g, '/[path]/'))
      .join('\n');
  }

  // Track generic event
  trackEvent(eventType, eventData) {
    if (!this.isEnabled) return;

    const event = {
      type: eventType,
      ...eventData,
      timestamp: Date.now(),
      environment: this.environment,
    };

    this.eventQueue.push(event);

    // Emit event for real-time processing
    this.emit('event', event);

    // Auto-flush if queue is full
    if (this.eventQueue.length >= this.batchSize) {
      this.flushAnalytics();
    }
  }

  // Update feature metrics
  updateFeatureMetrics(featureName, usage) {
    const key = `feature_${featureName}`;
    const current = this.aggregatedMetrics.get(key) || {
      totalUsage: 0,
      successRate: 0,
      averageDuration: 0,
      meshEnhanced: 0,
      samples: [],
    };

    current.totalUsage++;
    current.samples.push(usage);
    
    // Keep only last 1000 samples
    if (current.samples.length > 1000) {
      current.samples.splice(0, current.samples.length - 1000);
    }

    // Recalculate metrics
    const successful = current.samples.filter(s => s.success).length;
    const withDuration = current.samples.filter(s => s.duration).map(s => s.duration);
    const meshEnhanced = current.samples.filter(s => s.meshEnhanced).length;

    current.successRate = successful / current.samples.length;
    current.averageDuration = withDuration.length > 0 ? 
      withDuration.reduce((sum, d) => sum + d, 0) / withDuration.length : 0;
    current.meshEnhanced = meshEnhanced;

    this.aggregatedMetrics.set(key, current);
  }

  // Update performance aggregation
  updatePerformanceAggregation(metricName, value) {
    const key = `perf_${metricName}`;
    const current = this.aggregatedMetrics.get(key) || {
      count: 0,
      sum: 0,
      min: Infinity,
      max: -Infinity,
      average: 0,
      samples: [],
    };

    current.count++;
    current.sum += value;
    current.min = Math.min(current.min, value);
    current.max = Math.max(current.max, value);
    current.average = current.sum / current.count;
    current.samples.push({ value, timestamp: Date.now() });

    // Keep only last 1000 samples
    if (current.samples.length > 1000) {
      current.samples.splice(0, current.samples.length - 1000);
    }

    this.aggregatedMetrics.set(key, current);
  }

  // Update real-time messaging metrics
  updateRealTimeMessaging() {
    const now = Date.now();
    const key = 'messages_per_minute';
    const current = this.aggregatedMetrics.get(key) || { timestamps: [] };
    
    current.timestamps.push(now);
    
    // Remove timestamps older than 1 minute
    const oneMinuteAgo = now - 60000;
    current.timestamps = current.timestamps.filter(ts => ts > oneMinuteAgo);
    
    this.realTimeMetrics.messagesPerMinute = current.timestamps.length;
    this.aggregatedMetrics.set(key, current);
  }

  // Update average response time
  updateAverageResponseTime(responseTime) {
    const current = this.realTimeMetrics.averageResponseTime;
    const alpha = 0.1; // Smoothing factor
    
    this.realTimeMetrics.averageResponseTime = current === 0 ? 
      responseTime : 
      (alpha * responseTime) + ((1 - alpha) * current);
  }

  // Update error rate
  updateErrorRate() {
    const now = Date.now();
    const key = 'errors_per_minute';
    const current = this.aggregatedMetrics.get(key) || { timestamps: [] };
    
    current.timestamps.push(now);
    
    // Remove timestamps older than 1 minute
    const oneMinuteAgo = now - 60000;
    current.timestamps = current.timestamps.filter(ts => ts > oneMinuteAgo);
    
    this.realTimeMetrics.errorRate = current.timestamps.length;
    this.aggregatedMetrics.set(key, current);
  }

  // Count mesh pattern changes in session
  countMeshPatternChanges(session) {
    const patterns = new Set();
    session.meshEvents.forEach(event => {
      if (event.meshPattern) {
        patterns.add(event.meshPattern);
      }
    });
    return patterns.size;
  }

  // Aggregate metrics periodically
  aggregateMetrics() {
    // Calculate hourly, daily aggregations
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDate();

    // This would typically aggregate data into time-based buckets
    // For now, just log the current state
    console.log('📊 Aggregating metrics...', {
      events: this.eventQueue.length,
      sessions: this.sessionStore.size,
      metrics: this.aggregatedMetrics.size,
    });
  }

  // Clean up expired data
  cleanupExpiredData() {
    const retentionMs = this.privacyConfig.dataRetentionDays * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - retentionMs;

    // Clean up old events
    this.eventQueue = this.eventQueue.filter(event => event.timestamp > cutoff);

    // Clean up old aggregated data
    for (const [key, data] of this.aggregatedMetrics.entries()) {
      if (data.samples) {
        data.samples = data.samples.filter(sample => sample.timestamp > cutoff);
      }
    }

    console.log('🧹 Cleaned up expired analytics data');
  }

  // Flush analytics to storage/external service
  async flushAnalytics() {
    if (this.eventQueue.length === 0) return;

    try {
      const events = [...this.eventQueue];
      this.eventQueue = [];

      // In production, send to analytics service
      if (this.environment === 'production') {
        await this.sendToAnalyticsService(events);
      } else {
        // In development, just log
        console.log(`📊 Would send ${events.length} analytics events:`, {
          eventTypes: [...new Set(events.map(e => e.type))],
          totalEvents: events.length,
        });
      }
    } catch (error) {
      console.error('Analytics flush failed:', error);
      // Re-queue events for retry
      this.eventQueue.unshift(...this.eventQueue);
    }
  }

  // Send events to external analytics service
  async sendToAnalyticsService(events) {
    // Implementation would depend on chosen analytics service
    // Example: Send to Google Analytics, Mixpanel, or custom endpoint
    
    const payload = {
      events,
      metadata: {
        appVersion: process.env.npm_package_version,
        environment: this.environment,
        timestamp: Date.now(),
      },
    };

    // Mock implementation
    console.log('📡 Sending analytics payload:', {
      eventCount: events.length,
      size: JSON.stringify(payload).length,
    });
  }

  // Get analytics summary
  getAnalyticsSummary() {
    return {
      system: {
        enabled: this.isEnabled,
        environment: this.environment,
        queuedEvents: this.eventQueue.length,
        activeSessions: this.sessionStore.size,
        aggregatedMetrics: this.aggregatedMetrics.size,
      },
      realTime: this.realTimeMetrics,
      mesh: {
        totalInteractions: Array.from(this.meshMetrics.interactions.values())
          .reduce((sum, count) => sum + count, 0),
        uniquePatterns: this.meshMetrics.interactions.size,
        performanceMetrics: this.meshMetrics.performance.size,
      },
      privacy: this.privacyConfig,
    };
  }

  // Destroy analytics instance
  destroy() {
    if (this.flushTimer) clearInterval(this.flushTimer);
    if (this.aggregationTimer) clearInterval(this.aggregationTimer);
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);

    // Final flush
    this.flushAnalytics();

    this.removeAllListeners();
    console.log('📊 QuantumInsights destroyed');
  }
}

// Create singleton instance
const quantumInsights = new QuantumInsights();

// Export for use in application
module.exports = quantumInsights;