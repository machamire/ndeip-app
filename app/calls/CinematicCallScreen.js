/**
 * CinematicCallScreen - Movie-Quality Call Interface
 * Dynamic mesh background, floating controls with touch response
 * Connection animation building between users, screen sharing with mesh frame
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { PanGestureHandler, PinchGestureHandler } from 'react-native-gesture-handler';

// Import our mesh components
import CrystallineMesh from '../../components/ndeip/CrystallineMesh';
import QuantumLoader from '../../components/ndeip/QuantumLoader';
import EncryptionVisualizer from '../../utils/EncryptionVisualizer';
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

// Call states
const CALL_STATES = {
  CONNECTING: 'connecting',
  RINGING: 'ringing',
  CONNECTED: 'connected',
  ENDED: 'ended',
  FAILED: 'failed',
  BUSY: 'busy',
  DECLINED: 'declined',
};

// Video states
const VIDEO_STATES = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  LOADING: 'loading',
  FAILED: 'failed',
};

const CinematicCallScreen = ({
  route,
  navigation,
  callData,
  participants = [],
  isIncoming = false,
  isVideoCall = false,
  onCallAction,
  onToggleVideo,
  onToggleAudio,
  onToggleSpeaker,
  onToggleScreenShare,
  onEndCall,
}) => {
  const { colors } = useMeshColors();
  const { timing } = useMeshAnimations();

  // State management
  const [callState, setCallState] = useState(
    isIncoming ? CALL_STATES.RINGING : CALL_STATES.CONNECTING
  );
  const [videoState, setVideoState] = useState(
    isVideoCall ? VIDEO_STATES.ENABLED : VIDEO_STATES.DISABLED
  );
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [speakerEnabled, setSpeakerEnabled] = useState(false);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState('excellent');

  // Animation refs
  const backgroundAnimation = useRef(new Animated.Value(0)).current;
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const connectingAnimation = useRef(new Animated.Value(0)).current;
  const participantAnimations = useRef(new Map()).current;
  const callDurationOpacity = useRef(new Animated.Value(0)).current;

  // Video refs
  const localVideoScale = useRef(new Animated.Value(1)).current;
  const localVideoPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Timer ref
  const callTimer = useRef(null);

  // Initialize call screen
  useEffect(() => {
    StatusBar.setHidden(true);
    startBackgroundAnimation();
    
    if (callState === CALL_STATES.CONNECTING) {
      startConnectingAnimation();
    }

    return () => {
      StatusBar.setHidden(false);
      if (callTimer.current) {
        clearInterval(callTimer.current);
      }
    };
  }, []);

  // Handle call state changes
  useEffect(() => {
    switch (callState) {
      case CALL_STATES.CONNECTED:
        startCallTimer();
        showCallDuration();
        break;
      case CALL_STATES.ENDED:
      case CALL_STATES.FAILED:
        endCallAnimation();
        break;
      default:
        break;
    }
  }, [callState]);

  // Start background animation
  const startBackgroundAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundAnimation, {
          toValue: 1,
          duration: timing.mesh * 3,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundAnimation, {
          toValue: 0,
          duration: timing.mesh * 3,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Start connecting animation
  const startConnectingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(connectingAnimation, {
          toValue: 1,
          duration: timing.mesh,
          useNativeDriver: true,
        }),
        Animated.timing(connectingAnimation, {
          toValue: 0,
          duration: timing.mesh,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Start call timer
  const startCallTimer = () => {
    callTimer.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  // Show call duration
  const showCallDuration = () => {
    Animated.timing(callDurationOpacity, {
      toValue: 1,
      duration: timing.normal,
      useNativeDriver: true,
    }).start();
  };

  // End call animation
  const endCallAnimation = () => {
    if (callTimer.current) {
      clearInterval(callTimer.current);
    }

    Animated.parallel([
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: timing.normal,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundAnimation, {
        toValue: 0,
        duration: timing.slow,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.goBack();
    });
  };

  // Handle call actions
  const handleCallAction = (action) => {
    switch (action) {
      case 'answer':
        setCallState(CALL_STATES.CONNECTED);
        break;
      case 'decline':
        setCallState(CALL_STATES.DECLINED);
        onEndCall?.();
        break;
      case 'end':
        setCallState(CALL_STATES.ENDED);
        onEndCall?.();
        break;
      default:
        break;
    }

    if (onCallAction) {
      onCallAction(action);
    }
  };

  // Toggle video
  const handleToggleVideo = () => {
    const newState = videoState === VIDEO_STATES.ENABLED 
      ? VIDEO_STATES.DISABLED 
      : VIDEO_STATES.ENABLED;
    
    setVideoState(newState);
    
    if (onToggleVideo) {
      onToggleVideo(newState === VIDEO_STATES.ENABLED);
    }
  };

  // Toggle audio
  const handleToggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    
    if (onToggleAudio) {
      onToggleAudio(!audioEnabled);
    }
  };

  // Toggle speaker
  const handleToggleSpeaker = () => {
    setSpeakerEnabled(!speakerEnabled);
    
    if (onToggleSpeaker) {
      onToggleSpeaker(!speakerEnabled);
    }
  };

  // Toggle screen share
  const handleToggleScreenShare = () => {
    setScreenShareEnabled(!screenShareEnabled);
    
    if (onToggleScreenShare) {
      onToggleScreenShare(!screenShareEnabled);
    }
  };

  // Toggle controls visibility
  const toggleControls = () => {
    const newValue = showControls ? 0 : 1;
    setShowControls(!showControls);
    
    Animated.timing(controlsOpacity, {
      toValue: newValue,
      duration: timing.normal,
      useNativeDriver: true,
    }).start();
  };

  // Format call duration
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Get call state text
  const getCallStateText = () => {
    switch (callState) {
      case CALL_STATES.CONNECTING:
        return 'Connecting...';
      case CALL_STATES.RINGING:
        return isIncoming ? 'Incoming call' : 'Ringing...';
      case CALL_STATES.CONNECTED:
        return formatDuration(callDuration);
      case CALL_STATES.ENDED:
        return 'Call ended';
      case CALL_STATES.FAILED:
        return 'Call failed';
      case CALL_STATES.BUSY:
        return 'Busy';
      case CALL_STATES.DECLINED:
        return 'Call declined';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* Dynamic mesh background */}
      <CrystallineMesh
        variant="quantum"
        animated={true}
        intensity={0.8}
        color={getDynamicColor(colors.primary, 0.3)}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Background gradient overlay */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            opacity: backgroundAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.7, 0.9],
            }),
          },
        ]}
      >
        <LinearGradient
          colors={[
            getDynamicColor(colors.primaryTeal, 0.8),
            getDynamicColor(colors.electricBlue, 0.6),
            getDynamicColor(colors.primaryTeal, 0.9),
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Video area */}
      <TouchableOpacity
        style={styles.videoArea}
        onPress={toggleControls}
        activeOpacity={1}
      >
        {renderVideoContent()}
      </TouchableOpacity>

      {/* Top status bar */}
      <SafeAreaView style={styles.topContainer}>
        <Animated.View
          style={[
            styles.statusBar,
            { opacity: controlsOpacity },
          ]}
        >
          {renderTopStatus()}
        </Animated.View>
      </SafeAreaView>

      {/* Participant info */}
      <Animated.View
        style={[
          styles.participantInfo,
          { opacity: controlsOpacity },
        ]}
      >
        {renderParticipantInfo()}
      </Animated.View>

      {/* Call controls */}
      <SafeAreaView style={styles.bottomContainer}>
        <Animated.View
          style={[
            styles.controlsContainer,
            { opacity: controlsOpacity },
          ]}
        >
          {renderCallControls()}
        </Animated.View>
      </SafeAreaView>

      {/* Connection animation overlay */}
      {(callState === CALL_STATES.CONNECTING || callState === CALL_STATES.RINGING) && (
        <ConnectionAnimation
          isConnecting={callState === CALL_STATES.CONNECTING}
          participants={participants}
          animationValue={connectingAnimation}
          colors={colors}
        />
      )}

      {/* Screen share overlay */}
      {screenShareEnabled && (
        <ScreenShareOverlay
          colors={colors}
          onClose={() => handleToggleScreenShare()}
        />
      )}
    </View>
  );
};

