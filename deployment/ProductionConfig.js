/**
 * ProductionConfig - One-click Deployment Configuration
 * Environment management, feature flags, monitoring setup
 * Auto-scaling configuration for production deployment
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class ProductionConfig {
  constructor() {
    this.environments = ['development', 'staging', 'production'];
    this.currentEnv = process.env.NODE_ENV || 'development';
    this.configPath = path.join(__dirname, 'configs');
    
    this.config = this.loadConfiguration();
    this.featureFlags = this.loadFeatureFlags();
    this.deploymentConfig = this.loadDeploymentConfig();
    
    this.validateConfiguration();
  }

  // Load environment-specific configuration
  loadConfiguration() {
    const baseConfig = {
      // Server Configuration
      server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || '0.0.0.0',
        protocol: process.env.PROTOCOL || 'http',
        domain: process.env.DOMAIN || 'localhost',
        cors: {
          origin: process.env.CORS_ORIGIN || '*',
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        },
        rateLimit: {
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: process.env.RATE_LIMIT_MAX || 100,
          message: 'Too many requests from this IP',
        },
        compression: {
          enabled: true,
          level: 6,
          threshold: 1024,
        },
        ssl: {
          enabled: process.env.SSL_ENABLED === 'true',
          keyPath: process.env.SSL_KEY_PATH,
          certPath: process.env.SSL_CERT_PATH,
          caPath: process.env.SSL_CA_PATH,
        },
      },

      // Database Configuration
      database: {
        mongodb: {
          uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ndeip',
          options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: parseInt(process.env.MONGO_POOL_SIZE) || 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferMaxEntries: 0,
            bufferCommands: false,
          },
          indexes: {
            autoCreate: process.env.NODE_ENV !== 'production',
            background: true,
          },
        },
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD,
          db: parseInt(process.env.REDIS_DB) || 0,
          keyPrefix: process.env.REDIS_KEY_PREFIX || 'ndeip:',
          retryDelayOnFailover: 100,
          enableOfflineQueue: false,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          connectTimeout: 10000,
          commandTimeout: 5000,
        },
      },

      // Authentication & Security
      auth: {
        jwt: {
          secret: process.env.JWT_SECRET,
          refreshSecret: process.env.JWT_REFRESH_SECRET,
          accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
          refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
          issuer: process.env.JWT_ISSUER || 'ndeip',
          audience: process.env.JWT_AUDIENCE || 'ndeip-users',
        },
        encryption: {
          masterKey: process.env.MASTER_ENCRYPTION_KEY,
          algorithm: 'aes-256-gcm',
          keyRotationInterval: 24 * 60 * 60 * 1000, // 24 hours
        },
        session: {
          maxSessions: parseInt(process.env.MAX_SESSIONS_PER_USER) || 5,
          sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
          cleanupInterval: 60 * 60 * 1000, // 1 hour
        },
        twoFactor: {
          enabled: process.env.TWO_FACTOR_ENABLED === 'true',
          issuer: 'ndeip',
          windowSize: 2,
        },
      },

      // File Storage
      storage: {
        provider: process.env.STORAGE_PROVIDER || 'local', // 'local', 'aws', 'gcp', 'azure'
        local: {
          uploadPath: process.env.UPLOAD_PATH || './uploads',
          maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB
          allowedMimeTypes: [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/quicktime', 'video/x-msvideo',
            'audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg',
            'application/pdf', 'text/plain',
          ],
        },
        aws: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION || 'us-east-1',
          bucket: process.env.AWS_S3_BUCKET,
          cloudFront: {
            enabled: process.env.AWS_CLOUDFRONT_ENABLED === 'true',
            domain: process.env.AWS_CLOUDFRONT_DOMAIN,
          },
        },
        gcp: {
          projectId: process.env.GCP_PROJECT_ID,
          keyFilename: process.env.GCP_KEY_FILE,
          bucket: process.env.GCP_STORAGE_BUCKET,
        },
        azure: {
          accountName: process.env.AZURE_STORAGE_ACCOUNT,
          accountKey: process.env.AZURE_STORAGE_KEY,
          containerName: process.env.AZURE_CONTAINER_NAME,
        },
      },

      // External Services
      services: {
        email: {
          provider: process.env.EMAIL_PROVIDER || 'sendgrid', // 'sendgrid', 'mailgun', 'ses'
          sendgrid: {
            apiKey: process.env.SENDGRID_API_KEY,
            fromEmail: process.env.FROM_EMAIL || 'noreply@ndeip.com',
            fromName: process.env.FROM_NAME || 'ndeip',
          },
          mailgun: {
            apiKey: process.env.MAILGUN_API_KEY,
            domain: process.env.MAILGUN_DOMAIN,
          },
          ses: {
            region: process.env.AWS_SES_REGION || 'us-east-1',
            accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
          },
        },
        sms: {
          provider: process.env.SMS_PROVIDER || 'twilio', // 'twilio', 'vonage'
          twilio: {
            accountSid: process.env.TWILIO_ACCOUNT_SID,
            authToken: process.env.TWILIO_AUTH_TOKEN,
            fromNumber: process.env.TWILIO_FROM_NUMBER,
          },
          vonage: {
            apiKey: process.env.VONAGE_API_KEY,
            apiSecret: process.env.VONAGE_API_SECRET,
            fromNumber: process.env.VONAGE_FROM_NUMBER,
          },
        },
        push: {
          firebase: {
            serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
            databaseURL: process.env.FIREBASE_DATABASE_URL,
          },
          apns: {
            keyPath: process.env.APNS_KEY_PATH,
            keyId: process.env.APNS_KEY_ID,
            teamId: process.env.APNS_TEAM_ID,
            bundleId: process.env.APNS_BUNDLE_ID,
            production: process.env.APNS_PRODUCTION === 'true',
          },
        },
        ai: {
          openai: {
            apiKey: process.env.OPENAI_API_KEY,
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 150,
          },
          googleTranslate: {
            projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
            keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
          },
          perspectiveAPI: {
            apiKey: process.env.PERSPECTIVE_API_KEY,
          },
        },
      },

      // Monitoring & Logging
      monitoring: {
        enabled: process.env.MONITORING_ENABLED !== 'false',
        prometheus: {
          enabled: process.env.PROMETHEUS_ENABLED === 'true',
          port: parseInt(process.env.PROMETHEUS_PORT) || 9090,
          endpoint: process.env.PROMETHEUS_ENDPOINT || '/metrics',
        },
        sentry: {
          enabled: process.env.SENTRY_ENABLED === 'true',
          dsn: process.env.SENTRY_DSN,
          environment: this.currentEnv,
          tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
        },
        datadog: {
          enabled: process.env.DATADOG_ENABLED === 'true',
          apiKey: process.env.DATADOG_API_KEY,
          service: 'ndeip-backend',
          env: this.currentEnv,
        },
        logging: {
          level: process.env.LOG_LEVEL || (this.currentEnv === 'production' ? 'info' : 'debug'),
          format: process.env.LOG_FORMAT || 'json',
          destinations: {
            console: true,
            file: {
              enabled: process.env.LOG_TO_FILE === 'true',
              path: process.env.LOG_FILE_PATH || './logs/app.log',
              maxSize: process.env.LOG_MAX_SIZE || '10m',
              maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
            },
            elasticsearch: {
              enabled: process.env.ELASTICSEARCH_LOGGING === 'true',
              node: process.env.ELASTICSEARCH_NODE,
              index: process.env.ELASTICSEARCH_INDEX || 'ndeip-logs',
            },
          },
        },
      },

      // Performance & Scaling
      performance: {
        clustering: {
          enabled: process.env.CLUSTERING_ENABLED === 'true',
          workers: parseInt(process.env.CLUSTER_WORKERS) || require('os').cpus().length,
        },
        caching: {
          enabled: process.env.CACHING_ENABLED !== 'false',
          defaultTTL: parseInt(process.env.CACHE_TTL) || 3600, // 1 hour
          maxKeys: parseInt(process.env.CACHE_MAX_KEYS) || 10000,
          strategy: process.env.CACHE_STRATEGY || 'lru', // 'lru', 'lfu'
        },
        healthCheck: {
          enabled: true,
          interval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000, // 30 seconds
          timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000, // 5 seconds
          endpoints: [
            '/health',
            '/health/db',
            '/health/redis',
            '/health/services',
          ],
        },
      },

      // WebRTC Configuration
      webrtc: {
        iceServers: [
          {
            urls: process.env.STUN_SERVER || 'stun:stun.l.google.com:19302',
          },
          {
            urls: process.env.TURN_SERVER,
            username: process.env.TURN_USERNAME,
            credential: process.env.TURN_PASSWORD,
          },
        ].filter(server => server.urls),
        sdpSemantics: 'unified-plan',
        bundlePolicy: 'balanced',
        rtcpMuxPolicy: 'require',
      },
    };

    // Load environment-specific overrides
    const envConfigPath = path.join(this.configPath, `${this.currentEnv}.json`);
    if (fs.existsSync(envConfigPath)) {
      const envConfig = JSON.parse(fs.readFileSync(envConfigPath, 'utf8'));
      return this.deepMerge(baseConfig, envConfig);
    }

    return baseConfig;
  }

  // Load feature flags
  loadFeatureFlags() {
    const defaultFlags = {
      // Core Features
      userRegistration: process.env.FEATURE_USER_REGISTRATION !== 'false',
      phoneVerification: process.env.FEATURE_PHONE_VERIFICATION === 'true',
      emailVerification: process.env.FEATURE_EMAIL_VERIFICATION === 'true',
      twoFactorAuth: process.env.FEATURE_2FA === 'true',
      
      // Messaging Features
      messageEncryption: process.env.FEATURE_ENCRYPTION !== 'false',
      messageReactions: process.env.FEATURE_REACTIONS !== 'false',
      voiceMessages: process.env.FEATURE_VOICE_MESSAGES !== 'false',
      videoMessages: process.env.FEATURE_VIDEO_MESSAGES !== 'false',
      fileSharing: process.env.FEATURE_FILE_SHARING !== 'false',
      messageEditing: process.env.FEATURE_MESSAGE_EDITING === 'true',
      messageDeleting: process.env.FEATURE_MESSAGE_DELETING !== 'false',
      readReceipts: process.env.FEATURE_READ_RECEIPTS !== 'false',
      typingIndicators: process.env.FEATURE_TYPING_INDICATORS !== 'false',
      
      // Calling Features
      voiceCalls: process.env.FEATURE_VOICE_CALLS !== 'false',
      videoCalls: process.env.FEATURE_VIDEO_CALLS !== 'false',
      groupCalls: process.env.FEATURE_GROUP_CALLS === 'true',
      callRecording: process.env.FEATURE_CALL_RECORDING === 'true',
      screenSharing: process.env.FEATURE_SCREEN_SHARING === 'true',
      
      // Status Features
      statusUpdates: process.env.FEATURE_STATUS_UPDATES !== 'false',
      statusViews: process.env.FEATURE_STATUS_VIEWS !== 'false',
      statusReactions: process.env.FEATURE_STATUS_REACTIONS === 'true',
      
      // AI Features
      smartReplies: process.env.FEATURE_SMART_REPLIES === 'true',
      messageTranslation: process.env.FEATURE_TRANSLATION === 'true',
      contentModeration: process.env.FEATURE_MODERATION === 'true',
      smartNotifications: process.env.FEATURE_SMART_NOTIFICATIONS === 'true',
      
      // Premium Features
      premiumSubscription: process.env.FEATURE_PREMIUM === 'true',
      customThemes: process.env.FEATURE_CUSTOM_THEMES === 'true',
      increasedLimits: process.env.FEATURE_INCREASED_LIMITS === 'true',
      prioritySupport: process.env.FEATURE_PRIORITY_SUPPORT === 'true',
      
      // Admin Features
      adminPanel: process.env.FEATURE_ADMIN_PANEL === 'true',
      userManagement: process.env.FEATURE_USER_MANAGEMENT === 'true',
      contentReporting: process.env.FEATURE_CONTENT_REPORTING === 'true',
      systemNotifications: process.env.FEATURE_SYSTEM_NOTIFICATIONS === 'true',
      
      // Development Features
      devTools: process.env.FEATURE_DEV_TOOLS === 'true' && this.currentEnv !== 'production',
      debugMode: process.env.FEATURE_DEBUG_MODE === 'true' && this.currentEnv !== 'production',
      testEndpoints: process.env.FEATURE_TEST_ENDPOINTS === 'true' && this.currentEnv !== 'production',
    };

    // Load feature flags from file if exists
    const flagsPath = path.join(this.configPath, 'feature-flags.json');
    if (fs.existsSync(flagsPath)) {
      const fileFlags = JSON.parse(fs.readFileSync(flagsPath, 'utf8'));
      return { ...defaultFlags, ...fileFlags };
    }

    return defaultFlags;
  }

  // Load deployment configuration
  loadDeploymentConfig() {
    return {
      // Docker Configuration
      docker: {
        image: process.env.DOCKER_IMAGE || 'ndeip/backend',
        tag: process.env.DOCKER_TAG || 'latest',
        registry: process.env.DOCKER_REGISTRY || 'docker.io',
        ports: {
          internal: parseInt(process.env.INTERNAL_PORT) || 3000,
          external: parseInt(process.env.EXTERNAL_PORT) || 80,
        },
        environment: this.getDockerEnvironment(),
        resources: {
          cpu: process.env.DOCKER_CPU_LIMIT || '1000m',
          memory: process.env.DOCKER_MEMORY_LIMIT || '1Gi',
          storage: process.env.DOCKER_STORAGE_LIMIT || '10Gi',
        },
        healthCheck: {
          enabled: true,
          path: '/health',
          interval: 30,
          timeout: 5,
          retries: 3,
        },
      },

      // Kubernetes Configuration
      kubernetes: {
        namespace: process.env.K8S_NAMESPACE || 'ndeip',
        deployment: {
          replicas: parseInt(process.env.K8S_REPLICAS) || 3,
          strategy: process.env.K8S_STRATEGY || 'RollingUpdate',
          maxSurge: process.env.K8S_MAX_SURGE || '25%',
          maxUnavailable: process.env.K8S_MAX_UNAVAILABLE || '25%',
        },
        service: {
          type: process.env.K8S_SERVICE_TYPE || 'ClusterIP',
          port: parseInt(process.env.K8S_SERVICE_PORT) || 80,
          targetPort: parseInt(process.env.K8S_TARGET_PORT) || 3000,
        },
        ingress: {
          enabled: process.env.K8S_INGRESS_ENABLED === 'true',
          className: process.env.K8S_INGRESS_CLASS || 'nginx',
          host: process.env.K8S_INGRESS_HOST || 'api.ndeip.com',
          tls: {
            enabled: process.env.K8S_TLS_ENABLED === 'true',
            secretName: process.env.K8S_TLS_SECRET || 'ndeip-tls',
          },
        },
        autoscaling: {
          enabled: process.env.K8S_HPA_ENABLED === 'true',
          minReplicas: parseInt(process.env.K8S_MIN_REPLICAS) || 2,
          maxReplicas: parseInt(process.env.K8S_MAX_REPLICAS) || 10,
          targetCPU: parseInt(process.env.K8S_TARGET_CPU) || 70,
          targetMemory: parseInt(process.env.K8S_TARGET_MEMORY) || 80,
        },
      },

      // CI/CD Configuration
      cicd: {
        provider: process.env.CICD_PROVIDER || 'github', // 'github', 'gitlab', 'jenkins'
        triggers: {
          push: process.env.CICD_TRIGGER_PUSH !== 'false',
          pullRequest: process.env.CICD_TRIGGER_PR === 'true',
          schedule: process.env.CICD_SCHEDULE,
        },
        stages: {
          test: process.env.CICD_RUN_TESTS !== 'false',
          security: process.env.CICD_SECURITY_SCAN === 'true',
          build: process.env.CICD_BUILD !== 'false',
          deploy: process.env.CICD_AUTO_DEPLOY === 'true',
        },
        environments: {
          development: {
            autoPromote: true,
            requireApproval: false,
          },
          staging: {
            autoPromote: process.env.CICD_AUTO_PROMOTE_STAGING === 'true',
            requireApproval: process.env.CICD_REQUIRE_APPROVAL_STAGING === 'true',
          },
          production: {
            autoPromote: false,
            requireApproval: true,
            protectedBranch: 'main',
          },
        },
      },

      // Infrastructure as Code
      infrastructure: {
        provider: process.env.INFRA_PROVIDER || 'terraform', // 'terraform', 'pulumi', 'cloudformation'
        terraform: {
          backend: process.env.TERRAFORM_BACKEND || 's3',
          workspace: process.env.TERRAFORM_WORKSPACE || this.currentEnv,
          vars: {
            region: process.env.AWS_REGION || 'us-east-1',
            environment: this.currentEnv,
            project: 'ndeip',
          },
        },
      },
    };
  }

  // Get Docker environment variables
  getDockerEnvironment() {
    const envVars = {};
    
    // Copy all environment variables that start with specific prefixes
    const prefixes = ['NODE_', 'PORT', 'HOST', 'MONGODB_', 'REDIS_', 'JWT_', 'AWS_', 'GCP_'];
    
    Object.keys(process.env).forEach(key => {
      if (prefixes.some(prefix => key.startsWith(prefix))) {
        envVars[key] = process.env[key];
      }
    });
    
    return envVars;
  }

  // Validate configuration
  validateConfiguration() {
    const required = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'MONGODB_URI',
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error('❌ Missing required environment variables:', missing);
      if (this.currentEnv === 'production') {
        process.exit(1);
      }
    }
    
    // Warn about missing optional but recommended variables
    const recommended = [
      'REDIS_HOST',
      'MASTER_ENCRYPTION_KEY',
      'SENTRY_DSN',
    ];
    
    const missingRecommended = recommended.filter(key => !process.env[key]);
    
    if (missingRecommended.length > 0 && this.currentEnv === 'production') {
      console.warn('⚠️ Missing recommended environment variables:', missingRecommended);
    }
  }

  // Deep merge utility
  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  // Get configuration for specific component
  get(path) {
    const keys = path.split('.');
    let current = this.config;
    
    for (const key of keys) {
      if (current[key] === undefined) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }

  // Check if feature is enabled
  isFeatureEnabled(feature) {
    return this.featureFlags[feature] === true;
  }

  // Get deployment configuration
  getDeploymentConfig(component) {
    return this.deploymentConfig[component];
  }

  // Generate Docker Compose file
  generateDockerCompose() {
    const compose = {
      version: '3.8',
      services: {
        app: {
          image: `${this.deploymentConfig.docker.registry}/${this.deploymentConfig.docker.image}:${this.deploymentConfig.docker.tag}`,
          ports: [
            `${this.deploymentConfig.docker.ports.external}:${this.deploymentConfig.docker.ports.internal}`
          ],
          environment: this.deploymentConfig.docker.environment,
          depends_on: ['mongodb', 'redis'],
          restart: 'unless-stopped',
          healthcheck: {
            test: ['CMD', 'curl', '-f', `http://localhost:${this.deploymentConfig.docker.ports.internal}/health`],
            interval: '30s',
            timeout: '5s',
            retries: 3,
          },
          deploy: {
            resources: {
              limits: {
                cpus: this.deploymentConfig.docker.resources.cpu,
                memory: this.deploymentConfig.docker.resources.memory,
              },
            },
          },
        },
        mongodb: {
          image: 'mongo:5.0',
          environment: {
            MONGO_INITDB_ROOT_USERNAME: 'admin',
            MONGO_INITDB_ROOT_PASSWORD: process.env.MONGODB_PASSWORD || 'password',
          },
          volumes: ['mongodb_data:/data/db'],
          restart: 'unless-stopped',
        },
        redis: {
          image: 'redis:7-alpine',
          command: 'redis-server --appendonly yes',
          volumes: ['redis_data:/data'],
          restart: 'unless-stopped',
        },
      },
      volumes: {
        mongodb_data: {},
        redis_data: {},
      },
    };

    return yaml.dump(compose);
  }

  // Generate Kubernetes manifests
  generateKubernetesManifests() {
    const k8s = this.deploymentConfig.kubernetes;
    
    const manifests = {
      deployment: {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
          name: 'ndeip-backend',
          namespace: k8s.namespace,
          labels: {
            app: 'ndeip-backend',
            version: this.deploymentConfig.docker.tag,
          },
        },
        spec: {
          replicas: k8s.deployment.replicas,
          strategy: {
            type: k8s.deployment.strategy,
            rollingUpdate: {
              maxSurge: k8s.deployment.maxSurge,
              maxUnavailable: k8s.deployment.maxUnavailable,
            },
          },
          selector: {
            matchLabels: {
              app: 'ndeip-backend',
            },
          },
          template: {
            metadata: {
              labels: {
                app: 'ndeip-backend',
              },
            },
            spec: {
              containers: [{
                name: 'ndeip-backend',
                image: `${this.deploymentConfig.docker.registry}/${this.deploymentConfig.docker.image}:${this.deploymentConfig.docker.tag}`,
                ports: [{
                  containerPort: k8s.service.targetPort,
                }],
                env: Object.entries(this.deploymentConfig.docker.environment).map(([name, value]) => ({
                  name,
                  value: String(value),
                })),
                resources: {
                  limits: {
                    cpu: this.deploymentConfig.docker.resources.cpu,
                    memory: this.deploymentConfig.docker.resources.memory,
                  },
                  requests: {
                    cpu: '100m',
                    memory: '128Mi',
                  },
                },
                livenessProbe: {
                  httpGet: {
                    path: '/health',
                    port: k8s.service.targetPort,
                  },
                  initialDelaySeconds: 30,
                  periodSeconds: 10,
                },
                readinessProbe: {
                  httpGet: {
                    path: '/health',
                    port: k8s.service.targetPort,
                  },
                  initialDelaySeconds: 5,
                  periodSeconds: 5,
                },
              }],
            },
          },
        },
      },
      service: {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
          name: 'ndeip-backend-service',
          namespace: k8s.namespace,
        },
        spec: {
          selector: {
            app: 'ndeip-backend',
          },
          ports: [{
            port: k8s.service.port,
            targetPort: k8s.service.targetPort,
            protocol: 'TCP',
          }],
          type: k8s.service.type,
        },
      },
    };

    // Add ingress if enabled
    if (k8s.ingress.enabled) {
      manifests.ingress = {
        apiVersion: 'networking.k8s.io/v1',
        kind: 'Ingress',
        metadata: {
          name: 'ndeip-backend-ingress',
          namespace: k8s.namespace,
          annotations: {
            'kubernetes.io/ingress.class': k8s.ingress.className,
          },
        },
        spec: {
          rules: [{
            host: k8s.ingress.host,
            http: {
              paths: [{
                path: '/',
                pathType: 'Prefix',
                backend: {
                  service: {
                    name: 'ndeip-backend-service',
                    port: {
                      number: k8s.service.port,
                    },
                  },
                },
              }],
            },
          }],
        },
      };

      if (k8s.ingress.tls.enabled) {
        manifests.ingress.spec.tls = [{
          hosts: [k8s.ingress.host],
          secretName: k8s.ingress.tls.secretName,
        }];
      }
    }

    // Add HPA if enabled
    if (k8s.autoscaling.enabled) {
      manifests.hpa = {
        apiVersion: 'autoscaling/v2',
        kind: 'HorizontalPodAutoscaler',
        metadata: {
          name: 'ndeip-backend-hpa',
          namespace: k8s.namespace,
        },
        spec: {
          scaleTargetRef: {
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            name: 'ndeip-backend',
          },
          minReplicas: k8s.autoscaling.minReplicas,
          maxReplicas: k8s.autoscaling.maxReplicas,
          metrics: [
            {
              type: 'Resource',
              resource: {
                name: 'cpu',
                target: {
                  type: 'Utilization',
                  averageUtilization: k8s.autoscaling.targetCPU,
                },
              },
            },
            {
              type: 'Resource',
              resource: {
                name: 'memory',
                target: {
                  type: 'Utilization',
                  averageUtilization: k8s.autoscaling.targetMemory,
                },
              },
            },
          ],
        },
      };
    }

    return manifests;
  }

  // Save configurations to files
  saveConfigurations() {
    const configDir = path.join(__dirname, 'generated');
    
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Save Docker Compose
    const dockerCompose = this.generateDockerCompose();
    fs.writeFileSync(path.join(configDir, 'docker-compose.yml'), dockerCompose);

    // Save Kubernetes manifests
    const k8sManifests = this.generateKubernetesManifests();
    Object.entries(k8sManifests).forEach(([name, manifest]) => {
      const yamlContent = yaml.dump(manifest);
      fs.writeFileSync(path.join(configDir, `${name}.yaml`), yamlContent);
    });

    // Save environment files
    const envContent = Object.entries(this.deploymentConfig.docker.environment)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    fs.writeFileSync(path.join(configDir, `.env.${this.currentEnv}`), envContent);

    console.log(`✅ Configuration files generated in ${configDir}`);
  }

  // Print configuration summary
  printSummary() {
    console.log(`
🚀 Production Configuration Summary
Environment: ${this.currentEnv}
Server: ${this.config.server.protocol}://${this.config.server.host}:${this.config.server.port}
Database: ${this.config.database.mongodb.uri}
Redis: ${this.config.database.redis.host}:${this.config.database.redis.port}
Features: ${Object.entries(this.featureFlags).filter(([, enabled]) => enabled).length} enabled
Monitoring: ${this.config.monitoring.enabled ? 'Enabled' : 'Disabled'}
Clustering: ${this.config.performance.clustering.enabled ? 'Enabled' : 'Disabled'}
`);
  }
}

// Create and export singleton instance
const productionConfig = new ProductionConfig();

module.exports = productionConfig;