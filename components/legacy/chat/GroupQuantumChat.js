/**
 * GroupQuantumChat - Advanced Group Chat Interface
 * Member avatars floating around screen edge during activity
 * Speaking indicator, role visualization with mesh crown effects
 * Advanced group management and participant activity tracking
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { PanGestureHandler } from 'react-native-gesture-handler';

// Import our mesh components
import CrystallineMesh from '../../components/ndeip/CrystallineMesh';
import FloatingCard from '../../components/ui/FloatingCards';
import HolographicBubble from '../../components/chat/HolographicBubbles';
import QuantumTyping from '../../components/chat/QuantumTyping';
import VoiceWaveform from '../../components/chat/VoiceWaveform';
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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GroupQuantumChat = ({
  route,
  navigation,
  group,
  messages: initialMessages = [],
  participants = [],
  currentUser,
  onSendMessage,
  onVoiceMessage,
  onGroupAction,
  onParticipantAction,
  typingUsers = [],
  speakingUsers = [],
}) => {
  const { colors } = useMeshColors();
  const { timing } = useMeshAnimations();

  // State management
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [activeParticipants, setActiveParticipants] = useState([]);
  const [participantPositions, setParticipantPositions] = useState(new Map());

  // Animation refs
  const scrollViewRef = useRef(null);
  const participantAnimations = useRef(new Map()).current;
  const activityIndicators = useRef(new Map()).current;
  const messagesOpacity = useRef(new Animated.Value(0)).current;

  // Calculate active participants (recently active users)
  const recentlyActiveUsers = useMemo(() => {
    const now = Date.now();
    const activeThreshold = 5 * 60 * 1000; // 5 minutes
    
    return participants.filter(participant => {
      const lastActive = participant.lastActive || 0;
      return (now - lastActive) < activeThreshold;
    });
  }, [participants]);

  // Initialize screen
  useEffect(() => {
    Animated.timing(messagesOpacity, {
      toValue: 1,
      duration: timing.normal,
      useNativeDriver: true,
    }).start();

    initializeParticipantPositions();
  }, []);

  // Update active participants
  useEffect(() => {
    setActiveParticipants([...typingUsers, ...speakingUsers, ...recentlyActiveUsers]);
  }, [typingUsers, speakingUsers, recentlyActiveUsers]);

  // Initialize participant positions around screen edge
  const initializeParticipantPositions = () => {
    const positions = new Map();
    const edgeMargin = 60;
    const avatarSize = 40;
    
    participants.forEach((participant, index) => {
      const angle = (index / participants.length) * 2 * Math.PI;
      const radiusX = (screenWidth - edgeMargin * 2) / 2;
      const radiusY = (screenHeight - edgeMargin * 2) / 2;
      
      const x = screenWidth / 2 + Math.cos(angle) * radiusX - avatarSize / 2;
      const y = screenHeight / 2 + Math.sin(angle) * radiusY - avatarSize / 2;
      
      positions.set(participant.id, {
        x: Math.max(edgeMargin, Math.min(screenWidth - edgeMargin - avatarSize, x)),
        y: Math.max(edgeMargin, Math.min(screenHeight - edgeMargin - avatarSize, y)),
        angle,
      });
      
      // Initialize animation
      if (!participantAnimations.has(participant.id)) {
        participantAnimations.set(participant.id, new Animated.Value(0));
      }
      
      if (!activityIndicators.has(participant.id)) {
        activityIndicators.set(participant.id, new Animated.Value(0));
      }
    });
    
    setParticipantPositions(positions);
  };

  // Handle message sending
  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      timestamp: Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      isOwn: true,
      type: 'text',
      status: 'sending',
      groupId: group.id,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    if (onSendMessage) {
      try {
        await onSendMessage(newMessage);
        setMessages(prev =>
          prev.map(msg =>
            msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
          )
        );
      } catch (error) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === newMessage.id ? { ...msg, status: 'failed' } : msg
          )
        );
      }
    }
  }, [inputText, currentUser, group.id, onSendMessage]);

  // Handle group actions
  const handleGroupAction = (action, data) => {
    switch (action) {
      case 'info':
        setShowGroupInfo(true);
        break;
      case 'participants':
        setShowParticipants(true);
        break;
      case 'call':
        // Initiate group call
        if (onGroupAction) onGroupAction('call', { participants });
        break;
      case 'mute':
        // Mute group notifications
        if (onGroupAction) onGroupAction('mute', { groupId: group.id });
        break;
      default:
        if (onGroupAction) onGroupAction(action, data);
    }
  };

  // Handle participant actions
  const handleParticipantAction = (participant, action) => {
    setSelectedParticipant(participant);
    
    switch (action) {
      case 'profile':
        navigation.navigate('UserProfile', { user: participant });
        break;
      case 'message':
        navigation.navigate('Chat', { contact: participant });
        break;
      case 'call':
        // Initiate private call
        if (onParticipantAction) onParticipantAction(participant, 'call');
        break;
      case 'remove':
        handleRemoveParticipant(participant);
        break;
      case 'promote':
        handlePromoteParticipant(participant);
        break;
      case 'demote':
        handleDemoteParticipant(participant);
        break;
      default:
        if (onParticipantAction) onParticipantAction(participant, action);
    }
  };

  // Handle participant removal
  const handleRemoveParticipant = (participant) => {
    Alert.alert(
      'Remove Participant',
      `Remove ${participant.name} from this group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (onParticipantAction) onParticipantAction(participant, 'remove');
          },
        },
      ]
    );
  };

  // Handle participant promotion
  const handlePromoteParticipant = (participant) => {
    Alert.alert(
      'Promote to Admin',
      `Make ${participant.name} a group admin?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Promote',
          onPress: () => {
            if (onParticipantAction) onParticipantAction(participant, 'promote');
          },
        },
      ]
    );
  };

  // Handle participant demotion
  const handleDemoteParticipant = (participant) => {
    Alert.alert(
      'Remove Admin',
      `Remove admin privileges from ${participant.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (onParticipantAction) onParticipantAction(participant, 'demote');
          },
        },
      ]
    );
  };

  // Render message with group context
  const renderMessage = ({ item: message, index }) => {
    const isOwn = message.senderId === currentUser.id;
    const sender = participants.find(p => p.id === message.senderId);
    
    return (
      <View style={styles.messageWrapper}>
        {!isOwn && (
          <TouchableOpacity
            style={styles.senderInfo}
            onPress={() => handleParticipantAction(sender, 'profile')}
          >
            <Text style={[styles.senderName, { color: colors.primary }]}>
              {message.senderName || sender?.name || 'Unknown'}
            </Text>
            {sender?.role === 'admin' && (
              <AdminCrown colors={colors} size={12} />
            )}
          </TouchableOpacity>
        )}
        
        <HolographicBubble
          message={message}
          isOwn={isOwn}
          previousMessage={messages[index - 1]}
          nextMessage={messages[index + 1]}
          onSwipe={(msg, direction) => {/* Handle swipe */}}
          onLongPress={(msg) => {/* Handle long press */}}
          userMeshPattern={generateUserMesh(sender?.id)}
          showReactions={true}
          showDeliveryStatus={isOwn}
        />
      </View>
    );
  };

  // Render floating participant avatars
  const renderFloatingParticipants = () => {
    return activeParticipants.map((participant) => {
      const position = participantPositions.get(participant.id);
      if (!position) return null;

      const isTyping = typingUsers.some(u => u.id === participant.id);
      const isSpeaking = speakingUsers.some(u => u.id === participant.id);
      const isActive = isTyping || isSpeaking;

      return (
        <FloatingParticipantAvatar
          key={participant.id}
          participant={participant}
          position={position}
          isTyping={isTyping}
          isSpeaking={isSpeaking}
          isActive={isActive}
          onPress={() => handleParticipantAction(participant, 'profile')}
          colors={colors}
          timing={timing}
        />
      );
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Mesh background */}
      <CrystallineMesh
        variant="small"
        animated={true}
        intensity={0.2}
        color={getDynamicColor(colors.primary, 0.05)}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating participant avatars */}
      <View style={StyleSheet.absoluteFillObject}>
        {renderFloatingParticipants()}
      </View>

      {/* Group header */}
      <GroupHeader
        group={group}
        participants={participants}
        navigation={navigation}
        onAction={handleGroupAction}
        colors={colors}
      />

      {/* Messages list */}
      <Animated.View style={[styles.messagesContainer, { opacity: messagesOpacity }]}>
        <FlatList
          ref={scrollViewRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        />
        
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <QuantumTyping
            users={typingUsers}
            variant="standard"
            showAvatars={true}
            showUserNames={true}
            maxVisibleUsers={3}
            soundVisualization={false}
          />
        )}
      </Animated.View>

      {/* Group input */}
      <GroupChatInput
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSendMessage}
        onVoiceMessage={onVoiceMessage}
        participants={participants}
        colors={colors}
        timing={timing}
      />

      {/* Group info modal */}
      <GroupInfoModal
        visible={showGroupInfo}
        group={group}
        participants={participants}
        currentUser={currentUser}
        onClose={() => setShowGroupInfo(false)}
        onAction={handleGroupAction}
        onParticipantAction={handleParticipantAction}
        colors={colors}
      />

      {/* Participants modal */}
      <ParticipantsModal
        visible={showParticipants}
        participants={participants}
        currentUser={currentUser}
        onClose={() => setShowParticipants(false)}
        onParticipantAction={handleParticipantAction}
        colors={colors}
      />
    </SafeAreaView>
  );
};

