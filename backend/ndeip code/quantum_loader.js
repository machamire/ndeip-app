/**
 * QuantumLoader Component - Revolutionary Loading Animations
 * Replace all loading states with mesh-particle animations
 * Creates engaging, branded loading experiences
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Dimensions, Easing } from 'react-native';
import Svg, {
  Circle,
  Path,
  G,
  Defs,
  LinearGradient,
  Stop,
  AnimatedCircle,
  AnimatedPath,
} from 'react-native-svg';
import { MeshColors, MeshAnimations, getDynamicColor } from '../constants/ndeipBrandSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const QuantumLoader = ({
  type = 'dots', // 'dots', 'particles', 'wave', 'pulse', 'connection', 'send'
  size = 'medium', // 'small', 'medium', 'large', 'fullscreen'
  color = MeshColors.electricBlue,
  duration = 1500,
  style = {},
  visible = true,
}) => {
  // Animation references
  const animValue1 = useRef(new Animated.Value(0)).current;
  const animValue2 = useRef(new Animated.Value(0)).current;
  const animValue3 = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Particle system state
  const [particles, setParticles] = useState([]);
  
  // Size configurations
  const sizeConfig = {
    small: { width: 40, height: 40, dotSize: 4 },
    medium: { width: 60, height: 60, dotSize: 6 },
    large: { width: 80, height: 80, dotSize: 8 },
    fullscreen: { width: screenWidth, height: screenHeight, dotSize: 10 },
  };
  
  const { width, height, dotSize } = sizeConfig[size];

  // Start animations
  useEffect(() => {
    if (!visible) return;
    
    const startAnimations = () => {
      switch (type) {
        case 'dots':
          startDotsAnimation();
          break;
        case 'particles':
          startParticlesAnimation();
          break;
        case 'wave':
          startWaveAnimation();
          break;
        case 'pulse':
          startPulseAnimation();
          break;
        case 'connection':
          startConnectionAnimation();
          break;
        case 'send':
          startSendAnimation();
          break;
        default:
          startDotsAnimation();
      }
    };
    
    startAnimations();
    
    return () => {
      animValue1.stopAnimation();
      animValue2.stopAnimation();
      animValue3.stopAnimation();
      rotateAnim.stopAnimation();
    };
  }, [visible, type]);

  // Quantum dots animation (typing indicator style)
  const startDotsAnimation = () => {
    const sequence = Animated.stagger(duration / 6, [
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue1, {
            toValue: 1,
            duration: duration / 3,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(animValue1, {
            toValue: 0,
            duration: duration / 3,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue2, {
            toValue: 1,
            duration: duration / 3,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(animValue2, {
            toValue: 0,
            duration: duration / 3,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue3, {
            toValue: 1,
            duration: duration / 3,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(animValue3, {
            toValue: 0,
            duration: duration / 3,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ),
    ]);
    
    sequence.start();
  };

  // Mesh particles animation
  const startParticlesAnimation = () => {
    // Generate particles
    const newParticles = [];
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        angle: (i / particleCount) * 2 * Math.PI,
        radius: width / 4,
        animValue: new Animated.Value(0),
      });
    }
    
    setParticles(newParticles);
    
    // Animate particles
    const particleAnimations = newParticles.map((particle, index) => 
      Animated.loop(
        Animated.timing(particle.animValue, {
          toValue: 1,
          duration: duration,
          delay: (index / particleCount) * duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        })
      )
    );
    
    Animated.parallel(particleAnimations).start();
  };

  // Wave propagation animation
  const startWaveAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue1, {
          toValue: 1,
          duration: duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(animValue1, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    Animated.loop(
      Animated.sequence([
        Animated.delay(duration / 3),
        Animated.timing(animValue2, {
          toValue: 1,
          duration: duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(animValue2, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    Animated.loop(
      Animated.sequence([
        Animated.delay((duration / 3) * 2),
        Animated.timing(animValue3, {
          toValue: 1,
          duration: duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(animValue3, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Pulse animation for notifications
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue1, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(animValue1, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Connection building animation for calls
  const startConnectionAnimation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: duration * 2,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue1, {
          toValue: 1,
          duration: duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(animValue1, {
          toValue: 0,
          duration: duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Message send animation
  const startSendAnimation = () => {
    Animated.sequence([
      Animated.timing(animValue1, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
      Animated.timing(animValue2, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Render different loader types
  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return renderDotsLoader();
      case 'particles':
        return renderParticlesLoader();
      case 'wave':
        return renderWaveLoader();
      case 'pulse':
        return renderPulseLoader();
      case 'connection':
        return renderConnectionLoader();
      case 'send':
        return renderSendLoader();
      default:
        return renderDotsLoader();
    }
  };

  const renderDotsLoader = () => {
    const dot1Scale = animValue1.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1.5],
    });
    
    const dot2Scale = animValue2.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1.5],
    });
    
    const dot3Scale = animValue3.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1.5],
    });
    
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Animated.View
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
            marginHorizontal: dotSize / 4,
            transform: [{ scale: dot1Scale }],
          }}
        />
        <Animated.View
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
            marginHorizontal: dotSize / 4,
            transform: [{ scale: dot2Scale }],
          }}
        />
        <Animated.View
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
            marginHorizontal: dotSize / 4,
            transform: [{ scale: dot3Scale }],
          }}
        />
      </View>
    );
  };

  const renderParticlesLoader = () => {
    return (
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="particleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={getDynamicColor(color, 0.3)} stopOpacity="0.3" />
          </LinearGradient>
        </Defs>
        
        {particles.map((particle, index) => {
          const animatedRadius = particle.animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, particle.radius],
          });
          
          const x = width / 2 + Math.cos(particle.angle) * animatedRadius._value;
          const y = height / 2 + Math.sin(particle.angle) * animatedRadius._value;
          
          return (
            <AnimatedCircle
              key={particle.id}
              cx={x}
              cy={y}
              r={dotSize / 2}
              fill="url(#particleGradient)"
              opacity={particle.animValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 1, 0],
              })}
            />
          );
        })}
      </Svg>
    );
  };

  const renderWaveLoader = () => {
    const wave1Radius = animValue1.interpolate({
      inputRange: [0, 1],
      outputRange: [0, width / 2],
    });
    
    const wave2Radius = animValue2.interpolate({
      inputRange: [0, 1],
      outputRange: [0, width / 2],
    });
    
    const wave3Radius = animValue3.interpolate({
      inputRange: [0, 1],
      outputRange: [0, width / 2],
    });
    
    const wave1Opacity = animValue1.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 0],
    });
    
    const wave2Opacity = animValue2.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 0],
    });
    
    const wave3Opacity = animValue3.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 0],
    });
    
    return (
      <Svg width={width} height={height}>
        <AnimatedCircle
          cx={width / 2}
          cy={height / 2}
          r={wave1Radius}
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity={wave1Opacity}
        />
        <AnimatedCircle
          cx={width / 2}
          cy={height / 2}
          r={wave2Radius}
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity={wave2Opacity}
        />
        <AnimatedCircle
          cx={width / 2}
          cy={height / 2}
          r={wave3Radius}
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity={wave3Opacity}
        />
      </Svg>
    );
  };

  const renderPulseLoader = () => {
    const pulseScale = animValue1.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1.2],
    });
    
    const pulseOpacity = animValue1.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.3],
    });
    
    return (
      <Animated.View
        style={{
          width: width / 2,
          height: width / 2,
          borderRadius: width / 4,
          backgroundColor: color,
          transform: [{ scale: pulseScale }],
          opacity: pulseOpacity,
        }}
      />
    );
  };

  const renderConnectionLoader = () => {
    const rotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
    
    const connectionProgress = animValue1.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    
    return (
      <Animated.View style={{ transform: [{ rotate: rotation }] }}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={color} stopOpacity="1" />
              <Stop offset="50%" stopColor={MeshColors.primaryTeal} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={color} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          
          {/* Mesh connection lines */}
          <Path
            d={`M ${width * 0.2} ${height * 0.2} Q ${width * 0.5} ${height * 0.1} ${width * 0.8} ${height * 0.2}`}
            stroke="url(#connectionGradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray={`${connectionProgress._value * 100} ${100 - connectionProgress._value * 100}`}
          />
          <Path
            d={`M ${width * 0.2} ${height * 0.8} Q ${width * 0.5} ${height * 0.9} ${width * 0.8} ${height * 0.8}`}
            stroke="url(#connectionGradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray={`${connectionProgress._value * 100} ${100 - connectionProgress._value * 100}`}
          />
          
          {/* Connection nodes */}
          <Circle cx={width * 0.2} cy={height * 0.5} r={dotSize} fill={color} />
          <Circle cx={width * 0.8} cy={height * 0.5} r={dotSize} fill={color} />
        </Svg>
      </Animated.View>
    );
  };

  const renderSendLoader = () => {
    const messageScale = animValue1.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.8],
    });
    
    const particleScale = animValue2.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1.5],
    });
    
    const particleOpacity = animValue2.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    });
    
    return (
      <View style={{ alignItems: 'center' }}>
        <Animated.View
          style={{
            width: width * 0.6,
            height: height * 0.3,
            backgroundColor: color,
            borderRadius: dotSize,
            transform: [{ scale: messageScale }],
            marginBottom: dotSize,
          }}
        />
        
        {/* Particle trail */}
        {[...Array(5)].map((_, index) => (
          <Animated.View
            key={index}
            style={{
              position: 'absolute',
              width: dotSize,
              height: dotSize,
              backgroundColor: color,
              borderRadius: dotSize / 2,
              right: -dotSize * (index + 1),
              top: height * 0.15,
              transform: [{ scale: particleScale }],
              opacity: particleOpacity,
            }}
          />
        ))}
      </View>
    );
  };

  if (!visible) return null;

  return (
    <View
      style={[
        {
          width,
          height,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      {renderLoader()}
    </View>
  );
};

// Preset configurations for common use cases
export const LoaderPresets = {
  typing: {
    type: 'dots',
    size: 'small',
    color: MeshColors.primaryTeal,
    duration: 1200,
  },
  
  sending: {
    type: 'send',
    size: 'medium',
    color: MeshColors.electricBlue,
    duration: 800,
  },
  
  calling: {
    type: 'connection',
    size: 'large',
    color: MeshColors.electricBlue,
    duration: 2000,
  },
  
  loading: {
    type: 'particles',
    size: 'medium',
    color: MeshColors.electricBlue,
    duration: 1500,
  },
  
  notification: {
    type: 'pulse',
    size: 'small',
    color: MeshColors.accents.success,
    duration: 1000,
  },
  
  splash: {
    type: 'wave',
    size: 'fullscreen',
    color: MeshColors.electricBlue,
    duration: 2000,
  },
};

// Utility component for quick loaders
export const QuickLoader = ({ preset = 'loading', ...props }) => {
  const config = LoaderPresets[preset] || LoaderPresets.loading;
  
  return <QuantumLoader {...config} {...props} />;
};

export default QuantumLoader;