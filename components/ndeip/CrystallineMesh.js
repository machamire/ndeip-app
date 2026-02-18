
/**
 * CrystallineMesh Component - Revolutionary Animated Mesh Patterns
 * Creates living, breathing mesh patterns that respond to user interactions
 * Core visual element of the ndeip brand identity
 */

import React, { useEffect, useRef, useState, useMemo, useContext } from 'react';
import { View, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import Svg, {
  Defs,
  Rect,
  Polygon,
  Circle,
  Path,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';
import { MeshColors, MeshPatterns, MeshAnimations, getDynamicColor } from '../../constants/ndeipBrandSystem';

// Import Animated versions if needed
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CrystallineMesh = ({
  variant = 'medium', // 'small', 'medium', 'large', 'quantum'
  interactive = true,
  animated = true,
  intensity = 0.5, // 0-1 scale
  color = MeshColors.electricBlue,
  backgroundColor = 'transparent',
  style = {},
  children,
  onInteraction,
  userId = null, // For generating unique patterns
}) => {
  // Animation values
  const breatheAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const interactionAnim = useRef(new Animated.Value(0)).current;

  // State for interactive features
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  // Generate unique mesh pattern for user
  const meshConfig = useMemo(() => {
    if (userId) {
      return MeshPatterns.generateUserMesh(userId);
    }
    return {
      density: intensity,
      complexity: 5,
      primaryNodes: 8,
      animationSpeed: 3000,
      opacity: intensity * 0.2,
    };
  }, [userId, intensity]);

  // Start breathing animation
  useEffect(() => {
    if (animated) {
      const breatheAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1,
            duration: meshConfig.animationSpeed,
            useNativeDriver: false,
          }),
          Animated.timing(breatheAnim, {
            toValue: 0,
            duration: meshConfig.animationSpeed,
            useNativeDriver: false,
          }),
        ])
      );

      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: meshConfig.animationSpeed * 3,
          useNativeDriver: false,
        })
      );

      breatheAnimation.start();
      rotateAnimation.start();

      return () => {
        breatheAnimation.stop();
        rotateAnimation.stop();
      };
    }
  }, [animated, meshConfig.animationSpeed]);

  // Handle touch interactions
  const handleInteractionStart = (event) => {
    if (!interactive) return;

    const { locationX, locationY } = event.nativeEvent;
    setTouchPosition({ x: locationX, y: locationY });
    setIsInteracting(true);

    // Trigger interaction animation
    Animated.sequence([
      Animated.timing(interactionAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();

    if (onInteraction) {
      onInteraction({ x: locationX, y: locationY });
    }
  };

  const handleInteractionEnd = () => {
    setIsInteracting(false);

    Animated.timing(interactionAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: false,
    }).start();
  };

  // Generate mesh nodes based on configuration
  const generateMeshNodes = () => {
    const nodes = [];
    const { complexity, primaryNodes, density } = meshConfig;

    for (let i = 0; i < primaryNodes; i++) {
      const angle = (i / primaryNodes) * 2 * Math.PI;
      const radius = (screenWidth * 0.3) * density;
      const x = screenWidth / 2 + Math.cos(angle) * radius;
      const y = screenHeight / 2 + Math.sin(angle) * radius;

      nodes.push({
        id: i,
        x,
        y,
        radius: 2 + (i % 3),
        connections: complexity,
      });
    }

    return nodes;
  };

  const meshNodes = useMemo(generateMeshNodes, [meshConfig]);

  // Generate mesh connections
  const generateConnections = () => {
    const connections = [];

    meshNodes.forEach((node, index) => {
      const connectionsCount = Math.min(node.connections, meshNodes.length - 1);

      for (let i = 1; i <= connectionsCount; i++) {
        const targetIndex = (index + i) % meshNodes.length;
        const target = meshNodes[targetIndex];

        connections.push({
          from: node,
          to: target,
          opacity: meshConfig.opacity * (1 - (i / connectionsCount) * 0.5),
        });
      }
    });

    return connections;
  };

  const meshConnections = useMemo(generateConnections, [meshNodes]);

  // Animated style calculations
  const breatheScale = breatheAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.05],
  });

  const breatheOpacity = breatheAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [meshConfig.opacity * 0.7, meshConfig.opacity * 1.3],
  });

  const rotateAngle = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const interactionRadius = interactionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  const interactionOpacity = interactionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  // Render different mesh variants
  const renderMeshPattern = () => {
    switch (variant) {
      case 'small':
        return (
          <Svg width={screenWidth} height={screenHeight} style={{ position: 'absolute' }}>
            <G>
              {/* Create a simple grid pattern */}
              {Array.from({ length: Math.ceil(screenWidth / 40) }).map((_, i) =>
                Array.from({ length: Math.ceil(screenHeight / 40) }).map((_, j) => (
                  <G key={`${i}-${j}`}>
                    <Polygon
                      points={`${i * 40},${j * 40 + 20} ${i * 40 + 20},${j * 40} ${i * 40 + 40},${j * 40 + 20} ${i * 40 + 20},${j * 40 + 40}`}
                      fill="none"
                      stroke={color}
                      strokeWidth="0.5"
                      opacity={0.5}
                    />
                    <Circle cx={i * 40 + 20} cy={j * 40 + 20} r="1" fill={color} opacity={0.3} />
                  </G>
                ))
              )}
            </G>
          </Svg>
        );

      case 'large':
        return (
          <Svg width={screenWidth} height={screenHeight} style={{ position: 'absolute' }}>
            <G>
              {/* Create a large grid pattern */}
              {Array.from({ length: Math.ceil(screenWidth / 120) }).map((_, i) =>
                Array.from({ length: Math.ceil(screenHeight / 120) }).map((_, j) => (
                  <G key={`${i}-${j}`}>
                    <Polygon
                      points={`${i * 120},${j * 120 + 60} ${i * 120 + 60},${j * 120} ${i * 120 + 120},${j * 120 + 60} ${i * 120 + 60},${j * 120 + 120}`}
                      fill="none"
                      stroke={color}
                      strokeWidth="1.5"
                      opacity={0.5}
                    />
                    <Circle cx={i * 120 + 60} cy={j * 120 + 60} r="5" fill={color} opacity={0.3} />
                    <Circle cx={i * 120 + 30} cy={j * 120 + 30} r="2" fill={color} opacity={0.4} />
                    <Circle cx={i * 120 + 90} cy={j * 120 + 90} r="2" fill={color} opacity={0.4} />
                  </G>
                ))
              )}
            </G>
          </Svg>
        );

      case 'quantum':
        return (
          <Svg width={screenWidth} height={screenHeight} style={{ position: 'absolute' }}>
            <Defs>
              <LinearGradient id="quantumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={MeshColors.electricBlue} stopOpacity="0.2" />
                <Stop offset="50%" stopColor={MeshColors.primaryTeal} stopOpacity="0.1" />
                <Stop offset="100%" stopColor="#320096" stopOpacity="0.15" />
              </LinearGradient>
            </Defs>

            {/* Dynamic mesh network */}
            <G>
              {meshConnections.map((connection, index) => (
                <Path
                  key={`connection-${index}`}
                  d={`M ${connection.from.x} ${connection.from.y} Q ${(connection.from.x + connection.to.x) / 2
                    } ${(connection.from.y + connection.to.y) / 2
                    } ${connection.to.x} ${connection.to.y}`}
                  stroke={color}
                  strokeWidth="1"
                  fill="none"
                  opacity={connection.opacity}
                />
              ))}

              {meshNodes.map((node, index) => (
                <Circle
                  key={`node-${index}`}
                  cx={node.x}
                  cy={node.y}
                  r={node.radius}
                  fill={color}
                  opacity={0.6}
                />
              ))}
            </G>

            {/* Interaction ripple */}
            {isInteracting && (
              <Circle
                cx={touchPosition.x}
                cy={touchPosition.y}
                r={50}
                fill={color}
                opacity={0.3}
              />
            )}
          </Svg>
        );

      default: // medium
        return (
          <Svg width={screenWidth} height={screenHeight} style={{ position: 'absolute' }}>
            <G>
              {/* Create a medium grid pattern */}
              {Array.from({ length: Math.ceil(screenWidth / 80) }).map((_, i) =>
                Array.from({ length: Math.ceil(screenHeight / 80) }).map((_, j) => (
                  <G key={`${i}-${j}`}>
                    <Polygon
                      points={`${i * 80},${j * 80 + 40} ${i * 80 + 40},${j * 80} ${i * 80 + 80},${j * 80 + 40} ${i * 80 + 40},${j * 80 + 80}`}
                      fill="none"
                      stroke={color}
                      strokeWidth="1"
                      opacity={0.5}
                    />
                    <Polygon
                      points={`${i * 80 + 20},${j * 80 + 20} ${i * 80 + 60},${j * 80 + 20} ${i * 80 + 40},${j * 80 + 60}`}
                      fill={color}
                      opacity={0.2}
                    />
                    <Circle cx={i * 80 + 40} cy={j * 80 + 40} r="3" fill={color} opacity={0.4} />
                  </G>
                ))
              )}
            </G>
          </Svg>
        );
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={handleInteractionStart}
      onPressOut={handleInteractionEnd}
      disabled={!interactive}
    >
      <Animated.View
        style={[
          {
            width: screenWidth,
            height: screenHeight,
            backgroundColor,
            overflow: 'hidden',
          },
          {
            transform: [
              { scale: breatheScale },
              { rotate: rotateAngle },
            ],
          },
          style,
        ]}
      >
        {renderMeshPattern()}

        {/* Content overlay */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
          }}
        >
          {children}
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

// Preset mesh configurations for common use cases
export const MeshPresets = {
  // App splash screen
  splash: {
    variant: 'quantum',
    animated: true,
    interactive: false,
    intensity: 0.8,
    color: MeshColors.electricBlue,
  },

  // Chat background
  chatBackground: {
    variant: 'small',
    animated: true,
    interactive: false,
    intensity: 0.2,
    color: getDynamicColor(MeshColors.primaryTeal, 0.05),
  },

  // Call screen
  callScreen: {
    variant: 'large',
    animated: true,
    interactive: true,
    intensity: 0.6,
    color: MeshColors.electricBlue,
  },

  // Status viewer
  statusViewer: {
    variant: 'medium',
    animated: true,
    interactive: false,
    intensity: 0.4,
    color: getDynamicColor(MeshColors.electricBlue, 0.3),
  },

  // Settings background
  settingsBackground: {
    variant: 'small',
    animated: false,
    interactive: false,
    intensity: 0.1,
    color: getDynamicColor('#6B7280', 0.1),
  },

  // Loading states
  loading: {
    variant: 'quantum',
    animated: true,
    interactive: false,
    intensity: 0.7,
    color: MeshColors.electricBlue,
  },

  // Message typing indicator
  typing: {
    variant: 'small',
    animated: true,
    interactive: false,
    intensity: 0.3,
    color: MeshColors.primaryTeal,
  },
};

// Advanced mesh effects for special interactions
export const MeshEffects = {
  // Ripple effect for button presses
  createRipple: (x, y, color = MeshColors.electricBlue) => ({
    type: 'ripple',
    position: { x, y },
    color,
    duration: 600,
    maxRadius: 120,
  }),

  // Particle burst for message send
  createBurst: (x, y, particleCount = 12) => ({
    type: 'burst',
    position: { x, y },
    particleCount,
    color: MeshColors.electricBlue,
    duration: 800,
  }),

  // Connection line for voice calls
  createConnection: (startPoint, endPoint) => ({
    type: 'connection',
    start: startPoint,
    end: endPoint,
    color: MeshColors.primaryTeal,
    animated: true,
    duration: 2000,
  }),

  // Pulse effect for notifications
  createPulse: (intensity = 1) => ({
    type: 'pulse',
    intensity,
    color: MeshColors.electricBlue,
    duration: 1000,
    repeat: 3,
  }),
};

// Mesh animation hooks for common patterns
export const useMeshAnimation = (type = 'breathe') => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation;

    switch (type) {
      case 'breathe':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: false,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: MeshAnimations.timing.mesh,
              useNativeDriver: false,
            }),
          ])
        );
        break;

      case 'pulse':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: false,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: MeshAnimations.timing.normal,
              useNativeDriver: false,
            }),
          ])
        );
        break;

      case 'quantum':
        animation = Animated.loop(
          Animated.timing(animValue, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: false,
          })
        );
        break;

      default:
        animation = Animated.timing(animValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        });
    }

    animation.start();

    return () => animation.stop();
  }, [type]);

  return animValue;
};

