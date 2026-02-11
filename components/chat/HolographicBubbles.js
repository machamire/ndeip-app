/**
 * HolographicBubbles - Enhanced Message Bubbles with 3D Effects
 * 3D appearance with depth, reaction animations, delivery status indicators
 * Context actions with long-press action wheel
 */

import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Animated,
  PanGestureHandler,
  LongPressGestureHandler,
  TapGestureHandler,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Image,
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
  AnimatedCircle,
} from 'react-native-svg';

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

const { width: screenWidth } = Dimensions.get('window');

const HolographicBubble = ({
  message,
  isOwn = false,
  previousMessage = null,
  nextMessage = null,
  onSwipe,
  onLongPress,
  onReaction,
  onContextAction,
  showReactions = true,
  showDeliveryStatus = true,
  userMeshPattern = null,
  style = {},
}) => {
  const { colors } = useMeshColors();
  const { timing } = useMeshAnimations();

  // Animation refs
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const bubbleOpacity = useRef(new Animated.Value(1)).current;
  const shadowDepth = useRef(new Animated.Value(1)).current;

  // State
  const [isPressed, setIsPressed] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [reactionAnimations, setReactionAnimations] = useState([]);
  const [bubbleDimensions, setBubbleDimensions] = useState({ width: 0, height: 0 });

  // Check if message should be grouped with adjacent messages
  const isGroupedWithPrevious = useMemo(() => {
    return previousMessage?.isOwn === isOwn && 
           previousMessage?.type !== 'system' &&
           (message.timestamp - previousMessage?.timestamp) < 60000; // 1 minute
  }, [previousMessage, isOwn, message.timestamp]);

  const isGroupedWithNext = useMemo(() => {
    return nextMessage?.isOwn === isOwn && 
           nextMessage?.type !== 'system' &&
           (nextMessage?.timestamp - message.timestamp) < 60000; // 1 minute
  }, [nextMessage, isOwn, message.timestamp]);

  // Handle gesture interactions
  const handleSwipeGesture = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const handleSwipeEnd = ({ nativeEvent }) => {
    const { translationX, translationY, velocityX } = nativeEvent;
    
    if (Math.abs(translationX) > 80 || Math.abs(velocityX) > 800) {
      const direction = translationX > 0 ? 'right' : 'left';
      if (onSwipe) onSwipe(message, direction);
    }
    
    // Reset position with spring animation
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        tension: 300,
        friction: 20,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 300,
        friction: 20,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLongPress = () => {
    setIsPressed(true);
    setShowContextMenu(true);
    
    // 3D press effect
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: timing.fast,
        useNativeDriver: true,
      }),
      Animated.timing(shadowDepth, {
        toValue: 0.3,
        duration: timing.fast,
        useNativeDriver: true,
      }),
    ]).start();
    
    if (onLongPress) onLongPress(message);
  };

  const handlePressOut = () => {
    setIsPressed(false);
    
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 300,
        friction: 20,
        useNativeDriver: true,
      }),
      Animated.timing(shadowDepth, {
        toValue: 1,
        duration: timing.normal,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Hide context menu after delay
    setTimeout(() => setShowContextMenu(false), 3000);
  };

  // Handle 3D tilt effect
  const handle3DTilt = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    const { width, height } = bubbleDimensions;
    
    if (width === 0 || height === 0) return;
    
    const tiltX = ((locationY - height / 2) / height) * -5; // -5 to 5 degrees
    const tiltY = ((locationX - width / 2) / width) * 5;

    Animated.parallel([
      Animated.timing(rotateX, {
        toValue: tiltX,
        duration: timing.fast,
        useNativeDriver: true,
      }),
      Animated.timing(rotateY, {
        toValue: tiltY,
        duration: timing.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const reset3DTilt = () => {
    Animated.parallel([
      Animated.timing(rotateX, {
        toValue: 0,
        duration: timing.normal,
        useNativeDriver: true,
      }),
      Animated.timing(rotateY, {
        toValue: 0,
        duration: timing.normal,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle reaction animation
  const handleReaction = (emoji) => {
    const reactionId = Date.now() + Math.random();
    const animValue = new Animated.Value(0);
    
    setReactionAnimations(prev => [...prev, { id: reactionId, emoji, animValue }]);
    
    Animated.timing(animValue, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setReactionAnimations(prev => prev.filter(r => r.id !== reactionId));
    });
    
    if (onReaction) onReaction(message, emoji);
  };

  // Calculate bubble styling
  const bubbleBackgroundColor = isOwn ? colors.primary : colors.surface;
  const textColor = isOwn ? colors.background : colors.text;
  
  const bubbleStyle = [
    styles.bubble,
    {
      backgroundColor: bubbleBackgroundColor,
      borderTopLeftRadius: isGroupedWithPrevious && !isOwn ? MeshBorderRadius.xs : MeshBorderRadius.components.messageBubble,
      borderTopRightRadius: isGroupedWithPrevious && isOwn ? MeshBorderRadius.xs : MeshBorderRadius.components.messageBubble,
      borderBottomLeftRadius: isGroupedWithNext && !isOwn ? MeshBorderRadius.xs : MeshBorderRadius.components.messageBubble,
      borderBottomRightRadius: isGroupedWithNext && isOwn ? MeshBorderRadius.xs : MeshBorderRadius.components.messageBubble,
      transform: [
        { translateX },
        { translateY },
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
      ...MeshShadows.floating.medium,
      shadowOpacity: shadowDepth.interpolate({
        inputRange: [0, 1],
        outputRange: [0, MeshShadows.floating.medium.shadowOpacity],
      }),
    },
    style,
  ];

  const containerStyle = [
    styles.container,
    isOwn ? styles.ownContainer : styles.otherContainer,
    isGroupedWithPrevious && styles.groupedContainer,
  ];

  return (
    <View style={containerStyle}>
      <PanGestureHandler
        onGestureEvent={handleSwipeGesture}
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === 5) handleSwipeEnd({ nativeEvent });
        }}
      >
        <LongPressGestureHandler
          onActivated={handleLongPress}
          minDurationMs={500}
        >
          <TapGestureHandler onActivated={() => setShowContextMenu(false)}>
            <Animated.View
              style={bubbleStyle}
              onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                setBubbleDimensions({ width, height });
              }}
              onStartShouldSetResponder={() => true}
              onResponderMove={handle3DTilt}
              onResponderRelease={reset3DTilt}
              onResponderEnd={handlePressOut}
            >
              {/* Mesh overlay for non-own messages */}
              {!isOwn && userMeshPattern && (
                <MeshOverlay pattern={userMeshPattern} />
              )}
              
              {/* Holographic gradient overlay */}
              <HolographicOverlay isOwn={isOwn} colors={colors} />
              
              {/* Message content */}
              <View style={styles.contentContainer}>
                <MessageContent
                  message={message}
                  textColor={textColor}
                  colors={colors}
                />
                
                {/* Message footer with timestamp and status */}
                <MessageFooter
                  message={message}
                  isOwn={isOwn}
                  showDeliveryStatus={showDeliveryStatus}
                  textColor={textColor}
                  colors={colors}
                />
              </View>
              
              {/* Reaction particles */}
              {reactionAnimations.map(reaction => (
                <ReactionParticle
                  key={reaction.id}
                  emoji={reaction.emoji}
                  animValue={reaction.animValue}
                />
              ))}
              
              {/* Context action wheel */}
              {showContextMenu && (
                <ContextActionWheel
                  onAction={(action) => {
                    setShowContextMenu(false);
                    if (onContextAction) onContextAction(message, action);
                  }}
                  onReaction={handleReaction}
                  colors={colors}
                />
              )}
            </Animated.View>
          </TapGestureHandler>
        </LongPressGestureHandler>
      </PanGestureHandler>
      
      {/* Reactions display */}
      {showReactions && message.reactions && message.reactions.length > 0 && (
        <ReactionsDisplay
          reactions={message.reactions}
          onReactionPress={handleReaction}
          isOwn={isOwn}
          colors={colors}
        />
      )}
    </View>
  );
};

// Mesh overlay component for non-own messages
const MeshOverlay = ({ pattern }) => (
  <View style={StyleSheet.absoluteFillObject}>
    <Svg width="100%" height="100%" style={{ opacity: 0.1 }}>
      <Defs>
        <SvgGradient id="meshOverlayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={MeshColors.electricBlue} stopOpacity="0.3" />
          <Stop offset="100%" stopColor={MeshColors.primaryTeal} stopOpacity="0.1" />
        </SvgGradient>
      </Defs>
      
      {/* Render mesh pattern */}
      {pattern.connections?.map((connection, index) => (
        <Path
          key={index}
          d={`M ${connection.from.x * 0.3} ${connection.from.y * 0.3} Q ${
            connection.controlPoint ? connection.controlPoint.x * 0.3 : (connection.from.x + connection.to.x) * 0.15
          } ${
            connection.controlPoint ? connection.controlPoint.y * 0.3 : (connection.from.y + connection.to.y) * 0.15
          } ${connection.to.x * 0.3} ${connection.to.y * 0.3}`}
          stroke="url(#meshOverlayGradient)"
          strokeWidth="0.5"
          fill="none"
        />
      ))}
    </Svg>
  </View>
);

// Holographic gradient overlay
const HolographicOverlay = ({ isOwn, colors }) => (
  <LinearGradient
    colors={
      isOwn
        ? [
            getDynamicColor(colors.primary, 1),
            getDynamicColor(colors.primary, 0.9),
            getDynamicColor(colors.secondary, 0.1),
          ]
        : [
            getDynamicColor(colors.surface, 1),
            getDynamicColor(colors.surface, 0.95),
            getDynamicColor(colors.primary, 0.05),
          ]
    }
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={StyleSheet.absoluteFillObject}
  />
);

// Message content renderer
const MessageContent = ({ message, textColor, colors }) => {
  switch (message.type) {
    case 'text':
      return (
        <Text style={[styles.messageText, { color: textColor }]}>
          {message.text}
        </Text>
      );
      
    case 'image':
      return (
        <View style={styles.imageContainer}>
          <Image source={{ uri: message.imageUrl }} style={styles.messageImage} />
          {message.caption && (
            <Text style={[styles.imageCaption, { color: textColor }]}>
              {message.caption}
            </Text>
          )}
        </View>
      );
      
    case 'voice':
      return (
        <VoiceMessageContent
          message={message}
          textColor={textColor}
          colors={colors}
        />
      );
      
    case 'file':
      return (
        <FileMessageContent
          message={message}
          textColor={textColor}
          colors={colors}
        />
      );
      
    case 'location':
      return (
        <LocationMessageContent
          message={message}
          textColor={textColor}
          colors={colors}
        />
      );
      
    default:
      return (
        <Text style={[styles.messageText, { color: textColor }]}>
          {message.text || 'Unsupported message type'}
        </Text>
      );
  }
};

// Voice message content
const VoiceMessageContent = ({ message, textColor, colors }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const playButtonScale = useRef(new Animated.Value(1)).current;

  const handlePlay = () => {
    Animated.sequence([
      Animated.timing(playButtonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(playButtonScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    setIsPlaying(!isPlaying);
  };

  return (
    <View style={styles.voiceContainer}>
      <Animated.View style={[styles.playButton, { transform: [{ scale: playButtonScale }] }]}>
        <TouchableOpacity onPress={handlePlay}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={20}
            color={textColor}
          />
        </TouchableOpacity>
      </Animated.View>
      
      <View style={styles.waveformContainer}>
        {[...Array(15)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.waveformBar,
              {
                height: 4 + Math.random() * 12,
                backgroundColor: textColor,
                opacity: isPlaying && index < 8 ? 1 : 0.4,
              },
            ]}
          />
        ))}
      </View>
      
      <Text style={[styles.voiceDuration, { color: textColor }]}>
        {Math.floor(message.duration / 60)}:{(message.duration % 60).toString().padStart(2, '0')}
      </Text>
    </View>
  );
};

// File message content
const FileMessageContent = ({ message, textColor }) => (
  <View style={styles.fileContainer}>
    <View style={[styles.fileIcon, { backgroundColor: getDynamicColor(textColor, 0.1) }]}>
      <MaterialIcons name="insert-drive-file" size={24} color={textColor} />
    </View>
    <View style={styles.fileInfo}>
      <Text style={[styles.fileName, { color: textColor }]} numberOfLines={1}>
        {message.fileName}
      </Text>
      <Text style={[styles.fileSize, { color: getDynamicColor(textColor, 0.7) }]}>
        {formatFileSize(message.fileSize)}
      </Text>
    </View>
  </View>
);

// Location message content
const LocationMessageContent = ({ message, textColor }) => (
  <View style={styles.locationContainer}>
    <View style={[styles.locationIcon, { backgroundColor: getDynamicColor(textColor, 0.1) }]}>
      <Ionicons name="location" size={24} color={textColor} />
    </View>
    <View style={styles.locationInfo}>
      <Text style={[styles.locationName, { color: textColor }]} numberOfLines={1}>
        {message.locationName || 'Current Location'}
      </Text>
      <Text style={[styles.locationAddress, { color: getDynamicColor(textColor, 0.7) }]}>
        {message.address || 'Tap to view on map'}
      </Text>
    </View>
  </View>
);

// Message footer with timestamp and delivery status
const MessageFooter = ({ message, isOwn, showDeliveryStatus, textColor, colors }) => (
  <View style={styles.messageFooter}>
    <Text style={[styles.timestamp, { color: getDynamicColor(textColor, 0.7) }]}>
      {formatTimestamp(message.timestamp)}
    </Text>
    
    {isOwn && showDeliveryStatus && (
      <View style={styles.deliveryStatus}>
        <DeliveryStatusIndicator
          status={message.status}
          colors={{ textColor, ...colors }}
        />
      </View>
    )}
  </View>
);

// Delivery status indicator
const DeliveryStatusIndicator = ({ status, colors }) => {
  const iconSize = 12;
  
  switch (status) {
    case 'sending':
      return (
        <View style={styles.sendingIndicator}>
          <Ionicons name="time" size={iconSize} color={getDynamicColor(colors.textColor, 0.5)} />
        </View>
      );
      
    case 'sent':
      return <Ionicons name="checkmark" size={iconSize} color={getDynamicColor(colors.textColor, 0.7)} />;
      
    case 'delivered':
      return <Ionicons name="checkmark-done" size={iconSize} color={getDynamicColor(colors.textColor, 0.7)} />;
      
    case 'read':
      return <Ionicons name="checkmark-done" size={iconSize} color={colors.secondary} />;
      
    case 'failed':
      return <Ionicons name="alert-circle" size={iconSize} color={colors.accents.mutedRed} />;
      
    default:
      return null;
  }
};

// Reaction particle animation
const ReactionParticle = ({ emoji, animValue }) => {
  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });
  
  const opacity = animValue.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 1, 0],
  });
  
  const scale = animValue.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.5, 1.2, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.reactionParticle,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <Text style={styles.reactionEmoji}>{emoji}</Text>
    </Animated.View>
  );
};

