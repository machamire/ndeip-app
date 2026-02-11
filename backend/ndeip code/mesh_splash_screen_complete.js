/**
 * MeshSplashScreen - Cinematic App Launch Experience
 * Revolutionary splash screen with logo assembly animation
 * Creates unforgettable first impression for ndeip app
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
  Text,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Circle,
  Path,
  G,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Polygon,
  AnimatedCircle,
  AnimatedPath,
  AnimatedPolygon,
} from 'react-native-svg';
import CrystallineMesh from '../components/ndeip/CrystallineMesh';
import { MeshColors, MeshTypography, MeshSpacing } from '../constants/ndeipBrandSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MeshSplashScreen = ({ onAnimationComplete }) => {
  // Animation values
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const meshIntensity = useRef(new Animated.Value(0)).current;
  
  // Logo particle states
  const [logoParticles, setLogoParticles] = useState([]);
  const [showLogo, setShowLogo] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('particles'); // 'particles', 'assembly', 'reveal', 'complete'

  // Initialize logo particles
  useEffect(() => {
    initializeLogoParticles();
    startSplashAnimation();
  }, []);

  const initializeLogoParticles = () => {
    const particles = [];
    const particleCount = 60;
    
    // Generate particles that will form the ndeip logo
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        id: i,
        startX: Math.random() * screenWidth,
        startY: Math.random() * screenHeight,
        // Target positions will form the logo shape
        targetX: screenWidth / 2 + (Math.random() - 0.5) * 200,
        targetY: screenHeight / 2 + (Math.random() - 0.5) * 60,
        delay: Math.random() * 1000,
        animValue: new Animated.Value(0),
        size: 2 + Math.random() * 4,
        color: i < 48 ? MeshColors.primaryTeal : MeshColors.electricBlue, // 'p' will be blue
      });
    }
    
    setLogoParticles(particles);
  };

  const startSplashAnimation = () => {
    // Phase 1: Background and mesh appear
    Animated.timing(backgroundAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    Animated.timing(meshIntensity, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    // Phase 2: Particles animate to form logo (delayed start)
    setTimeout(() => {
      setAnimationPhase('assembly');
      startParticleAssembly();
    }, 600);

    // Phase 3: Logo reveals and text appears
    setTimeout(() => {
      setAnimationPhase('reveal');
      startLogoReveal();
    }, 2400);

    // Phase 4: Complete animation and transition
    setTimeout(() => {
      setAnimationPhase('complete');
      completeAnimation();
    }, 4000);
  };

  const startParticleAssembly = () => {
    const particleAnimations = logoParticles.map((particle, index) =>
      Animated.timing(particle.animValue, {
        toValue: 1,
        duration: 1500,
        delay: particle.delay,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: false,
      })
    );

    Animated.parallel(particleAnimations).start(() => {
      setShowLogo(true);
    });
  };

  const startLogoReveal = () => {
    // Hide particles and show actual logo
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 300,
        friction: 20,
        useNativeDriver: true,
      }),
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 1000,
        delay: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const completeAnimation = () => {
    // Final fade out and transition
    Animated.timing(backgroundAnim, {
      toValue: 2,
      duration: 800,
      easing: Easing.in(Easing.quad),
      useNativeDriver: false,
    }).start(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });
  };

  // Render logo particles during assembly phase
  const renderLogoParticles = () => {
    if (animationPhase !== 'assembly' || showLogo) return null;

    return (
      <Svg
        width={screenWidth}
        height={screenHeight}
        style={StyleSheet.absoluteFillObject}
      >
        {logoParticles.map((particle) => {
          const x = particle.animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [particle.startX, particle.targetX],
          });

          const y = particle.animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [particle.startY, particle.targetY],
          });

          return (
            <AnimatedCircle
              key={particle.id}
              cx={x}
              cy={y}
              r={particle.size}
              fill={particle.color}
              opacity={particle.animValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 1, 0.8],
              })}
            />
          );
        })}
      </Svg>
    );
  };

  // Render crystalline logo
  const renderCrystallineLogo = () => {
    if (!showLogo) return null;

    return (
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Svg width={200} height={60} viewBox="0 0 200 60">
          <Defs>
            {/* Gradient for 'ndei' */}
            <SvgGradient id="ndeiBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={MeshColors.primaryTeal} stopOpacity="1" />
              <Stop offset="100%" stopColor={MeshColors.primaryTeal} stopOpacity="0.8" />
            </SvgGradient>
            
            {/* Gradient for 'p' */}
            <SvgGradient id="pGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={MeshColors.electricBlue} stopOpacity="1" />
              <Stop offset="100%" stopColor="#320096" stopOpacity="0.9" />
            </SvgGradient>
            
            {/* Mesh pattern */}
            <pattern id="logoMesh" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <Polygon
                points="0,4 4,0 8,4 4,8"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </pattern>
          </Defs>

          {/* Letter 'n' */}
          <G>
            <Path
              d="M10 45 L10 15 L15 15 L15 35 L25 15 L30 15 L30 45 L25 45 L25 25 L15 45 Z"
              fill="url(#ndeiBgGradient)"
            />
            <Path
              d="M10 45 L10 15 L15 15 L15 35 L25 15 L30 15 L30 45 L25 45 L25 25 L15 45 Z"
              fill="url(#logoMesh)"
            />
          </G>

          {/* Letter 'd' */}
          <G>
            <Path
              d="M35 45 L35 15 L45 15 Q55 15 55 30 Q55 45 45 45 Z M40 20 L40 40 L45 40 Q50 40 50 30 Q50 20 45 20 Z"
              fill="url(#ndeiBgGradient)"
            />
            <Path
              d="M35 45 L35 15 L45 15 Q55 15 55 30 Q55 45 45 45 Z M40 20 L40 40 L45 40 Q50 40 50 30 Q50 20 45 20 Z"
              fill="url(#logoMesh)"
            />
          </G>

          {/* Letter 'e' */}
          <G>
            <Path
              d="M60 45 L60 15 L80 15 L80 20 L65 20 L65 27 L78 27 L78 32 L65 32 L65 40 L80 40 L80 45 Z"
              fill="url(#ndeiBgGradient)"
            />
            <Path
              d="M60 45 L60 15 L80 15 L80 20 L65 20 L65 27 L78 27 L78 32 L65 32 L65 40 L80 40 L80 45 Z"
              fill="url(#logoMesh)"
            />
          </G>

          {/* Letter 'i' */}
          <G>
            <Circle cx="87" cy="12" r="2" fill="url(#ndeiBgGradient)" />
            <Path
              d="M85 45 L85 20 L90 20 L90 45 Z"
              fill="url(#ndeiBgGradient)"
            />
            <Path
              d="M85 45 L85 20 L90 20 L90 45 Z"
              fill="url(#logoMesh)"
            />
          </G>

          {/* Letter 'p' - Electric Blue */}
          <G>
            <Path
              d="M95 55 L95 15 L105 15 Q115 15 115 25 Q115 35 105 35 L100 35 L100 55 Z M100 20 L100 30 L105 30 Q110 30 110 25 Q110 20 105 20 Z"
              fill="url(#pGradient)"
            />
            <Path
              d="M95 55 L95 15 L105 15 Q115 15 115 25 Q115 35 105 35 L100 35 L100 55 Z M100 20 L100 30 L105 30 Q110 30 110 25 Q110 20 105 20 Z"
              fill="url(#logoMesh)"
            />
          </G>
        </Svg>
      </Animated.View>
    );
  };

  // Dynamic background animation
  const backgroundOpacity = backgroundAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 1, 0],
  });

  const backgroundScale = backgroundAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1.2, 1, 0.8],
  });

  const meshAnimIntensity = meshIntensity.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  const textOpacity = textAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const textTranslateY = textAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Animated Background */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            opacity: backgroundOpacity,
            transform: [{ scale: backgroundScale }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            MeshColors.primaryTeal,
            '#001F1F',
            MeshColors.electricBlue,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Crystalline Mesh Background */}
      <CrystallineMesh
        variant="quantum"
        animated={true}
        interactive={false}
        intensity={meshAnimIntensity._value}
        color={MeshColors.crystallineWhite}
        style={{ opacity: 0.3 }}
      />

      {/* Logo Formation Particles */}
      {renderLogoParticles()}

      {/* Main Logo */}
      {renderCrystallineLogo()}

      {/* Tagline */}
      <Animated.View
        style={[
          styles.taglineContainer,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        <Text style={styles.tagline}>
          Where Connection Becomes Presence
        </Text>
      </Animated.View>

      {/* Bottom Branding */}
      <Animated.View
        style={[
          styles.bottomContainer,
          {
            opacity: textOpacity,
          },
        ]}
      >
        <Text style={styles.versionText}>
          v1.0.0
        </Text>
        <Text style={styles.copyrightText}>
          Powered by ndeip Network
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  taglineContainer: {
    position: 'absolute',
    bottom: screenHeight * 0.3,
    alignItems: 'center',
    paddingHorizontal: MeshSpacing.xl,
  },
  tagline: {
    fontSize: MeshTypography.sizes.h4,
    fontFamily: MeshTypography.fonts.primary,
    fontWeight: MeshTypography.weights.medium,
    color: MeshColors.crystallineWhite,
    textAlign: 'center',
    letterSpacing: 1,
    opacity: 0.9,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: MeshSpacing.xl,
    alignItems: 'center',
  },
  versionText: {
    fontSize: MeshTypography.sizes.caption,
    fontFamily: MeshTypography.fonts.mono,
    fontWeight: MeshTypography.weights.regular,
    color: MeshColors.neutrals.mediumGrey,
    marginBottom: MeshSpacing.xs,
  },
  copyrightText: {
    fontSize: MeshTypography.sizes.caption,
    fontFamily: MeshTypography.fonts.primary,
    fontWeight: MeshTypography.weights.light,
    color: MeshColors.neutrals.mediumGrey,
  },
});

// Enhanced splash screen with sound effects (optional)
export const EnhancedSplashScreen = ({ 
  onAnimationComplete,
  enableSound = false,
  customTagline,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(enableSound);

  // Optional sound effects for premium experience
  const playStartupSound = () => {
    if (!soundEnabled) return;
    // Implementation for startup sound
    // Could integrate with Expo AV for sound effects
  };

  useEffect(() => {
    if (soundEnabled) {
      playStartupSound();
    }
  }, [soundEnabled]);

  return (
    <MeshSplashScreen
      onAnimationComplete={onAnimationComplete}
      customTagline={customTagline}
    />
  );
};

// Utility function for preloading splash assets
export const preloadSplashAssets = async () => {
  // Preload any heavy assets here
  return Promise.resolve();
};

export default MeshSplashScreen;