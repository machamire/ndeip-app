/**
 * MeshTransitions - Revolutionary Screen Transitions using Mesh Morphing
 * Screen dissolve, swipe particles, and reverse mesh animations
 * Creates seamless, branded transitions between app screens
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Animated,
  Dimensions,
  PanGestureHandler,
  Easing,
  StyleSheet,
} from 'react-native';
import Svg, {
  Circle,
  Path,
  G,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Polygon,
} from 'react-native-svg';
import { AnimatedCircle, AnimatedPath } from '../../utils/AnimatedSvg';
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
import {
  MeshColors,
  MeshAnimations,
  getDynamicColor,
  interpolateColor,
} from '../../constants/ndeipBrandSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Main transition component
const MeshTransition = ({
  isVisible,
  children,
  previousScreen,
  transitionType = 'dissolve', // 'dissolve', 'swipe', 'morph', 'quantum'
  direction = 'forward', // 'forward', 'backward'
  duration = 800,
  onTransitionStart,
  onTransitionComplete,
  particleCount = 60,
  meshDensity = 0.8,
}) => {
  // Animation values
  const transitionProgress = useRef(new Animated.Value(0)).current;
  const particleAnimations = useRef([]).current;
  const meshMorphAnim = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(direction === 'forward' ? 0 : 1)).current;

  // State
  const [particles, setParticles] = useState([]);
  const [transitionActive, setTransitionActive] = useState(false);
  const [meshNodes, setMeshNodes] = useState([]);

  // Initialize particles and mesh nodes
  useEffect(() => {
    initializeParticles();
    initializeMeshNodes();
  }, []);

  // Start transition when visibility changes
  useEffect(() => {
    if (isVisible !== undefined) {
      startTransition(isVisible);
    }
  }, [isVisible]);

  const initializeParticles = () => {
    const newParticles = [];

    for (let i = 0; i < particleCount; i++) {
      const startX = Math.random() * screenWidth;
      const startY = Math.random() * screenHeight;
      const endX = Math.random() * screenWidth;
      const endY = Math.random() * screenHeight;

      newParticles.push({
        id: i,
        startX,
        startY,
        endX,
        endY,
        size: 2 + Math.random() * 4,
        color: i % 3 === 0 ? MeshColors.electricBlue : MeshColors.primaryTeal,
        delay: Math.random() * 300,
        animValue: new Animated.Value(0),
        lifespan: 0.5 + Math.random() * 0.5,
      });
    }

    setParticles(newParticles);
  };

  const initializeMeshNodes = () => {
    const nodes = [];
    const nodeCount = Math.floor(meshDensity * 20);

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * 2 * Math.PI;
      const radius = (Math.min(screenWidth, screenHeight) * 0.3) * meshDensity;
      const x = screenWidth / 2 + Math.cos(angle) * radius;
      const y = screenHeight / 2 + Math.sin(angle) * radius;

      nodes.push({
        id: i,
        x,
        y,
        targetX: x + (Math.random() - 0.5) * 200,
        targetY: y + (Math.random() - 0.5) * 200,
        connections: [],
      });
    }

    // Create connections between nearby nodes
    nodes.forEach((node, index) => {
      const connectionsCount = 3;
      for (let i = 1; i <= connectionsCount; i++) {
        const targetIndex = (index + i) % nodes.length;
        node.connections.push(nodes[targetIndex]);
      }
    });

    setMeshNodes(nodes);
  };

  const startTransition = (entering) => {
    setTransitionActive(true);

    if (onTransitionStart) {
      onTransitionStart();
    }

    const targetValue = entering ? 1 : 0;
    const screenTarget = entering ? 1 : 0;

    switch (transitionType) {
      case 'dissolve':
        startDissolveTransition(targetValue, screenTarget);
        break;
      case 'swipe':
        startSwipeTransition(targetValue, screenTarget);
        break;
      case 'morph':
        startMorphTransition(targetValue, screenTarget);
        break;
      case 'quantum':
        startQuantumTransition(targetValue, screenTarget);
        break;
      default:
        startDissolveTransition(targetValue, screenTarget);
    }
  };

  const startDissolveTransition = (targetValue, screenTarget) => {
    // Screen dissolves into mesh particles, then reforms
    const particleAnimations = particles.map((particle) =>
      Animated.timing(particle.animValue, {
        toValue: targetValue,
        duration: duration * particle.lifespan,
        delay: particle.delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    );

    Animated.parallel([
      ...particleAnimations,
      Animated.timing(transitionProgress, {
        toValue: targetValue,
        duration,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(screenOpacity, {
        toValue: screenTarget,
        duration: duration * 0.6,
        delay: targetValue ? duration * 0.4 : 0,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(completeTransition);
  };

  const startSwipeTransition = (targetValue, screenTarget) => {
    // Particles follow swipe gesture
    const swipeDirection = direction === 'forward' ? 1 : -1;

    Animated.parallel([
      Animated.timing(transitionProgress, {
        toValue: targetValue,
        duration,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(screenOpacity, {
        toValue: screenTarget,
        duration: duration * 0.8,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(completeTransition);
  };

  const startMorphTransition = (targetValue, screenTarget) => {
    // Mesh morphs from one shape to another
    Animated.parallel([
      Animated.timing(meshMorphAnim, {
        toValue: targetValue,
        duration,
        easing: Easing.inOut(Easing.back(1.1)),
        useNativeDriver: true,
      }),
      Animated.timing(transitionProgress, {
        toValue: targetValue,
        duration,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(screenOpacity, {
        toValue: screenTarget,
        duration: duration * 0.7,
        delay: targetValue ? duration * 0.3 : 0,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(completeTransition);
  };

  const startQuantumTransition = (targetValue, screenTarget) => {
    // Quantum effect with multiple particle layers
    const quantumLayers = 3;
    const layerAnimations = [];

    for (let layer = 0; layer < quantumLayers; layer++) {
      layerAnimations.push(
        Animated.timing(transitionProgress, {
          toValue: targetValue,
          duration: duration * (1 + layer * 0.2),
          delay: layer * 100,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel([
      ...layerAnimations,
      Animated.timing(screenOpacity, {
        toValue: screenTarget,
        duration: duration * 0.9,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(completeTransition);
  };

  const completeTransition = () => {
    setTransitionActive(false);

    if (onTransitionComplete) {
      onTransitionComplete();
    }
  };

  // Render transition particles
  const renderTransitionParticles = () => {
    if (transitionType !== 'dissolve' && transitionType !== 'quantum') return null;

    return (
      <Svg
        width={screenWidth}
        height={screenHeight}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      >
        <Defs>
          <SvgGradient id="particleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={MeshColors.electricBlue} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={MeshColors.primaryTeal} stopOpacity="0.4" />
          </SvgGradient>
        </Defs>

        {particles.map((particle) => {
          const progress = transitionProgress._value;
          const particleProgress = particle.animValue._value;

          const x = particle.startX + (particle.endX - particle.startX) * particleProgress;
          const y = particle.startY + (particle.endY - particle.startY) * particleProgress;

          const opacity = Math.sin(particleProgress * Math.PI) * progress;
          const size = particle.size * (1 + particleProgress * 0.5);

          return (
            <AnimatedCircle
              key={particle.id}
              cx={x}
              cy={y}
              r={size}
              fill="url(#particleGradient)"
              opacity={opacity}
            />
          );
        })}
      </Svg>
    );
  };

  // Render morphing mesh
  const renderMorphingMesh = () => {
    if (transitionType !== 'morph') return null;

    const morphProgress = meshMorphAnim._value;

    return (
      <Svg
        width={screenWidth}
        height={screenHeight}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      >
        <Defs>
          <SvgGradient id="meshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={MeshColors.electricBlue} stopOpacity="0.6" />
            <Stop offset="50%" stopColor={MeshColors.primaryTeal} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={MeshColors.electricBlue} stopOpacity="0.6" />
          </SvgGradient>
        </Defs>

        {meshNodes.map((node, index) => {
          const currentX = node.x + (node.targetX - node.x) * morphProgress;
          const currentY = node.y + (node.targetY - node.y) * morphProgress;

          return (
            <G key={node.id}>
              {/* Node connections */}
              {node.connections.map((connection, connIndex) => {
                const connX = connection.x + (connection.targetX - connection.x) * morphProgress;
                const connY = connection.y + (connection.targetY - connection.y) * morphProgress;

                return (
                  <AnimatedPath
                    key={`${node.id}-${connIndex}`}
                    d={`M ${currentX} ${currentY} Q ${(currentX + connX) / 2 + Math.sin(morphProgress * Math.PI) * 30
                      } ${(currentY + connY) / 2 + Math.cos(morphProgress * Math.PI) * 30
                      } ${connX} ${connY}`}
                    stroke="url(#meshGradient)"
                    strokeWidth="1.5"
                    fill="none"
                    opacity={transitionProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.7],
                    })}
                  />
                );
              })}

              {/* Node points */}
              <AnimatedCircle
                cx={currentX}
                cy={currentY}
                r={4 + Math.sin(morphProgress * Math.PI * 2) * 2}
                fill={MeshColors.electricBlue}
                opacity={transitionProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.8],
                })}
              />
            </G>
          );
        })}
      </Svg>
    );
  };

  // Render swipe trail
  const renderSwipeTrail = () => {
    if (transitionType !== 'swipe') return null;

    const trailProgress = transitionProgress._value;
    const swipeX = screenWidth * trailProgress * (direction === 'forward' ? 1 : -1);

    return (
      <Svg
        width={screenWidth}
        height={screenHeight}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      >
        <Defs>
          <SvgGradient id="swipeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={MeshColors.electricBlue} stopOpacity="0" />
            <Stop offset="50%" stopColor={MeshColors.electricBlue} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={MeshColors.primaryTeal} stopOpacity="0" />
          </SvgGradient>
        </Defs>

        {/* Swipe trail particles */}
        {[...Array(20)].map((_, index) => {
          const delay = index * 0.05;
          const adjustedProgress = Math.max(0, trailProgress - delay);
          const y = (screenHeight / 20) * index;
          const x = swipeX - (index * 10);

          return (
            <AnimatedCircle
              key={index}
              cx={x}
              cy={y}
              r={3}
              fill="url(#swipeGradient)"
              opacity={adjustedProgress * (1 - delay)}
            />
          );
        })}
      </Svg>
    );
  };

  // Render quantum layers
  const renderQuantumLayers = () => {
    if (transitionType !== 'quantum') return null;

    const quantumProgress = transitionProgress._value;

    return (
      <Svg
        width={screenWidth}
        height={screenHeight}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      >
        <Defs>
          <SvgGradient id="quantumGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={MeshColors.electricBlue} stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#320096" stopOpacity="0.6" />
          </SvgGradient>
          <SvgGradient id="quantumGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={MeshColors.primaryTeal} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={MeshColors.electricBlue} stopOpacity="0.2" />
          </SvgGradient>
        </Defs>

        {/* Multiple quantum layers */}
        {[...Array(3)].map((_, layerIndex) => {
          const layerProgress = quantumProgress + (layerIndex * 0.1);
          const layerScale = 1 + (layerIndex * 0.2);
          const rotation = layerProgress * 360 * (layerIndex + 1);

          return (
            <G key={layerIndex}>
              <AnimatedPolygon
                points={`${screenWidth / 2},${screenHeight / 2 - 100 * layerScale} ${screenWidth / 2 + 87 * layerScale
                  },${screenHeight / 2 + 50 * layerScale} ${screenWidth / 2 - 87 * layerScale
                  },${screenHeight / 2 + 50 * layerScale}`}
                fill={`url(#quantumGradient${(layerIndex % 2) + 1})`}
                opacity={layerProgress * (1 - layerIndex * 0.3)}
                transform={`rotate(${rotation} ${screenWidth / 2} ${screenHeight / 2})`}
              />
            </G>
          );
        })}
      </Svg>
    );
  };

  const containerStyle = {
    opacity: screenOpacity,
    transform: [
      {
        scale: transitionProgress.interpolate({
          inputRange: [0, 1],
          outputRange: direction === 'forward' ? [0.8, 1] : [1, 0.8],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Previous screen (if transitioning) */}
      {transitionActive && previousScreen && (
        <View style={[StyleSheet.absoluteFillObject, styles.previousScreen]}>
          {previousScreen}
        </View>
      )}

      {/* Transition effects */}
      {renderTransitionParticles()}
      {renderMorphingMesh()}
      {renderSwipeTrail()}
      {renderQuantumLayers()}

      {/* Current screen */}
      <Animated.View style={[styles.currentScreen, containerStyle]}>
        {children}
      </Animated.View>
    </View>
  );
};

// Gesture-based swipe transition
export const SwipeTransition = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = screenWidth * 0.3,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const handleGestureStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === 5) { // END state
      const { translationX: finalX, velocityX } = nativeEvent;

      if (Math.abs(finalX) > threshold || Math.abs(velocityX) > 1000) {
        // Trigger transition
        setIsTransitioning(true);

        const direction = finalX > 0 ? 'right' : 'left';
        const callback = direction === 'right' ? onSwipeRight : onSwipeLeft;

        Animated.timing(translateX, {
          toValue: direction === 'right' ? screenWidth : -screenWidth,
          duration: MeshAnimations.timing.normal,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start(() => {
          if (callback) callback();
          setIsTransitioning(false);
          translateX.setValue(0);
        });
      } else {
        // Spring back
        Animated.spring(translateX, {
          toValue: 0,
          ...MeshAnimations.springs.gentle,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={handleGestureEvent}
      onHandlerStateChange={handleGestureStateChange}
      activeOffsetX={[-20, 20]}
    >
      <Animated.View
        style={[
          styles.swipeContainer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};

// Screen stack with mesh transitions
export const MeshScreenStack = ({
  screens = [],
  currentIndex = 0,
  transitionType = 'dissolve',
  onScreenChange,
}) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTransition = (newIndex) => {
    if (isTransitioning || newIndex === activeIndex) return;

    setIsTransitioning(true);
    const direction = newIndex > activeIndex ? 'forward' : 'backward';

    // Start transition
    setTimeout(() => {
      setActiveIndex(newIndex);
      if (onScreenChange) onScreenChange(newIndex);
    }, 400);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 800);
  };

  return (
    <View style={styles.stackContainer}>
      {screens.map((screen, index) => {
        const isActive = index === activeIndex;
        const isPrevious = index === activeIndex - 1 && isTransitioning;

        if (!isActive && !isPrevious) return null;

        return (
          <MeshTransition
            key={screen.key || index}
            isVisible={isActive}
            transitionType={transitionType}
            direction={index > activeIndex ? 'backward' : 'forward'}
            previousScreen={isPrevious ? screen.component : null}
            onTransitionComplete={() => {
              if (isActive && onScreenChange) {
                onScreenChange(index);
              }
            }}
          >
            {screen.component}
          </MeshTransition>
        );
      })}
    </View>
  );
};

// Utility hook for mesh transitions
export const useMeshTransition = (initialVisible = false) => {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const show = () => {
    setIsTransitioning(true);
    setIsVisible(true);
  };

  const hide = () => {
    setIsTransitioning(true);
    setIsVisible(false);
  };

  const toggle = () => {
    if (isVisible) hide();
    else show();
  };

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
  };

  return {
    isVisible,
    isTransitioning,
    show,
    hide,
    toggle,
    handleTransitionComplete,
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },

  previousScreen: {
    zIndex: 1,
  },

  currentScreen: {
    flex: 1,
    zIndex: 2,
  },

  swipeContainer: {
    flex: 1,
  },

  stackContainer: {
    flex: 1,
    position: 'relative',
  },
});

export default MeshTransition;