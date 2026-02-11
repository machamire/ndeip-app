/**
 * MessageReactions - Instagram-Story-Style Reaction System
 * Floating emojis that float up from messages with mesh particle trails
 * Reaction history with beautiful animations and user attribution
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  FlatList,
  StyleSheet,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, LongPressGestureHandler } from 'react-native-gesture-handler';
import Svg, {
  Circle,
  Path,
  G,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  AnimatedCircle,
  AnimatedPath,
} from 'react-native-svg';

import { useMeshTheme, useMeshColors, useMeshAnimations } from '../../hooks/useMeshTheme';
import FloatingCard from '../ui/FloatingCards';
import {
  MeshColors,
  MeshTypography,
  MeshSpacing,
  MeshBorderRadius,
  MeshShadows,
  getDynamicColor,
} from '../../constants/ndeipBrandSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Default emoji set for quick reactions
const DEFAULT_EMOJI_SET = ['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥'];

const MessageReactions = ({
  message,
  reactions = [],
  onReaction,
  onReactionLongPress,
  showReactionPicker = false,
  onReactionPickerToggle,
  currentUser,
  participants = [],
  style = {},
  variant = 'standard', // 'standard', 'compact', 'detailed'
}) => {
  const { colors } = useMeshColors();
  const { timing } = useMeshAnimations();

  // State
  const [activeReactions, setActiveReactions] = useState([]);
  const [showReactionHistory, setShowReactionHistory] = useState(false);
  const [reactionAnimations, setReactionAnimations] = useState([]);
  const [selectedReaction, setSelectedReaction] = useState(null);

  // Animation refs
  const reactionBarScale = useRef(new Animated.Value(0)).current;
  const reactionBarOpacity = useRef(new Animated.Value(0)).current;

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        emoji: reaction.emoji,
        count: 0,
        users: [],
        hasUserReacted: false,
      };
    }
    acc[reaction.emoji].count++;
    acc[reaction.emoji].users.push(reaction.user);
    if (reaction.user.id === currentUser?.id) {
      acc[reaction.emoji].hasUserReacted = true;
    }
    return acc;
  }, {});

  const reactionsList = Object.values(groupedReactions);

  // Show/hide reaction picker
  useEffect(() => {
    if (showReactionPicker) {
      Animated.parallel([
        Animated.spring(reactionBarScale, {
          toValue: 1,
          tension: 300,
          friction: 20,
          useNativeDriver: true,
        }),
        Animated.timing(reactionBarOpacity, {
          toValue: 1,
          duration: timing.fast,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(reactionBarScale, {
          toValue: 0,
          duration: timing.fast,
          useNativeDriver: true,
        }),
        Animated.timing(reactionBarOpacity, {
          toValue: 0,
          duration: timing.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showReactionPicker]);

  // Handle emoji reaction
  const handleReaction = useCallback((emoji) => {
    // Create floating animation
    const reactionId = Date.now() + Math.random();
    createFloatingReaction(emoji, reactionId);
    
    // Call parent handler
    if (onReaction) {
      onReaction(message.id, emoji);
    }
    
    // Hide picker
    if (onReactionPickerToggle) {
      onReactionPickerToggle(false);
    }
  }, [message.id, onReaction, onReactionPickerToggle]);

  // Create floating reaction animation
  const createFloatingReaction = (emoji, reactionId) => {
    const animValue = new Animated.Value(0);
    const particles = generateParticleTrail();
    
    const newReaction = {
      id: reactionId,
      emoji,
      animValue,
      particles,
      timestamp: Date.now(),
    };
    
    setReactionAnimations(prev => [...prev, newReaction]);
    
    // Start animation
    Animated.timing(animValue, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: true,
    }).start(() => {
      // Remove from animations after completion
      setReactionAnimations(prev => prev.filter(r => r.id !== reactionId));
    });
  };

  // Generate particle trail for floating emoji
  const generateParticleTrail = () => {
    const particles = [];
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        id: i,
        delay: i * 50,
        offsetX: (Math.random() - 0.5) * 40,
        offsetY: i * -15,
        size: 2 + Math.random() * 3,
        opacity: 0.8 - (i * 0.1),
      });
    }
    
    return particles;
  };

  // Handle reaction long press to show history
  const handleReactionLongPress = (reactionGroup) => {
    setSelectedReaction(reactionGroup);
    setShowReactionHistory(true);
    
    if (onReactionLongPress) {
      onReactionLongPress(reactionGroup);
    }
  };

  // Render floating reaction animations
  const renderFloatingReactions = () => {
    return reactionAnimations.map((reaction) => (
      <FloatingReactionAnimation
        key={reaction.id}
        reaction={reaction}
        colors={colors}
      />
    ));
  };

  // Render reaction picker
  const renderReactionPicker = () => {
    if (!showReactionPicker) return null;

    return (
      <Animated.View
        style={[
          styles.reactionPicker,
          {
            opacity: reactionBarOpacity,
            transform: [{ scale: reactionBarScale }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            getDynamicColor(colors.surface, 0.95),
            getDynamicColor(colors.background, 0.9),
          ]}
          style={styles.reactionPickerGradient}
        >
          {/* Mesh overlay */}
          <ReactionPickerMesh colors={colors} />
          
          <View style={styles.reactionPickerContent}>
            {DEFAULT_EMOJI_SET.map((emoji, index) => (
              <ReactionButton
                key={emoji}
                emoji={emoji}
                index={index}
                onPress={() => handleReaction(emoji)}
                colors={colors}
                timing={timing}
              />
            ))}
            
            {/* More emoji button */}
            <TouchableOpacity
              style={[styles.moreEmojiButton, { backgroundColor: colors.primary }]}
              onPress={() => {/* Show emoji picker */}}
            >
              <Ionicons name="add" size={20} color={colors.background} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  // Render reaction badges
  const renderReactionBadges = () => {
    if (reactionsList.length === 0) return null;

    const maxVisible = variant === 'compact' ? 3 : 6;
    const visibleReactions = reactionsList.slice(0, maxVisible);
    const hasMore = reactionsList.length > maxVisible;

    return (
      <View style={styles.reactionBadgesContainer}>
        {visibleReactions.map((reactionGroup, index) => (
          <ReactionBadge
            key={reactionGroup.emoji}
            reactionGroup={reactionGroup}
            onPress={() => handleReaction(reactionGroup.emoji)}
            onLongPress={() => handleReactionLongPress(reactionGroup)}
            variant={variant}
            colors={colors}
            style={[
              styles.reactionBadge,
              { marginLeft: index > 0 ? MeshSpacing.xs : 0 },
            ]}
          />
        ))}
        
        {hasMore && (
          <TouchableOpacity
            style={[
              styles.moreReactionsBadge,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => setShowReactionHistory(true)}
          >
            <Text style={[styles.moreReactionsText, { color: colors.textSecondary }]}>
              +{reactionsList.length - maxVisible}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Floating reaction animations */}
      <View style={StyleSheet.absoluteFillObject}>
        {renderFloatingReactions()}
      </View>
      
      {/* Reaction picker */}
      {renderReactionPicker()}
      
      {/* Reaction badges */}
      {renderReactionBadges()}
      
      {/* Reaction history modal */}
      <ReactionHistoryModal
        visible={showReactionHistory}
        reactions={reactions}
        selectedReaction={selectedReaction}
        participants={participants}
        onClose={() => setShowReactionHistory(false)}
        colors={colors}
      />
    </View>
  );
};

// Floating reaction animation component
const FloatingReactionAnimation = ({ reaction, colors }) => {
  const translateY = reaction.animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -100],
  });
  
  const opacity = reaction.animValue.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });
  
  const scale = reaction.animValue.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0.5, 1.2, 1, 0.8],
  });

  return (
    <View style={styles.floatingReactionContainer}>
      {/* Particle trail */}
      <Svg
        width={60}
        height={120}
        style={StyleSheet.absoluteFillObject}
      >
        <Defs>
          <SvgGradient id="particleTrailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={colors.secondary} stopOpacity="0.3" />
          </SvgGradient>
        </Defs>
        
        {reaction.particles.map((particle, index) => {
          const particleProgress = reaction.animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });
          
          const particleOpacity = reaction.animValue.interpolate({
            inputRange: [0, 0.3, 0.7, 1],
            outputRange: [0, particle.opacity, particle.opacity * 0.5, 0],
          });
          
          return (
            <AnimatedCircle
              key={particle.id}
              cx={30 + particle.offsetX}
              cy={100 + particle.offsetY * particleProgress._value}
              r={particle.size}
              fill="url(#particleTrailGradient)"
              opacity={particleOpacity}
            />
          );
        })}
      </Svg>
      
      {/* Floating emoji */}
      <Animated.View
        style={[
          styles.floatingEmoji,
          {
            opacity,
            transform: [{ translateY }, { scale }],
          },
        ]}
      >
        <Text style={styles.floatingEmojiText}>{reaction.emoji}</Text>
      </Animated.View>
    </View>
  );
};

