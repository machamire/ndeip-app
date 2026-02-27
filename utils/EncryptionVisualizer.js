/**
 * EncryptionVisualizer - Make Encryption Visible and Beautiful
 * Lock animations for message encryption, mesh shield security indicators
 * Visual representation of encryption handshake and key exchange
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Svg, {
  Circle,
  Path,
  G,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Rect,
  Polygon,
} from 'react-native-svg';
import { AnimatedCircle, AnimatedPath } from '../utils/AnimatedSvg';
const Pattern = G;

import { useMeshTheme, useMeshColors, useMeshAnimations } from '../hooks/useMeshTheme';
import {
  MeshColors,
  MeshTypography,
  MeshSpacing,
  MeshBorderRadius,
  getDynamicColor,
} from '../constants/ndeipBrandSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Encryption status types
export const ENCRYPTION_STATUS = {
  UNENCRYPTED: 'unencrypted',
  ENCRYPTING: 'encrypting',
  ENCRYPTED: 'encrypted',
  DECRYPTING: 'decrypting',
  KEY_EXCHANGE: 'key_exchange',
  HANDSHAKE: 'handshake',
  VERIFIED: 'verified',
  COMPROMISED: 'compromised',
};

// Security levels
export const SECURITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  QUANTUM: 'quantum',
};

const EncryptionVisualizer = ({
  status = ENCRYPTION_STATUS.UNENCRYPTED,
  securityLevel = SECURITY_LEVELS.HIGH,
  variant = 'indicator', // 'indicator', 'badge', 'fullscreen', 'handshake'
  size = 'medium', // 'small', 'medium', 'large'
  animated = true,
  showDetails = false,
  onPress,
  style = {},
}) => {
  const { colors } = useMeshColors();
  const { timing } = useMeshAnimations();

  // Animation refs
  const lockAnimation = useRef(new Animated.Value(0)).current;
  const shieldAnimation = useRef(new Animated.Value(0)).current;
  const particleAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(0)).current;
  const handshakeAnimation = useRef(new Animated.Value(0)).current;

  // State
  const [particles, setParticles] = useState([]);
  const [keyExchangeProgress, setKeyExchangeProgress] = useState(0);

  // Size configuration
  const sizeConfig = {
    small: { width: 24, height: 24, iconSize: 16 },
    medium: { width: 40, height: 40, iconSize: 24 },
    large: { width: 60, height: 60, iconSize: 36 },
  };

  const config = sizeConfig[size];

  // Initialize animations based on status
  useEffect(() => {
    if (!animated) return;

    switch (status) {
      case ENCRYPTION_STATUS.ENCRYPTING:
        startEncryptionAnimation();
        break;
      case ENCRYPTION_STATUS.ENCRYPTED:
        startEncryptedAnimation();
        break;
      case ENCRYPTION_STATUS.DECRYPTING:
        startDecryptionAnimation();
        break;
      case ENCRYPTION_STATUS.KEY_EXCHANGE:
        startKeyExchangeAnimation();
        break;
      case ENCRYPTION_STATUS.HANDSHAKE:
        startHandshakeAnimation();
        break;
      case ENCRYPTION_STATUS.VERIFIED:
        startVerifiedAnimation();
        break;
      case ENCRYPTION_STATUS.COMPROMISED:
        startCompromisedAnimation();
        break;
      default:
        stopAllAnimations();
    }
  }, [status, animated]);

  // Start encryption animation
  const startEncryptionAnimation = () => {
    generateSecurityParticles();

    Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(lockAnimation, {
            toValue: 1,
            duration: timing.mesh,
            useNativeDriver: true,
          }),
          Animated.timing(lockAnimation, {
            toValue: 0,
            duration: timing.mesh,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.timing(particleAnimation, {
          toValue: 1,
          duration: timing.mesh * 2,
          useNativeDriver: true,
        })
      ),
    ]).start();
  };

  // Start encrypted state animation
  const startEncryptedAnimation = () => {
    Animated.sequence([
      Animated.timing(lockAnimation, {
        toValue: 1,
        duration: timing.normal,
        useNativeDriver: true,
      }),
      Animated.timing(shieldAnimation, {
        toValue: 1,
        duration: timing.normal,
        useNativeDriver: true,
      }),
    ]).start();

    // Gentle pulse for encrypted state
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: timing.mesh * 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0,
          duration: timing.mesh * 2,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Start decryption animation
  const startDecryptionAnimation = () => {
    Animated.parallel([
      Animated.timing(lockAnimation, {
        toValue: 0,
        duration: timing.normal,
        useNativeDriver: true,
      }),
      Animated.timing(shieldAnimation, {
        toValue: 0,
        duration: timing.normal,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Start key exchange animation
  const startKeyExchangeAnimation = () => {
    generateKeyExchangeParticles();

    Animated.loop(
      Animated.timing(particleAnimation, {
        toValue: 1,
        duration: timing.mesh * 3,
        useNativeDriver: true,
      })
    ).start();

    // Simulate key exchange progress
    const progressAnimation = Animated.timing(handshakeAnimation, {
      toValue: 1,
      duration: timing.mesh * 4,
      useNativeDriver: false,
    });

    progressAnimation.start(({ finished }) => {
      if (finished) {
        setKeyExchangeProgress(1);
      }
    });
  };

  // Start handshake animation
  const startHandshakeAnimation = () => {
    generateHandshakeParticles();

    Animated.loop(
      Animated.sequence([
        Animated.timing(handshakeAnimation, {
          toValue: 1,
          duration: timing.normal,
          useNativeDriver: true,
        }),
        Animated.timing(handshakeAnimation, {
          toValue: 0,
          duration: timing.normal,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Start verified animation
  const startVerifiedAnimation = () => {
    Animated.sequence([
      Animated.timing(lockAnimation, {
        toValue: 1,
        duration: timing.fast,
        useNativeDriver: true,
      }),
      Animated.timing(shieldAnimation, {
        toValue: 1,
        duration: timing.fast,
        useNativeDriver: true,
      }),
      // Success pulse
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
    ]).start();
  };

  // Start compromised animation
  const startCompromisedAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: timing.fast,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0,
          duration: timing.fast,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Stop all animations
  const stopAllAnimations = () => {
    lockAnimation.stopAnimation();
    shieldAnimation.stopAnimation();
    particleAnimation.stopAnimation();
    pulseAnimation.stopAnimation();
    handshakeAnimation.stopAnimation();
  };

  // Generate security particles
  const generateSecurityParticles = () => {
    const newParticles = [];
    const particleCount = 12;

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        angle: (i / particleCount) * 2 * Math.PI,
        radius: config.width / 2 + 10,
        size: 2 + Math.random() * 2,
        delay: i * 100,
      });
    }

    setParticles(newParticles);
  };

  // Generate key exchange particles
  const generateKeyExchangeParticles = () => {
    const newParticles = [];
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        startX: i < 4 ? 0 : config.width,
        startY: config.height / 2,
        endX: i < 4 ? config.width : 0,
        endY: config.height / 2,
        size: 3,
        delay: i * 200,
      });
    }

    setParticles(newParticles);
  };

  // Generate handshake particles
  const generateHandshakeParticles = () => {
    const newParticles = [];

    for (let i = 0; i < 6; i++) {
      newParticles.push({
        id: i,
        x: config.width / 2 + (Math.random() - 0.5) * config.width,
        y: config.height / 2 + (Math.random() - 0.5) * config.height,
        size: 2 + Math.random() * 3,
        delay: i * 100,
      });
    }

    setParticles(newParticles);
  };

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case ENCRYPTION_STATUS.ENCRYPTED:
      case ENCRYPTION_STATUS.VERIFIED:
        return colors.accents.success;
      case ENCRYPTION_STATUS.ENCRYPTING:
      case ENCRYPTION_STATUS.DECRYPTING:
      case ENCRYPTION_STATUS.KEY_EXCHANGE:
      case ENCRYPTION_STATUS.HANDSHAKE:
        return colors.primary;
      case ENCRYPTION_STATUS.COMPROMISED:
        return colors.accents.mutedRed;
      default:
        return colors.textSecondary;
    }
  };

  // Get security level color
  const getSecurityLevelColor = () => {
    switch (securityLevel) {
      case SECURITY_LEVELS.LOW:
        return colors.accents.warning;
      case SECURITY_LEVELS.MEDIUM:
        return colors.primary;
      case SECURITY_LEVELS.HIGH:
        return colors.accents.success;
      case SECURITY_LEVELS.QUANTUM:
        return colors.secondary;
      default:
        return colors.textSecondary;
    }
  };

  // Render different variants
  const renderVariant = () => {
    switch (variant) {
      case 'badge':
        return renderBadge();
      case 'fullscreen':
        return renderFullscreen();
      case 'handshake':
        return renderHandshake();
      default:
        return renderIndicator();
    }
  };

  // Render indicator variant
  const renderIndicator = () => {
    const statusColor = getStatusColor();
    const lockScale = lockAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.2],
    });

    const pulseOpacity = pulseAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.8],
    });

    return (
      <TouchableOpacity
        style={[styles.indicator, { width: config.width, height: config.height }, style]}
        onPress={onPress}
        disabled={!onPress}
      >
        {/* Background glow */}
        <Animated.View
          style={[
            styles.indicatorGlow,
            {
              backgroundColor: statusColor,
              opacity: pulseOpacity,
            },
          ]}
        />

        {/* Security particles */}
        {animated && particles.length > 0 && (
          <EncryptionParticles
            particles={particles}
            animationValue={particleAnimation}
            color={statusColor}
            config={config}
          />
        )}

        {/* Main icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: lockScale }],
            },
          ]}
        >
          <EncryptionIcon
            status={status}
            size={config.iconSize}
            color={statusColor}
          />
        </Animated.View>

        {/* Shield overlay */}
        <Animated.View
          style={[
            styles.shieldOverlay,
            {
              opacity: shieldAnimation,
            },
          ]}
        >
          <MeshShield
            size={config.width}
            color={statusColor}
            securityLevel={securityLevel}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // Render badge variant
  const renderBadge = () => {
    const statusColor = getStatusColor();
    const securityColor = getSecurityLevelColor();

    return (
      <TouchableOpacity
        style={[styles.badge, { borderColor: statusColor }, style]}
        onPress={onPress}
        disabled={!onPress}
      >
        <EncryptionIcon
          status={status}
          size={16}
          color={statusColor}
        />

        {showDetails && (
          <>
            <Text style={[styles.badgeText, { color: colors.text }]}>
              {getStatusText(status)}
            </Text>

            <View style={[styles.securityDot, { backgroundColor: securityColor }]} />
          </>
        )}
      </TouchableOpacity>
    );
  };

  // Render fullscreen variant
  const renderFullscreen = () => {
    return (
      <View style={[styles.fullscreen, style]}>
        <EncryptionAnimation
          status={status}
          securityLevel={securityLevel}
          particles={particles}
          animationValues={{
            lock: lockAnimation,
            shield: shieldAnimation,
            particle: particleAnimation,
            pulse: pulseAnimation,
          }}
          colors={colors}
        />

        {showDetails && (
          <EncryptionDetails
            status={status}
            securityLevel={securityLevel}
            colors={colors}
          />
        )}
      </View>
    );
  };

  // Render handshake variant
  const renderHandshake = () => {
    return (
      <View style={[styles.handshake, style]}>
        <HandshakeVisualization
          progress={keyExchangeProgress}
          animationValue={handshakeAnimation}
          particles={particles}
          colors={colors}
        />
      </View>
    );
  };

  return renderVariant();
};