// Context action wheel
const ContextActionWheel = ({ onAction, onReaction, colors }) => {
  const wheelScale = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.spring(wheelScale, {
      toValue: 1,
      tension: 300,
      friction: 20,
      useNativeDriver: true,
    }).start();
  }, []);

  const actions = [
    { icon: 'heart', label: 'Like', action: () => onReaction('❤️') },
    { icon: 'happy', label: 'Laugh', action: () => onReaction('😂') },
    { icon: 'sad', label: 'Sad', action: () => onReaction('😢') },
    { icon: 'arrow-undo', label: 'Reply', action: () => onAction('reply') },
    { icon: 'copy', label: 'Copy', action: () => onAction('copy') },
    { icon: 'trash', label: 'Delete', action: () => onAction('delete') },
  ];

  return (
    <Animated.View
      style={[
        styles.contextWheel,
        {
          transform: [{ scale: wheelScale }],
        },
      ]}
    >
      {actions.map((action, index) => {
        const angle = (index / actions.length) * 2 * Math.PI;
        const radius = 60;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        return (
          <TouchableOpacity
            key={action.label}
            style={[
              styles.contextAction,
              {
                backgroundColor: colors.surface,
                transform: [{ translateX: x }, { translateY: y }],
              },
            ]}
            onPress={action.action}
          >
            <Ionicons
              name={action.icon}
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
};

// Reactions display
const ReactionsDisplay = ({ reactions, onReactionPress, isOwn, colors }) => (
  <View style={[styles.reactionsContainer, isOwn && styles.ownReactions]}>
    {reactions.map((reaction, index) => (
      <TouchableOpacity
        key={index}
        style={[styles.reactionBadge, { backgroundColor: colors.surface }]}
        onPress={() => onReactionPress(reaction.emoji)}
      >
        <Text style={styles.reactionText}>{reaction.emoji}</Text>
        <Text style={[styles.reactionCount, { color: colors.text }]}>
          {reaction.count}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

// Utility functions
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const styles = StyleSheet.create({
  container: {
    marginVertical: MeshSpacing.xs,
    maxWidth: screenWidth * 0.75,
  },
  
  ownContainer: {
    alignSelf: 'flex-end',
    marginLeft: screenWidth * 0.25,
  },
  
  otherContainer: {
    alignSelf: 'flex-start',
    marginRight: screenWidth * 0.25,
  },
  
  groupedContainer: {
    marginTop: MeshSpacing.xs / 2,
  },
  
  bubble: {
    borderRadius: MeshBorderRadius.components.messageBubble,
    paddingHorizontal: MeshSpacing.md,
    paddingVertical: MeshSpacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  
  contentContainer: {
    position: 'relative',
    zIndex: 2,
  },
  
  messageText: {
    fontSize: MeshTypography.sizes.body,
    lineHeight: MeshTypography.lineHeights.normal * MeshTypography.sizes.body,
  },
  
  imageContainer: {
    borderRadius: MeshBorderRadius.sm,
    overflow: 'hidden',
  },
  
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: MeshBorderRadius.sm,
  },
  
  imageCaption: {
    fontSize: MeshTypography.sizes.bodySmall,
    marginTop: MeshSpacing.xs,
  },
  
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 180,
  },
  
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: MeshSpacing.sm,
  },
  
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    marginRight: MeshSpacing.sm,
  },
  
  waveformBar: {
    width: 2,
    marginHorizontal: 1,
    borderRadius: 1,
  },
  
  voiceDuration: {
    fontSize: MeshTypography.sizes.caption,
    minWidth: 40,
  },
  
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
  },
  
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: MeshBorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: MeshSpacing.sm,
  },
  
  fileInfo: {
    flex: 1,
  },
  
  fileName: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.medium,
  },
  
  fileSize: {
    fontSize: MeshTypography.sizes.caption,
    marginTop: 2,
  },
  
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
  },
  
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: MeshBorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: MeshSpacing.sm,
  },
  
  locationInfo: {
    flex: 1,
  },
  
  locationName: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.medium,
  },
  
  locationAddress: {
    fontSize: MeshTypography.sizes.caption,
    marginTop: 2,
  },
  
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: MeshSpacing.xs,
  },
  
  timestamp: {
    fontSize: MeshTypography.sizes.caption,
    marginRight: MeshSpacing.xs,
  },
  
  deliveryStatus: {
    marginLeft: MeshSpacing.xs,
  },
  
  sendingIndicator: {
    opacity: 0.6,
  },
  
  reactionParticle: {
    position: 'absolute',
    top: -20,
    right: 20,
    zIndex: 1000,
  },
  
  reactionEmoji: {
    fontSize: 24,
  },
  
  contextWheel: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  
  contextAction: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...MeshShadows.floating.light,
  },
  
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: MeshSpacing.xs,
    alignSelf: 'flex-start',
  },
  
  ownReactions: {
    alignSelf: 'flex-end',
  },
  
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MeshSpacing.sm,
    paddingVertical: MeshSpacing.xs,
    borderRadius: MeshBorderRadius.lg,
    marginRight: MeshSpacing.xs,
    marginBottom: MeshSpacing.xs,
    ...MeshShadows.floating.light,
  },
  
  reactionText: {
    fontSize: 14,
    marginRight: 4,
  },
  
  reactionCount: {
    fontSize: MeshTypography.sizes.caption,
    fontWeight: MeshTypography.weights.medium,
  },
});

export default HolographicBubble;