/**
 * QuantumTyping - Revolutionary Typing Indicator Component
 * Mesh particles with crystalline dots that pulse and flow
 * User avatar with typing animation and sound visualization
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  Dimensions,
  StyleSheet,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Circle,
  Path,
  G,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from 'react-native-svg';
import { AnimatedCircle, AnimatedPath } from '../../utils/AnimatedSvg';

import { useMeshTheme, useMeshColors, useMeshAnimations } from '../../hooks/useMeshTheme';
import { generateUserMesh } from '../../utils/MeshGenerator';
import {
  MeshColors,
  MeshTypography,
  MeshSpacing,
  MeshBorderRadius,
  getDynamicColor,
} from '../../constants/ndeipBrandSystem';

const { width: screenWidth } = Dimensions.get('window');

const QuantumTyping = ({
  users = [], // Array of users currently typing
  variant = 'standard', // 'standard', 'compact', 'detailed', 'minimal'
  showAvatars = true,
  showUserNames = true,
  maxVisibleUsers = 3,
  soundVisualization = false,
  customMessage = null,
  style = {},
  onUserPress,
}) => {
  const { colors } = useMeshColors();
  const { timing } = useMeshAnimations();

  // Animation refs
  const mainAnimation = useRef(new Animated.Value(0)).current;
  const particleAnimations = useRef([]).current;
  const avatarAnimations = useRef(new Map()).current;
  const soundWaves = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(0)).current;

  // State
  const [visibleUsers, setVisibleUsers] = useState([]);
  const [particles, setParticles] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  // Configuration based on variant
  const config = getVariantConfig(variant);

  // Update visible users
  useEffect(() => {
    const newVisibleUsers = users.slice(0, maxVisibleUsers);
    setVisibleUsers(newVisibleUsers);
    setIsVisible(newVisibleUsers.length > 0);
  }, [users, maxVisibleUsers]);

  // Show/hide animation
  useEffect(() => {
    if (isVisible) {
      // Initialize particles
      initializeParticles();

      // Fade in
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: timing.normal,
        useNativeDriver: true,
      }).start();

      // Start main animation
      startMainAnimation();
    } else {
      // Fade out
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: timing.fast,
        useNativeDriver: true,
      }).start();

      // Stop all animations
      stopAllAnimations();
    }
  }, [isVisible]);

  // Initialize particle system
  const initializeParticles = () => {
    const newParticles = [];
    const particleCount = config.particleCount;

    // Clear existing animations
    particleAnimations.current.forEach(anim => anim.stopAnimation());
    particleAnimations.current = [];

    for (let i = 0; i < particleCount; i++) {
      const animValue = new Animated.Value(0);
      particleAnimations.current.push(animValue);

      newParticles.push({
        id: i,
        animValue,
        delay: i * (config.animationDuration / particleCount),
        startX: config.particleArea.x + Math.random() * config.particleArea.width,
        startY: config.particleArea.y + Math.random() * config.particleArea.height,
        endX: config.particleArea.x + Math.random() * config.particleArea.width,
        endY: config.particleArea.y + Math.random() * config.particleArea.height,
        size: 2 + Math.random() * 3,
        color: i % 2 === 0 ? colors.primary : colors.secondary,
      });
    }

    setParticles(newParticles);
  };

  // Start main animation loop
  const startMainAnimation = () => {
    // Particle flow animation
    const particleSequence = particleAnimations.current.map((animValue, index) => {
      const particle = particles[index];
      if (!particle) return Animated.timing(animValue, { toValue: 0, duration: 0, useNativeDriver: true });

      return Animated.loop(
        Animated.sequence([
          Animated.delay(particle.delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: config.animationDuration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    });

    // Main pulsing animation
    const mainSequence = Animated.loop(
      Animated.sequence([
        Animated.timing(mainAnimation, {
          toValue: 1,
          duration: timing.mesh,
          useNativeDriver: true,
        }),
        Animated.timing(mainAnimation, {
          toValue: 0,
          duration: timing.mesh,
          useNativeDriver: true,
        }),
      ])
    );

    // Sound wave animation
    if (soundVisualization) {
      const soundSequence = Animated.loop(
        Animated.sequence([
          Animated.timing(soundWaves, {
            toValue: 1,
            duration: timing.normal,
            useNativeDriver: true,
          }),
          Animated.timing(soundWaves, {
            toValue: 0,
            duration: timing.normal,
            useNativeDriver: true,
          }),
        ])
      );

      Animated.parallel([mainSequence, soundSequence, ...particleSequence]).start();
    } else {
      Animated.parallel([mainSequence, ...particleSequence]).start();
    }

    // Start avatar animations
    startAvatarAnimations();
  };

  // Start avatar animations
  const startAvatarAnimations = () => {
    visibleUsers.forEach((user, index) => {
      if (!avatarAnimations.current.has(user.id)) {
        avatarAnimations.current.set(user.id, new Animated.Value(0));
      }

      const avatarAnim = avatarAnimations.current.get(user.id);

      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(avatarAnim, {
            toValue: 1,
            duration: timing.slow,
            useNativeDriver: true,
          }),
          Animated.timing(avatarAnim, {
            toValue: 0,
            duration: timing.slow,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  };

  // Stop all animations
  const stopAllAnimations = () => {
    mainAnimation.stopAnimation();
    soundWaves.stopAnimation();
    particleAnimations.current.forEach(anim => anim.stopAnimation());
    avatarAnimations.current.forEach(anim => anim.stopAnimation());
  };

  // Render mesh particles
  const renderMeshParticles = () => {
    if (particles.length === 0) return null;

    return (
      <Svg
        width={config.width}
        height={config.height}
        style={StyleSheet.absoluteFillObject}
      >
        <Defs>
          <SvgGradient id="particleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.8" />
            <Stop offset="50%" stopColor={colors.secondary} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.6" />
          </SvgGradient>
        </Defs>

        {/* Particle connections */}
        {particles.slice(0, -1).map((particle, index) => {
          const nextParticle = particles[index + 1];
          if (!nextParticle) return null;

          const progress1 = particle.animValue._value || 0;
          const progress2 = nextParticle.animValue._value || 0;

          const x1 = particle.startX + (particle.endX - particle.startX) * progress1;
          const y1 = particle.startY + (particle.endY - particle.startY) * progress1;
          const x2 = nextParticle.startX + (nextParticle.endX - nextParticle.startX) * progress2;
          const y2 = nextParticle.startY + (nextParticle.endY - nextParticle.startY) * progress2;

          const opacity = Math.min(progress1, progress2) * 0.3;

          return (
            <AnimatedPath
              key={`connection-${index}`}
              d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 - 10} ${x2} ${y2}`}
              stroke="url(#particleGradient)"
              strokeWidth="1"
              fill="none"
              opacity={opacity}
            />
          );
        })}

        {/* Particles */}
        {particles.map((particle) => {
          const progress = particle.animValue._value || 0;
          const x = particle.startX + (particle.endX - particle.startX) * progress;
          const y = particle.startY + (particle.endY - particle.startY) * progress;
          const opacity = Math.sin(progress * Math.PI) * 0.8;
          const scale = 0.5 + progress * 0.5;

          return (
            <AnimatedCircle
              key={particle.id}
              cx={x}
              cy={y}
              r={particle.size * scale}
              fill={particle.color}
              opacity={opacity}
            />
          );
        })}
      </Svg>
    );
  };

  // Render user avatars
  const renderUserAvatars = () => {
    if (!showAvatars || visibleUsers.length === 0) return null;

    return (
      <View style={styles.avatarsContainer}>
        {visibleUsers.map((user, index) => {
          const avatarAnim = avatarAnimations.current.get(user.id);
          if (!avatarAnim) return null;

          const scale = avatarAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.1],
          });

          const glowOpacity = avatarAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.6],
          });

          return (
            <Animated.View
              key={user.id}
              style={[
                styles.avatarContainer,
                {
                  transform: [{ scale }],
                  marginLeft: index > 0 ? -8 : 0,
                  zIndex: visibleUsers.length - index,
                },
              ]}
              onTouchEnd={() => onUserPress?.(user)}
            >
              {/* Avatar glow */}
              <Animated.View
                style={[
                  styles.avatarGlow,
                  {
                    backgroundColor: colors.primary,
                    opacity: glowOpacity,
                  },
                ]}
              />

              {/* Avatar */}
              <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={[styles.avatarText, { color: colors.text }]}>
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                )}
              </View>

              {/* Typing dots */}
              <View style={styles.typingDotsContainer}>
                <TypingDots
                  color={colors.primary}
                  delay={index * 100}
                />
              </View>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  // Render sound visualization
  const renderSoundVisualization = () => {
    if (!soundVisualization) return null;

    const waveCount = 4;
    const waves = Array.from({ length: waveCount }, (_, index) => {
      const delay = index * 150;
      const radius = 20 + index * 8;

      const scale = soundWaves.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1.2],
      });

      const opacity = soundWaves.interpolate({
        inputRange: [0, 1],
        outputRange: [0.1, 0.4 - index * 0.08],
      });

      return (
        <Animated.View
          key={index}
          style={[
            styles.soundWave,
            {
              width: radius,
              height: radius,
              borderRadius: radius / 2,
              borderColor: colors.primary,
              opacity,
              transform: [{ scale }],
            },
          ]}
        />
      );
    });

    return <View style={styles.soundVisualizationContainer}>{waves}</View>;
  };

  // Render typing text
  const renderTypingText = () => {
    if (!showUserNames && !customMessage) return null;

    const message = customMessage || generateTypingMessage(visibleUsers);

    const textOpacity = mainAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 1],
    });

    return (
      <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
        <Text style={[styles.typingText, { color: colors.textSecondary }]}>
          {message}
        </Text>
      </Animated.View>
    );
  };

  if (!isVisible) return null;

  const containerStyle = [
    styles.container,
    config.containerStyle,
    { backgroundColor: config.showBackground ? colors.surface : 'transparent' },
    style,
  ];

  return (
    <Animated.View style={[containerStyle, { opacity: containerOpacity }]}>
      {/* Mesh particles background */}
      {renderMeshParticles()}

      {/* Sound visualization */}
      {renderSoundVisualization()}

      <View style={styles.content}>
        {/* User avatars */}
        {renderUserAvatars()}

        {/* Typing text */}
        {renderTypingText()}
      </View>
    </Animated.View>
  );
};

// Typing dots component
const TypingDots = ({ color, delay = 0 }) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (animValue, dotDelay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay + dotDelay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animations = [
      animateDot(dot1, 0),
      animateDot(dot2, 133),
      animateDot(dot3, 266),
    ];

    Animated.parallel(animations).start();

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [delay]);

  const renderDot = (animValue) => {
    const scale = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 1],
    });

    const opacity = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });

    return (
      <Animated.View
        style={[
          styles.typingDot,
          {
            backgroundColor: color,
            opacity,
            transform: [{ scale }],
          },
        ]}
      />
    );
  };

  return (
    <View style={styles.typingDots}>
      {renderDot(dot1)}
      {renderDot(dot2)}
      {renderDot(dot3)}
    </View>
  );
};

// Configuration for different variants
const getVariantConfig = (variant) => {
  const configs = {
    standard: {
      width: screenWidth * 0.7,
      height: 60,
      particleCount: 12,
      animationDuration: 2000,
      particleArea: {
        x: 0,
        y: 10,
        width: screenWidth * 0.7,
        height: 40,
      },
      containerStyle: {
        paddingHorizontal: MeshSpacing.md,
        paddingVertical: MeshSpacing.sm,
        borderRadius: MeshBorderRadius.components.card,
      },
      showBackground: true,
    },
    compact: {
      width: screenWidth * 0.5,
      height: 40,
      particleCount: 8,
      animationDuration: 1500,
      particleArea: {
        x: 0,
        y: 5,
        width: screenWidth * 0.5,
        height: 30,
      },
      containerStyle: {
        paddingHorizontal: MeshSpacing.sm,
        paddingVertical: MeshSpacing.xs,
        borderRadius: MeshBorderRadius.sm,
      },
      showBackground: true,
    },
    detailed: {
      width: screenWidth * 0.8,
      height: 80,
      particleCount: 16,
      animationDuration: 2500,
      particleArea: {
        x: 0,
        y: 15,
        width: screenWidth * 0.8,
        height: 50,
      },
      containerStyle: {
        paddingHorizontal: MeshSpacing.lg,
        paddingVertical: MeshSpacing.md,
        borderRadius: MeshBorderRadius.lg,
      },
      showBackground: true,
    },
    minimal: {
      width: screenWidth * 0.3,
      height: 30,
      particleCount: 6,
      animationDuration: 1200,
      particleArea: {
        x: 0,
        y: 5,
        width: screenWidth * 0.3,
        height: 20,
      },
      containerStyle: {
        paddingHorizontal: MeshSpacing.sm,
        paddingVertical: MeshSpacing.xs,
      },
      showBackground: false,
    },
  };

  return configs[variant] || configs.standard;
};

// Generate typing message based on users
const generateTypingMessage = (users) => {
  if (users.length === 0) return '';

  if (users.length === 1) {
    return `${users[0].name || 'Someone'} is typing...`;
  } else if (users.length === 2) {
    return `${users[0].name || 'Someone'} and ${users[1].name || 'someone'} are typing...`;
  } else {
    return `${users[0].name || 'Someone'} and ${users.length - 1} others are typing...`;
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'flex-start',
    maxWidth: screenWidth * 0.8,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },

  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: MeshSpacing.sm,
  },

  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
  },

  avatarGlow: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    zIndex: 1,
  },

  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    overflow: 'hidden',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },

  avatarText: {
    fontSize: MeshTypography.sizes.bodySmall,
    fontWeight: MeshTypography.weights.semiBold,
  },

  typingDotsContainer: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
  },

  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },

  textContainer: {
    flex: 1,
  },

  typingText: {
    fontSize: MeshTypography.sizes.bodySmall,
    fontStyle: 'italic',
  },

  soundVisualizationContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  soundWave: {
    position: 'absolute',
    borderWidth: 1,
  },
});

// Export specialized components
export const CompactTyping = (props) => (
  <QuantumTyping {...props} variant="compact" />
);

export const DetailedTyping = (props) => (
  <QuantumTyping {...props} variant="detailed" soundVisualization={true} />
);

export const MinimalTyping = (props) => (
  <QuantumTyping {...props} variant="minimal" showAvatars={false} />
);

export default QuantumTyping;