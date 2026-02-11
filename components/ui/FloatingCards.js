/**
 * FloatingCards - Revolutionary Card System with Depth and Shadow
 * Levitating UI cards that respond to touch with realistic physics
 * Mesh overlays with subtle crystalline patterns on card surfaces
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Animated,
  PanGestureHandler,
  TapGestureHandler,
  Dimensions,
  Platform,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Defs,
  Pattern,
  Rect,
  Polygon,
  Circle,
  LinearGradient as SvgGradient,
  Stop,
} from 'react-native-svg';
import {
  MeshColors,
  MeshShadows,
  MeshBorderRadius,
  MeshAnimations,
  MeshSpacing,
  getDynamicColor,
} from '../../constants/ndeipBrandSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FloatingCard = ({
  children,
  style = {},
  variant = 'medium', // 'small', 'medium', 'large', 'quantum'
  interactive = true,
  physics = true,
  meshOverlay = true,
  shadowLevel = 'medium', // 'light', 'medium', 'heavy'
  onPress,
  onLongPress,
  backgroundColor = MeshColors.crystallineWhite,
  borderRadius = MeshBorderRadius.components.card,
  elevation = true,
  animationType = 'float', // 'float', 'hover', 'press', 'quantum'
  ...props
}) => {
  // Animation values
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const shadowOpacity = useRef(new Animated.Value(MeshShadows.floating[shadowLevel].shadowOpacity)).current;
  const meshOpacity = useRef(new Animated.Value(0.1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // State
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [cardDimensions, setCardDimensions] = useState({ width: 0, height: 0 });

  // Card size configurations
  const sizeConfig = {
    small: {
      minHeight: 80,
      padding: MeshSpacing.md,
      maxWidth: screenWidth * 0.4,
    },
    medium: {
      minHeight: 120,
      padding: MeshSpacing.lg,
      maxWidth: screenWidth * 0.85,
    },
    large: {
      minHeight: 200,
      padding: MeshSpacing.xl,
      maxWidth: screenWidth * 0.95,
    },
    quantum: {
      minHeight: 160,
      padding: MeshSpacing.xl,
      maxWidth: screenWidth * 0.9,
    },
  };

  const config = sizeConfig[variant];

  // Floating animation
  useEffect(() => {
    if (animationType === 'float') {
      const floatingAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: MeshAnimations.timing.mesh * 2,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: MeshAnimations.timing.mesh * 2,
            useNativeDriver: true,
          }),
        ])
      );
      floatingAnimation.start();
      
      return () => floatingAnimation.stop();
    }
  }, [animationType]);

  // Handle touch interactions
  const handlePressIn = () => {
    setIsPressed(true);
    
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.95,
        ...MeshAnimations.springs.gentle,
        useNativeDriver: true,
      }),
      Animated.timing(shadowOpacity, {
        toValue: MeshShadows.pressed.shadowOpacity,
        duration: MeshAnimations.timing.fast,
        useNativeDriver: true,
      }),
      Animated.timing(meshOpacity, {
        toValue: 0.2,
        duration: MeshAnimations.timing.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        ...MeshAnimations.springs.gentle,
        useNativeDriver: true,
      }),
      Animated.timing(shadowOpacity, {
        toValue: MeshShadows.floating[shadowLevel].shadowOpacity,
        duration: MeshAnimations.timing.normal,
        useNativeDriver: true,
      }),
      Animated.timing(meshOpacity, {
        toValue: 0.1,
        duration: MeshAnimations.timing.normal,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Physics-based gesture handling
  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const handleGestureStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === 5) { // END state
      // Spring back to original position
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          ...MeshAnimations.springs.mesh,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          ...MeshAnimations.springs.mesh,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // 3D tilt effect based on touch position
  const handle3DTilt = (event) => {
    if (!physics || variant !== 'quantum') return;

    const { locationX, locationY } = event.nativeEvent;
    const { width, height } = cardDimensions;
    
    const tiltX = ((locationY - height / 2) / height) * -10; // -10 to 10 degrees
    const tiltY = ((locationX - width / 2) / width) * 10;

    Animated.parallel([
      Animated.timing(rotateX, {
        toValue: tiltX,
        duration: MeshAnimations.timing.fast,
        useNativeDriver: true,
      }),
      Animated.timing(rotateY, {
        toValue: tiltY,
        duration: MeshAnimations.timing.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const resetTilt = () => {
    Animated.parallel([
      Animated.timing(rotateX, {
        toValue: 0,
        duration: MeshAnimations.timing.normal,
        useNativeDriver: true,
      }),
      Animated.timing(rotateY, {
        toValue: 0,
        duration: MeshAnimations.timing.normal,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Mesh overlay pattern generator
  const renderMeshOverlay = () => {
    if (!meshOverlay) return null;

    const patternId = `meshPattern_${variant}`;
    const gradientId = `meshGradient_${variant}`;

    return (
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { opacity: meshOpacity },
        ]}
        pointerEvents="none"
      >
        <Svg width="100%" height="100%">
          <Defs>
            <SvgGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={MeshColors.electricBlue} stopOpacity="0.1" />
              <Stop offset="50%" stopColor={MeshColors.primaryTeal} stopOpacity="0.05" />
              <Stop offset="100%" stopColor={MeshColors.electricBlue} stopOpacity="0.1" />
            </SvgGradient>
            
            <Pattern
              id={patternId}
              x="0"
              y="0"
              width={variant === 'small' ? "20" : variant === 'large' ? "60" : "40"}
              height={variant === 'small' ? "20" : variant === 'large' ? "60" : "40"}
              patternUnits="userSpaceOnUse"
            >
              <Polygon
                points={
                  variant === 'small' 
                    ? "0,10 10,0 20,10 10,20"
                    : variant === 'large'
                    ? "0,30 30,0 60,30 30,60"
                    : "0,20 20,0 40,20 20,40"
                }
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth="0.5"
              />
              <Circle
                cx={variant === 'small' ? "10" : variant === 'large' ? "30" : "20"}
                cy={variant === 'small' ? "10" : variant === 'large' ? "30" : "20"}
                r={variant === 'small' ? "1" : variant === 'large' ? "3" : "2"}
                fill={MeshColors.electricBlue}
                opacity="0.3"
              />
            </Pattern>
          </Defs>
          
          <Rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </Svg>
      </Animated.View>
    );
  };

  // Background gradient for quantum variant
  const renderQuantumBackground = () => {
    if (variant !== 'quantum') return null;

    return (
      <LinearGradient
        colors={[
          getDynamicColor(MeshColors.electricBlue, 0.05),
          getDynamicColor(MeshColors.primaryTeal, 0.02),
          getDynamicColor(MeshColors.electricBlue, 0.05),
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
    );
  };

  // Calculate dynamic styles
  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  const shadowStyle = {
    ...MeshShadows.floating[shadowLevel],
    shadowOpacity,
  };

  const cardStyle = [
    styles.baseCard,
    {
      backgroundColor,
      borderRadius,
      minHeight: config.minHeight,
      maxWidth: config.maxWidth,
      padding: config.padding,
      ...shadowStyle,
    },
    elevation && Platform.OS === 'android' && {
      elevation: MeshShadows.floating[shadowLevel].elevation,
    },
    style,
  ];

  const animatedStyle = {
    transform: [
      { translateX },
      { translateY },
      { translateY: floatTranslateY },
      { scale },
      { perspective: 1000 },
      {
        rotateX: rotateX.interpolate({
          inputRange: [-10, 10],
          outputRange: ['-10deg', '10deg'],
        }),
      },
      {
        rotateY: rotateY.interpolate({
          inputRange: [-10, 10],
          outputRange: ['-10deg', '10deg'],
        }),
      },
    ],
  };

  // Render card content
  const CardContent = () => (
    <Animated.View
      style={[cardStyle, animatedStyle]}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setCardDimensions({ width, height });
      }}
    >
      {renderQuantumBackground()}
      {renderMeshOverlay()}
      
      <View style={styles.contentContainer}>
        {children}
      </View>
    </Animated.View>
  );

  // If not interactive, render static card
  if (!interactive) {
    return <CardContent />;
  }

  // Interactive card with gesture handling
  if (physics && variant === 'quantum') {
    return (
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleGestureStateChange}
        enabled={physics}
      >
        <TapGestureHandler onActivated={onPress}>
          <TouchableWithoutFeedback
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onLongPress={onLongPress}
            onMoveShouldSetResponder={() => true}
            onResponderMove={handle3DTilt}
            onResponderRelease={resetTilt}
          >
            <View>
              <CardContent />
            </View>
          </TouchableWithoutFeedback>
        </TapGestureHandler>
      </PanGestureHandler>
    );
  }

  // Standard interactive card
  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={onLongPress}
    >
      <View>
        <CardContent />
      </View>
    </TouchableWithoutFeedback>
  );
};

// Specialized card components
export const ChatCard = ({ message, isOwn, ...props }) => (
  <FloatingCard
    variant="medium"
    backgroundColor={isOwn ? MeshColors.electricBlue : MeshColors.crystallineWhite}
    shadowLevel="light"
    style={[
      styles.chatCard,
      isOwn ? styles.ownMessage : styles.otherMessage,
    ]}
    {...props}
  >
    {message}
  </FloatingCard>
);

export const ContactCard = ({ contact, onPress, ...props }) => (
  <FloatingCard
    variant="medium"
    interactive={true}
    onPress={() => onPress(contact)}
    style={styles.contactCard}
    {...props}
  >
    {contact}
  </FloatingCard>
);

export const StatusCard = ({ status, ...props }) => (
  <FloatingCard
    variant="small"
    animationType="hover"
    meshOverlay={true}
    style={styles.statusCard}
    {...props}
  >
    {status}
  </FloatingCard>
);

export const CallCard = ({ call, onPress, ...props }) => (
  <FloatingCard
    variant="large"
    interactive={true}
    physics={true}
    onPress={() => onPress(call)}
    backgroundColor={getDynamicColor(MeshColors.electricBlue, 0.05)}
    style={styles.callCard}
    {...props}
  >
    {call}
  </FloatingCard>
);

export const QuantumCard = ({ children, ...props }) => (
  <FloatingCard
    variant="quantum"
    interactive={true}
    physics={true}
    meshOverlay={true}
    shadowLevel="heavy"
    animationType="quantum"
    {...props}
  >
    {children}
  </FloatingCard>
);

// Card container for grouped cards
export const CardContainer = ({ 
  children, 
  spacing = MeshSpacing.md,
  direction = 'vertical', // 'vertical', 'horizontal', 'grid'
  style = {},
}) => {
  const containerStyle = [
    styles.cardContainer,
    direction === 'horizontal' && styles.horizontalContainer,
    direction === 'grid' && styles.gridContainer,
    { gap: spacing },
    style,
  ];

  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
};

// Animated card stack
export const CardStack = ({ 
  cards = [], 
  onCardPress,
  stackOffset = 8,
  maxVisible = 3,
}) => {
  const [visibleCards, setVisibleCards] = useState(
    cards.slice(0, maxVisible)
  );

  return (
    <View style={styles.cardStack}>
      {visibleCards.map((card, index) => {
        const zIndex = visibleCards.length - index;
        const translateY = index * stackOffset;
        const scale = 1 - (index * 0.02);

        return (
          <Animated.View
            key={card.id || index}
            style={[
              styles.stackedCard,
              {
                zIndex,
                transform: [
                  { translateY },
                  { scale },
                ],
              },
            ]}
          >
            <FloatingCard
              variant="medium"
              interactive={true}
              onPress={() => onCardPress(card, index)}
              shadowLevel={index === 0 ? 'heavy' : 'light'}
            >
              {card.content}
            </FloatingCard>
          </Animated.View>
        );
      })}
    </View>
  );
};

// Loading card with mesh animation
export const LoadingCard = ({ 
  variant = 'medium',
  ...props 
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: MeshAnimations.timing.mesh,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: MeshAnimations.timing.mesh,
          useNativeDriver: true,
        }),
      ])
    );
    
    pulse.start();
    
    return () => pulse.stop();
  }, []);

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <FloatingCard
      variant={variant}
      interactive={false}
      style={[styles.loadingCard]}
      {...props}
    >
      <Animated.View
        style={[
          styles.loadingContent,
          { opacity: pulseOpacity },
        ]}
      >
        {/* Loading placeholder content */}
        <View style={styles.loadingBar} />
        <View style={[styles.loadingBar, { width: '60%' }]} />
        <View style={[styles.loadingBar, { width: '80%' }]} />
      </Animated.View>
    </FloatingCard>
  );
};