// Render video content
const renderVideoContent = () => {
  if (videoState === VIDEO_STATES.DISABLED) {
    return (
      <View style={styles.noVideoContainer}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.avatarText, { color: colors.text }]}>
            {callData?.contact?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.videoContainer}>
      {/* Remote video */}
      <View style={styles.remoteVideo}>
        {callState === CALL_STATES.CONNECTED ? (
          <RemoteVideoView participant={callData?.contact} />
        ) : (
          <View style={[styles.videoPlaceholder, { backgroundColor: colors.surface }]}>
            <QuantumLoader
              type="connection"
              size="large"
              color={colors.primary}
            />
          </View>
        )}
      </View>

      {/* Local video (picture-in-picture) */}
      <PanGestureHandler
        onGestureEvent={Animated.event(
          [{ nativeEvent: { translationX: localVideoPosition.x, translationY: localVideoPosition.y } }],
          { useNativeDriver: false }
        )}
      >
        <PinchGestureHandler
          onGestureEvent={Animated.event(
            [{ nativeEvent: { scale: localVideoScale } }],
            { useNativeDriver: false }
          )}
        >
          <Animated.View
            style={[
              styles.localVideo,
              {
                transform: [
                  { translateX: localVideoPosition.x },
                  { translateY: localVideoPosition.y },
                  { scale: localVideoScale },
                ],
              },
            ]}
          >
            <LocalVideoView />
          </Animated.View>
        </PinchGestureHandler>
      </PanGestureHandler>
    </View>
  );
};