// Encryption particles component
const EncryptionParticles = ({ particles, animationValue, color, config }) => (
  <Svg
    width={config.width + 40}
    height={config.height + 40}
    style={StyleSheet.absoluteFillObject}
  >
    <Defs>
      <SvgGradient id="particleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
        <Stop offset="100%" stopColor={color} stopOpacity="0.3" />
      </SvgGradient>
    </Defs>

    {particles.map((particle, index) => {
      const progress = animationValue._value || 0;
      const x = config.width / 2 + 20 + Math.cos(particle.angle) * particle.radius * progress;
      const y = config.height / 2 + 20 + Math.sin(particle.angle) * particle.radius * progress;
      const opacity = Math.sin(progress * Math.PI) * 0.8;

      return (
        <AnimatedCircle
          key={particle.id}
          cx={x}
          cy={y}
          r={particle.size}
          fill="url(#particleGradient)"
          opacity={opacity}
        />
      );
    })}
  </Svg>
);

// Encryption icon component
const EncryptionIcon = ({ status, size, color }) => {
  const getIconName = () => {
    switch (status) {
      case ENCRYPTION_STATUS.ENCRYPTED:
      case ENCRYPTION_STATUS.VERIFIED:
        return 'lock-closed';
      case ENCRYPTION_STATUS.ENCRYPTING:
      case ENCRYPTION_STATUS.DECRYPTING:
        return 'sync';
      case ENCRYPTION_STATUS.KEY_EXCHANGE:
        return 'key';
      case ENCRYPTION_STATUS.HANDSHAKE:
        return 'people';
      case ENCRYPTION_STATUS.COMPROMISED:
        return 'warning';
      default:
        return 'lock-open';
    }
  };

  return (
    <Ionicons
      name={getIconName()}
      size={size}
      color={color}
    />
  );
};

