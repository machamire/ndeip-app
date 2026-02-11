/**
 * PrivacyCenter - Apple-level Privacy Controls
 * Visual privacy dashboard with mesh indicators and granular controls
 * Complete privacy transparency and data insights
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FloatingCard from '../../components/ui/FloatingCards';
import CrystallineMesh from '../../components/ndeip/CrystallineMesh';
import {
  MeshColors,
  MeshTypography,
  MeshSpacing,
  MeshBorderRadius,
  MeshShadows,
  getDynamicColor,
} from '../../constants/ndeipBrandSystem';

const { width: screenWidth } = Dimensions.get('window');

const PrivacyCenter = ({ navigation }) => {
  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    // Visibility Settings
    lastSeen: 'contacts', // 'everyone', 'contacts', 'nobody'
    profilePhoto: 'contacts',
    status: 'contacts',
    about: 'everyone',
    liveLocation: 'nobody',
    
    // Message Privacy
    readReceipts: true,
    groupAddPermission: 'contacts',
    disappearingMessages: false,
    disappearingTimer: 24, // hours
    
    // Call Privacy
    callPrivacy: 'everyone',
    missedCallNotifications: true,
    
    // Security Features
    twoStepVerification: false,
    fingerprintLock: false,
    screenLock: 'none', // 'none', 'immediate', '1min', '5min', '15min'
    showNotifications: 'name_and_message', // 'name_and_message', 'name_only', 'none'
    
    // Data and Storage
    autoDeleteMedia: 'never', // 'never', '30days', '6months', '1year'
    downloadPermission: 'wifi_only', // 'always', 'wifi_only', 'never'
    backupToCloud: false,
    backupIncludeVideos: false,
    
    // Advanced Privacy
    blockScreenshots: false,
    hideMediaInGallery: false,
    showTypingIndicator: true,
    showOnlineStatus: true,
  });

  // Privacy health score
  const [privacyScore, setPrivacyScore] = useState(0);
  const [dataInsights, setDataInsights] = useState({
    messagesStored: 0,
    mediaFiles: 0,
    contactsWithAccess: 0,
    encryptedChats: 0,
    storageUsed: 0,
  });

  // Animation values
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const meshIntensityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    loadPrivacySettings();
    calculatePrivacyScore();
    loadDataInsights();
  }, []);

  useEffect(() => {
    calculatePrivacyScore();
  }, [privacySettings]);

  // Load privacy settings
  const loadPrivacySettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('@privacy_settings');
      if (saved) {
        setPrivacySettings({ ...privacySettings, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    }
  };

  // Save privacy settings
  const savePrivacySettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('@privacy_settings', JSON.stringify(newSettings));
      setPrivacySettings(newSettings);
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
    }
  };

  // Update privacy setting
  const updatePrivacySetting = (key, value) => {
    const newSettings = { ...privacySettings, [key]: value };
    savePrivacySettings(newSettings);
  };

  // Calculate privacy health score
  const calculatePrivacyScore = () => {
    let score = 0;
    const weights = {
      // High security features
      twoStepVerification: 15,
      fingerprintLock: 10,
      blockScreenshots: 10,
      disappearingMessages: 10,
      
      // Medium security features
      screenLock: privacySettings.screenLock !== 'none' ? 8 : 0,
      readReceipts: privacySettings.readReceipts ? 0 : 5,
      showOnlineStatus: privacySettings.showOnlineStatus ? 0 : 5,
      hideMediaInGallery: 5,
      
      // Visibility restrictions
      lastSeen: privacySettings.lastSeen === 'nobody' ? 8 : 
               privacySettings.lastSeen === 'contacts' ? 4 : 0,
      profilePhoto: privacySettings.profilePhoto === 'nobody' ? 6 : 
                   privacySettings.profilePhoto === 'contacts' ? 3 : 0,
      status: privacySettings.status === 'nobody' ? 4 : 
             privacySettings.status === 'contacts' ? 2 : 0,
      
      // Data protection
      backupToCloud: privacySettings.backupToCloud ? 0 : 8,
      autoDeleteMedia: privacySettings.autoDeleteMedia !== 'never' ? 6 : 0,
    };

    Object.entries(weights).forEach(([key, weight]) => {
      if (key in privacySettings && privacySettings[key] === true) {
        score += weight;
      } else if (typeof weights[key] === 'number') {
        score += weights[key];
      }
    });

    const finalScore = Math.min(score, 100);
    setPrivacyScore(finalScore);

    // Animate score change
    Animated.timing(scoreAnim, {
      toValue: finalScore,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    // Animate mesh intensity based on score
    Animated.timing(meshIntensityAnim, {
      toValue: 0.2 + (finalScore / 100) * 0.5,
      duration: 800,
      useNativeDriver: false,
    }).start();
  };

  // Load data insights
  const loadDataInsights = async () => {
    try {
      // Simulate loading data insights
      // In production, fetch from backend
      setDataInsights({
        messagesStored: 15420,
        mediaFiles: 342,
        contactsWithAccess: 28,
        encryptedChats: 45,
        storageUsed: 234.5, // MB
      });
    } catch (error) {
      console.error('Failed to load data insights:', error);
    }
  };

  // Render privacy score indicator
  const renderPrivacyScore = () => {
    const scoreColor = privacyScore >= 80 ? MeshColors.accents.success :
                     privacyScore >= 60 ? MeshColors.electricBlue :
                     privacyScore >= 40 ? MeshColors.accents.warning :
                     MeshColors.accents.mutedRed;

    return (
      <FloatingCard
        variant="large"
        style={styles.scoreCard}
        backgroundColor={getDynamicColor(scoreColor, 0.05)}
      >
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreTitle}>Privacy Health</Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Privacy Score',
                'Your privacy score is calculated based on your security settings, visibility controls, and data protection measures. Higher scores indicate better privacy protection.',
                [{ text: 'Got it', style: 'default' }]
              );
            }}
          >
            <Ionicons name="information-circle" size={20} color={MeshColors.electricBlue} />
          </TouchableOpacity>
        </View>

        <View style={styles.scoreContainer}>
          <View style={styles.scoreVisual}>
            <Svg width={120} height={120}>
              <Defs>
                <RadialGradient id="scoreGradient">
                  <Stop offset="0%" stopColor={scoreColor} stopOpacity="0.8" />
                  <Stop offset="100%" stopColor={scoreColor} stopOpacity="0.2" />
                </RadialGradient>
              </Defs>
              
              {/* Background circle */}
              <Circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={getDynamicColor(scoreColor, 0.2)}
                strokeWidth="8"
              />
              
              {/* Progress circle */}
              <Circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(privacyScore / 100) * 314} 314`}
                transform="rotate(-90 60 60)"
              />
              
              {/* Mesh pattern overlay */}
              <G opacity="0.3">
                {[...Array(6)].map((_, i) => (
                  <Circle
                    key={i}
                    cx="60"
                    cy="60"
                    r={15 + i * 8}
                    fill="none"
                    stroke={scoreColor}
                    strokeWidth="0.5"
                    opacity={0.6 - i * 0.1}
                  />
                ))}
              </G>
            </Svg>
            
            <View style={styles.scoreText}>
              <Animated.Text style={[styles.scoreNumber, { color: scoreColor }]}>
                {Math.round(privacyScore)}
              </Animated.Text>
              <Text style={styles.scoreLabel}>Privacy Score</Text>
            </View>
          </View>

          <View style={styles.scoreActions}>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: scoreColor }]}
              onPress={() => navigation.navigate('PrivacyRecommendations')}
            >
              <Text style={[styles.actionButtonText, { color: scoreColor }]}>
                Improve Score
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </FloatingCard>
    );
  };

  // Render data insights
  const renderDataInsights = () => (
    <FloatingCard variant="large" style={styles.insightsCard}>
      <Text style={styles.sectionTitle}>Your Data at a Glance</Text>
      
      <View style={styles.insightsGrid}>
        <View style={styles.insightItem}>
          <View style={[styles.insightIcon, { backgroundColor: getDynamicColor(MeshColors.electricBlue, 0.1) }]}>
            <Ionicons name="chatbubbles" size={24} color={MeshColors.electricBlue} />
          </View>
          <Text style={styles.insightNumber}>{dataInsights.messagesStored.toLocaleString()}</Text>
          <Text style={styles.insightLabel}>Messages Stored</Text>
        </View>

        <View style={styles.insightItem}>
          <View style={[styles.insightIcon, { backgroundColor: getDynamicColor(MeshColors.primaryTeal, 0.1) }]}>
            <Ionicons name="images" size={24} color={MeshColors.primaryTeal} />
          </View>
          <Text style={styles.insightNumber}>{dataInsights.mediaFiles}</Text>
          <Text style={styles.insightLabel}>Media Files</Text>
        </View>

        <View style={styles.insightItem}>
          <View style={[styles.insightIcon, { backgroundColor: getDynamicColor(MeshColors.accents.success, 0.1) }]}>
            <Ionicons name="shield-checkmark" size={24} color={MeshColors.accents.success} />
          </View>
          <Text style={styles.insightNumber}>{dataInsights.encryptedChats}</Text>
          <Text style={styles.insightLabel}>Encrypted Chats</Text>
        </View>

        <View style={styles.insightItem}>
          <View style={[styles.insightIcon, { backgroundColor: getDynamicColor(MeshColors.accents.warning, 0.1) }]}>
            <Ionicons name="server" size={24} color={MeshColors.accents.warning} />
          </View>
          <Text style={styles.insightNumber}>{dataInsights.storageUsed} MB</Text>
          <Text style={styles.insightLabel}>Storage Used</Text>
        </View>
      </View>
    </FloatingCard>
  );

  // Render privacy section
  const renderPrivacySection = (title, icon, settings) => (
    <FloatingCard variant="large" style={styles.sectionCard} key={title}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Ionicons name={icon} size={20} color={MeshColors.primaryTeal} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      </View>
      
      {settings.map((setting) => renderPrivacySetting(setting))}
    </FloatingCard>
  );

  // Render individual privacy setting
  const renderPrivacySetting = (setting) => {
    switch (setting.type) {
      case 'switch':
        return (
          <View key={setting.key} style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              {setting.description && (
                <Text style={styles.settingDescription}>{setting.description}</Text>
              )}
              {setting.warning && (
                <Text style={styles.settingWarning}>{setting.warning}</Text>
              )}
            </View>
            <Switch
              value={privacySettings[setting.key]}
              onValueChange={(value) => {
                if (setting.requireConfirmation && value) {
                  Alert.alert(
                    setting.confirmTitle,
                    setting.confirmMessage,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Enable', onPress: () => updatePrivacySetting(setting.key, value) },
                    ]
                  );
                } else {
                  updatePrivacySetting(setting.key, value);
                }
              }}
              trackColor={{
                false: MeshColors.neutrals.lightGrey,
                true: getDynamicColor(setting.color || MeshColors.electricBlue, 0.3),
              }}
              thumbColor={
                privacySettings[setting.key] ? 
                (setting.color || MeshColors.electricBlue) : 
                MeshColors.neutrals.mediumGrey
              }
            />
          </View>
        );

      case 'select':
        return (
          <TouchableOpacity
            key={setting.key}
            style={styles.settingRow}
            onPress={() => {
              Alert.alert(
                setting.title,
                'Select an option',
                setting.options.map(option => ({
                  text: option.label,
                  onPress: () => updatePrivacySetting(setting.key, option.value),
                  style: privacySettings[setting.key] === option.value ? 'destructive' : 'default',
                }))
              );
            }}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingValue}>
                {setting.options.find(opt => opt.value === privacySettings[setting.key])?.label}
              </Text>
              {setting.description && (
                <Text style={styles.settingDescription}>{setting.description}</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={MeshColors.neutrals.mediumGrey} />
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  // Privacy settings configuration
  const privacySections = [
    {
      title: 'Visibility',
      icon: 'eye',
      settings: [
        {
          key: 'lastSeen',
          title: 'Last Seen',
          description: 'Control who can see when you were last online',
          type: 'select',
          options: [
            { label: 'Everyone', value: 'everyone' },
            { label: 'My Contacts', value: 'contacts' },
            { label: 'Nobody', value: 'nobody' },
          ],
        },
        {
          key: 'profilePhoto',
          title: 'Profile Photo',
          description: 'Who can see your profile picture',
          type: 'select',
          options: [
            { label: 'Everyone', value: 'everyone' },
            { label: 'My Contacts', value: 'contacts' },
            { label: 'Nobody', value: 'nobody' },
          ],
        },
        {
          key: 'status',
          title: 'Status',
          description: 'Who can see your status updates',
          type: 'select',
          options: [
            { label: 'Everyone', value: 'everyone' },
            { label: 'My Contacts', value: 'contacts' },
            { label: 'Nobody', value: 'nobody' },
          ],
        },
        {
          key: 'showOnlineStatus',
          title: 'Show Online Status',
          description: 'Let others see when you\'re online',
          type: 'switch',
        },
      ],
    },
    {
      title: 'Messages',
      icon: 'chatbubble-ellipses',
      settings: [
        {
          key: 'readReceipts',
          title: 'Read Receipts',
          description: 'Show blue checkmarks when you read messages',
          type: 'switch',
        },
        {
          key: 'showTypingIndicator',
          title: 'Typing Indicator',
          description: 'Show when you\'re typing a message',
          type: 'switch',
        },
        {
          key: 'disappearingMessages',
          title: 'Disappearing Messages',
          description: 'Messages automatically delete after set time',
          type: 'switch',
          color: MeshColors.accents.warning,
        },
        {
          key: 'groupAddPermission',
          title: 'Groups',
          description: 'Who can add you to groups',
          type: 'select',
          options: [
            { label: 'Everyone', value: 'everyone' },
            { label: 'My Contacts', value: 'contacts' },
            { label: 'Nobody', value: 'nobody' },
          ],
        },
      ],
    },
    {
      title: 'Security',
      icon: 'shield-checkmark',
      settings: [
        {
          key: 'twoStepVerification',
          title: 'Two-Step Verification',
          description: 'Add an extra layer of security to your account',
          type: 'switch',
          color: MeshColors.accents.success,
        },
        {
          key: 'fingerprintLock',
          title: 'Fingerprint Lock',
          description: 'Use fingerprint to unlock ndeip',
          type: 'switch',
          color: MeshColors.accents.success,
        },
        {
          key: 'blockScreenshots',
          title: 'Block Screenshots',
          description: 'Prevent screenshots and screen recording',
          type: 'switch',
          color: MeshColors.accents.success,
          requireConfirmation: true,
          confirmTitle: 'Block Screenshots',
          confirmMessage: 'This will prevent taking screenshots in the app. Are you sure?',
        },
        {
          key: 'screenLock',
          title: 'Screen Lock',
          description: 'Automatically lock the app',
          type: 'select',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Immediately', value: 'immediate' },
            { label: '1 minute', value: '1min' },
            { label: '5 minutes', value: '5min' },
            { label: '15 minutes', value: '15min' },
          ],
        },
      ],
    },
    {
      title: 'Data & Storage',
      icon: 'server',
      settings: [
        {
          key: 'backupToCloud',
          title: 'Cloud Backup',
          description: 'Backup messages to cloud storage',
          type: 'switch',
          warning: 'Cloud backups are not end-to-end encrypted',
        },
        {
          key: 'hideMediaInGallery',
          title: 'Hide Media in Gallery',
          description: 'ndeip media won\'t appear in your phone\'s gallery',
          type: 'switch',
        },
        {
          key: 'autoDeleteMedia',
          title: 'Auto-Delete Media',
          description: 'Automatically delete old media files',
          type: 'select',
          options: [
            { label: 'Never', value: 'never' },
            { label: 'After 30 days', value: '30days' },
            { label: 'After 6 months', value: '6months' },
            { label: 'After 1 year', value: '1year' },
          ],
        },
      ],
    },
  ];

  return (
    <CrystallineMesh 
      preset="settingsBackground" 
      intensity={meshIntensityAnim._value}
      interactive={true}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={MeshColors.primaryTeal} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Center</Text>
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => navigation.navigate('PrivacyHelp')}
          >
            <Ionicons name="help-circle" size={24} color={MeshColors.electricBlue} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Privacy Score */}
          {renderPrivacyScore()}

          {/* Data Insights */}
          {renderDataInsights()}

          {/* Privacy Sections */}
          {privacySections.map((section) => 
            renderPrivacySection(section.title, section.icon, section.settings)
          )}

          {/* Privacy Notice */}
          <FloatingCard variant="medium" style={styles.noticeCard}>
            <View style={styles.noticeContent}>
              <Ionicons 
                name="information-circle" 
                size={24} 
                color={MeshColors.electricBlue} 
                style={styles.noticeIcon}
              />
              <View style={styles.noticeText}>
                <Text style={styles.noticeTitle}>Your Privacy Matters</Text>
                <Text style={styles.noticeDescription}>
                  ndeip uses end-to-end encryption to protect your messages. 
                  We can't read your messages, and neither can anyone else.
                </Text>
              </View>
            </View>
          </FloatingCard>
        </ScrollView>
      </SafeAreaView>
    </CrystallineMesh>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: MeshSpacing.lg,
    paddingVertical: MeshSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: getDynamicColor(MeshColors.neutrals.lightGrey, 0.5),
  },
  backButton: {
    padding: MeshSpacing.sm,
  },
  headerTitle: {
    fontSize: MeshTypography.sizes.h2,
    fontWeight: MeshTypography.weights.bold,
    color: MeshColors.primaryTeal,
    fontFamily: MeshTypography.fonts.primary,
  },
  helpButton: {
    padding: MeshSpacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: MeshSpacing.md,
    paddingBottom: MeshSpacing.xl,
  },
  scoreCard: {
    marginVertical: MeshSpacing.lg,
    alignItems: 'center',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: MeshSpacing.lg,
  },
  scoreTitle: {
    fontSize: MeshTypography.sizes.h3,
    fontWeight: MeshTypography.weights.bold,
    color: MeshColors.primaryTeal,
    fontFamily: MeshTypography.fonts.primary,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreVisual: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: MeshTypography.weights.bold,
    fontFamily: MeshTypography.fonts.primary,
  },
  scoreLabel: {
    fontSize: MeshTypography.sizes.caption,
    color: MeshColors.neutrals.mediumGrey,
    marginTop: MeshSpacing.xs,
  },
  scoreActions: {
    marginTop: MeshSpacing.lg,
  },
  actionButton: {
    paddingHorizontal: MeshSpacing.lg,
    paddingVertical: MeshSpacing.md,
    borderWidth: 2,
    borderRadius: MeshBorderRadius.components.button,
  },
  actionButtonText: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.semiBold,
    fontFamily: MeshTypography.fonts.primary,
  },
  insightsCard: {
    marginBottom: MeshSpacing.lg,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  insightItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: MeshSpacing.md,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: MeshSpacing.sm,
  },
  insightNumber: {
    fontSize: MeshTypography.sizes.h4,
    fontWeight: MeshTypography.weights.bold,
    color: MeshColors.primaryTeal,
    fontFamily: MeshTypography.fonts.primary,
  },
  insightLabel: {
    fontSize: MeshTypography.sizes.caption,
    color: MeshColors.neutrals.mediumGrey,
    textAlign: 'center',
    marginTop: MeshSpacing.xs,
  },
  sectionCard: {
    marginBottom: MeshSpacing.lg,
    padding: MeshSpacing.lg,
  },
  sectionHeader: {
    marginBottom: MeshSpacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: MeshTypography.sizes.h3,
    fontWeight: MeshTypography.weights.bold,
    color: MeshColors.primaryTeal,
    fontFamily: MeshTypography.fonts.primary,
    marginLeft: MeshSpacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: MeshSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: getDynamicColor(MeshColors.neutrals.lightGrey, 0.3),
  },
  settingInfo: {
    flex: 1,
    marginRight: MeshSpacing.md,
  },
  settingTitle: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.medium,
    color: MeshColors.neutrals.charcoalGrey,
    fontFamily: MeshTypography.fonts.primary,
  },
  settingDescription: {
    fontSize: MeshTypography.sizes.bodySmall,
    color: MeshColors.neutrals.mediumGrey,
    marginTop: MeshSpacing.xs,
  },
  settingWarning: {
    fontSize: MeshTypography.sizes.bodySmall,
    color: MeshColors.accents.warning,
    marginTop: MeshSpacing.xs,
    fontStyle: 'italic',
  },
  settingValue: {
    fontSize: MeshTypography.sizes.bodySmall,
    color: MeshColors.electricBlue,
    marginTop: MeshSpacing.xs,
  },
  noticeCard: {
    marginTop: MeshSpacing.lg,
    backgroundColor: getDynamicColor(MeshColors.electricBlue, 0.05),
  },
  noticeContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noticeIcon: {
    marginRight: MeshSpacing.md,
    marginTop: MeshSpacing.xs,
  },
  noticeText: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.semiBold,
    color: MeshColors.primaryTeal,
    fontFamily: MeshTypography.fonts.primary,
    marginBottom: MeshSpacing.xs,
  },
  noticeDescription: {
    fontSize: MeshTypography.sizes.bodySmall,
    color: MeshColors.neutrals.mediumGrey,
    lineHeight: MeshTypography.lineHeights.relaxed * MeshTypography.sizes.bodySmall,
  },
});

export default PrivacyCenter;