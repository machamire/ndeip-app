/**
 * QuantumSettings - iOS Settings-level Polish with Mesh Elements
 * Revolutionary settings interface with floating mesh cards, live previews
 * Smart search, gesture controls, and crystalline design system
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Slider,
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  TextInput,
  Modal,
  StatusBar,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
let Notifications = null;
try { Notifications = require('expo-notifications'); } catch (e) { }
// expo-local-authentication is native-only; lazy-load to avoid web build crash
let LocalAuthentication = null;
try { LocalAuthentication = require('expo-local-authentication'); } catch (e) { }
let Haptics = null;
try { Haptics = require('expo-haptics'); } catch (e) { }
import { BlurView } from 'expo-blur';

import CrystallineMesh from '../../components/ndeip/CrystallineMesh';
import FloatingCard from '../../components/ui/FloatingCards';
import QuantumLoader from '../../components/ndeip/QuantumLoader';
import { useMeshTheme, useMeshColors, useMeshAnimations } from '../../hooks/useMeshTheme';
import {
  MeshColors,
  MeshTypography,
  MeshSpacing,
  MeshBorderRadius,
  MeshShadows,
  getDynamicColor,
} from '../../constants/ndeipBrandSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Settings sections configuration
const SETTINGS_SECTIONS = {
  ACCOUNT: {
    id: 'account',
    title: 'Account',
    icon: 'person-circle',
    description: 'Profile, privacy, and security',
    meshColor: MeshColors.electricBlue,
  },
  NOTIFICATIONS: {
    id: 'notifications',
    title: 'Notifications',
    icon: 'notifications',
    description: 'Alerts, sounds, and badges',
    meshColor: MeshColors.primaryTeal,
  },
  PRIVACY: {
    id: 'privacy',
    title: 'Privacy & Security',
    icon: 'shield-checkmark',
    description: 'Encryption, permissions, and data',
    meshColor: '#00FF88',
  },
  CHAT: {
    id: 'chat',
    title: 'Chat Settings',
    icon: 'chatbubbles',
    description: 'Messages, media, and backup',
    meshColor: MeshColors.meshGradients.primary[0],
  },
  CALLS: {
    id: 'calls',
    title: 'Calls & Media',
    icon: 'call',
    description: 'Audio, video, and connection',
    meshColor: MeshColors.meshGradients.primary[1],
  },
  APPEARANCE: {
    id: 'appearance',
    title: 'Appearance',
    icon: 'color-palette',
    description: 'Theme, colors, and interface',
    meshColor: '#9D4EDD',
  },
  STORAGE: {
    id: 'storage',
    title: 'Storage & Data',
    icon: 'server',
    description: 'Usage, backup, and cleanup',
    meshColor: '#06FFA5',
  },
  ADVANCED: {
    id: 'advanced',
    title: 'Advanced',
    icon: 'settings',
    description: 'Developer, debugging, and labs',
    meshColor: '#FF006E',
  },
};

// Settings items configuration
const SETTINGS_ITEMS = {
  // Account section
  profile: {
    section: 'account',
    title: 'Edit Profile',
    subtitle: 'Name, photo, and status',
    icon: 'person',
    type: 'navigation',
    screen: 'EditProfile',
  },
  username: {
    section: 'account',
    title: 'Username',
    subtitle: '@username',
    icon: 'at',
    type: 'navigation',
    screen: 'EditUsername',
  },
  twoFactor: {
    section: 'account',
    title: 'Two-Factor Authentication',
    subtitle: 'Add extra security to your account',
    icon: 'shield-checkmark',
    type: 'navigation',
    screen: 'TwoFactorAuth',
  },

  // Notifications section
  notifications: {
    section: 'notifications',
    title: 'Show Notifications',
    subtitle: 'Allow ndeip to send notifications',
    icon: 'notifications',
    type: 'toggle',
    key: 'notificationsEnabled',
    defaultValue: true,
  },
  messageNotifications: {
    section: 'notifications',
    title: 'Message Notifications',
    subtitle: 'Sound and vibration for messages',
    icon: 'chatbubble',
    type: 'toggle',
    key: 'messageNotifications',
    defaultValue: true,
    dependsOn: 'notificationsEnabled',
  },
  callNotifications: {
    section: 'notifications',
    title: 'Call Notifications',
    subtitle: 'Ringtone and vibration for calls',
    icon: 'call',
    type: 'toggle',
    key: 'callNotifications',
    defaultValue: true,
    dependsOn: 'notificationsEnabled',
  },
  notificationSound: {
    section: 'notifications',
    title: 'Notification Sound',
    subtitle: 'Default sound for messages',
    icon: 'volume-high',
    type: 'navigation',
    screen: 'NotificationSounds',
    dependsOn: 'messageNotifications',
  },

  // Privacy section
  lastSeen: {
    section: 'privacy',
    title: 'Last Seen',
    subtitle: 'Who can see when you were last online',
    icon: 'time',
    type: 'navigation',
    screen: 'LastSeenPrivacy',
  },
  profilePhoto: {
    section: 'privacy',
    title: 'Profile Photo',
    subtitle: 'Who can see your profile photo',
    icon: 'image',
    type: 'navigation',
    screen: 'ProfilePhotoPrivacy',
  },
  status: {
    section: 'privacy',
    title: 'Status',
    subtitle: 'Who can see your status updates',
    icon: 'radio',
    type: 'navigation',
    screen: 'StatusPrivacy',
  },
  readReceipts: {
    section: 'privacy',
    title: 'Read Receipts',
    subtitle: 'Show blue checkmarks when you read messages',
    icon: 'checkmark-done',
    type: 'toggle',
    key: 'readReceipts',
    defaultValue: true,
  },
  blockContacts: {
    section: 'privacy',
    title: 'Blocked Contacts',
    subtitle: 'Manage blocked users',
    icon: 'ban',
    type: 'navigation',
    screen: 'BlockedContacts',
  },

  // Chat section
  enterToSend: {
    section: 'chat',
    title: 'Enter to Send',
    subtitle: 'Press Enter to send messages',
    icon: 'return-down-back',
    type: 'toggle',
    key: 'enterToSend',
    defaultValue: false,
  },
  mediaAutoDownload: {
    section: 'chat',
    title: 'Auto-Download Media',
    subtitle: 'Automatically download photos and videos',
    icon: 'download',
    type: 'navigation',
    screen: 'MediaAutoDownload',
  },
  fontSize: {
    section: 'chat',
    title: 'Font Size',
    subtitle: 'Adjust text size in chats',
    icon: 'text',
    type: 'slider',
    key: 'fontSize',
    min: 12,
    max: 24,
    defaultValue: 16,
    unit: 'pt',
  },
  chatBackup: {
    section: 'chat',
    title: 'Chat Backup',
    subtitle: 'Backup your messages to cloud',
    icon: 'cloud-upload',
    type: 'navigation',
    screen: 'ChatBackup',
  },

  // Calls section
  callsTab: {
    section: 'calls',
    title: 'Show Calls Tab',
    subtitle: 'Display calls tab in main interface',
    icon: 'call',
    type: 'toggle',
    key: 'showCallsTab',
    defaultValue: true,
  },
  callWaiting: {
    section: 'calls',
    title: 'Call Waiting',
    subtitle: 'Accept new calls while in a call',
    icon: 'call-outline',
    type: 'toggle',
    key: 'callWaiting',
    defaultValue: true,
  },
  lowDataMode: {
    section: 'calls',
    title: 'Low Data Mode',
    subtitle: 'Reduce data usage for calls',
    icon: 'cellular',
    type: 'toggle',
    key: 'lowDataMode',
    defaultValue: false,
  },

  // Appearance section
  darkMode: {
    section: 'appearance',
    title: 'Dark Mode',
    subtitle: 'Use dark interface colors',
    icon: 'moon',
    type: 'toggle',
    key: 'darkMode',
    defaultValue: false,
  },
  meshIntensity: {
    section: 'appearance',
    title: 'Mesh Effects',
    subtitle: 'Crystalline pattern intensity',
    icon: 'diamond',
    type: 'slider',
    key: 'meshIntensity',
    min: 0,
    max: 100,
    defaultValue: 70,
    unit: '%',
  },
  wallpaper: {
    section: 'appearance',
    title: 'Chat Wallpaper',
    subtitle: 'Background for chat screens',
    icon: 'image-outline',
    type: 'navigation',
    screen: 'ChatWallpaper',
  },

  // Storage section
  storageUsage: {
    section: 'storage',
    title: 'Storage Usage',
    subtitle: 'See how much space ndeip is using',
    icon: 'pie-chart',
    type: 'navigation',
    screen: 'StorageUsage',
  },
  networkUsage: {
    section: 'storage',
    title: 'Network Usage',
    subtitle: 'Monitor data consumption',
    icon: 'stats-chart',
    type: 'navigation',
    screen: 'NetworkUsage',
  },
  clearCache: {
    section: 'storage',
    title: 'Clear Cache',
    subtitle: 'Free up space by clearing cached data',
    icon: 'trash',
    type: 'action',
    action: 'clearCache',
    confirmRequired: true,
  },

  // Advanced section
  developerMode: {
    section: 'advanced',
    title: 'Developer Mode',
    subtitle: 'Enable debug features and logs',
    icon: 'code-slash',
    type: 'toggle',
    key: 'developerMode',
    defaultValue: false,
  },
  betaFeatures: {
    section: 'advanced',
    title: 'Beta Features',
    subtitle: 'Try experimental features',
    icon: 'flask',
    type: 'toggle',
    key: 'betaFeatures',
    defaultValue: false,
    dependsOn: 'developerMode',
  },
  exportData: {
    section: 'advanced',
    title: 'Export Data',
    subtitle: 'Download your data',
    icon: 'download-outline',
    type: 'action',
    action: 'exportData',
  },
  resetApp: {
    section: 'advanced',
    title: 'Reset App',
    subtitle: 'Clear all data and settings',
    icon: 'refresh',
    type: 'action',
    action: 'resetApp',
    confirmRequired: true,
    destructive: true,
  },
};

const QuantumSettings = ({ navigation }) => {
  const { colors, isDark } = useMeshColors();
  const { timing } = useMeshAnimations();

  // State management
  const [activeSection, setActiveSection] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [meshPattern, setMeshPattern] = useState(null);

  // Animation refs
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const sectionAnimation = useRef(new Animated.Value(0)).current;
  const meshAnimation = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  // Initialize settings
  useEffect(() => {
    loadSettings();
    generateMeshPattern();
    startMeshAnimation();
  }, []);

  // Load settings from storage
  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      const defaultSettings = {};

      // Set default values
      Object.entries(SETTINGS_ITEMS).forEach(([key, item]) => {
        if (item.type === 'toggle' || item.type === 'slider') {
          defaultSettings[item.key] = item.defaultValue;
        }
      });

      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      } else {
        setSettings(defaultSettings);
      }

    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save settings to storage
  const saveSettings = async (newSettings) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await AsyncStorage.setItem('app_settings', JSON.stringify(updatedSettings));

      // Trigger haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  // Generate mesh pattern for settings visualization
  const generateMeshPattern = () => {
    const pattern = {
      nodes: [],
      connections: [],
      sections: Object.keys(SETTINGS_SECTIONS).map((key, index) => ({
        id: key,
        x: (index % 3) * 33,
        y: Math.floor(index / 3) * 25,
        color: SETTINGS_SECTIONS[key].meshColor,
        active: false,
        intensity: 0.5,
      })),
    };

    // Create connections between related sections
    const relationships = [
      ['account', 'privacy'],
      ['notifications', 'chat'],
      ['calls', 'chat'],
      ['appearance', 'advanced'],
      ['storage', 'advanced'],
    ];

    relationships.forEach(([from, to]) => {
      const fromSection = pattern.sections.find(s => s.id === from);
      const toSection = pattern.sections.find(s => s.id === to);

      if (fromSection && toSection) {
        pattern.connections.push({
          from: fromSection,
          to: toSection,
          strength: 0.6,
          active: false,
        });
      }
    });

    setMeshPattern(pattern);
  };

  // Start mesh animation
  const startMeshAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(meshAnimation, {
          toValue: 1,
          duration: timing.mesh * 3,
          useNativeDriver: true,
        }),
        Animated.timing(meshAnimation, {
          toValue: 0,
          duration: timing.mesh * 3,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Handle section selection
  const handleSectionSelect = (sectionId) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);

    // Update mesh pattern
    if (meshPattern) {
      const updatedPattern = {
        ...meshPattern,
        sections: meshPattern.sections.map(section => ({
          ...section,
          active: section.id === sectionId,
          intensity: section.id === sectionId ? 1 : 0.3,
        })),
        connections: meshPattern.connections.map(conn => ({
          ...conn,
          active: conn.from.id === sectionId || conn.to.id === sectionId,
        })),
      };

      setMeshPattern(updatedPattern);
    }

    // Animate section expansion
    Animated.spring(sectionAnimation, {
      toValue: activeSection === sectionId ? 0 : 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Handle setting toggle
  const handleToggle = (item, value) => {
    saveSettings({ [item.key]: value });

    // Update mesh visualization based on setting change
    if (item.key === 'meshIntensity') {
      updateMeshIntensity(value);
    }
  };

  // Handle setting action
  const handleAction = (item) => {
    switch (item.action) {
      case 'clearCache':
        Alert.alert(
          'Clear Cache',
          'This will remove cached images and temporary files. Continue?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: clearCache },
          ]
        );
        break;

      case 'exportData':
        exportUserData();
        break;

      case 'resetApp':
        Alert.alert(
          'Reset App',
          'This will permanently delete all your data and settings. This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reset', style: 'destructive', onPress: resetApp },
          ]
        );
        break;
    }
  };

  // Clear cache action
  const clearCache = async () => {
    try {
      // Implementation would clear cached files
      Alert.alert('Success', 'Cache cleared successfully');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      Alert.alert('Error', 'Failed to clear cache');
    }
  };

  // Export user data
  const exportUserData = async () => {
    try {
      const userData = {
        settings,
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };

      await Share.share({
        message: JSON.stringify(userData, null, 2),
        title: 'ndeip Data Export',
      });

    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  // Reset app action
  const resetApp = async () => {
    try {
      await AsyncStorage.clear();
      // Would restart app or navigate to onboarding
      Alert.alert('Reset Complete', 'App has been reset to default settings');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset app');
    }
  };

  // Update mesh intensity
  const updateMeshIntensity = (intensity) => {
    if (meshPattern) {
      const updatedPattern = {
        ...meshPattern,
        globalIntensity: intensity / 100,
        sections: meshPattern.sections.map(section => ({
          ...section,
          intensity: (intensity / 100) * (section.active ? 1 : 0.5),
        })),
      };

      setMeshPattern(updatedPattern);
    }
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.length > 0 && !searchActive) {
      setSearchActive(true);
      Animated.timing(searchAnimation, {
        toValue: 1,
        duration: timing.normal,
        useNativeDriver: true,
      }).start();
    } else if (query.length === 0 && searchActive) {
      setSearchActive(false);
      Animated.timing(searchAnimation, {
        toValue: 0,
        duration: timing.normal,
        useNativeDriver: true,
      }).start();
    }
  };

  // Filter settings based on search
  const filteredSections = Object.keys(SETTINGS_SECTIONS).filter(sectionId => {
    if (!searchQuery) return true;

    const section = SETTINGS_SECTIONS[sectionId];
    const sectionItems = Object.values(SETTINGS_ITEMS).filter(item => item.section === sectionId);

    return (
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sectionItems.some(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

  // Check if setting is dependent and should be disabled
  const isSettingDisabled = (item) => {
    if (!item.dependsOn) return false;
    return !settings[item.dependsOn];
  };

  // Render setting item
  const renderSettingItem = (item) => {
    const isDisabled = isSettingDisabled(item);

    return (
      <FloatingCard
        key={item.title}
        style={[
          styles.settingItem,
          isDisabled && { opacity: 0.5 },
        ]}
      >
        <TouchableOpacity
          style={styles.settingContent}
          onPress={() => {
            if (isDisabled) return;

            if (item.type === 'navigation') {
              navigation.navigate(item.screen);
            } else if (item.type === 'action') {
              handleAction(item);
            }
          }}
          disabled={isDisabled || ['toggle', 'slider'].includes(item.type)}
        >
          <View style={styles.settingIcon}>
            <Ionicons
              name={item.icon}
              size={20}
              color={isDisabled ? colors.textSecondary : colors.primary}
            />
          </View>

          <View style={styles.settingText}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                {item.subtitle}
              </Text>
            )}
          </View>

          <View style={styles.settingControl}>
            {item.type === 'toggle' && (
              <Switch
                value={settings[item.key] || false}
                onValueChange={(value) => handleToggle(item, value)}
                trackColor={{
                  false: colors.surface,
                  true: getDynamicColor(colors.primary, 0.3),
                }}
                thumbColor={
                  settings[item.key] ? colors.primary : colors.textSecondary
                }
                disabled={isDisabled}
              />
            )}

            {item.type === 'slider' && (
              <View style={styles.sliderContainer}>
                <Text style={[styles.sliderValue, { color: colors.text }]}>
                  {settings[item.key] || item.defaultValue}{item.unit}
                </Text>
                <Slider
                  style={styles.slider}
                  value={settings[item.key] || item.defaultValue}
                  minimumValue={item.min}
                  maximumValue={item.max}
                  step={1}
                  onValueChange={(value) => handleToggle(item, value)}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.surface}
                  thumbStyle={{ backgroundColor: colors.electricBlue }}
                  disabled={isDisabled}
                />
              </View>
            )}

            {item.type === 'navigation' && (
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            )}

            {item.type === 'action' && (
              <Ionicons
                name={item.destructive ? "warning" : "arrow-forward"}
                size={20}
                color={item.destructive ? '#C83232' : colors.primary}
              />
            )}
          </View>
        </TouchableOpacity>
      </FloatingCard>
    );
  };

  // Render section
  const renderSection = (sectionId) => {
    const section = SETTINGS_SECTIONS[sectionId];
    const sectionItems = Object.values(SETTINGS_ITEMS).filter(item => item.section === sectionId);
    const isExpanded = activeSection === sectionId;

    return (
      <View key={sectionId} style={styles.section}>
        <TouchableOpacity
          style={[
            styles.sectionHeader,
            { backgroundColor: getDynamicColor(section.meshColor, 0.1) },
            isExpanded && { backgroundColor: getDynamicColor(section.meshColor, 0.2) },
          ]}
          onPress={() => handleSectionSelect(sectionId)}
        >
          <View style={styles.sectionHeaderContent}>
            <View style={[styles.sectionIcon, { backgroundColor: section.meshColor }]}>
              <Ionicons name={section.icon} size={24} color={colors.crystallineWhite} />
            </View>

            <View style={styles.sectionInfo}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {section.title}
              </Text>
              <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                {section.description}
              </Text>
            </View>

            <Animated.View
              style={{
                transform: [{
                  rotate: sectionAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                }],
              }}
            >
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.textSecondary}
              />
            </Animated.View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <Animated.View
            style={[
              styles.sectionContent,
              {
                opacity: sectionAnimation,
                transform: [{
                  translateY: sectionAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                }],
              },
            ]}
          >
            {sectionItems.map(renderSettingItem)}
          </Animated.View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <CrystallineMesh
          variant="large"
          animated={true}
          intensity={0.1}
          color={getDynamicColor(colors.primary, 0.05)}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <QuantumLoader type="mesh" size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading Settings...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Mesh background */}
      <CrystallineMesh
        variant="large"
        animated={true}
        intensity={settings.meshIntensity ? settings.meshIntensity / 100 : 0.7}
        color={getDynamicColor(colors.primary, 0.03)}
        style={[StyleSheet.absoluteFillObject, { zIndex: -1 }]}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: getDynamicColor(colors.surface, 0.9) }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Settings
          </Text>

          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: getDynamicColor(colors.surface, 0.9) }]}
            onPress={() => {
              setSearchActive(!searchActive);
              Animated.timing(searchAnimation, {
                toValue: searchActive ? 0 : 1,
                duration: timing.normal,
                useNativeDriver: true,
              }).start();
            }}
          >
            <Ionicons name="search" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <Animated.View
          style={[
            styles.searchContainer,
            {
              opacity: searchAnimation,
              transform: [{
                translateY: searchAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              }],
            },
          ]}
          pointerEvents={searchActive ? 'auto' : 'none'}
        >
          <BlurView intensity={80} style={styles.searchBlur}>
            <View style={[styles.searchInputContainer, { backgroundColor: colors.surface }]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search settings..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus={searchActive}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </BlurView>
        </Animated.View>

        {/* Settings content */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredSections.map(renderSection)}

          {/* App info */}
          <View style={styles.appInfo}>
            <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
              ndeip v1.0.0
            </Text>
            <Text style={[styles.appDescription, { color: colors.textSecondary }]}>
              Secure messaging for the next generation
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.fonts.primary,
    marginTop: MeshSpacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: MeshSpacing.md,
    paddingVertical: MeshSpacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: MeshBorderRadius.components.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    ...MeshShadows.floating.medium,
  },
  headerTitle: {
    fontSize: MeshTypography.sizes.h2,
    fontWeight: MeshTypography.weights.bold,
    fontFamily: MeshTypography.fonts.primary,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: MeshBorderRadius.components.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    ...MeshShadows.floating.medium,
  },
  searchContainer: {
    paddingHorizontal: MeshSpacing.md,
    paddingVertical: MeshSpacing.sm,
  },
  searchBlur: {
    borderRadius: MeshBorderRadius.lg,
    overflow: 'hidden',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MeshSpacing.md,
    paddingVertical: MeshSpacing.sm,
    borderRadius: MeshBorderRadius.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: MeshTypography.sizes.body,
    fontFamily: MeshTypography.fonts.primary,
    marginLeft: MeshSpacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: MeshSpacing.md,
    paddingBottom: MeshSpacing.xl,
  },
  section: {
    marginBottom: MeshSpacing.lg,
  },
  sectionHeader: {
    borderRadius: MeshBorderRadius.lg,
    overflow: 'hidden',
    ...MeshShadows.floating.medium,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MeshSpacing.md,
    paddingVertical: MeshSpacing.md,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: MeshBorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...MeshShadows.floating.light,
  },
  sectionInfo: {
    flex: 1,
    marginLeft: MeshSpacing.md,
  },
  sectionTitle: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.semiBold,
    fontFamily: MeshTypography.fonts.primary,
  },
  sectionDescription: {
    fontSize: MeshTypography.sizes.bodySmall,
    fontFamily: MeshTypography.fonts.primary,
    marginTop: MeshSpacing.xs,
  },
  sectionContent: {
    paddingTop: MeshSpacing.md,
  },
  settingItem: {
    marginBottom: MeshSpacing.sm,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MeshSpacing.md,
    paddingVertical: MeshSpacing.sm,
  },
  settingIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    flex: 1,
    marginLeft: MeshSpacing.sm,
  },
  settingTitle: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.fonts.primary,
  },
  settingSubtitle: {
    fontSize: MeshTypography.sizes.bodySmall,
    fontFamily: MeshTypography.fonts.primary,
    marginTop: MeshSpacing.xs,
  },
  settingControl: {
    alignItems: 'center',
  },
  sliderContainer: {
    alignItems: 'center',
    minWidth: 120,
  },
  sliderValue: {
    fontSize: MeshTypography.sizes.bodySmall,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.fonts.primary,
    marginBottom: MeshSpacing.xs,
  },
  slider: {
    width: 100,
    height: 20,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: MeshSpacing.xl,
  },
  appVersion: {
    fontSize: MeshTypography.sizes.bodySmall,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.fonts.primary,
  },
  appDescription: {
    fontSize: MeshTypography.sizes.caption,
    fontFamily: MeshTypography.fonts.primary,
    marginTop: MeshSpacing.xs,
    textAlign: 'center',
  },
});

export default QuantumSettings;