// Reaction picker mesh overlay
const ReactionPickerMesh = ({ colors }) => (
  <Svg
    width="100%"
    height="100%"
    style={StyleSheet.absoluteFillObject}
  >
    <Defs>
      <SvgGradient id="meshPickerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.1" />
        <Stop offset="100%" stopColor={colors.secondary} stopOpacity="0.05" />
      </SvgGradient>
    </Defs>
    
    {/* Mesh pattern */}
    {Array.from({ length: 6 }, (_, i) => (
      <AnimatedPath
        key={i}
        d={`M ${i * 20} 0 Q ${i * 20 + 10} 25 ${i * 20 + 20} 50`}
        stroke="url(#meshPickerGradient)"
        strokeWidth="1"
        fill="none"
        opacity="0.3"
      />
    ))}
  </Svg>
);

// Individual reaction button
const ReactionButton = ({ emoji, index, onPress, colors, timing }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Ripple effect
    Animated.timing(rippleAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      rippleAnim.setValue(0);
    });
    
    onPress();
  };

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });
  
  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 2],
  });

  return (
    <TouchableOpacity
      style={[styles.reactionButton]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Ripple effect */}
      <Animated.View
        style={[
          styles.rippleEffect,
          {
            backgroundColor: colors.primary,
            opacity: rippleOpacity,
            transform: [{ scale: rippleScale }],
          },
        ]}
      />
      
      {/* Emoji */}
      <Animated.View style={[styles.emojiContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.emojiText}>{emoji}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Reaction badge component
const ReactionBadge = ({
  reactionGroup,
  onPress,
  onLongPress,
  variant,
  colors,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reactionGroup.hasUserReacted) {
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [reactionGroup.hasUserReacted]);

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

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  const badgeStyle = [
    styles.badgeBase,
    variant === 'compact' && styles.badgeCompact,
    {
      backgroundColor: reactionGroup.hasUserReacted ? colors.primary : colors.surface,
      borderColor: reactionGroup.hasUserReacted ? colors.primary : colors.border,
      transform: [{ scale: scaleAnim }],
    },
    style,
  ];

  const textColor = reactionGroup.hasUserReacted ? colors.background : colors.text;

  return (
    <LongPressGestureHandler onActivated={() => onLongPress(reactionGroup)}>
      <TouchableOpacity style={badgeStyle} onPress={handlePress}>
        {/* Glow effect */}
        <Animated.View
          style={[
            styles.badgeGlow,
            {
              backgroundColor: colors.primary,
              opacity: glowOpacity,
            },
          ]}
        />
        
        <View style={styles.badgeContent}>
          <Text style={[styles.badgeEmoji, variant === 'compact' && styles.badgeEmojiCompact]}>
            {reactionGroup.emoji}
          </Text>
          
          {variant !== 'compact' && (
            <Text style={[styles.badgeCount, { color: textColor }]}>
              {reactionGroup.count}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </LongPressGestureHandler>
  );
};

// Reaction history modal
const ReactionHistoryModal = ({
  visible,
  reactions,
  selectedReaction,
  participants,
  onClose,
  colors,
}) => {
  // Group reactions by emoji for tabs
  const reactionTabs = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {});

  const [selectedTab, setSelectedTab] = useState(selectedReaction?.emoji || Object.keys(reactionTabs)[0]);

  const renderReactionUser = ({ item: reaction }) => (
    <FloatingCard variant="small" style={styles.reactionUserCard}>
      <View style={styles.reactionUserContent}>
        <View style={[styles.reactionUserAvatar, { backgroundColor: colors.primary }]}>
          {reaction.user.avatar ? (
            <Image source={{ uri: reaction.user.avatar }} style={styles.reactionUserAvatarImage} />
          ) : (
            <Text style={[styles.reactionUserAvatarText, { color: colors.background }]}>
              {reaction.user.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        
        <View style={styles.reactionUserInfo}>
          <Text style={[styles.reactionUserName, { color: colors.text }]}>
            {reaction.user.name}
          </Text>
          <Text style={[styles.reactionTime, { color: colors.textSecondary }]}>
            {new Date(reaction.timestamp).toLocaleTimeString()}
          </Text>
        </View>
        
        <Text style={styles.reactionUserEmoji}>{reaction.emoji}</Text>
      </View>
    </FloatingCard>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        {/* Modal header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Reactions
          </Text>
          <View style={{ width: 24 }} />
        </View>
        
        {/* Reaction tabs */}
        <View style={styles.reactionTabs}>
          <TouchableOpacity
            style={[
              styles.reactionTab,
              !selectedTab && styles.reactionTabActive,
              { borderBottomColor: colors.primary },
            ]}
            onPress={() => setSelectedTab(null)}
          >
            <Text style={[styles.reactionTabText, { color: colors.text }]}>
              All ({reactions.length})
            </Text>
          </TouchableOpacity>
          
          {Object.entries(reactionTabs).map(([emoji, reactionList]) => (
            <TouchableOpacity
              key={emoji}
              style={[
                styles.reactionTab,
                selectedTab === emoji && styles.reactionTabActive,
                { borderBottomColor: colors.primary },
              ]}
              onPress={() => setSelectedTab(emoji)}
            >
              <Text style={styles.reactionTabEmoji}>{emoji}</Text>
              <Text style={[styles.reactionTabCount, { color: colors.text }]}>
                {reactionList.length}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Reactions list */}
        <FlatList
          data={selectedTab ? reactionTabs[selectedTab] : reactions}
          renderItem={renderReactionUser}
          keyExtractor={(item, index) => `${item.user.id}-${item.emoji}-${index}`}
          contentContainerStyle={styles.reactionsList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  
  reactionPicker: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    marginBottom: MeshSpacing.sm,
    borderRadius: MeshBorderRadius.lg,
    overflow: 'hidden',
    ...MeshShadows.floating.medium,
  },
  
  reactionPickerGradient: {
    paddingVertical: MeshSpacing.md,
    paddingHorizontal: MeshSpacing.lg,
  },
  
  reactionPickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  
  reactionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  rippleEffect: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  
  emojiContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  emojiText: {
    fontSize: 24,
  },
  
  moreEmojiButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  reactionBadgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: MeshSpacing.xs,
  },
  
  badgeBase: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MeshSpacing.sm,
    paddingVertical: MeshSpacing.xs,
    borderRadius: MeshBorderRadius.lg,
    borderWidth: 1,
    position: 'relative',
    ...MeshShadows.floating.light,
  },
  
  badgeCompact: {
    paddingHorizontal: MeshSpacing.xs,
  },
  
  badgeGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: MeshBorderRadius.lg + 2,
  },
  
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  badgeEmoji: {
    fontSize: 16,
    marginRight: MeshSpacing.xs,
  },
  
  badgeEmojiCompact: {
    fontSize: 14,
    marginRight: 0,
  },
  
  badgeCount: {
    fontSize: MeshTypography.sizes.caption,
    fontWeight: MeshTypography.weights.medium,
    minWidth: 16,
    textAlign: 'center',
  },
  
  moreReactionsBadge: {
    paddingHorizontal: MeshSpacing.sm,
    paddingVertical: MeshSpacing.xs,
    borderRadius: MeshBorderRadius.lg,
    borderWidth: 1,
    marginLeft: MeshSpacing.xs,
  },
  
  moreReactionsText: {
    fontSize: MeshTypography.sizes.caption,
    fontWeight: MeshTypography.weights.medium,
  },
  
  floatingReactionContainer: {
    position: 'absolute',
    bottom: 0,
    right: 20,
    width: 60,
    height: 120,
  },
  
  floatingEmoji: {
    position: 'absolute',
    bottom: 0,
    right: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  floatingEmojiText: {
    fontSize: 28,
  },
  
  modalContainer: {
    flex: 1,
  },
  
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: MeshSpacing.lg,
    paddingVertical: MeshSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: getDynamicColor(MeshColors.neutrals.mediumGrey, 0.2),
  },
  
  modalTitle: {
    fontSize: MeshTypography.sizes.h3,
    fontWeight: MeshTypography.weights.semiBold,
  },
  
  reactionTabs: {
    flexDirection: 'row',
    paddingHorizontal: MeshSpacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: getDynamicColor(MeshColors.neutrals.lightGrey, 0.5),
  },
  
  reactionTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: MeshSpacing.md,
    paddingHorizontal: MeshSpacing.sm,
    marginRight: MeshSpacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  
  reactionTabActive: {
    borderBottomWidth: 2,
  },
  
  reactionTabText: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.medium,
  },
  
  reactionTabEmoji: {
    fontSize: 20,
    marginRight: MeshSpacing.xs,
  },
  
  reactionTabCount: {
    fontSize: MeshTypography.sizes.bodySmall,
    fontWeight: MeshTypography.weights.medium,
  },
  
  reactionsList: {
    paddingHorizontal: MeshSpacing.lg,
    paddingVertical: MeshSpacing.md,
  },
  
  reactionUserCard: {
    marginVertical: MeshSpacing.xs,
  },
  
  reactionUserContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  reactionUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: MeshSpacing.md,
    overflow: 'hidden',
  },
  
  reactionUserAvatarImage: {
    width: '100%',
    height: '100%',
  },
  
  reactionUserAvatarText: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.semiBold,
  },
  
  reactionUserInfo: {
    flex: 1,
  },
  
  reactionUserName: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.medium,
  },
  
  reactionTime: {
    fontSize: MeshTypography.sizes.caption,
    marginTop: 2,
  },
  
  reactionUserEmoji: {
    fontSize: 24,
  },
});

// Export specialized components
export const CompactReactions = (props) => (
  <MessageReactions {...props} variant="compact" />
);

export const DetailedReactions = (props) => (
  <MessageReactions {...props} variant="detailed" />
);

// Hook for managing reactions
export const useMessageReactions = (messageId, initialReactions = []) => {
  const [reactions, setReactions] = useState(initialReactions);
  const [showPicker, setShowPicker] = useState(false);

  const addReaction = useCallback((emoji, user) => {
    const newReaction = {
      id: Date.now().toString(),
      emoji,
      user,
      timestamp: Date.now(),
      messageId,
    };
    
    setReactions(prev => [...prev, newReaction]);
  }, [messageId]);

  const removeReaction = useCallback((reactionId) => {
    setReactions(prev => prev.filter(r => r.id !== reactionId));
  }, []);

  const toggleReaction = useCallback((emoji, user) => {
    const existingReaction = reactions.find(
      r => r.emoji === emoji && r.user.id === user.id
    );
    
    if (existingReaction) {
      removeReaction(existingReaction.id);
    } else {
      addReaction(emoji, user);
    }
  }, [reactions, addReaction, removeReaction]);

  const togglePicker = useCallback((show) => {
    setShowPicker(show !== undefined ? show : !showPicker);
  }, [showPicker]);

  return {
    reactions,
    showPicker,
    addReaction,
    removeReaction,
    toggleReaction,
    togglePicker,
  };
};

export default MessageReactions;