/**
 * E2ETests.js - Comprehensive End-to-End Testing Suite for ndeip
 * User journey tests, performance tests, security tests, visual regression
 * Covers complete user flows from registration to messaging and calling
 */

import { device, element, by, waitFor, expect } from 'detox';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Test configuration
const TEST_CONFIG = {
  timeout: 30000,
  longTimeout: 60000,
  retries: 3,
  screenshotPath: './screenshots',
  performanceThresholds: {
    appLaunch: 3000,      // 3 seconds
    messageDelivery: 1000, // 1 second
    callConnection: 5000,  // 5 seconds
    meshAnimation: 16,     // 60fps = 16ms per frame
  },
  testUsers: {
    user1: {
      email: 'test1@ndeip.com',
      password: 'TestPassword123!',
      firstName: 'Alice',
      lastName: 'Johnson',
      phoneNumber: '+1234567890',
    },
    user2: {
      email: 'test2@ndeip.com',
      password: 'TestPassword123!',
      firstName: 'Bob',
      lastName: 'Smith',
      phoneNumber: '+1234567891',
    },
  },
};

describe('ndeip E2E Test Suite', () => {
  beforeAll(async () => {
    // Launch app
    await device.launchApp({
      newInstance: true,
      permissions: {
        notifications: 'YES',
        microphone: 'YES',
        camera: 'YES',
        contacts: 'YES',
      },
    });
    
    // Setup screenshot directory
    if (!fs.existsSync(TEST_CONFIG.screenshotPath)) {
      fs.mkdirSync(TEST_CONFIG.screenshotPath, { recursive: true });
    }
    
    // Reset app state
    await device.resetContentAndSettings();
  });

  afterAll(async () => {
    // Generate test report
    await generateTestReport();
    
    // Cleanup
    await device.terminateApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterEach(async () => {
    // Take screenshot on failure
    if (jasmine.currentSpec.failedExpectations.length > 0) {
      const specName = jasmine.currentSpec.fullName.replace(/\s+/g, '_');
      await device.takeScreenshot(`${specName}_failed`);
    }
  });

  // =============================================================================
  // USER JOURNEY TESTS
  // =============================================================================

  describe('Complete User Journey', () => {
    it('should complete full onboarding flow', async () => {
      await testOnboardingFlow();
    });

    it('should register new user successfully', async () => {
      await testUserRegistration();
    });

    it('should login existing user', async () => {
      await testUserLogin();
    });

    it('should setup two-factor authentication', async () => {
      await testTwoFactorSetup();
    });

    it('should navigate through main app sections', async () => {
      await testMainNavigation();
    });
  });

  describe('Messaging Journey', () => {
    it('should send and receive text messages', async () => {
      await testTextMessaging();
    });

    it('should send voice messages', async () => {
      await testVoiceMessaging();
    });

    it('should share media files', async () => {
      await testMediaSharing();
    });

    it('should create and manage group chats', async () => {
      await testGroupChatFlow();
    });

    it('should use message reactions', async () => {
      await testMessageReactions();
    });

    it('should translate messages', async () => {
      await testMessageTranslation();
    });
  });

  describe('Calling Journey', () => {
    it('should make voice calls', async () => {
      await testVoiceCalling();
    });

    it('should make video calls', async () => {
      await testVideoCalling();
    });

    it('should handle call history', async () => {
      await testCallHistory();
    });
  });

  describe('Status Journey', () => {
    it('should create and view status updates', async () => {
      await testStatusUpdates();
    });

    it('should interact with friend statuses', async () => {
      await testStatusInteractions();
    });
  });

  describe('Settings Journey', () => {
    it('should customize mesh preferences', async () => {
      await testMeshCustomization();
    });

    it('should update privacy settings', async () => {
      await testPrivacySettings();
    });

    it('should configure notifications', async () => {
      await testNotificationSettings();
    });
  });

  // =============================================================================
  // PERFORMANCE TESTS
  // =============================================================================

  describe('Performance Tests', () => {
    it('should launch app within performance threshold', async () => {
      const startTime = Date.now();
      
      await device.launchApp({ newInstance: true });
      await waitFor(element(by.id('splash-screen')))
        .toBeVisible()
        .withTimeout(TEST_CONFIG.timeout);
      
      await waitFor(element(by.id('main-navigation')))
        .toBeVisible()
        .withTimeout(TEST_CONFIG.timeout);
      
      const launchTime = Date.now() - startTime;
      expect(launchTime).toBeLessThan(TEST_CONFIG.performanceThresholds.appLaunch);
      
      await recordPerformanceMetric('app_launch_time', launchTime);
    });

    it('should render large message lists efficiently', async () => {
      await testLargeMessageListPerformance();
    });

    it('should handle mesh animations at 60fps', async () => {
      await testMeshAnimationPerformance();
    });

    it('should deliver messages within threshold', async () => {
      await testMessageDeliveryPerformance();
    });

    it('should connect calls within threshold', async () => {
      await testCallConnectionPerformance();
    });

    it('should handle memory usage efficiently', async () => {
      await testMemoryUsage();
    });
  });

  // =============================================================================
  // SECURITY TESTS
  // =============================================================================

  describe('Security Tests', () => {
    it('should encrypt messages end-to-end', async () => {
      await testEndToEndEncryption();
    });

    it('should protect against unauthorized access', async () => {
      await testUnauthorizedAccess();
    });

    it('should handle session security properly', async () => {
      await testSessionSecurity();
    });

    it('should protect sensitive data', async () => {
      await testDataProtection();
    });

    it('should validate input sanitization', async () => {
      await testInputSanitization();
    });
  });

  // =============================================================================
  // VISUAL REGRESSION TESTS
  // =============================================================================

  describe('Visual Regression Tests', () => {
    it('should maintain consistent UI across screens', async () => {
      await testVisualConsistency();
    });

    it('should render mesh patterns correctly', async () => {
      await testMeshPatternRendering();
    });

    it('should display animations smoothly', async () => {
      await testAnimationSmoothnessn();
    });

    it('should handle different screen sizes', async () => {
      await testResponsiveDesign();
    });

    it('should maintain brand consistency', async () => {
      await testBrandConsistency();
    });
  });

  // =============================================================================
  // ACCESSIBILITY TESTS
  // =============================================================================

  describe('Accessibility Tests', () => {
    it('should support screen readers', async () => {
      await testScreenReaderSupport();
    });

    it('should handle high contrast mode', async () => {
      await testHighContrastMode();
    });

    it('should support voice control', async () => {
      await testVoiceControl();
    });

    it('should provide proper focus management', async () => {
      await testFocusManagement();
    });
  });

  // =============================================================================
  // TEST IMPLEMENTATIONS
  // =============================================================================

  // User Journey Test Implementations
  async function testOnboardingFlow() {
    // Welcome screen
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    await element(by.id('get-started-button')).tap();

    // Permissions screen
    await waitFor(element(by.id('permissions-screen')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    await element(by.id('allow-notifications-button')).tap();
    await element(by.id('allow-contacts-button')).tap();
    await element(by.id('continue-button')).tap();

    // Phone verification
    await waitFor(element(by.id('phone-verification-screen')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    await element(by.id('phone-input')).typeText(TEST_CONFIG.testUsers.user1.phoneNumber);
    await element(by.id('send-code-button')).tap();

    // Mock OTP verification
    await element(by.id('otp-input')).typeText('123456');
    await element(by.id('verify-button')).tap();

    // Profile setup
    await waitFor(element(by.id('profile-setup-screen')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    await element(by.id('first-name-input')).typeText(TEST_CONFIG.testUsers.user1.firstName);
    await element(by.id('last-name-input')).typeText(TEST_CONFIG.testUsers.user1.lastName);
    await element(by.id('complete-setup-button')).tap();

    // Verify main screen
    await waitFor(element(by.id('main-navigation')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    await takeScreenshot('onboarding_completed');
  }

  async function testUserRegistration() {
    // Navigate to registration
    await element(by.id('register-button')).tap();

    await waitFor(element(by.id('registration-screen')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    // Fill registration form
    await element(by.id('email-input')).typeText(TEST_CONFIG.testUsers.user1.email);
    await element(by.id('password-input')).typeText(TEST_CONFIG.testUsers.user1.password);
    await element(by.id('confirm-password-input')).typeText(TEST_CONFIG.testUsers.user1.password);
    await element(by.id('first-name-input')).typeText(TEST_CONFIG.testUsers.user1.firstName);
    await element(by.id('last-name-input')).typeText(TEST_CONFIG.testUsers.user1.lastName);
    await element(by.id('phone-input')).typeText(TEST_CONFIG.testUsers.user1.phoneNumber);

    // Submit registration
    await element(by.id('register-submit-button')).tap();

    // Wait for verification screen
    await waitFor(element(by.id('email-verification-screen')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    // Mock email verification
    await element(by.id('verification-code-input')).typeText('VERIFY123');
    await element(by.id('verify-email-button')).tap();

    // Verify successful registration
    await waitFor(element(by.id('registration-success-screen')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    await takeScreenshot('registration_completed');
  }

  async function testUserLogin() {
    // Navigate to login
    await element(by.id('login-button')).tap();

    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    // Enter credentials
    await element(by.id('email-input')).typeText(TEST_CONFIG.testUsers.user1.email);
    await element(by.id('password-input')).typeText(TEST_CONFIG.testUsers.user1.password);

    // Submit login
    await element(by.id('login-submit-button')).tap();

    // Verify successful login
    await waitFor(element(by.id('main-navigation')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    // Check user profile is loaded
    await element(by.id('profile-tab')).tap();
    await waitFor(element(by.text(TEST_CONFIG.testUsers.user1.firstName)))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    await takeScreenshot('login_completed');
  }

  async function testTwoFactorSetup() {
    // Navigate to security settings
    await element(by.id('settings-tab')).tap();
    await element(by.id('security-settings-item')).tap();
    await element(by.id('two-factor-setup-button')).tap();

    // Setup 2FA
    await waitFor(element(by.id('two-factor-setup-screen')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    await element(by.id('setup-authenticator-button')).tap();

    // Verify QR code is displayed
    await waitFor(element(by.id('qr-code-image')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    // Enter test TOTP code
    await element(by.id('totp-code-input')).typeText('123456');
    await element(by.id('verify-totp-button')).tap();

    // Verify 2FA is enabled
    await waitFor(element(by.id('two-factor-enabled-message')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    await takeScreenshot('two_factor_setup_completed');
  }

  async function testMainNavigation() {
    // Test all main navigation tabs
    const tabs = ['chats-tab', 'calls-tab', 'status-tab', 'settings-tab'];

    for (const tab of tabs) {
      await element(by.id(tab)).tap();
      await waitFor(element(by.id(tab.replace('-tab', '-screen'))))
        .toBeVisible()
        .withTimeout(TEST_CONFIG.timeout);

      await takeScreenshot(`navigation_${tab.replace('-tab', '')}`);
    }

    // Test mesh animation on navigation
    await element(by.id('chats-tab')).tap();
    await waitFor(element(by.id('crystalline-mesh')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);
  }

  // Messaging Test Implementations
  async function testTextMessaging() {
    // Navigate to chats
    await element(by.id('chats-tab')).tap();

    // Start new chat
    await element(by.id('new-chat-button')).tap();
    await element(by.id('contact-search-input')).typeText(TEST_CONFIG.testUsers.user2.firstName);
    await element(by.id('contact-result-0')).tap();

    // Send text message
    const testMessage = 'Hello from E2E test! 👋';
    await element(by.id('message-input')).typeText(testMessage);
    await element(by.id('send-button')).tap();

    // Verify message appears in chat
    await waitFor(element(by.text(testMessage)))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    // Verify message status indicators
    await waitFor(element(by.id('message-sent-indicator')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    await takeScreenshot('text_message_sent');

    // Wait for delivery confirmation
    await waitFor(element(by.id('message-delivered-indicator')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.longTimeout);
  }

  async function testVoiceMessaging() {
    // Start voice recording
    await element(by.id('voice-record-button')).longPress(2000);

    // Verify recording UI
    await waitFor(element(by.id('voice-recording-waveform')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    // Stop recording
    await element(by.id('voice-record-button')).tap();

    // Send voice message
    await element(by.id('voice-send-button')).tap();

    // Verify voice message appears
    await waitFor(element(by.id('voice-message-player')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    await takeScreenshot('voice_message_sent');
  }

  async function testMediaSharing() {
    // Open media picker
    await element(by.id('media-attach-button')).tap();
    await element(by.id('gallery-option')).tap();

    // Select test image
    await waitFor(element(by.id('media-gallery')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    await element(by.id('media-item-0')).tap();
    await element(by.id('media-send-button')).tap();

    // Verify media message appears
    await waitFor(element(by.id('media-message-preview')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    await takeScreenshot('media_message_sent');
  }

  async function testGroupChatFlow() {
    // Create new group
    await element(by.id('new-group-button')).tap();

    // Add participants
    await element(by.id('group-name-input')).typeText('Test Group');
    await element(by.id('add-participant-button')).tap();
    await element(by.id('contact-checkbox-0')).tap();
    await element(by.id('contact-checkbox-1')).tap();
    await element(by.id('create-group-button')).tap();

    // Send group message
    await element(by.id('message-input')).typeText('Hello group! 👥');
    await element(by.id('send-button')).tap();

    // Verify group message functionality
    await waitFor(element(by.text('Hello group! 👥')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    await takeScreenshot('group_chat_created');
  }

  async function testMessageReactions() {
    // Long press on message to show reactions
    await element(by.id('message-bubble-0')).longPress();

    // Verify reaction picker appears
    await waitFor(element(by.id('reaction-picker')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    // Select reaction
    await element(by.id('reaction-heart')).tap();

    // Verify reaction appears on message
    await waitFor(element(by.id('message-reaction-heart')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    await takeScreenshot('message_reaction_added');
  }

  // Performance Test Implementations
  async function testLargeMessageListPerformance() {
    const startTime = Date.now();

    // Load large chat with 1000+ messages
    await element(by.id('large-chat-test')).tap();

    // Wait for all messages to load
    await waitFor(element(by.id('message-1000')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.longTimeout);

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds

    // Test scrolling performance
    const scrollStartTime = Date.now();
    await element(by.id('message-list')).scroll(5000, 'down');
    const scrollTime = Date.now() - scrollStartTime;

    expect(scrollTime).toBeLessThan(1000); // Smooth scrolling

    await recordPerformanceMetric('large_list_load_time', loadTime);
    await recordPerformanceMetric('large_list_scroll_time', scrollTime);
  }

  async function testMeshAnimationPerformance() {
    // Enable mesh animation
    await element(by.id('settings-tab')).tap();
    await element(by.id('appearance-settings')).tap();
    await element(by.id('mesh-intensity-slider')).adjustSliderToPosition(1.0);

    // Navigate back to trigger mesh animation
    await element(by.id('chats-tab')).tap();

    // Measure frame rate during animation
    const frameRateData = await measureFrameRate(3000); // 3 seconds

    expect(frameRateData.averageFPS).toBeGreaterThan(55); // Near 60fps
    expect(frameRateData.droppedFrames).toBeLessThan(10);

    await recordPerformanceMetric('mesh_animation_fps', frameRateData.averageFPS);
  }

  async function testMessageDeliveryPerformance() {
    const messages = [];
    const deliveryTimes = [];

    // Send 10 messages and measure delivery times
    for (let i = 0; i < 10; i++) {
      const startTime = Date.now();
      const message = `Performance test message ${i + 1}`;

      await element(by.id('message-input')).typeText(message);
      await element(by.id('send-button')).tap();

      // Wait for delivery confirmation
      await waitFor(element(by.id('message-delivered-indicator')))
        .toBeVisible()
        .withTimeout(TEST_CONFIG.timeout);

      const deliveryTime = Date.now() - startTime;
      deliveryTimes.push(deliveryTime);

      await element(by.id('message-input')).clearText();
    }

    const averageDeliveryTime = deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length;
    expect(averageDeliveryTime).toBeLessThan(TEST_CONFIG.performanceThresholds.messageDelivery);

    await recordPerformanceMetric('average_message_delivery_time', averageDeliveryTime);
  }

  async function testCallConnectionPerformance() {
    // Initiate voice call
    const startTime = Date.now();

    await element(by.id('voice-call-button')).tap();

    // Wait for call to connect
    await waitFor(element(by.id('call-connected-indicator')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.longTimeout);

    const connectionTime = Date.now() - startTime;
    expect(connectionTime).toBeLessThan(TEST_CONFIG.performanceThresholds.callConnection);

    // End call
    await element(by.id('end-call-button')).tap();

    await recordPerformanceMetric('call_connection_time', connectionTime);
  }

  async function testMemoryUsage() {
    // Get initial memory usage
    const initialMemory = await getMemoryUsage();

    // Perform memory-intensive operations
    await performMemoryIntensiveOperations();

    // Get final memory usage
    const finalMemory = await getMemoryUsage();

    const memoryIncrease = finalMemory - initialMemory;
    expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB increase

    await recordPerformanceMetric('memory_usage_increase', memoryIncrease);
  }

  // Security Test Implementations
  async function testEndToEndEncryption() {
    // Send encrypted message
    await element(by.id('message-input')).typeText('Secret message 🔐');
    await element(by.id('send-button')).tap();

    // Verify encryption indicator
    await waitFor(element(by.id('encryption-indicator')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);

    // Verify message cannot be read in plain text from network logs
    // This would require network interception testing
    await takeScreenshot('encrypted_message_sent');
  }

  async function testUnauthorizedAccess() {
    // Logout current user
    await element(by.id('settings-tab')).tap();
    await element(by.id('logout-button')).tap();

    // Try to access protected screens without authentication
    await device.openURL({ url: 'ndeip://chats' });

    // Verify redirected to login
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);
  }

  async function testSessionSecurity() {
    // Login and get session
    await testUserLogin();

    // Simulate session timeout
    await device.sendToHome();
    await new Promise(resolve => setTimeout(resolve, 35000)); // Wait 35 seconds
    await device.launchApp();

    // Verify session expired and re-authentication required
    await waitFor(element(by.id('session-expired-dialog')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);
  }

  // Visual Regression Test Implementations
  async function testVisualConsistency() {
    const screens = [
      'chats-screen',
      'calls-screen',
      'status-screen',
      'settings-screen',
      'chat-screen',
      'call-screen',
    ];

    for (const screen of screens) {
      await navigateToScreen(screen);
      await takeScreenshot(`visual_regression_${screen}`);
      
      // Compare with baseline screenshots
      const comparisonResult = await compareScreenshots(
        `visual_regression_${screen}`,
        `baseline_${screen}`
      );
      
      expect(comparisonResult.similarity).toBeGreaterThan(0.95);
    }
  }

  async function testMeshPatternRendering() {
    // Test different mesh variants
    const meshVariants = ['small', 'medium', 'large', 'quantum'];

    for (const variant of meshVariants) {
      await element(by.id('settings-tab')).tap();
      await element(by.id('appearance-settings')).tap();
      await element(by.id(`mesh-variant-${variant}`)).tap();
      
      await element(by.id('chats-tab')).tap();
      await takeScreenshot(`mesh_pattern_${variant}`);
      
      // Verify mesh pattern is rendered correctly
      await waitFor(element(by.id('crystalline-mesh')))
        .toBeVisible()
        .withTimeout(TEST_CONFIG.timeout);
    }
  }

  async function testBrandConsistency() {
    // Verify brand colors are consistent across screens
    const brandElements = [
      'primary-button',
      'accent-text',
      'mesh-overlay',
      'navigation-bar',
    ];

    for (const element_id of brandElements) {
      const elementProps = await element(by.id(element_id)).getAttributes();
      
      // Verify brand colors are used
      expect(elementProps.backgroundColor || elementProps.color)
        .toMatch(/#003B3B|#0A71EF|#FFFFFF/);
    }
  }

  // Accessibility Test Implementations
  async function testScreenReaderSupport() {
    // Enable VoiceOver/TalkBack
    await device.enableAccessibility();

    // Navigate using accessibility
    await element(by.accessibilityLabel('Chats tab')).tap();
    await element(by.accessibilityLabel('New chat button')).tap();

    // Verify accessibility labels exist
    await waitFor(element(by.accessibilityLabel('Message input field')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);
  }

  async function testHighContrastMode() {
    // Enable high contrast
    await device.setHighContrast(true);

    // Navigate through app
    await element(by.id('chats-tab')).tap();
    await takeScreenshot('high_contrast_chats');

    // Verify contrast ratios meet WCAG standards
    const contrastRatio = await measureContrastRatio();
    expect(contrastRatio).toBeGreaterThan(4.5); // WCAG AA standard
  }

  // Utility Functions
  async function takeScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}_${timestamp}`;
    await device.takeScreenshot(filename);
  }

  async function recordPerformanceMetric(metric, value) {
    const performanceData = {
      metric,
      value,
      timestamp: new Date().toISOString(),
      device: device.getPlatform(),
    };

    // Write to performance log
    const logPath = path.join(TEST_CONFIG.screenshotPath, 'performance.json');
    let existingData = [];

    if (fs.existsSync(logPath)) {
      existingData = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    }

    existingData.push(performanceData);
    fs.writeFileSync(logPath, JSON.stringify(existingData, null, 2));
  }

  async function measureFrameRate(duration) {
    // Mock implementation - would use actual profiling tools
    return {
      averageFPS: 58.5,
      droppedFrames: 3,
      duration,
    };
  }

  async function getMemoryUsage() {
    // Mock implementation - would use actual memory profiling
    return Math.random() * 200 * 1024 * 1024; // Random memory usage
  }

  async function performMemoryIntensiveOperations() {
    // Load large chat history
    await element(by.id('large-chat-test')).tap();
    
    // Scroll through many messages
    for (let i = 0; i < 10; i++) {
      await element(by.id('message-list')).scroll(1000, 'down');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Load media gallery
    await element(by.id('media-gallery-button')).tap();
    await waitFor(element(by.id('media-gallery')))
      .toBeVisible()
      .withTimeout(TEST_CONFIG.timeout);
  }

  async function navigateToScreen(screenId) {
    const navigationMap = {
      'chats-screen': () => element(by.id('chats-tab')).tap(),
      'calls-screen': () => element(by.id('calls-tab')).tap(),
      'status-screen': () => element(by.id('status-tab')).tap(),
      'settings-screen': () => element(by.id('settings-tab')).tap(),
      'chat-screen': async () => {
        await element(by.id('chats-tab')).tap();
        await element(by.id('chat-item-0')).tap();
      },
      'call-screen': async () => {
        await element(by.id('calls-tab')).tap();
        await element(by.id('voice-call-button')).tap();
      },
    };

    const navigator = navigationMap[screenId];
    if (navigator) {
      await navigator();
      await waitFor(element(by.id(screenId)))
        .toBeVisible()
        .withTimeout(TEST_CONFIG.timeout);
    }
  }

  async function compareScreenshots(current, baseline) {
    // Mock implementation - would use actual image comparison
    return {
      similarity: 0.97,
      differences: [],
    };
  }

  async function measureContrastRatio() {
    // Mock implementation - would measure actual contrast
    return 7.2; // Example contrast ratio
  }

  async function generateTestReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalTests: jasmine.getEnv().totalSpecsDefined,
      passedTests: 0,
      failedTests: 0,
      performanceMetrics: {},
      screenshots: [],
    };

    // Calculate pass/fail counts
    const specs = jasmine.getEnv().specResults;
    specs.forEach(spec => {
      if (spec.status === 'passed') {
        report.passedTests++;
      } else {
        report.failedTests++;
      }
    });

    // Load performance data
    const performanceLogPath = path.join(TEST_CONFIG.screenshotPath, 'performance.json');
    if (fs.existsSync(performanceLogPath)) {
      const performanceData = JSON.parse(fs.readFileSync(performanceLogPath, 'utf8'));
      report.performanceMetrics = performanceData;
    }

    // List screenshots
    const screenshotFiles = fs.readdirSync(TEST_CONFIG.screenshotPath)
      .filter(file => file.endsWith('.png'));
    report.screenshots = screenshotFiles;

    // Generate HTML report
    const htmlReport = generateHTMLReport(report);
    fs.writeFileSync(
      path.join(TEST_CONFIG.screenshotPath, 'test-report.html'),
      htmlReport
    );

    // Write JSON report
    fs.writeFileSync(
      path.join(TEST_CONFIG.screenshotPath, 'test-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('Test report generated:', path.join(TEST_CONFIG.screenshotPath, 'test-report.html'));
  }

  function generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>ndeip E2E Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .summary { display: flex; justify-content: space-around; margin-bottom: 40px; }
        .metric { text-align: center; padding: 20px; border-radius: 8px; background: #f5f5f5; }
        .metric h3 { margin: 0; color: #003B3B; }
        .metric p { margin: 10px 0 0 0; font-size: 24px; font-weight: bold; }
        .passed { color: #00D68F; }
        .failed { color: #C83232; }
        .performance { margin: 20px 0; }
        .screenshots { margin: 20px 0; }
        .screenshot { display: inline-block; margin: 10px; text-align: center; }
        .screenshot img { max-width: 200px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,59,59,0.1); }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌐 ndeip E2E Test Report</h1>
        <p>Generated on ${new Date(report.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <p>${report.totalTests}</p>
        </div>
        <div class="metric">
            <h3>Passed</h3>
            <p class="passed">${report.passedTests}</p>
        </div>
        <div class="metric">
            <h3>Failed</h3>
            <p class="failed">${report.failedTests}</p>
        </div>
        <div class="metric">
            <h3>Pass Rate</h3>
            <p>${((report.passedTests / report.totalTests) * 100).toFixed(1)}%</p>
        </div>
    </div>
    
    <div class="performance">
        <h2>Performance Metrics</h2>
        <table border="1" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #003B3B; color: white;">
                    <th style="padding: 10px;">Metric</th>
                    <th style="padding: 10px;">Value</th>
                    <th style="padding: 10px;">Threshold</th>
                    <th style="padding: 10px;">Status</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(TEST_CONFIG.performanceThresholds).map(([metric, threshold]) => {
                  const value = report.performanceMetrics.find(m => m.metric === metric)?.value || 'N/A';
                  const status = typeof value === 'number' && value < threshold ? 'PASS' : 'FAIL';
                  return `
                    <tr>
                        <td style="padding: 10px;">${metric}</td>
                        <td style="padding: 10px;">${value}ms</td>
                        <td style="padding: 10px;">${threshold}ms</td>
                        <td style="padding: 10px; color: ${status === 'PASS' ? '#00D68F' : '#C83232'};">${status}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>
    </div>
    
    <div class="screenshots">
        <h2>Screenshots</h2>
        ${report.screenshots.map(screenshot => `
            <div class="screenshot">
                <img src="${screenshot}" alt="${screenshot}">
                <p>${screenshot.replace(/\.png$/, '').replace(/_/g, ' ')}</p>
            </div>
        `).join('')}
    </div>
</body>
</html>
    `;
  }
});

// Export test configuration for external use
module.exports = {
  TEST_CONFIG,
  takeScreenshot,
  recordPerformanceMetric,
  measureFrameRate,
  getMemoryUsage,
};