// Group header component
const GroupHeader = ({ group, participants, navigation, onAction, colors }) => (
  <FloatingCard
    variant="medium"
    style={styles.header}
    interactive={false}
    shadowLevel="light"
  >
    <View style={styles.headerContent}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.groupInfo}
        onPress={() => onAction('info')}
      >
        <View style={[styles.groupAvatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.groupAvatarText, { color: colors.background }]}>
            {group.name?.charAt(0)?.toUpperCase() || 'G'}
          </Text>
        </View>
        
        <View style={styles.groupDetails}>
          <Text style={[styles.groupName, { color: colors.text }]}>
            {group.name || 'Group Chat'}
          </Text>
          <Text style={[styles.participantCount, { color: colors.textSecondary }]}>
            {participants.length} participants
          </Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => onAction('call')}
        >
          <Ionicons name="videocam" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => onAction('participants')}
        >
          <Ionicons name="people" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => onAction('menu')}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  </FloatingCard>
);

// Floating participant avatar component
const FloatingParticipantAvatar = ({
  participant,
  position,
  isTyping,
  isSpeaking,
  isActive,
  onPress,
  colors,
  timing,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      // Start activity animations
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: timing.normal,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 0,
              duration: timing.normal,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: timing.fast,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Stop animations
      pulseAnim.stopAnimation();
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: timing.fast,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive]);

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
    ]).start(() => onPress());
  };

  const activityColor = isSpeaking ? colors.accents.success : colors.primary;
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  return (
    <Animated.View
      style={[
        styles.floatingAvatar,
        {
          left: position.x,
          top: position.y,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.avatarGlow,
          {
            backgroundColor: activityColor,
            opacity: glowOpacity,
          },
        ]}
      />
      
      {/* Activity indicator */}
      {isActive && (
        <Animated.View
          style={[
            styles.activityIndicator,
            {
              backgroundColor: activityColor,
              opacity: pulseAnim,
            },
          ]}
        />
      )}
      
      {/* Avatar */}
      <TouchableOpacity onPress={handlePress}>
        <View style={[styles.participantAvatar, { backgroundColor: colors.surface }]}>
          <Text style={[styles.participantAvatarText, { color: colors.text }]}>
            {participant.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
          
          {/* Admin crown */}
          {participant.role === 'admin' && (
            <View style={styles.adminCrownContainer}>
              <AdminCrown colors={colors} size={16} />
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      {/* Status indicators */}
      {isTyping && (
        <View style={styles.statusIndicator}>
          <Ionicons name="create" size={12} color={colors.primary} />
        </View>
      )}
      
      {isSpeaking && (
        <View style={styles.statusIndicator}>
          <Ionicons name="mic" size={12} color={colors.accents.success} />
        </View>
      )}
    </Animated.View>
  );
};

// Admin crown component
const AdminCrown = ({ colors, size = 16 }) => (
  <View style={[styles.adminCrown, { width: size, height: size }]}>
    <Ionicons name="crown" size={size} color={colors.secondary} />
  </View>
);

// Group chat input component
const GroupChatInput = ({
  value,
  onChangeText,
  onSend,
  onVoiceMessage,
  participants,
  colors,
  timing,
}) => {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');

  const handleTextChange = (text) => {
    onChangeText(text);
    
    // Check for mentions
    const mentionMatch = text.match(/@(\w*)$/);
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
  };

  const handleMentionSelect = (participant) => {
    const newText = value.replace(/@\w*$/, `@${participant.name} `);
    onChangeText(newText);
    setShowMentions(false);
  };

  const filteredParticipants = participants.filter(p =>
    p.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  return (
    <View style={styles.inputWrapper}>
      {/* Mentions dropdown */}
      {showMentions && filteredParticipants.length > 0 && (
        <View style={[styles.mentionsContainer, { backgroundColor: colors.surface }]}>
          <ScrollView style={styles.mentionsList}>
            {filteredParticipants.map(participant => (
              <TouchableOpacity
                key={participant.id}
                style={styles.mentionItem}
                onPress={() => handleMentionSelect(participant)}
              >
                <View style={[styles.mentionAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.mentionAvatarText, { color: colors.background }]}>
                    {participant.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.mentionName, { color: colors.text }]}>
                  {participant.name}
                </Text>
                {participant.role === 'admin' && (
                  <AdminCrown colors={colors} size={14} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Input */}
      <GroupChatInputBar
        value={value}
        onChangeText={handleTextChange}
        onSend={onSend}
        onVoiceMessage={onVoiceMessage}
        colors={colors}
      />
    </View>
  );
};

// Group chat input bar
const GroupChatInputBar = ({ value, onChangeText, onSend, onVoiceMessage, colors }) => (
  <FloatingCard
    variant="medium"
    style={styles.inputContainer}
    interactive={false}
    shadowLevel="light"
  >
    <View style={styles.inputContent}>
      <TouchableOpacity style={styles.attachButton}>
        <Ionicons name="add" size={24} color={colors.text} />
      </TouchableOpacity>
      
      <TextInput
        style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
        value={value}
        onChangeText={onChangeText}
        placeholder="Message the group..."
        placeholderTextColor={colors.textSecondary}
        multiline
        maxLength={1000}
      />
      
      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name="happy" size={24} color={colors.text} />
      </TouchableOpacity>
      
      {value.trim() ? (
        <TouchableOpacity
          onPress={onSend}
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="send" size={20} color={colors.background} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={onVoiceMessage}
          style={[styles.voiceButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="mic" size={24} color={colors.background} />
        </TouchableOpacity>
      )}
    </View>
  </FloatingCard>
);

// Group info modal
const GroupInfoModal = ({
  visible,
  group,
  participants,
  currentUser,
  onClose,
  onAction,
  onParticipantAction,
  colors,
}) => (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
    <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
      <CrystallineMesh
        variant="small"
        animated={true}
        intensity={0.1}
        color={getDynamicColor(colors.primary, 0.03)}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.modalTitle, { color: colors.text }]}>
          Group Info
        </Text>
        <TouchableOpacity onPress={() => onAction('edit')}>
          <Ionicons name="create" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.modalContent}>
        {/* Group details */}
        <FloatingCard variant="large" style={styles.groupDetailsCard}>
          <View style={styles.groupDetailsContent}>
            <View style={[styles.groupAvatarLarge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.groupAvatarTextLarge, { color: colors.background }]}>
                {group.name?.charAt(0)?.toUpperCase() || 'G'}
              </Text>
            </View>
            
            <Text style={[styles.groupNameLarge, { color: colors.text }]}>
              {group.name || 'Group Chat'}
            </Text>
            
            <Text style={[styles.groupDescription, { color: colors.textSecondary }]}>
              {group.description || 'No description'}
            </Text>
            
            <Text style={[styles.groupStats, { color: colors.textSecondary }]}>
              Created {new Date(group.createdAt || Date.now()).toLocaleDateString()} • {participants.length} participants
            </Text>
          </View>
        </FloatingCard>
        
        {/* Participants list */}
        <FloatingCard variant="large" style={styles.participantsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Participants
          </Text>
          
          {participants.map(participant => (
            <TouchableOpacity
              key={participant.id}
              style={styles.participantItem}
              onPress={() => onParticipantAction(participant, 'profile')}
            >
              <View style={[styles.participantItemAvatar, { backgroundColor: colors.primary }]}>
                <Text style={[styles.participantItemAvatarText, { color: colors.background }]}>
                  {participant.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.participantItemInfo}>
                <Text style={[styles.participantItemName, { color: colors.text }]}>
                  {participant.name}
                  {participant.id === currentUser.id && ' (You)'}
                </Text>
                <Text style={[styles.participantItemRole, { color: colors.textSecondary }]}>
                  {participant.role === 'admin' ? 'Admin' : 'Member'}
                </Text>
              </View>
              
              {participant.role === 'admin' && (
                <AdminCrown colors={colors} size={18} />
              )}
              
              <TouchableOpacity
                style={styles.participantAction}
                onPress={() => onParticipantAction(participant, 'menu')}
              >
                <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </FloatingCard>
      </ScrollView>
    </SafeAreaView>
  </Modal>
);

// Participants modal (simplified version)
const ParticipantsModal = ({
  visible,
  participants,
  currentUser,
  onClose,
  onParticipantAction,
  colors,
}) => (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
    <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.modalTitle, { color: colors.text }]}>
          Participants ({participants.length})
        </Text>
        <TouchableOpacity onPress={() => onParticipantAction(null, 'add')}>
          <Ionicons name="person-add" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={participants}
        keyExtractor={(item) => item.id}
        renderItem={({ item: participant }) => (
          <FloatingCard variant="medium" style={styles.participantCard}>
            <TouchableOpacity
              style={styles.participantCardContent}
              onPress={() => onParticipantAction(participant, 'profile')}
            >
              <View style={[styles.participantCardAvatar, { backgroundColor: colors.primary }]}>
                <Text style={[styles.participantCardAvatarText, { color: colors.background }]}>
                  {participant.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.participantCardInfo}>
                <Text style={[styles.participantCardName, { color: colors.text }]}>
                  {participant.name}
                </Text>
                <Text style={[styles.participantCardStatus, { color: colors.textSecondary }]}>
                  {participant.status || 'Available'}
                </Text>
              </View>
              
              {participant.role === 'admin' && (
                <AdminCrown colors={colors} size={16} />
              )}
            </TouchableOpacity>
          </FloatingCard>
        )}
        contentContainerStyle={styles.participantsList}
      />
    </SafeAreaView>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  header: {
    marginHorizontal: MeshSpacing.md,
    marginTop: MeshSpacing.sm,
    marginBottom: MeshSpacing.xs,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: MeshSpacing.sm,
  },
  
  backButton: {
    marginRight: MeshSpacing.md,
  },
  
  groupInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  groupAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: MeshSpacing.sm,
  },
  
  groupAvatarText: {
    fontSize: MeshTypography.sizes.h4,
    fontWeight: MeshTypography.weights.semiBold,
  },
  
  groupDetails: {
    flex: 1,
  },
  
  groupName: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.semiBold,
  },
  
  participantCount: {
    fontSize: MeshTypography.sizes.caption,
    marginTop: 2,
  },
  
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  headerAction: {
    marginLeft: MeshSpacing.md,
  },
  
  messagesContainer: {
    flex: 1,
    paddingHorizontal: MeshSpacing.md,
  },
  
  messagesList: {
    paddingBottom: MeshSpacing.lg,
  },
  
  messageWrapper: {
    marginVertical: MeshSpacing.xs,
  },
  
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: MeshSpacing.xs,
    marginLeft: MeshSpacing.sm,
  },
  
  senderName: {
    fontSize: MeshTypography.sizes.caption,
    fontWeight: MeshTypography.weights.medium,
    marginRight: MeshSpacing.xs,
  },
  
  floatingAvatar: {
    position: 'absolute',
    width: 40,
    height: 40,
    zIndex: 100,
  },
  
  avatarGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    top: -4,
    left: -4,
  },
  
  activityIndicator: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    top: -6,
    left: -6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  participantAvatarText: {
    fontSize: MeshTypography.sizes.bodySmall,
    fontWeight: MeshTypography.weights.semiBold,
  },
  
  adminCrownContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  
  adminCrown: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  statusIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  inputWrapper: {
    position: 'relative',
  },
  
  mentionsContainer: {
    position: 'absolute',
    bottom: '100%',
    left: MeshSpacing.md,
    right: MeshSpacing.md,
    maxHeight: 200,
    borderRadius: MeshBorderRadius.components.card,
    marginBottom: MeshSpacing.xs,
    ...MeshShadows.floating.medium,
  },
  
  mentionsList: {
    maxHeight: 200,
  },
  
  mentionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MeshSpacing.md,
    paddingVertical: MeshSpacing.sm,
  },
  
  mentionAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: MeshSpacing.sm,
  },
  
  mentionAvatarText: {
    fontSize: MeshTypography.sizes.bodySmall,
    fontWeight: MeshTypography.weights.semiBold,
  },
  
  mentionName: {
    flex: 1,
    fontSize: MeshTypography.sizes.body,
  },
  
  inputContainer: {
    marginHorizontal: MeshSpacing.md,
    marginBottom: MeshSpacing.md,
  },
  
  inputContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: MeshSpacing.sm,
  },
  
  attachButton: {
    marginRight: MeshSpacing.sm,
    marginBottom: MeshSpacing.xs,
  },
  
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: MeshBorderRadius.components.input,
    paddingHorizontal: MeshSpacing.md,
    paddingVertical: MeshSpacing.sm,
    fontSize: MeshTypography.sizes.body,
    maxHeight: 100,
    marginRight: MeshSpacing.sm,
  },
  
  actionButton: {
    marginRight: MeshSpacing.sm,
    marginBottom: MeshSpacing.xs,
  },
  
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: MeshSpacing.xs,
  },
  
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: MeshSpacing.xs,
  },
  
  // Modal styles
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
  
  modalContent: {
    flex: 1,
    paddingHorizontal: MeshSpacing.md,
  },
  
  groupDetailsCard: {
    marginVertical: MeshSpacing.md,
  },
  
  groupDetailsContent: {
    alignItems: 'center',
    paddingVertical: MeshSpacing.lg,
  },
  
  groupAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: MeshSpacing.md,
  },
  
  groupAvatarTextLarge: {
    fontSize: MeshTypography.sizes.h1,
    fontWeight: MeshTypography.weights.bold,
  },
  
  groupNameLarge: {
    fontSize: MeshTypography.sizes.h2,
    fontWeight: MeshTypography.weights.semiBold,
    marginBottom: MeshSpacing.sm,
  },
  
  groupDescription: {
    fontSize: MeshTypography.sizes.body,
    textAlign: 'center',
    marginBottom: MeshSpacing.sm,
  },
  
  groupStats: {
    fontSize: MeshTypography.sizes.caption,
    textAlign: 'center',
  },
  
  participantsCard: {
    marginBottom: MeshSpacing.md,
  },
  
  sectionTitle: {
    fontSize: MeshTypography.sizes.h4,
    fontWeight: MeshTypography.weights.semiBold,
    marginBottom: MeshSpacing.md,
  },
  
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: MeshSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: getDynamicColor(MeshColors.neutrals.lightGrey, 0.5),
  },
  
  participantItemAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: MeshSpacing.md,
  },
  
  participantItemAvatarText: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.semiBold,
  },
  
  participantItemInfo: {
    flex: 1,
  },
  
  participantItemName: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.medium,
  },
  
  participantItemRole: {
    fontSize: MeshTypography.sizes.caption,
    marginTop: 2,
  },
  
  participantAction: {
    padding: MeshSpacing.sm,
  },
  
  participantsList: {
    paddingHorizontal: MeshSpacing.md,
  },
  
  participantCard: {
    marginVertical: MeshSpacing.xs,
  },
  
  participantCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  participantCardAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: MeshSpacing.md,
  },
  
  participantCardAvatarText: {
    fontSize: MeshTypography.sizes.h4,
    fontWeight: MeshTypography.weights.semiBold,
  },
  
  participantCardInfo: {
    flex: 1,
  },
  
  participantCardName: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.medium,
  },
  
  participantCardStatus: {
    fontSize: MeshTypography.sizes.caption,
    marginTop: 2,
  },
});

export default GroupQuantumChat;