const styles = StyleSheet.create({
  baseCard: {
    backgroundColor: MeshColors.crystallineWhite,
    borderRadius: MeshBorderRadius.components.card,
    overflow: 'hidden',
    position: 'relative',
  },
  
  contentContainer: {
    flex: 1,
    zIndex: 10,
  },
  
  chatCard: {
    marginVertical: MeshSpacing.xs,
    maxWidth: screenWidth * 0.8,
  },
  
  ownMessage: {
    alignSelf: 'flex-end',
    marginLeft: screenWidth * 0.2,
  },
  
  otherMessage: {
    alignSelf: 'flex-start',
    marginRight: screenWidth * 0.2,
  },
  
  contactCard: {
    marginVertical: MeshSpacing.xs,
    width: '100%',
  },
  
  statusCard: {
    margin: MeshSpacing.xs,
  },
  
  callCard: {
    marginVertical: MeshSpacing.sm,
    width: '100%',
  },
  
  cardContainer: {
    flex: 1,
  },
  
  horizontalContainer: {
    flexDirection: 'row',
  },
  
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  cardStack: {
    position: 'relative',
    alignItems: 'center',
  },
  
  stackedCard: {
    position: 'absolute',
    width: '100%',
  },
  
  loadingCard: {
    opacity: 0.7,
  },
  
  loadingContent: {
    flex: 1,
  },
  
  loadingBar: {
    height: 12,
    backgroundColor: MeshColors.neutrals.lightGrey,
    borderRadius: MeshBorderRadius.xs,
    marginVertical: MeshSpacing.xs,
    width: '100%',
  },
});

export default FloatingCard;