// Mesh shield component
const MeshShield = ({ size, color, securityLevel }) => (
  <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
    <Defs>
      <SvgGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
        <Stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </SvgGradient>

      <Pattern id="meshPattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <Polygon
          points="0,4 4,0 8,4 4,8"
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          opacity="0.4"
        />
      </Pattern>
    </Defs>

    {/* Shield shape */}
    <Path
      d={`M ${size / 2} 4 L ${size * 0.8} ${size * 0.3} L ${size * 0.8} ${size * 0.7} L ${size / 2} ${size * 0.9} L ${size * 0.2} ${size * 0.7} L ${size * 0.2} ${size * 0.3} Z`}
      fill="url(#shieldGradient)"
      stroke={color}
      strokeWidth="1"
      opacity="0.6"
    />

    {/* Mesh overlay */}
    <Path
      d={`M ${size / 2} 4 L ${size * 0.8} ${size * 0.3} L ${size * 0.8} ${size * 0.7} L ${size / 2} ${size * 0.9} L ${size * 0.2} ${size * 0.7} L ${size * 0.2} ${size * 0.3} Z`}
      fill="url(#meshPattern)"
    />
  </Svg>
);

// Fullscreen encryption animation
const EncryptionAnimation = ({
  status,
  securityLevel,
  particles,
  animationValues,
  colors,
}) => {
  const { lock, shield, particle, pulse } = animationValues;

  const containerScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  return (
    <Animated.View
      style={[
        styles.animationContainer,
        {
          transform: [{ scale: containerScale }],
        },
      ]}
    >
      {/* Background mesh */}
      <Svg
        width={screenWidth}
        height={screenHeight}
        style={StyleSheet.absoluteFillObject}
      >
        <Defs>
          <SvgGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.1" />
            <Stop offset="100%" stopColor={colors.secondary} stopOpacity="0.05" />
          </SvgGradient>
        </Defs>

        <Rect width="100%" height="100%" fill="url(#bgGradient)" />

        {/* Animated mesh grid */}
        {Array.from({ length: 20 }, (_, i) => (
          <AnimatedPath
            key={i}
            d={`M 0 ${i * 40} L ${screenWidth} ${i * 40 + Math.sin(particle._value * Math.PI + i) * 10}`}
            stroke={colors.primary}
            strokeWidth="0.5"
            opacity="0.2"
          />
        ))}
      </Svg>

      {/* Central encryption visualization */}
      <View style={styles.centralIcon}>
        <Animated.View
          style={[
            styles.lockContainer,
            {
              transform: [
                {
                  scale: lock.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.3],
                  }),
                },
                {
                  rotate: lock.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '10deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <EncryptionIcon
            status={status}
            size={80}
            color={colors.primary}
          />
        </Animated.View>

        {/* Security shield */}
        <Animated.View
          style={[
            styles.shieldContainer,
            {
              opacity: shield,
              transform: [
                {
                  scale: shield.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <MeshShield
            size={150}
            color={colors.accents.success}
            securityLevel={securityLevel}
          />
        </Animated.View>
      </View>

      {/* Floating particles */}
      <EncryptionParticles
        particles={particles}
        animationValue={particle}
        color={colors.primary}
        config={{ width: screenWidth, height: screenHeight }}
      />
    </Animated.View>
  );
};

// Encryption details component
const EncryptionDetails = ({ status, securityLevel, colors }) => (
  <View style={styles.detailsContainer}>
    <Text style={[styles.statusTitle, { color: colors.text }]}>
      {getStatusText(status)}
    </Text>

    <Text style={[styles.securityLevel, { color: colors.textSecondary }]}>
      Security Level: {securityLevel.toUpperCase()}
    </Text>

    <View style={styles.securityFeatures}>
      <SecurityFeature
        icon="shield-checkmark"
        label="End-to-End Encryption"
        active={status === ENCRYPTION_STATUS.ENCRYPTED}
        colors={colors}
      />
      <SecurityFeature
        icon="key"
        label="Perfect Forward Secrecy"
        active={securityLevel === SECURITY_LEVELS.HIGH}
        colors={colors}
      />
      <SecurityFeature
        icon="fingerprint"
        label="Identity Verification"
        active={status === ENCRYPTION_STATUS.VERIFIED}
        colors={colors}
      />
    </View>
  </View>
);

// Security feature component
const SecurityFeature = ({ icon, label, active, colors }) => (
  <View style={styles.securityFeature}>
    <Ionicons
      name={icon}
      size={20}
      color={active ? colors.accents.success : colors.textSecondary}
    />
    <Text
      style={[
        styles.featureLabel,
        { color: active ? colors.text : colors.textSecondary },
      ]}
    >
      {label}
    </Text>
  </View>
);

// Handshake visualization component
const HandshakeVisualization = ({ progress, animationValue, particles, colors }) => {
  const handshakeOpacity = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <View style={styles.handshakeContainer}>
      <Svg width={200} height={100}>
        <Defs>
          <SvgGradient id="handshakeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.8" />
            <Stop offset="50%" stopColor={colors.secondary} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.8" />
          </SvgGradient>
        </Defs>

        {/* Connection line */}
        <AnimatedPath
          d="M 20 50 Q 100 30 180 50"
          stroke="url(#handshakeGradient)"
          strokeWidth="3"
          fill="none"
          strokeDasharray={`${progress * 160} ${160 - progress * 160}`}
          opacity={handshakeOpacity}
        />

        {/* User nodes */}
        <Circle cx="20" cy="50" r="8" fill={colors.primary} />
        <Circle cx="180" cy="50" r="8" fill={colors.primary} />

        {/* Key exchange particles */}
        {particles.map((particle, index) => (
          <AnimatedCircle
            key={particle.id}
            cx={particle.startX + (particle.endX - particle.startX) * progress}
            cy={particle.startY}
            r={particle.size}
            fill={colors.secondary}
            opacity={handshakeOpacity}
          />
        ))}
      </Svg>

      <Text style={[styles.handshakeText, { color: colors.text }]}>
        Establishing Secure Connection...
      </Text>

      <Text style={[styles.progressText, { color: colors.textSecondary }]}>
        {Math.round(progress * 100)}% Complete
      </Text>
    </View>
  );
};

// Get status text
const getStatusText = (status) => {
  switch (status) {
    case ENCRYPTION_STATUS.UNENCRYPTED:
      return 'Not Encrypted';
    case ENCRYPTION_STATUS.ENCRYPTING:
      return 'Encrypting...';
    case ENCRYPTION_STATUS.ENCRYPTED:
      return 'Encrypted';
    case ENCRYPTION_STATUS.DECRYPTING:
      return 'Decrypting...';
    case ENCRYPTION_STATUS.KEY_EXCHANGE:
      return 'Exchanging Keys...';
    case ENCRYPTION_STATUS.HANDSHAKE:
      return 'Establishing Handshake...';
    case ENCRYPTION_STATUS.VERIFIED:
      return 'Verified & Secure';
    case ENCRYPTION_STATUS.COMPROMISED:
      return 'Security Compromised';
    default:
      return 'Unknown Status';
  }
};

const styles = StyleSheet.create({
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  indicatorGlow: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 999,
  },

  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  shieldOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MeshSpacing.sm,
    paddingVertical: MeshSpacing.xs,
    borderRadius: MeshBorderRadius.sm,
    borderWidth: 1,
  },

  badgeText: {
    fontSize: MeshTypography.sizes.caption,
    marginLeft: MeshSpacing.xs,
    marginRight: MeshSpacing.xs,
  },

  securityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  fullscreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  centralIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  lockContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },

  shieldContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  detailsContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
    paddingHorizontal: MeshSpacing.xl,
  },

  statusTitle: {
    fontSize: MeshTypography.sizes.h2,
    fontWeight: MeshTypography.weights.semiBold,
    marginBottom: MeshSpacing.sm,
  },

  securityLevel: {
    fontSize: MeshTypography.sizes.body,
    marginBottom: MeshSpacing.lg,
  },

  securityFeatures: {
    alignItems: 'center',
  },

  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: MeshSpacing.xs,
  },

  featureLabel: {
    fontSize: MeshTypography.sizes.bodySmall,
    marginLeft: MeshSpacing.sm,
  },

  handshake: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: MeshSpacing.lg,
  },

  handshakeContainer: {
    alignItems: 'center',
  },

  handshakeText: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.medium,
    marginTop: MeshSpacing.md,
  },

  progressText: {
    fontSize: MeshTypography.sizes.bodySmall,
    marginTop: MeshSpacing.xs,
  },
});

// Export specialized components
export const EncryptionBadge = (props) => (
  <EncryptionVisualizer {...props} variant="badge" />
);

export const EncryptionFullscreen = (props) => (
  <EncryptionVisualizer {...props} variant="fullscreen" />
);

export const HandshakeAnimation = (props) => (
  <EncryptionVisualizer {...props} variant="handshake" />
);

// Hook for managing encryption visualization
export const useEncryptionVisualization = () => {
  const [status, setStatus] = useState(ENCRYPTION_STATUS.UNENCRYPTED);
  const [securityLevel, setSecurityLevel] = useState(SECURITY_LEVELS.HIGH);
  const [isVisible, setIsVisible] = useState(false);

  const showEncryption = (newStatus, level = SECURITY_LEVELS.HIGH) => {
    setStatus(newStatus);
    setSecurityLevel(level);
    setIsVisible(true);
  };

  const hideEncryption = () => {
    setIsVisible(false);
  };

  const updateStatus = (newStatus) => {
    setStatus(newStatus);
  };

  return {
    status,
    securityLevel,
    isVisible,
    showEncryption,
    hideEncryption,
    updateStatus,
  };
};

export default EncryptionVisualizer;