// Context provider for mesh theme
export const MeshContext = React.createContext({
  theme: 'light',
  intensity: 0.5,
  interactive: true,
  userId: null,
});

export const MeshProvider = ({ children, theme = 'light', userId = null }) => {
  const [meshSettings, setMeshSettings] = useState({
    theme,
    intensity: 0.5,
    interactive: true,
    userId,
  });

  const updateMeshSettings = (newSettings) => {
    setMeshSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <MeshContext.Provider value={{ ...meshSettings, updateMeshSettings }}>
      {children}
    </MeshContext.Provider>
  );
};

// Custom hook to use mesh context
export const useMesh = () => {
  const context = useContext(MeshContext);
  if (!context) {
    throw new Error('useMesh must be used within a MeshProvider');
  }
  return context;
};

// Utility component for quick mesh overlays
export const MeshOverlay = ({
  preset = 'chatBackground',
  style = {},
  children,
  ...props
}) => {
  const meshConfig = MeshPresets[preset] || MeshPresets.chatBackground;

  return (
    <CrystallineMesh
      {...meshConfig}
      {...props}
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        },
        style,
      ]}
    >
      {children}
    </CrystallineMesh>
  );
};

// Performance optimized mesh for list items
export const MeshListItem = React.memo(({
  children,
  style = {},
  interactive = false,
  ...props
}) => {
  return (
    <View style={[{ position: 'relative' }, style]}>
      <MeshOverlay
        preset="settingsBackground"
        interactive={interactive}
        style={{ opacity: 0.5 }}
        {...props}
      />
      {children}
    </View>
  );
});

// Mesh transition component for screen changes
export const MeshTransition = ({
  isVisible,
  children,
  duration = 800,
  onComplete,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: duration * 0.6,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 20,
          useNativeDriver: true,
        }),
      ]).start(onComplete);
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: duration * 0.4,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: duration * 0.4,
          useNativeDriver: true,
        }),
      ]).start(onComplete);
    }
  }, [isVisible, duration]);

  if (!isVisible && fadeAnim._value === 0) {
    return null;
  }

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <MeshOverlay preset="splash">
        {children}
      </MeshOverlay>
    </Animated.View>
  );
};

export default CrystallineMesh;