// Render top status
const renderTopStatus = () => (
  <View style={styles.statusContent}>
    <TouchableOpacity
      style={styles.backButton}
      onPress={() => navigation.goBack()}
    >
      <Ionicons name="chevron-down" size={24} color={colors.crystallineWhite} />
    </TouchableOpacity>

    <View style={styles.statusInfo}>
      <EncryptionVisualizer
        status="encrypted"
        variant="badge"
        size="small"
        showDetails={false}
      />
      
      <ConnectionQualityIndicator quality={connectionQuality} colors={colors} />
    </View>
  </View>
);

// Render participant info
const renderParticipantInfo = () => (
  <View style={styles.participantContainer}>
    <Text style={[styles.participantName, { color: colors.crystallineWhite }]}>
      {callData?.contact?.name || 'Unknown Contact'}
    </Text>
    
    <Animated.Text
      style={[
        styles.callStatus,
        { 
          color: getDynamicColor(colors.crystallineWhite, 0.8),
          opacity: callDurationOpacity,
        },
      ]}
    >
      {getCallStateText()}
    </Animated.Text>
  </View>
);

// Render call controls
const renderCallControls = () => {
  if (callState === CALL_STATES.RINGING && isIncoming) {
    return (
      <View style={styles.incomingControls}>
        <CallControlButton
          icon="call"
          backgroundColor={colors.accents.success}
          onPress={() => handleCallAction('answer')}
          size="large"
          colors={colors}
        />
        
        <CallControlButton
          icon="call"
          backgroundColor={colors.accents.mutedRed}
          onPress={() => handleCallAction('decline')}
          size="large"
          colors={colors}
          style={{ transform: [{ rotate: '135deg' }] }}
        />
      </View>
    );
  }

  return (
    <View style={styles.callControls}>
      <CallControlButton
        icon={audioEnabled ? "mic" : "mic-off"}
        backgroundColor={audioEnabled ? colors.surface : colors.accents.mutedRed}
        onPress={handleToggleAudio}
        colors={colors}
      />
      
      {isVideoCall && (
        <CallControlButton
          icon={videoState === VIDEO_STATES.ENABLED ? "videocam" : "videocam-off"}
          backgroundColor={videoState === VIDEO_STATES.ENABLED ? colors.surface : colors.accents.warning}
          onPress={handleToggleVideo}
          colors={colors}
        />
      )}
      
      <CallControlButton
        icon="call"
        backgroundColor={colors.accents.mutedRed}
        onPress={() => handleCallAction('end')}
        size="large"
        colors={colors}
        style={{ transform: [{ rotate: '135deg' }] }}
      />
      
      <CallControlButton
        icon={speakerEnabled ? "volume-high" : "volume-medium"}
        backgroundColor={speakerEnabled ? colors.primary : colors.surface}
        onPress={handleToggleSpeaker}
        colors={colors}
      />
      
      <CallControlButton
        icon="desktop"
        backgroundColor={screenShareEnabled ? colors.secondary : colors.surface}
        onPress={handleToggleScreenShare}
        colors={colors}
      />
    </View>
  );
};

