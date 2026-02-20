/**
 * CallConnecting - Beautiful Call Connection Sequence
 * Mesh building between caller and receiver, audio wave visualization
 * Connection particles flowing along mesh, ringtone sync visual effects
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// expo-av is native-only; lazy-load to avoid web build crash
let Audio = null;
try { Audio = require('expo-av').Audio; } catch (e) { }
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

import { useMeshTheme, useMeshColors, useMeshAnimations } from '../../hooks/useMeshTheme';
import QuantumLoader from '../ndeip/QuantumLoader';
import {
  MeshColors,
  MeshTypography,
  MeshSpacing,
  getDynamicColor,
} from '../../constants/ndeipBrandSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Connection states
const CONNECTION_STATES = {
  INITIALIZING: 'initializing',
  BUILDING_MESH: 'building_mesh',
  CONNECTING: 'connecting',
  SYNCING_AUDIO: 'syncing_audio',
  ESTABLISHING: 'establishing',
  CONNECTED: 'connected',
  FAILED: 'failed',
  TIMEOUT: 'timeout',
};

const CallConnecting = ({
  caller,
  receiver,
  connectionState = CONNECTION_STATES.INITIALIZING,
  onConnectionComplete,
  onConnectionFailed,
  audioEnabled = true,
  visualizeAudio = true,
  showProgress = true,
  style = {},
}) => {
  const { colors } = useMeshColors();
  const { timing } = useMeshAnimations();

  // Animation refs
  const meshAnimation = useRef(new Animated.Value(0)).current;
  const particleAnimation = useRef(new Animated.Value(0)).current;
  const audioWaveAnimation = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(0)).current;
  const connectionLineAnimation = useRef(new Animated.Value(0)).current;

  // State
  const [meshNodes, setMeshNodes] = useState([]);
  const [connectionParticles, setConnectionParticles] = useState([]);
  const [audioWaveData, setAudioWaveData] = useState([]);
  const [progressValue, setProgressValue] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);

  // Connection stages for progress
  const connectionStages = [
    { state: CONNECTION_STATES.INITIALIZING, label: 'Initializing...', duration: 1000 },
    { state: CONNECTION_STATES.BUILDING_MESH, label: 'Building secure connection...', duration: 2000 },
    { state: CONNECTION_STATES.CONNECTING, label: 'Connecting...', duration: 1500 },
    { state: CONNECTION_STATES.SYNCING_AUDIO, label: 'Syncing audio...', duration: 1000 },
    { state: CONNECTION_STATES.ESTABLISHING, label: 'Establishing call...', duration: 800 },
    { state: CONNECTION_STATES.CONNECTED, label: 'Connected!', duration: 500 },
  ];

  // Initialize connection sequence
  useEffect(() => {
    initializeConnectionSequence();
    generateMeshNodes();
    generateConnectionParticles();

    if (visualizeAudio) {
      generateAudioWaveData();
    }
  }, []);

  // Handle connection state changes
  useEffect(() => {
    const stageIndex = connectionStages.findIndex(stage => stage.state === connectionState);
    if (stageIndex !== -1) {
      setCurrentStage(stageIndex);
      animateToStage(stageIndex);
    }
  }, [connectionState]);

  // Initialize connection sequence
  const initializeConnectionSequence = () => {
    startSequentialAnimations();
  };

  // Start sequential animations
  const startSequentialAnimations = () => {
    // Start mesh building animation
    Animated.timing(meshAnimation, {
      toValue: 1,
      duration: timing.mesh * 2,
      useNativeDriver: true,
    }).start();

    // Start particle flow animation
    Animated.loop(
      Animated.timing(particleAnimation, {
        toValue: 1,
        duration: timing.mesh * 3,
        useNativeDriver: true,
      })
    ).start();

    // Start connection line animation
    Animated.timing(connectionLineAnimation, {
      toValue: 1,
      duration: timing.mesh * 2,
      useNativeDriver: true,
    }).start();

    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: timing.normal,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0,
          duration: timing.normal,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start audio wave animation if enabled
    if (visualizeAudio) {
      Animated.loop(
        Animated.timing(audioWaveAnimation, {
          toValue: 1,
          duration: timing.fast,
          useNativeDriver: true,
        })
      ).start();
    }
  };

  // Animate to specific stage
  const animateToStage = (stageIndex) => {
    const progress = (stageIndex + 1) / connectionStages.length;

    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: timing.normal,
      useNativeDriver: false,
    }).start();

    setProgressValue(progress);

    // Handle completion
    if (stageIndex === connectionStages.length - 1) {
      setTimeout(() => {
        if (onConnectionComplete) {
          onConnectionComplete();
        }
      }, 1000);
    }
  };

  // Generate mesh nodes for connection visualization
  const generateMeshNodes = () => {
    const nodes = [];
    const nodeCount = 12;
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    const radius = Math.min(screenWidth, screenHeight) * 0.25;

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * 2 * Math.PI;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      nodes.push({
        id: i,
        x,
        y,
        angle,
        radius: 3 + Math.random() * 2,
        delay: i * 100,
        connections: [],
      });
    }

    // Create connections between nodes
    nodes.forEach((node, index) => {
      const nextIndex = (index + 1) % nodes.length;
      const oppositeIndex = (index + Math.floor(nodeCount / 2)) % nodes.length;

      node.connections = [
        nodes[nextIndex],
        nodes[oppositeIndex],
      ];
    });

    setMeshNodes(nodes);
  };

  // Generate connection particles
  const generateConnectionParticles = () => {
    const particles = [];
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        id: i,
        startX: screenWidth * 0.2,
        startY: screenHeight / 2,
        endX: screenWidth * 0.8,
        endY: screenHeight / 2,
        size: 2 + Math.random() * 3,
        delay: i * 200,
        speed: 0.5 + Math.random() * 0.5,
      });
    }

    setConnectionParticles(particles);
  };

  // Generate audio wave data
  const generateAudioWaveData = () => {
    const waveData = [];
    const waveCount = 20;

    for (let i = 0; i < waveCount; i++) {
      waveData.push({
        id: i,
        height: 10 + Math.random() * 40,
        delay: i * 50,
        frequency: 0.5 + Math.random() * 0.5,
      });
    }

    setAudioWaveData(waveData);
  };

  // Render mesh network
  const renderMeshNetwork = () => (
    <Svg
      width={screenWidth}
      height={screenHeight}
      style={StyleSheet.absoluteFillObject}
    >
      <Defs>
        <SvgGradient id="meshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.8" />
          <Stop offset="50%" stopColor={colors.secondary} stopOpacity="1" />
          <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.6" />
        </SvgGradient>

        <SvgGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.3" />
          <Stop offset="50%" stopColor={colors.secondary} stopOpacity="0.8" />
          <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.3" />
        </SvgGradient>
      </Defs>

      {/* Mesh connections */}
      {meshNodes.map((node, index) => (
        <G key={`node-${node.id}`}>
          {node.connections.map((connection, connIndex) => (
            <AnimatedPath
              key={`connection-${node.id}-${connIndex}`}
              d={`M ${node.x} ${node.y} Q ${(node.x + connection.x) / 2 + Math.sin(meshAnimation._value * Math.PI) * 20
                } ${(node.y + connection.y) / 2 + Math.cos(meshAnimation._value * Math.PI) * 20
                } ${connection.x} ${connection.y}`}
              stroke="url(#meshGradient)"
              strokeWidth="2"
              fill="none"
              opacity={meshAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.6],
              })}
              strokeDasharray={meshAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [`0 100`, `50 50`],
              })}
            />
          ))}

          {/* Mesh nodes */}
          <AnimatedCircle
            cx={node.x}
            cy={node.y}
            r={node.radius * pulseAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.5],
            })}
            fill="url(#meshGradient)"
            opacity={meshAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.8],
            })}
          />
        </G>
      ))}
    </Svg>
  );

  // Render connection particles
  const renderConnectionParticles = () => (
    <Svg
      width={screenWidth}
      height={screenHeight}
      style={StyleSheet.absoluteFillObject}
    >
      {connectionParticles.map((particle, index) => {
        const progress = particleAnimation._value || 0;
        const adjustedProgress = (progress + particle.delay / 1000) % 1;

        const x = particle.startX + (particle.endX - particle.startX) * adjustedProgress * particle.speed;
        const y = particle.startY + Math.sin(adjustedProgress * Math.PI * 2) * 30;

        const opacity = Math.sin(adjustedProgress * Math.PI) * 0.8;

        return (
          <AnimatedCircle
            key={particle.id}
            cx={x}
            cy={y}
            r={particle.size}
            fill={colors.secondary}
            opacity={opacity}
          />
        );
      })}
    </Svg>
  );

  // Render audio waves
  const renderAudioWaves = () => {
    if (!visualizeAudio) return null;

    return (
      <Svg
        width={screenWidth}
        height={100}
        style={[styles.audioWaves]}
      >
        <Defs>
          <SvgGradient id="audioGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={colors.secondary} stopOpacity="0.8" />
            <Stop offset="50%" stopColor={colors.secondary} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.secondary} stopOpacity="0.4" />
          </SvgGradient>
        </Defs>

        {audioWaveData.map((wave, index) => {
          const animatedHeight = audioWaveAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [wave.height * 0.3, wave.height],
          });

          const x = (index / audioWaveData.length) * screenWidth;
          const y = 50;

          return (
            <AnimatedPath
              key={wave.id}
              d={`M ${x} ${y} L ${x} ${y - animatedHeight._value / 2} L ${x} ${y + animatedHeight._value / 2}`}
              stroke="url(#audioGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              opacity={audioWaveAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 1],
              })}
            />
          );
        })}
      </Svg>
    );
  };

  // Render connection line between users
  const renderConnectionLine = () => (
    <Svg
      width={screenWidth}
      height={screenHeight}
      style={StyleSheet.absoluteFillObject}
    >
      <Defs>
        <SvgGradient id="connectionLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
          <Stop offset="50%" stopColor={colors.secondary} stopOpacity="1" />
          <Stop offset="100%" stopColor={colors.primary} stopOpacity="1" />
        </SvgGradient>
      </Defs>

      <AnimatedPath
        d={`M ${screenWidth * 0.2} ${screenHeight / 2} Q ${screenWidth / 2} ${screenHeight / 2 - 50
          } ${screenWidth * 0.8} ${screenHeight / 2}`}
        stroke="url(#connectionLineGradient)"
        strokeWidth="4"
        fill="none"
        strokeDasharray={connectionLineAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [`0 ${screenWidth}`, `${screenWidth} 0`],
        })}
        opacity={connectionLineAnimation}
      />
    </Svg>
  );

  // Render user avatars
  const renderUserAvatars = () => (
    <View style={styles.usersContainer}>
      {/* Caller */}
      <UserAvatar
        user={caller}
        position="left"
        isActive={connectionState !== CONNECTION_STATES.INITIALIZING}
        colors={colors}
        pulseAnimation={pulseAnimation}
      />

      {/* Receiver */}
      <UserAvatar
        user={receiver}
        position="right"
        isActive={connectionState === CONNECTION_STATES.CONNECTED}
        colors={colors}
        pulseAnimation={pulseAnimation}
      />
    </View>
  );

  // Render progress indicator
  const renderProgressIndicator = () => {
    if (!showProgress) return null;

    const currentStageData = connectionStages[currentStage];

    return (
      <View style={styles.progressContainer}>
        <Text style={[styles.progressLabel, { color: colors.crystallineWhite }]}>
          {currentStageData?.label || 'Connecting...'}
        </Text>

        <View style={[styles.progressBar, { backgroundColor: getDynamicColor(colors.crystallineWhite, 0.2) }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.secondary,
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        <Text style={[styles.progressPercent, { color: colors.crystallineWhite }]}>
          {Math.round(progressValue * 100)}%
        </Text>
      </View>
    );
  };

  // Render status indicator
  const renderStatusIndicator = () => (
    <View style={styles.statusContainer}>
      <QuantumLoader
        type="connection"
        size="medium"
        color={colors.secondary}
      />
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Background gradient */}
      <LinearGradient
        colors={[
          getDynamicColor(colors.primaryTeal, 0.8),
          getDynamicColor(colors.electricBlue, 0.6),
          getDynamicColor(colors.primaryTeal, 0.9),
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Mesh network visualization */}
      {renderMeshNetwork()}

      {/* Connection line */}
      {renderConnectionLine()}

      {/* Connection particles */}
      {renderConnectionParticles()}

      {/* User avatars */}
      {renderUserAvatars()}

      {/* Audio waves */}
      {renderAudioWaves()}

      {/* Progress indicator */}
      {renderProgressIndicator()}

      {/* Status indicator */}
      {renderStatusIndicator()}
    </View>
  );
};

// User avatar component
const UserAvatar = ({ user, position, isActive, colors, pulseAnimation }) => {
  const avatarScale = pulseAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, isActive ? 1.1 : 1.05],
  });

  const glowOpacity = pulseAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, isActive ? 0.8 : 0.5],
  });

  const containerStyle = [
    styles.userAvatar,
    position === 'left' ? styles.userAvatarLeft : styles.userAvatarRight,
  ];

  return (
    <View style={containerStyle}>
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.avatarGlow,
          {
            backgroundColor: colors.secondary,
            opacity: glowOpacity,
          },
        ]}
      />

      {/* Avatar */}
      <Animated.View
        style={[
          styles.avatar,
          {
            backgroundColor: colors.primary,
            transform: [{ scale: avatarScale }],
          },
        ]}
      >
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
        ) : (
          <Text style={[styles.avatarText, { color: colors.crystallineWhite }]}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        )}
      </Animated.View>

      {/* User name */}
      <Text style={[styles.userName, { color: colors.crystallineWhite }]}>
        {user?.name || 'Unknown'}
      </Text>

      {/* Status indicator */}
      <View style={[styles.statusDot, { backgroundColor: isActive ? colors.accents.success : colors.accents.warning }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  usersContainer: {
    position: 'absolute',
    top: '25%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: MeshSpacing.xl * 2,
    zIndex: 10,
  },

  userAvatar: {
    alignItems: 'center',
    position: 'relative',
  },

  userAvatarLeft: {
    alignItems: 'flex-start',
  },

  userAvatarRight: {
    alignItems: 'flex-end',
  },

  avatarGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -10,
    left: -10,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 2,
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  avatarText: {
    fontSize: MeshTypography.sizes.h1,
    fontWeight: MeshTypography.weights.bold,
  },

  userName: {
    fontSize: MeshTypography.sizes.h4,
    fontWeight: MeshTypography.weights.medium,
    marginTop: MeshSpacing.md,
    textAlign: 'center',
  },

  statusDot: {
    position: 'absolute',
    bottom: 20,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },

  audioWaves: {
    position: 'absolute',
    bottom: '35%',
    left: 0,
    right: 0,
  },

  progressContainer: {
    position: 'absolute',
    bottom: '20%',
    left: MeshSpacing.xl,
    right: MeshSpacing.xl,
    alignItems: 'center',
  },

  progressLabel: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.medium,
    marginBottom: MeshSpacing.md,
    textAlign: 'center',
  },

  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: MeshSpacing.sm,
  },

  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  progressPercent: {
    fontSize: MeshTypography.sizes.caption,
    fontWeight: MeshTypography.weights.medium,
  },

  statusContainer: {
    position: 'absolute',
    bottom: '10%',
    alignItems: 'center',
  },
});

