/**
 * AIService - AI-Powered Features for ndeip (Future-Ready)
 * Smart replies, real-time translation, content moderation, smart notifications
 * Designed for scalability with multiple AI providers
 */

const OpenAI = require('openai');
const axios = require('axios');
const crypto = require('crypto');
const EventEmitter = require('events');
const Redis = require('redis');

// AI service providers
const AI_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GOOGLE: 'google',
  AZURE: 'azure',
  LOCAL: 'local',
};

// AI feature types
const AI_FEATURES = {
  SMART_REPLIES: 'smart_replies',
  TRANSLATION: 'translation',
  CONTENT_MODERATION: 'content_moderation',
  SENTIMENT_ANALYSIS: 'sentiment_analysis',
  SMART_NOTIFICATIONS: 'smart_notifications',
  VOICE_ENHANCEMENT: 'voice_enhancement',
  IMAGE_RECOGNITION: 'image_recognition',
  TEXT_SUMMARIZATION: 'text_summarization',
};

// Content moderation levels
const MODERATION_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  STRICT: 'strict',
};

// Language codes
const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'sw': 'Swahili',
  'zu': 'Zulu',
  'xh': 'Xhosa',
  'af': 'Afrikaans',
  'sn': 'Shona',
  'nd': 'Ndebele',
};

class AIService extends EventEmitter {
  constructor() {
    super();
    this.providers = new Map();
    this.cache = null;
    this.config = {
      defaultProvider: AI_PROVIDERS.OPENAI,
      fallbackProvider: AI_PROVIDERS.GOOGLE,
      cacheEnabled: true,
      cacheTTL: 3600, // 1 hour
      rateLimits: {
        smartReplies: 100, // per minute
        translation: 50,
        moderation: 200,
      },
      costs: {
        smartReplies: 0.001, // per request
        translation: 0.002,
        moderation: 0.0005,
      },
    };
    
    this.initializeService();
  }

  // Initialize AI service
  async initializeService() {
    try {
      // Initialize cache
      await this.initializeCache();
      
      // Initialize AI providers
      await this.initializeProviders();
      
      // Set up rate limiting
      this.setupRateLimiting();
      
      console.log('AIService initialized successfully');
      this.emit('initialized');
      
    } catch (error) {
      console.error('Failed to initialize AIService:', error);
      this.emit('error', error);
    }
  }

  // Initialize cache
  async initializeCache() {
    if (this.config.cacheEnabled) {
      try {
        this.cache = Redis.createClient({
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          password: process.env.REDIS_PASSWORD,
        });
        
        await this.cache.connect();
        console.log('AI cache initialized');
        
      } catch (error) {
        console.warn('Failed to initialize AI cache:', error);
        this.cache = null;
      }
    }
  }