// Call control button component
const CallControlButton = ({
  icon,
  backgroundColor,
  onPress,
  size = 'medium',
  colors,
  style = {},
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    onPress();
  };

  const buttonSize = size === 'large' ? 70 : 50;
  const iconSize = size === 'large' ? 32 : 24;

  return (
    <Animated.View
      style={[
        styles.controlButton,
        {
          width: buttonSize,
          height: buttonSize,
          backgroundColor,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={styles.controlButtonInner}
        onPress={handlePress}
      >
        <Ionicons
          name={icon}
          size={iconSize}
          color={colors.crystallineWhite}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Connection quality indicator
const ConnectionQualityIndicator = ({ quality, colors }) => {
  const getQualityColor = () => {
    switch (quality) {
      case 'excellent':
        return colors.accents.success;
      case 'good':
        return colors.primary;
      case 'fair':
        return colors.accents.warning;
      case 'poor':
        return colors.accents.mutedRed;
      default:
        return colors.textSecondary;
    }
  };

  const getBars = () => {
    switch (quality) {
      case 'excellent': return 4;
      case 'good': return 3;
      case 'fair': return 2;
      case 'poor': return 1;
      default: return 0;
    }
  };

  const qualityColor = getQualityColor();
  const activeBars = getBars();

  return (
    <View style={styles.qualityIndicator}>
      {[1, 2, 3, 4].map((bar) => (
        <View
          key={bar}
          style={[
            styles.qualityBar,
            {
              backgroundColor: bar <= activeBars ? qualityColor : getDynamicColor(colors.crystallineWhite, 0.3),
              height: bar * 3 + 6,
            },
          ]}
        />
      ))}
    </View>
  );
};

// Remote video view
const RemoteVideoView = ({ participant }) => (
  <View style={styles.remoteVideoContent}>
    {/* Placeholder for actual video stream */}
    <View style={[styles.videoPlaceholder, { backgroundColor: '#1a1a1a' }]}>
      <Text style={[styles.videoLabel, { color: colors.crystallineWhite }]}>
        {participant?.name || 'Remote Video'}
      </Text>
    </View>
  </View>
);

// Local video view
const LocalVideoView = () => (
  <View style={styles.localVideoContent}>
    {/* Placeholder for local video stream */}
    <View style={[styles.videoPlaceholder, { backgroundColor: '#2a2a2a' }]}>
      <Text style={[styles.videoLabel, { color: colors.crystallineWhite }]}>
        You
      </Text>
    </View>
  </View>
);

// Connection animation component
const ConnectionAnimation = ({ isConnecting, participants, animationValue, colors }) => {
  const connectionOpacity = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const connectionScale = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Animated.View
        style={[
          styles.connectionOverlay,
          {
            opacity: connectionOpacity,
            transform: [{ scale: connectionScale }],
          },
        ]}
      >
        <QuantumLoader
          type="connection"
          size="large"
          color={colors.electricBlue}
        />
        
        <Text style={[styles.connectionText, { color: colors.crystallineWhite }]}>
          {isConnecting ? 'Establishing connection...' : 'Incoming call...'}
        </Text>
      </Animated.View>
    </View>
  );
};

// Screen share overlay
const ScreenShareOverlay = ({ colors, onClose }) => (
  <View style={styles.screenShareContainer}>
    <BlurView intensity={80} style={StyleSheet.absoluteFillObject} />
    
    {/* Mesh frame around shared content */}
    <View style={styles.screenShareFrame}>
      <CrystallineMesh
        variant="medium"
        animated={true}
        intensity={0.4}
        color={colors.electricBlue}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.screenShareContent}>
        <Text style={[styles.screenShareLabel, { color: colors.crystallineWhite }]}>
          Screen Sharing Active
        </Text>
        
        <TouchableOpacity
          style={[styles.stopShareButton, { backgroundColor: colors.accents.mutedRed }]}
          onPress={onClose}
        >
          <Ionicons name="stop" size={24} color={colors.crystallineWhite} />
          <Text style={[styles.stopShareText, { color: colors.crystallineWhite }]}>
            Stop Sharing
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  
  videoArea: {
    flex: 1,
  },
  
  topContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  
  statusBar: {
    paddingHorizontal: MeshSpacing.lg,
    paddingVertical: MeshSpacing.sm,
  },
  
  statusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: getDynamicColor('#000', 0.3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MeshSpacing.sm,
  },
  
  qualityIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  
  qualityBar: {
    width: 3,
    borderRadius: 1.5,
  },
  
  participantInfo: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  
  participantContainer: {
    alignItems: 'center',
    paddingHorizontal: MeshSpacing.xl,
  },
  
  participantName: {
    fontSize: MeshTypography.sizes.h1,
    fontWeight: MeshTypography.weights.semiBold,
    marginBottom: MeshSpacing.sm,
    textAlign: 'center',
  },
  
  callStatus: {
    fontSize: MeshTypography.sizes.h4,
    textAlign: 'center',
  },
  
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  
  controlsContainer: {
    paddingHorizontal: MeshSpacing.xl,
    paddingBottom: MeshSpacing.lg,
  },
  
  callControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: MeshSpacing.lg,
  },
  
  incomingControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: MeshSpacing.xl,
  },
  
  controlButton: {
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    ...MeshShadows.floating.medium,
  },
  
  controlButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  noVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    ...MeshShadows.floating.heavy,
  },
  
  avatarText: {
    fontSize: MeshTypography.sizes.h1 * 2,
    fontWeight: MeshTypography.weights.bold,
  },
  
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  
  remoteVideo: {
    flex: 1,
  },
  
  remoteVideoContent: {
    flex: 1,
  },
  
  localVideo: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: MeshBorderRadius.lg,
    overflow: 'hidden',
    ...MeshShadows.floating.medium,
  },
  
  localVideoContent: {
    flex: 1,
  },
  
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  videoLabel: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.medium,
  },
  
  connectionOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: getDynamicColor('#000', 0.5),
  },
  
  connectionText: {
    fontSize: MeshTypography.sizes.h3,
    fontWeight: MeshTypography.weights.medium,
    marginTop: MeshSpacing.xl,
  },
  
  screenShareContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  
  screenShareFrame: {
    flex: 1,
    margin: MeshSpacing.lg,
    borderRadius: MeshBorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  
  screenShareContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: getDynamicColor('#000', 0.7),
  },
  
  screenShareLabel: {
    fontSize: MeshTypography.sizes.h2,
    fontWeight: MeshTypography.weights.semiBold,
    marginBottom: MeshSpacing.xl,
  },
  
  stopShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MeshSpacing.xl,
    paddingVertical: MeshSpacing.md,
    borderRadius: MeshBorderRadius.lg,
  },
  
  stopShareText: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.medium,
    marginLeft: MeshSpacing.sm,
  },
});

export default CinematicCallScreen;