// Export specialized connection components
export const VoiceCallConnecting = (props) => (
  <CallConnecting {...props} visualizeAudio={true} />
);

export const VideoCallConnecting = (props) => (
  <CallConnecting {...props} visualizeAudio={false} showProgress={true} />
);

export const GroupCallConnecting = ({ participants, ...props }) => (
  <CallConnecting
    {...props}
    caller={{ name: `${participants?.length || 0} participants` }}
    receiver={{ name: 'Group Call' }}
  />
);

// Hook for managing call connection
export const useCallConnection = (onComplete, onFailed) => {
  const [connectionState, setConnectionState] = useState(CONNECTION_STATES.INITIALIZING);
  const [progress, setProgress] = useState(0);

  const startConnection = useCallback(() => {
    setConnectionState(CONNECTION_STATES.INITIALIZING);
    setProgress(0);

    // Simulate connection sequence
    const stages = [
      CONNECTION_STATES.INITIALIZING,
      CONNECTION_STATES.BUILDING_MESH,
      CONNECTION_STATES.CONNECTING,
      CONNECTION_STATES.SYNCING_AUDIO,
      CONNECTION_STATES.ESTABLISHING,
      CONNECTION_STATES.CONNECTED,
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      currentStage++;
      if (currentStage < stages.length) {
        setConnectionState(stages[currentStage]);
        setProgress(currentStage / (stages.length - 1));
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete]);

  const failConnection = useCallback(() => {
    setConnectionState(CONNECTION_STATES.FAILED);
    if (onFailed) onFailed();
  }, [onFailed]);

  return {
    connectionState,
    progress,
    startConnection,
    failConnection,
  };
};

export default CallConnecting;
export { CONNECTION_STATES };