  // Initialize AI providers
  async initializeProviders() {
    // OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.providers.set(AI_PROVIDERS.OPENAI, {
        client: new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        }),
        models: {
          smartReplies: 'gpt-3.5-turbo',
          translation: 'gpt-3.5-turbo',
          moderation: 'text-moderation-latest',
          summarization: 'gpt-3.5-turbo',
        },
      });
    }

    // Google Translate
    if (process.env.GOOGLE_TRANSLATE_API_KEY) {
      this.providers.set(AI_PROVIDERS.GOOGLE, {
        apiKey: process.env.GOOGLE_TRANSLATE_API_KEY,
        baseURL: 'https://translation.googleapis.com/language/translate/v2',
      });
    }

    // Azure Cognitive Services
    if (process.env.AZURE_API_KEY) {
      this.providers.set(AI_PROVIDERS.AZURE, {
        apiKey: process.env.AZURE_API_KEY,
        endpoint: process.env.AZURE_ENDPOINT,
      });
    }
  }

  // Setup rate limiting
  setupRateLimiting() {
    this.rateLimiters = new Map();
    
    Object.keys(this.config.rateLimits).forEach(feature => {
      this.rateLimiters.set(feature, new Map());
    });
  }

  // Check rate limit
  async checkRateLimit(feature, userId) {
    const limit = this.config.rateLimits[feature];
    if (!limit) return true;

    const key = `${feature}:${userId}`;
    const current = Date.now();
    const window = 60 * 1000; // 1 minute

    if (this.cache) {
      const count = await this.cache.incr(key);
      if (count === 1) {
        await this.cache.expire(key, 60);
      }
      return count <= limit;
    } else {
      // In-memory rate limiting
      const limiter = this.rateLimiters.get(feature);
      const userLimiter = limiter.get(userId) || { count: 0, resetTime: current + window };
      
      if (current > userLimiter.resetTime) {
        userLimiter.count = 1;
        userLimiter.resetTime = current + window;
      } else {
        userLimiter.count++;
      }
      
      limiter.set(userId, userLimiter);
      return userLimiter.count <= limit;
    }
  }

  // Generate smart replies
  async generateSmartReplies(messageText, conversationContext = [], userId, options = {}) {
    try {
      // Check rate limit
      if (!(await this.checkRateLimit(AI_FEATURES.SMART_REPLIES, userId))) {
        throw new Error('Rate limit exceeded for smart replies');
      }

      // Check cache
      const cacheKey = this.generateCacheKey('smart_replies', messageText, conversationContext);
      if (this.cache) {
        const cached = await this.cache.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const provider = this.providers.get(options.provider || this.config.defaultProvider);
      if (!provider) {
        throw new Error('AI provider not available');
      }

      let replies = [];

      if (options.provider === AI_PROVIDERS.OPENAI || !options.provider) {
        replies = await this.generateOpenAISmartReplies(provider, messageText, conversationContext, options);
      }

      // Cache results
      if (this.cache && replies.length > 0) {
        await this.cache.setEx(cacheKey, this.config.cacheTTL, JSON.stringify(replies));
      }

      // Log usage
      this.logUsage(AI_FEATURES.SMART_REPLIES, userId, this.config.costs.smartReplies);

      this.emit('smartRepliesGenerated', { userId, messageText, replies });

      return replies;

    } catch (error) {
      console.error('Smart replies generation failed:', error);
      this.emit('error', { feature: AI_FEATURES.SMART_REPLIES, error, userId });
      return [];
    }
  }

  // Generate OpenAI smart replies
  async generateOpenAISmartReplies(provider, messageText, conversationContext, options) {
    const contextMessages = conversationContext.slice(-5).map(msg => ({
      role: msg.isOwn ? 'assistant' : 'user',
      content: msg.text,
    }));

    const response = await provider.client.chat.completions.create({
      model: provider.models.smartReplies,
      messages: [
        {
          role: 'system',
          content: `Generate 3 short, natural, and contextually appropriate reply suggestions for a messaging app. 
                   The replies should be casual, friendly, and varied in tone (positive, neutral, question).
                   Each reply should be maximum 50 characters. Return only the replies, separated by newlines.`,
        },
	...contextMessages,	
        {
          role: 'user',
          content: messageText,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
      n: 1,
    });

    const repliesText = response.choices[0]?.message?.content || '';
    return repliesText
      .split('\n')
      .filter(reply => reply.trim())
      .slice(0, 3)
      .map(reply => ({
        text: reply.trim(),
        confidence: 0.8 + Math.random() * 0.2,
        type: this.categorizeReply(reply.trim()),
      }));
  }

  // Categorize reply type
  categorizeReply(reply) {
    const lowerReply = reply.toLowerCase();
    
    if (lowerReply.includes('?')) return 'question';
    if (lowerReply.includes('thanks') || lowerReply.includes('great') || lowerReply.includes('awesome')) return 'positive';
    if (lowerReply.includes('ok') || lowerReply.includes('sure') || lowerReply.includes('yes')) return 'agreement';
    if (lowerReply.includes('no') || lowerReply.includes('sorry')) return 'negative';
    
    return 'neutral';
  }

  // Real-time translation
  async translateMessage(text, targetLanguage, sourceLanguage = 'auto', userId, options = {}) {
    try {
      // Check rate limit
      if (!(await this.checkRateLimit(AI_FEATURES.TRANSLATION, userId))) {
        throw new Error('Rate limit exceeded for translation');
      }

      // Check cache
      const cacheKey = this.generateCacheKey('translation', text, sourceLanguage, targetLanguage);
      if (this.cache) {
        const cached = await this.cache.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      let result;

      // Try Google Translate first
      if (this.providers.has(AI_PROVIDERS.GOOGLE)) {
        result = await this.translateWithGoogle(text, targetLanguage, sourceLanguage);
      } else if (this.providers.has(AI_PROVIDERS.OPENAI)) {
        result = await this.translateWithOpenAI(text, targetLanguage, sourceLanguage);
      } else {
        throw new Error('No translation provider available');
      }

      // Cache results
      if (this.cache && result) {
        await this.cache.setEx(cacheKey, this.config.cacheTTL * 24, JSON.stringify(result)); // Cache for 24 hours
      }

      // Log usage
      this.logUsage(AI_FEATURES.TRANSLATION, userId, this.config.costs.translation);

      this.emit('messageTranslated', { userId, originalText: text, translatedText: result.text, targetLanguage });

      return result;

    } catch (error) {
      console.error('Translation failed:', error);
      this.emit('error', { feature: AI_FEATURES.TRANSLATION, error, userId });
      return null;
    }
  }

  // Translate with Google
  async translateWithGoogle(text, targetLanguage, sourceLanguage) {
    const provider = this.providers.get(AI_PROVIDERS.GOOGLE);
    
    const params = {
      q: text,
      target: targetLanguage,
      key: provider.apiKey,
      format: 'text',
    };

    if (sourceLanguage !== 'auto') {
      params.source = sourceLanguage;
    }

    const response = await axios.post(provider.baseURL, null, { params });
    
    const translation = response.data.data.translations[0];
    
    return {
      text: translation.translatedText,
      detectedLanguage: translation.detectedSourceLanguage || sourceLanguage,
      confidence: 0.9,
      provider: AI_PROVIDERS.GOOGLE,
    };
  }

  // Translate with OpenAI
  async translateWithOpenAI(text, targetLanguage, sourceLanguage) {
    const provider = this.providers.get(AI_PROVIDERS.OPENAI);
    const targetLangName = SUPPORTED_LANGUAGES[targetLanguage] || targetLanguage;
    
    const response = await provider.client.chat.completions.create({
      model: provider.models.translation,
      messages: [
        {
          role: 'system',
          content: `Translate the following text to ${targetLangName}. Return only the translated text, no explanations.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    return {
      text: response.choices[0]?.message?.content || text,
      detectedLanguage: sourceLanguage,
      confidence: 0.8,
      provider: AI_PROVIDERS.OPENAI,
    };
  }

  // Content moderation
  async moderateContent(content, userId, options = {}) {
    try {
      // Check rate limit
      if (!(await this.checkRateLimit(AI_FEATURES.CONTENT_MODERATION, userId))) {
        return { safe: true, reason: 'Rate limit check' };
      }

      // Check cache
      const cacheKey = this.generateCacheKey('moderation', content);
      if (this.cache) {
        const cached = await this.cache.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      let result;

      if (this.providers.has(AI_PROVIDERS.OPENAI)) {
        result = await this.moderateWithOpenAI(content, options);
      } else {
        result = await this.moderateWithFallback(content, options);
      }

      // Cache results
      if (this.cache && result) {
        await this.cache.setEx(cacheKey, this.config.cacheTTL * 6, JSON.stringify(result)); // Cache for 6 hours
      }

      // Log usage
      this.logUsage(AI_FEATURES.CONTENT_MODERATION, userId, this.config.costs.moderation);

      if (!result.safe) {
        this.emit('unsafeContentDetected', { userId, content, result });
      }

      return result;

    } catch (error) {
      console.error('Content moderation failed:', error);
      this.emit('error', { feature: AI_FEATURES.CONTENT_MODERATION, error, userId });
      
      // Default to safe in case of error
      return { safe: true, reason: 'Moderation service unavailable' };
    }
  }

  // Moderate with OpenAI
  async moderateWithOpenAI(content, options) {
    const provider = this.providers.get(AI_PROVIDERS.OPENAI);
    
    const response = await provider.client.moderations.create({
      input: content,
      model: provider.models.moderation,
    });

    const result = response.results[0];
    
    return {
      safe: !result.flagged,
      categories: Object.keys(result.categories).filter(key => result.categories[key]),
      scores: result.category_scores,
      provider: AI_PROVIDERS.OPENAI,
    };
  }

  // Fallback moderation (rule-based)
  async moderateWithFallback(content, options) {
    const prohibitedWords = [
      // Add your prohibited words list
      'spam', 'scam', 'phishing',
    ];

    const lowerContent = content.toLowerCase();
    const foundWords = prohibitedWords.filter(word => lowerContent.includes(word));

    return {
      safe: foundWords.length === 0,
      categories: foundWords.length > 0 ? ['prohibited-words'] : [],
      foundWords,
      provider: 'fallback',
    };
  }

  // Sentiment analysis
  async analyzeSentiment(text, userId, options = {}) {
    try {
      // Check cache
      const cacheKey = this.generateCacheKey('sentiment', text);
      if (this.cache) {
        const cached = await this.cache.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      let result;

      if (this.providers.has(AI_PROVIDERS.OPENAI)) {
        result = await this.analyzeSentimentWithOpenAI(text);
      } else {
        result = await this.analyzeSentimentFallback(text);
      }

      // Cache results
      if (this.cache && result) {
        await this.cache.setEx(cacheKey, this.config.cacheTTL * 2, JSON.stringify(result));
      }

      this.emit('sentimentAnalyzed', { userId, text, sentiment: result });

      return result;

    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return { sentiment: 'neutral', confidence: 0, provider: 'error' };
    }
  }

  // Analyze sentiment with OpenAI
  async analyzeSentimentWithOpenAI(text) {
    const provider = this.providers.get(AI_PROVIDERS.OPENAI);
    
    const response = await provider.client.chat.completions.create({
      model: provider.models.smartReplies,
      messages: [
        {
          role: 'system',
          content: 'Analyze the sentiment of the following text. Respond with only: positive, negative, or neutral.',
        },
        {
          role: 'user',
          content: text,
        },
      ],
      max_tokens: 10,
      temperature: 0,
    });

    const sentiment = response.choices[0]?.message?.content?.trim().toLowerCase() || 'neutral';
    
    return {
      sentiment: ['positive', 'negative', 'neutral'].includes(sentiment) ? sentiment : 'neutral',
      confidence: 0.8,
      provider: AI_PROVIDERS.OPENAI,
    };
  }

  // Fallback sentiment analysis
  async analyzeSentimentFallback(text) {
    const positiveWords = ['good', 'great', 'awesome', 'love', 'happy', 'excellent', 'amazing'];
    const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'sad', 'angry', 'worst'];
    
    const lowerText = text.toLowerCase();
    const positiveScore = positiveWords.reduce((score, word) => {
      return score + (lowerText.includes(word) ? 1 : 0);
    }, 0);
    
    const negativeScore = negativeWords.reduce((score, word) => {
      return score + (lowerText.includes(word) ? 1 : 0);
    }, 0);
    
    let sentiment = 'neutral';
    if (positiveScore > negativeScore) sentiment = 'positive';
    else if (negativeScore > positiveScore) sentiment = 'negative';
    
    return {
      sentiment,
      confidence: Math.abs(positiveScore - negativeScore) / Math.max(positiveScore + negativeScore, 1),
      provider: 'fallback',
    };
  }

  // Smart notification optimization
  async optimizeNotificationTiming(userId, message, userPreferences = {}) {
    try {
      // Get user's activity patterns
      const activityPattern = await this.getUserActivityPattern(userId);
      
      // Analyze message urgency
      const urgency = await this.analyzeMessageUrgency(message);
      
      // Calculate optimal delivery time
      const optimalTime = this.calculateOptimalDeliveryTime(activityPattern, urgency, userPreferences);
      
      return {
        shouldDelayNotification: optimalTime.delay > 0,
        delayMinutes: optimalTime.delay,
        reason: optimalTime.reason,
        confidence: optimalTime.confidence,
        urgencyScore: urgency.score,
      };

    } catch (error) {
      console.error('Smart notification optimization failed:', error);
      return {
        shouldDelayNotification: false,
        delayMinutes: 0,
        reason: 'optimization_failed',
        confidence: 0,
      };
    }
  }

  // Get user activity pattern
  async getUserActivityPattern(userId) {
    // This would typically query your analytics database
    // For now, return a mock pattern
    return {
      activeHours: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
      peakHours: [12, 18, 20],
      timezone: 'Africa/Harare',
      averageResponseTime: 300, // seconds
      lastActiveTime: new Date(),
    };
  }

  // Analyze message urgency
  async analyzeMessageUrgency(message) {
    const urgentKeywords = ['urgent', 'emergency', 'asap', 'immediately', 'help', 'problem'];
    const questionMarks = (message.text.match(/\?/g) || []).length;
    const exclamationMarks = (message.text.match(/!/g) || []).length;
    
    let score = 0;
    
    // Check for urgent keywords
    const lowerText = message.text.toLowerCase();
    urgentKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) score += 0.3;
    });
    
    // Check punctuation
    score += questionMarks * 0.1;
    score += exclamationMarks * 0.2;
    
    // Check message length (shorter might be more urgent)
    if (message.text.length < 20) score += 0.1;
    
    // Check if it's a call or voice message
    if (message.type === 'call' || message.type === 'voice') score += 0.4;
    
    return {
      score: Math.min(score, 1),
      level: score > 0.7 ? 'high' : score > 0.4 ? 'medium' : 'low',
    };
  }

  // Calculate optimal delivery time
  calculateOptimalDeliveryTime(activityPattern, urgency, userPreferences) {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Always deliver urgent messages immediately
    if (urgency.level === 'high') {
      return {
        delay: 0,
        reason: 'urgent_message',
        confidence: 0.9,
      };
    }
    
    // Check if user is likely to be active
    const isActiveHour = activityPattern.activeHours.includes(currentHour);
    
    if (isActiveHour) {
      return {
        delay: 0,
        reason: 'user_active_hours',
        confidence: 0.8,
      };
    }
    
    // Find next active hour
    const nextActiveHour = activityPattern.activeHours.find(hour => hour > currentHour) || 
                          activityPattern.activeHours[0]; // Next day
    
    const hoursUntilActive = nextActiveHour > currentHour ? 
                            nextActiveHour - currentHour : 
                            (24 - currentHour) + nextActiveHour;
    
    const delayMinutes = Math.min(hoursUntilActive * 60, 480); // Max 8 hours delay
    
    return {
      delay: delayMinutes,
      reason: 'optimized_for_user_activity',
      confidence: 0.7,
    };
  }

  // Text summarization
  async summarizeText(text, maxLength = 100, userId, options = {}) {
    try {
      if (text.length <= maxLength) {
        return { summary: text, originalLength: text.length, compressed: false };
      }

      // Check cache
      const cacheKey = this.generateCacheKey('summarization', text, maxLength);
      if (this.cache) {
        const cached = await this.cache.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      let result;

      if (this.providers.has(AI_PROVIDERS.OPENAI)) {
        result = await this.summarizeWithOpenAI(text, maxLength);
      } else {
        result = await this.summarizeWithFallback(text, maxLength);
      }

      // Cache results
      if (this.cache && result) {
        await this.cache.setEx(cacheKey, this.config.cacheTTL, JSON.stringify(result));
      }

      this.emit('textSummarized', { userId, originalLength: text.length, summaryLength: result.summary.length });

      return result;

    } catch (error) {
      console.error('Text summarization failed:', error);
      return {
        summary: text.substring(0, maxLength) + (text.length > maxLength ? '...' : ''),
        originalLength: text.length,
        compressed: text.length > maxLength,
        provider: 'fallback',
      };
    }
  }

  // Summarize with OpenAI
  async summarizeWithOpenAI(text, maxLength) {
    const provider = this.providers.get(AI_PROVIDERS.OPENAI);
    
    const response = await provider.client.chat.completions.create({
      model: provider.models.summarization,
      messages: [
        {
          role: 'system',
          content: `Summarize the following text in approximately ${maxLength} characters or less. Keep the key information and maintain the original tone.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      max_tokens: Math.ceil(maxLength / 2),
      temperature: 0.3,
    });

    const summary = response.choices[0]?.message?.content || text;
    
    return {
      summary: summary.substring(0, maxLength),
      originalLength: text.length,
      compressed: summary.length < text.length,
      provider: AI_PROVIDERS.OPENAI,
    };
  }

  // Fallback summarization
  async summarizeWithFallback(text, maxLength) {
    // Simple extractive summarization
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    if (sentences.length <= 1) {
      return {
        summary: text.substring(0, maxLength),
        originalLength: text.length,
        compressed: text.length > maxLength,
        provider: 'fallback',
      };
    }
    
    // Take first and last sentences if they fit
    const firstSentence = sentences[0].trim();
    const lastSentence = sentences[sentences.length - 1].trim();
    const combined = `${firstSentence}. ${lastSentence}`;
    
    if (combined.length <= maxLength) {
      return {
        summary: combined,
        originalLength: text.length,
        compressed: true,
        provider: 'fallback',
      };
    }
    
    return {
      summary: firstSentence.substring(0, maxLength),
      originalLength: text.length,
      compressed: true,
      provider: 'fallback',
    };
  }

  // Generate cache key
  generateCacheKey(...args) {
    const key = args.join(':');
    return crypto.createHash('md5').update(key).digest('hex');
  }

  // Log usage for billing/analytics
  logUsage(feature, userId, cost) {
    const usageData = {
      feature,
      userId,
      cost,
      timestamp: new Date(),
      provider: this.config.defaultProvider,
    };
    
    // This would typically be sent to your analytics/billing system
    this.emit('usageLogged', usageData);
  }

  // Get service health
  getServiceHealth() {
    const health = {
      status: 'healthy',
      providers: {},
      cache: this.cache ? 'connected' : 'disabled',
      features: Object.values(AI_FEATURES),
    };
    
    this.providers.forEach((provider, name) => {
      health.providers[name] = 'available';
    });
    
    return health;
  }

  // Update configuration
  updateConfiguration(newConfig) {
    Object.assign(this.config, newConfig);
    this.emit('configurationUpdated', this.config);
  }

  // Cleanup
  async cleanup() {
    if (this.cache) {
      await this.cache.disconnect();
    }
    this.removeAllListeners();
  }
}

// Export singleton instance
module.exports = new AIService();

// Export constants and classes
module.exports.AIService = AIService;
module.exports.AI_PROVIDERS = AI_PROVIDERS;
module.exports.AI_FEATURES = AI_FEATURES;
module.exports.MODERATION_LEVELS = MODERATION_LEVELS;
module.exports.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;