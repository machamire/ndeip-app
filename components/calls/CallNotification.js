/**
 * CallNotification - Stunning Incoming Call Experience
 * Full-screen takeover with beautiful interface, mesh ripples on touch
 * Quick actions with mesh trails, rich contact info with mesh frames
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Image,
  StatusBar,
  Platform,
  Vibration,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Svg, {
  Circle,
  Path,
  G,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  AnimatedCircle,
  AnimatedPath,
  Pattern,
  Rect,
} from 'react-native-svg';

// Import our mesh components
import CrystallineMesh from '../ndeip/CrystallineMesh';
import QuantumLoader from '../ndeip/QuantumLoader';
import { useMeshTheme, useMeshColors, useMeshAnimations } from '../../hooks/useMeshTheme';
import { generateUserMesh } from '../../utils/MeshGenerator';
import {
  MeshColors,
  MeshTypography,
  MeshSpacing,
  MeshBorderRadius,
  MeshShadows,
  getDynamicColor,
} from '../../constants/ndeipBrandSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Call types
const CALL_TYPES = {
  VOICE: 'voice',
  VIDEO: 'video',
  GROUP: 'group',
  CONFERENCE: 'conference',
};

// Call actions
const CALL_ACTIONS = {
  ANSWER: 'answer',
  DECLINE: 'decline',
  MESSAGE: 'message',
  REMIND: 'remind',
};

const CallNotification = ({
  visible = false,
  caller,
  callType = CALL_TYPES.VOICE,
  duration = 0,
  onAnswer,
  onDecline,
  onMessage,
  onRemindLater,
  customRingtone = null,
  showQuickActions = true,
  autoDeclineTimeout = 30000, // 30 seconds
}) => {
  const { colors } = useMeshColors();
  const { timing } = useMeshAnimations();

  // Animation refs
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0.8)).current;
  const pulseAnimation = useRef(new Animated.Value(0)).current;
  const rippleAnimations = useRef([]).current;
  const avatarAnimation = useRef(new Animated.Value(0)).current;
  const actionsAnimation = useRef(new Animated.Value(0)).current;
  const backgroundAnimation = useRef(new Animated.Value(0)).current;

  // State
  const [currentDuration, setCurrentDuration] = useState(0);
  const [ringtoneSound, setRingtoneSound] = useState(null);
  const [touchRipples, setTouchRipples] = useState([]);
  const [nextRippleId, setNextRippleId] = useState(0);
  const [isVibrating, setIsVibrating] = useState(false);

  // Timers
  const durationTimer = useRef(null);
  const autoDeclineTimer = useRef(null);
  const vibrationTimer = useRef(null);

  // User mesh pattern
  const callerMeshPattern = generateUserMesh(caller?.id);

  // Initialize notification
  useEffect(() => {
    if (visible) {
      showNotification();
      startRingtone();
      startVibration();
      startAutoDeclineTimer();
      
      // Handle Android back button
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      
      return () => {
        backHandler.remove();
      };
    } else {
      hideNotification();
      stopRingtone();
      stopVibration();
      clearTimers();
    }
  }, [visible]);

  // Duration counter
  useEffect(() => {
    if (visible) {
      durationTimer.current = setInterval(() => {
        setCurrentDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
      }
    };
  }, [visible]);

  // Show notification animation
  const showNotification = () => {
    StatusBar.setHidden(true);
    
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: timing.normal,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnimation, {
        toValue: 1,
        tension: 300,
        friction: 20,
        useNativeDriver: true,
      }),
    ]).start();

    // Start background animation
    startBackgroundAnimation();

    // Delayed avatar and actions animation
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(avatarAnimation, {
          toValue: 1,
          duration: timing.normal,
          useNativeDriver: true,
        }),
        Animated.timing(actionsAnimation, {
          toValue: 1,
          duration: timing.normal,
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    // Start pulse animation
    startPulseAnimation();
  };

  // Hide notification animation
  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: timing.fast,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 0.8,
        duration: timing.fast,
        useNativeDriver: true,
      }),
    ]).start(() => {
      StatusBar.setHidden(false);
    });
  };

  // Start background animation
  const startBackgroundAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundAnimation, {
          toValue: 1,
          duration: timing.mesh * 2,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundAnimation, {
          toValue: 0,
          duration: timing.mesh * 2,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Start pulse animation
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: timing.slow,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0,
          duration: timing.slow,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Start ringtone
  const startRingtone = async () => {
    try {
      const soundSource = customRingtone || require('../../assets/sounds/default_ringtone.mp3');
      
      const { sound } = await Audio.Sound.createAsync(soundSource, {
        shouldPlay: true,
        isLooping: true,
        volume: 0.8,
      });
      
      setRingtoneSound(sound);
    } catch (error) {
      console.error('Failed to start ringtone:', error);
    }
  };

  // Stop ringtone
  const stopRingtone = async () => {
    if (ringtoneSound) {
      await ringtoneSound.stopAsync();
      await ringtoneSound.unloadAsync();
      setRingtoneSound(null);
    }
  };

  // Start vibration
  const startVibration = () => {
    if (Platform.OS === 'ios') {
      setIsVibrating(true);
      vibrationTimer.current = setInterval(() => {
        Vibration.vibrate([0, 200, 100, 200]);
      }, 1000);
    } else {
      Vibration.vibrate([0, 300, 200, 300], true);
      setIsVibrating(true);
    }
  };

  // Stop vibration
  const stopVibration = () => {
    Vibration.cancel();
    setIsVibrating(false);
    
    if (vibrationTimer.current) {
      clearInterval(vibrationTimer.current);
      vibrationTimer.current = null;
    }
  };

  // Start auto decline timer
  const startAutoDeclineTimer = () => {
    if (autoDeclineTimeout > 0) {
      autoDeclineTimer.current = setTimeout(() => {
        handleDecline();
      }, autoDeclineTimeout);
    }
  };

  // Clear all timers
  const clearTimers = () => {
    if (durationTimer.current) {
      clearInterval(durationTimer.current);
      durationTimer.current = null;
    }
    
    if (autoDeclineTimer.current) {
      clearTimeout(autoDeclineTimer.current);
      autoDeclineTimer.current = null;
    }
  };

  // Handle back button press
  const handleBackPress = () => {
    // Prevent back button from closing the call notification
    return true;
  };

  // Handle touch ripple effect
  const handleTouch = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    
    const newRipple = {
      id: nextRippleId,
      x: locationX,
      y: locationY,
      animValue: new Animated.Value(0),
    };
    
    setTouchRipples(prev => [...prev, newRipple]);
    setNextRippleId(prev => prev + 1);

    // Start ripple animation
    Animated.timing(newRipple.animValue, {
      toValue: 1,
      duration: timing.normal * 2,
      useNativeDriver: true,
    }).start(() => {
      // Remove ripple after animation
      setTouchRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    });
  };

  // Handle answer call
  const handleAnswer = useCallback(() => {
    clearTimers();
    stopRingtone();
    stopVibration();
    
    if (onAnswer) {
      onAnswer(callType);
    }
  }, [callType, onAnswer]);

  // Handle decline call
  const handleDecline = useCallback(() => {
    clearTimers();
    stopRingtone();
    stopVibration();
    
    if (onDecline) {
      onDecline();
    }
  }, [onDecline]);

  // Handle message action
  const handleMessage = useCallback(() => {
    clearTimers();
    stopRingtone();
    stopVibration();
    
    if (onMessage) {
      onMessage(caller);
    }
  }, [caller, onMessage]);

  // Handle remind later
  const handleRemindLater = useCallback(() => {
    clearTimers();
    stopRingtone();
    stopVibration();
    
    if (onRemindLater) {
      onRemindLater();
    }
  }, [onRemindLater]);

  // Format call duration
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Get call type icon
  const getCallTypeIcon = () => {
    switch (callType) {
      case CALL_TYPES.VIDEO:
        return 'videocam';
      case CALL_TYPES.GROUP:
        return 'people';
      case CALL_TYPES.CONFERENCE:
        return 'business';
      default:
        return 'call';
    }
  };

  // Render background mesh
  const renderBackgroundMesh = () => (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        {
          opacity: backgroundAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.7],
          }),
        },
      ]}
    >
      <CrystallineMesh
        variant="quantum"
        animated={true}
        intensity={0.8}
        color={getDynamicColor(colors.primary, 0.4)}
        interactive={false}
      />
    </Animated.View>
  );

  // Render touch ripples
  const renderTouchRipples = () => (
    <Svg
      width={screenWidth}
      height={screenHeight}
      style={StyleSheet.absoluteFillObject}
      pointerEvents="none"
    >
      <Defs>
        <SvgGradient id="rippleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={colors.secondary} stopOpacity="0.6" />
          <Stop offset="100%" stopColor={colors.secondary} stopOpacity="0" />
        </SvgGradient>
      </Defs>

      {touchRipples.map((ripple) => {
        const rippleRadius = ripple.animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 200],
        });

        const rippleOpacity = ripple.animValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.8, 0.4, 0],
        });

        return (
          <AnimatedCircle
            key={ripple.id}
            cx={ripple.x}
            cy={ripple.y}
            r={rippleRadius}
            fill="url(#rippleGradient)"
            opacity={rippleOpacity}
          />
        );
      })}
    </Svg>
  );

  // Render caller avatar with mesh frame
  const renderCallerAvatar = () => (
    <Animated.View
      style={[
        styles.avatarContainer,
        {
          opacity: avatarAnimation,
          transform: [{
            scale: avatarAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1],
            }),
          }],
        },
      ]}
    >
      {/* Mesh frame */}
      <Svg
        width={200}
        height={200}
        style={StyleSheet.absoluteFillObject}
      >
        <Defs>
          <SvgGradient id="avatarFrameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.8" />
            <Stop offset="50%" stopColor={colors.secondary} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.8" />
          </SvgGradient>
          
          <Pattern id="avatarMeshPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <Circle cx="10" cy="10" r="1" fill={colors.secondary} opacity="0.3" />
            <Path
              d="M 5 10 Q 10 5 15 10 Q 10 15 5 10"
              stroke={colors.primary}
              strokeWidth="0.5"
              fill="none"
              opacity="0.5"
            />
          </Pattern>
        </Defs>

        {/* Outer mesh ring */}
        <AnimatedCircle
          cx="100"
          cy="100"
          r="95"
          stroke="url(#avatarFrameGradient)"
          strokeWidth="4"
          fill="none"
          strokeDasharray={pulseAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [`0 ${2 * Math.PI * 95}`, `${2 * Math.PI * 95} 0`],
          })}
        />

        {/* Mesh pattern overlay */}
        <Circle
          cx="100"
          cy="100"
          r="90"
          fill="url(#avatarMeshPattern)"
          opacity="0.1"
        />

        {/* Connection nodes */}
        {callerMeshPattern.nodes?.slice(0, 8).map((node, index) => {
          const angle = (index / 8) * 2 * Math.PI;
          const radius = 85;
          const x = 100 + Math.cos(angle) * radius;
          const y = 100 + Math.sin(angle) * radius;

          return (
            <AnimatedCircle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill={colors.secondary}
              opacity={pulseAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.8],
              })}
            />
          );
        })}
      </Svg>

      {/* Avatar glow effect */}
      <Animated.View
        style={[
          styles.avatarGlow,
          {
            backgroundColor: colors.secondary,
            opacity: pulseAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.2, 0.5],
            }),
            transform: [{
              scale: pulseAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.1],
              }),
            }],
          },
        ]}
      />

      {/* Avatar image */}
      <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
        {caller?.avatar ? (
          <Image source={{ uri: caller.avatar }} style={styles.avatarImage} />
        ) : (
          <Text style={[styles.avatarText, { color: colors.text }]}>
            {caller?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        )}
      </View>

      {/* Call type indicator */}
      <View style={[styles.callTypeIndicator, { backgroundColor: colors.secondary }]}>
        <Ionicons
          name={getCallTypeIcon()}
          size={24}
          color={colors.background}
        />
      </View>
    </Animated.View>
  );

  // Render caller information
  const renderCallerInfo = () => (
    <Animated.View
      style={[
        styles.callerInfo,
        {
          opacity: avatarAnimation,
          transform: [{
            translateY: avatarAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        },
      ]}
    >
      <Text style={[styles.callerName, { color: colors.crystallineWhite }]}>
        {caller?.name || 'Unknown Caller'}
      </Text>
      
      <Text style={[styles.callerNumber, { color: getDynamicColor(colors.crystallineWhite, 0.8) }]}>
        {caller?.phoneNumber || caller?.email || ''}
      </Text>
      
      <View style={styles.callDetails}>
        <Text style={[styles.callType, { color: getDynamicColor(colors.crystallineWhite, 0.7) }]}>
          {callType === CALL_TYPES.VIDEO ? 'Video Call' : 
           callType === CALL_TYPES.GROUP ? 'Group Call' :
           callType === CALL_TYPES.CONFERENCE ? 'Conference Call' : 'Voice Call'}
        </Text>
        
        <View style={styles.callDuration}>
          <MaterialIcons 
            name="access-time" 
            size={16} 
            color={getDynamicColor(colors.crystallineWhite, 0.7)} 
          />
          <Text style={[styles.durationText, { color: getDynamicColor(colors.crystallineWhite, 0.7) }]}>
            {formatDuration(currentDuration)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  // Render main action buttons
  const renderMainActions = () => (
    <Animated.View
      style={[
        styles.mainActions,
        {
          opacity: actionsAnimation,
          transform: [{
            translateY: actionsAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0],
            }),
          }],
        },
      ]}
    >
      {/* Decline button */}
      <TouchableOpacity
        style={[styles.mainActionButton, styles.declineButton, { backgroundColor: colors.accents.mutedRed }]}
        onPress={handleDecline}
        activeOpacity={0.8}
      >
        <Ionicons name="call" size={32} color={colors.crystallineWhite} style={{ transform: [{ rotate: '135deg' }] }} />
        <View style={[styles.actionButtonGlow, { backgroundColor: colors.accents.mutedRed }]} />
      </TouchableOpacity>

      {/* Answer button */}
      <TouchableOpacity
        style={[styles.mainActionButton, styles.answerButton, { backgroundColor: colors.accents.success }]}
        onPress={handleAnswer}
        activeOpacity={0.8}
      >
        <Ionicons name="call" size={32} color={colors.crystallineWhite} />
        <View style={[styles.actionButtonGlow, { backgroundColor: colors.accents.success }]} />
      </TouchableOpacity>
    </Animated.View>
  );

  // Render quick actions
  const renderQuickActions = () => {
    if (!showQuickActions) return null;

    return (
      <Animated.View
        style={[
          styles.quickActions,
          {
            opacity: actionsAnimation,
            transform: [{
              translateY: actionsAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            }],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: getDynamicColor(colors.surface, 0.9) }]}
          onPress={handleMessage}
        >
          <Ionicons name="chatbubble" size={20} color={colors.text} />
          <Text style={[styles.quickActionText, { color: colors.text }]}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: getDynamicColor(colors.surface, 0.9) }]}
          onPress={handleRemindLater}
        >
          <Ionicons name="time" size={20} color={colors.text} />
          <Text style={[styles.quickActionText, { color: colors.text }]}>Remind</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnimation,
          transform: [{ scale: scaleAnimation }],
        },
      ]}
      onTouchStart={handleTouch}
    >
      {/* Background gradient */}
      <LinearGradient
        colors={[
          getDynamicColor(colors.primaryTeal, 0.95),
          getDynamicColor(colors.electricBlue, 0.8),
          getDynamicColor(colors.primaryTeal, 0.95),
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Background mesh */}
      {renderBackgroundMesh()}

      {/* Touch ripples */}
      {renderTouchRipples()}

      {/* Content container */}
      <SafeAreaView style={styles.contentContainer}>
        {/* Caller avatar */}
        {renderCallerAvatar()}

        {/* Caller information */}
        {renderCallerInfo()}

        {/* Main action buttons */}
        {renderMainActions()}

        {/* Quick actions */}
        {renderQuickActions()}
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },

  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: MeshSpacing.xxl,
  },

  avatarContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: MeshSpacing.xxxl,
    position: 'relative',
  },

  avatarGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    zIndex: 1,
  },

  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    zIndex: 2,
    ...MeshShadows.floating.heavy,
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  avatarText: {
    fontSize: MeshTypography.sizes.h1 * 2,
    fontWeight: MeshTypography.weights.bold,
  },

  callTypeIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    ...MeshShadows.floating.medium,
  },

  callerInfo: {
    alignItems: 'center',
    paddingHorizontal: MeshSpacing.xl,
  },

  callerName: {
    fontSize: MeshTypography.sizes.h1,
    fontWeight: MeshTypography.weights.semiBold,
    textAlign: 'center',
    marginBottom: MeshSpacing.sm,
  },

  callerNumber: {
    fontSize: MeshTypography.sizes.body,
    textAlign: 'center',
    marginBottom: MeshSpacing.lg,
  },

  callDetails: {
    alignItems: 'center',
  },

  callType: {
    fontSize: MeshTypography.sizes.bodySmall,
    marginBottom: MeshSpacing.sm,
  },

  callDuration: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  durationText: {
    fontSize: MeshTypography.sizes.bodySmall,
    marginLeft: MeshSpacing.xs,
  },

  mainActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: screenWidth * 0.6,
    marginBottom: MeshSpacing.xl,
  },

  mainActionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...MeshShadows.floating.heavy,
  },

  actionButtonGlow: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    opacity: 0.3,
    zIndex: -1,
  },

  declineButton: {
    marginRight: MeshSpacing.xl,
  },

  answerButton: {
    marginLeft: MeshSpacing.xl,
  },

  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: MeshSpacing.lg,
  },

  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MeshSpacing.lg,
    paddingVertical: MeshSpacing.md,
    borderRadius: MeshBorderRadius.components.button,
    ...MeshShadows.floating.light,
  },

  quickActionText: {
    fontSize: MeshTypography.sizes.bodySmall,
    fontWeight: MeshTypography.weights.medium,
    marginLeft: MeshSpacing.sm,
  },
});

// Export specialized notification components
export const VoiceCallNotification = (props) => (
  <CallNotification {...props} callType={CALL_TYPES.VOICE} />
);

export const VideoCallNotification = (props) => (
  <CallNotification {...props} callType={CALL_TYPES.VIDEO} />
);

export const GroupCallNotification = (props) => (
  <CallNotification {...props} callType={CALL_TYPES.GROUP} />
);

export const ConferenceCallNotification = (props) => (
  <CallNotification {...props} callType={CALL_TYPES.CONFERENCE} />
);

// Hook for managing call notifications
export const useCallNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [notificationData, setNotificationData] = useState(null);

  const showNotification = useCallback((caller, callType = CALL_TYPES.VOICE, options = {}) => {
    setNotificationData({ caller, callType, ...options });
    setIsVisible(true);
  }, []);

  const hideNotification = useCallback(() => {
    setIsVisible(false);
    setNotificationData(null);
  }, []);

  return {
    isVisible,
    notificationData,
    showNotification,
    hideNotification,
  };
};

export default CallNotification;
export { CALL_TYPES, CALL_ACTIONS };