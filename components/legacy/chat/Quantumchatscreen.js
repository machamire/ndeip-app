/**
 * QuantumChatScreen - Revolutionary Chat Interface that feels like the future
 * Floating message bubbles, gesture recognition, mesh typing indicators
 * Voice waveform integration with real-time audio visualization
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// Audio functionality temporarily disabled - expo-av removed
import { PanGestureHandler, LongPressGestureHandler } from 'react-native-gesture-handler';

// Import our mesh components
import CrystallineMesh from '../../components/ndeip/CrystallineMesh';
import QuantumLoader from '../../components/ndeip/QuantumLoader';
import FloatingCard from '../../components/ui/FloatingCards';
import MeshTransition from '../../components/animations/MeshTransitions';
import { useMeshTheme, useMeshColors, useMeshAnimations } from '../../hooks/useMeshTheme';
import { generateUserMesh } from '../../utils/MeshGenerator';
import {
  MeshColors,
  MeshTypography,
  MeshSpacing,
  MeshBorderRadius,
  getDynamicColor,
} from '../../constants/ndeipBrandSystem';

// Get screen dimensions safely for web compatibility
const getScreenDimensions = () => {
  try {
    return Dimensions.get('window');
  } catch (e) {
    // Fallback for web or when Dimensions isn't ready
    return { width: 375, height: 667 };
  }
};

const { width: screenWidth, height: screenHeight } = getScreenDimensions();

const QuantumChatScreen = ({ 
  route, 
  navigation,
  messages: initialMessages = [],
  contact,
  currentUser,
  onSendMessage,
  onVoiceMessage,
  onMessageAction,
}) => {
  // Theme hooks
  const { theme, meshConfig } = useMeshTheme();
  const { colors } = useMeshColors();
  const { timing } = useMeshAnimations();

  // State management
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [contactTyping, setContactTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Animation refs
  const scrollViewRef = useRef(null);
  const inputAnimValue = useRef(new Animated.Value(0)).current;
  const sendButtonScale = useRef(new Animated.Value(1)).current;
  const messagesOpacity = useRef(new Animated.Value(0)).current;
  const voiceButtonScale = useRef(new Animated.Value(1)).current;

  // Voice recording refs
  const recordingTimer = useRef(null);

  // Initialize screen animation
  useEffect(() => {
    Animated.timing(messagesOpacity, {
      toValue: 1,
      duration: timing.normal,
      useNativeDriver: true,
    }).start();
  }, []);

  // Handle message sending
  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      timestamp: Date.now(),
      isOwn: true,
      type: 'text',
      status: 'sending',
    };

    // Animate send button
    Animated.sequence([
      Animated.timing(sendButtonScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(sendButtonScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Add message to local state
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsTyping(false);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Call parent handler
    if (onSendMessage) {
      try {
        await onSendMessage(newMessage);
        // Update message status to sent
        setMessages(prev =>
          prev.map(msg =>
            msg.id === newMessage.id
              ? { ...msg, status: 'sent' }
              : msg
          )
        );
      } catch (error) {
        // Update message status to failed
        setMessages(prev =>
          prev.map(msg =>
            msg.id === newMessage.id
              ? { ...msg, status: 'failed' }
              : msg
          )
        );
      }
    }
  }, [inputText, onSendMessage]);

  // Handle voice recording - temporarily disabled
  const startVoiceRecording = async () => {
    Alert.alert('Voice Recording', 'Voice recording is temporarily unavailable.');
  };

  const stopVoiceRecording = async () => {
    // Voice recording temporarily disabled
    setIsRecording(false);
    setRecordingDuration(0);
  };

  // Handle input text changes
  const handleTextChange = (text) => {
    setInputText(text);
    
    // Trigger typing indicator
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
    }
  };

  // Message swipe actions
  const handleMessageSwipe = (message, direction) => {
    if (direction === 'right') {
      // Reply to message
      setInputText(`Reply to: "${message.text?.substring(0, 30)}..."\n`);
    } else if (direction === 'left') {
      // Message actions
      if (onMessageAction) {
        onMessageAction(message, 'menu');
      }
    }
  };

  // Render individual message
  const renderMessage = ({ item: message, index }) => {
    return (
      <MessageBubble
        message={message}
        isOwn={message.isOwn}
        previousMessage={messages[index - 1]}
        nextMessage={messages[index + 1]}
        onSwipe={handleMessageSwipe}
        onLongPress={() => onMessageAction?.(message, 'longPress')}
        userMeshPattern={generateUserMesh(message.isOwn ? currentUser?.id : contact?.id)}
      />
    );
  };

  // Render typing indicator
  const renderTypingIndicator = () => {
    if (!contactTyping) return null;

    return (
      <View style={styles.typingContainer}>
        <FloatingCard
          variant="small"
          style={styles.typingCard}
          interactive={false}
        >
          <View style={styles.typingContent}>
            <Text style={[styles.typingText, { color: colors.textSecondary }]}>
              {contact?.name || 'Contact'} is typing
            </Text>
            <QuantumLoader
              type="dots"
              size="small"
              color={colors.primary}
              style={styles.typingLoader}
            />
          </View>
        </FloatingCard>
      </View>
    );
  };

  // Render voice recording overlay
  const renderVoiceRecording = () => {
    if (!isRecording) return null;

    return (
      <Animated.View style={[styles.voiceRecordingOverlay, { opacity: messagesOpacity }]}>
        <LinearGradient
          colors={[
            getDynamicColor(colors.primary, 0.9),
            getDynamicColor(colors.secondary, 0.8),
          ]}
          style={styles.voiceRecordingGradient}
        >
          <CrystallineMesh
            variant="medium"
            animated={true}
            intensity={0.3}
            color={colors.background}
          />
          
          <View style={styles.voiceRecordingContent}>
            <Animated.View style={[styles.voiceIcon, { transform: [{ scale: voiceButtonScale }] }]}>
              <MaterialIcons name="mic" size={48} color={colors.background} />
            </Animated.View>
            
            <Text style={[styles.voiceRecordingText, { color: colors.background }]}>
              Recording...
            </Text>
            
            <Text style={[styles.voiceRecordingDuration, { color: colors.background }]}>
              {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
            </Text>
            
            <TouchableOpacity
              style={styles.stopRecordingButton}
              onPress={stopVoiceRecording}
            >
              <MaterialIcons name="stop" size={32} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Mesh background */}
      <CrystallineMesh
        variant="small"
        animated={true}
        intensity={meshConfig.density * 0.3}
        color={getDynamicColor(colors.primary, 0.05)}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <ChatHeader
        contact={contact}
        navigation={navigation}
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
        
        {renderTypingIndicator()}
      </Animated.View>

      {/* Input area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <ChatInput
          value={inputText}
          onChangeText={handleTextChange}
          onSend={handleSendMessage}
          onStartVoiceRecording={startVoiceRecording}
          onStopVoiceRecording={stopVoiceRecording}
          isRecording={isRecording}
          colors={colors}
          timing={timing}
        />
      </KeyboardAvoidingView>

      {/* Voice recording overlay */}
      {renderVoiceRecording()}
    </SafeAreaView>
  );
};

// Chat header component
const ChatHeader = ({ contact, navigation, colors }) => (
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
        style={styles.contactInfo}
        onPress={() => navigation.navigate('ContactProfile', { contact })}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.background }]}>
            {contact?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        
        <View style={styles.contactDetails}>
          <Text style={[styles.contactName, { color: colors.text }]}>
            {contact?.name || 'Unknown Contact'}
          </Text>
          <Text style={[styles.contactStatus, { color: colors.textSecondary }]}>
            {contact?.status || 'Online'}
          </Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="videocam" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="call" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  </FloatingCard>
);

// Message bubble component
const MessageBubble = ({ 
  message, 
  isOwn, 
  previousMessage, 
  nextMessage, 
  onSwipe, 
  onLongPress,
  userMeshPattern,
}) => {
  const { colors } = useMeshColors();
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const handleSwipeGesture = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const handleSwipeEnd = ({ nativeEvent }) => {
    const { translationX, velocityX } = nativeEvent;
    
    if (Math.abs(translationX) > 50 || Math.abs(velocityX) > 500) {
      const direction = translationX > 0 ? 'right' : 'left';
      onSwipe(message, direction);
    }
    
    // Reset position
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleLongPress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onLongPress(message);
    });
  };

  // Check if message should be grouped
  const isGrouped = previousMessage?.isOwn === isOwn && 
    (message.timestamp - previousMessage?.timestamp) < 60000; // 1 minute

  const bubbleStyle = [
    styles.messageBubble,
    isOwn ? styles.ownBubble : styles.otherBubble,
    isGrouped && styles.groupedBubble,
    {
      backgroundColor: isOwn ? colors.primary : colors.surface,
      transform: [{ translateX }, { scale }],
    },
  ];

  const textStyle = [
    styles.messageText,
    { color: isOwn ? colors.background : colors.text },
  ];

  return (
    <PanGestureHandler
      onGestureEvent={handleSwipeGesture}
      onHandlerStateChange={({ nativeEvent }) => {
        if (nativeEvent.state === 5) handleSwipeEnd({ nativeEvent });
      }}
    >
      <LongPressGestureHandler onActivated={handleLongPress}>
        <Animated.View style={[styles.messageContainer, isOwn && styles.ownMessageContainer]}>
          <FloatingCard
            variant="small"
            style={bubbleStyle}
            interactive={false}
            meshOverlay={!isOwn}
            backgroundColor={isOwn ? colors.primary : colors.surface}
          >
            {message.type === 'text' ? (
              <Text style={textStyle}>{message.text}</Text>
            ) : message.type === 'voice' ? (
              <VoiceMessageBubble message={message} colors={colors} />
            ) : null}
            
            <View style={styles.messageFooter}>
              <Text style={[styles.messageTime, { color: isOwn ? colors.background : colors.textSecondary }]}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              
              {isOwn && (
                <View style={styles.messageStatus}>
                  {message.status === 'sending' && (
                    <QuantumLoader type="dots" size="small" color={colors.background} />
                  )}
                  {message.status === 'sent' && (
                    <Ionicons name="checkmark" size={14} color={colors.background} />
                  )}
                  {message.status === 'delivered' && (
                    <Ionicons name="checkmark-done" size={14} color={colors.background} />
                  )}
                  {message.status === 'read' && (
                    <Ionicons name="checkmark-done" size={14} color={colors.accent} />
                  )}
                  {message.status === 'failed' && (
                    <Ionicons name="alert-circle" size={14} color={colors.accents.mutedRed} />
                  )}
                </View>
              )}
            </View>
          </FloatingCard>
        </Animated.View>
      </LongPressGestureHandler>
    </PanGestureHandler>
  );
};

// Voice message bubble component
const VoiceMessageBubble = ({ message, colors }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [position, setPosition] = useState(0);
  const playButtonScale = useRef(new Animated.Value(1)).current;

  const handlePlayPause = async () => {
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

    // Audio playback temporarily disabled
    Alert.alert('Voice Playback', 'Voice message playback is temporarily unavailable.');
  };

  // Audio cleanup disabled temporarily

  const formatDuration = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.voiceMessageContainer}>
      <Animated.View style={[styles.playButton, { transform: [{ scale: playButtonScale }] }]}>
        <TouchableOpacity onPress={handlePlayPause}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={20}
            color={colors.background}
          />
        </TouchableOpacity>
      </Animated.View>
      
      <View style={styles.voiceWaveform}>
        {/* Simplified waveform visualization */}
        {[...Array(20)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.waveformBar,
              {
                height: 4 + Math.random() * 16,
                backgroundColor: colors.background,
                opacity: (position / (message.duration * 1000)) > (index / 20) ? 1 : 0.3,
              },
            ]}
          />
        ))}
      </View>
      
      <Text style={[styles.voiceDuration, { color: colors.background }]}>
        {formatDuration(position)} / {formatDuration(message.duration * 1000)}
      </Text>
    </View>
  );
};

// Chat input component
const ChatInput = ({ 
  value, 
  onChangeText, 
  onSend, 
  onStartVoiceRecording, 
  onStopVoiceRecording,
  isRecording,
  colors,
  timing,
}) => {
  const sendButtonOpacity = useRef(new Animated.Value(value ? 1 : 0)).current;
  const voiceButtonOpacity = useRef(new Animated.Value(value ? 0 : 1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(sendButtonOpacity, {
        toValue: value ? 1 : 0,
        duration: timing.fast,
        useNativeDriver: true,
      }),
      Animated.timing(voiceButtonOpacity, {
        toValue: value ? 0 : 1,
        duration: timing.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, [value]);

  return (
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
          placeholder="Type a message..."
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={1000}
        />
        
        <Animated.View style={[styles.actionButton, { opacity: voiceButtonOpacity }]}>
          <TouchableOpacity
            onPressIn={onStartVoiceRecording}
            onPressOut={onStopVoiceRecording}
            style={[styles.voiceButton, { backgroundColor: colors.primary }]}
          >
            <MaterialIcons name="mic" size={24} color={colors.background} />
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={[styles.actionButton, { opacity: sendButtonOpacity }]}>
          <TouchableOpacity
            onPress={onSend}
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
            disabled={!value.trim()}
          >
            <Ionicons name="send" size={20} color={colors.background} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </FloatingCard>
  );
};

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
  
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: MeshSpacing.sm,
  },
  
  avatarText: {
    fontSize: MeshTypography.sizes.h4,
    fontWeight: MeshTypography.weights.semiBold,
  },
  
  contactDetails: {
    flex: 1,
  },
  
  contactName: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.semiBold,
  },
  
  contactStatus: {
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
  
  messageContainer: {
    marginVertical: MeshSpacing.xs,
    maxWidth: screenWidth * 0.8,
  },
  
  ownMessageContainer: {
    alignSelf: 'flex-end',
    marginLeft: screenWidth * 0.2,
  },
  
  messageBubble: {
    borderRadius: MeshBorderRadius.components.messageBubble,
    paddingHorizontal: MeshSpacing.md,
    paddingVertical: MeshSpacing.sm,
  },
  
  ownBubble: {
    borderBottomRightRadius: MeshBorderRadius.xs,
  },
  
  otherBubble: {
    borderBottomLeftRadius: MeshBorderRadius.xs,
  },
  
  groupedBubble: {
    marginTop: MeshSpacing.xs / 2,
  },
  
  messageText: {
    fontSize: MeshTypography.sizes.body,
    lineHeight: MeshTypography.lineHeights.normal * MeshTypography.sizes.body,
  },
  
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: MeshSpacing.xs,
  },
  
  messageTime: {
    fontSize: MeshTypography.sizes.caption,
    marginRight: MeshSpacing.xs,
  },
  
  messageStatus: {
    marginLeft: MeshSpacing.xs,
  },
  
  voiceMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
  },
  
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: MeshSpacing.sm,
  },
  
  voiceWaveform: {
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
    minWidth: 50,
  },
  
  typingContainer: {
    paddingVertical: MeshSpacing.sm,
  },
  
  typingCard: {
    alignSelf: 'flex-start',
    maxWidth: screenWidth * 0.6,
  },
  
  typingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  typingText: {
    fontSize: MeshTypography.sizes.bodySmall,
    marginRight: MeshSpacing.sm,
  },
  
  typingLoader: {
    marginLeft: MeshSpacing.xs,
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
    marginBottom: MeshSpacing.xs,
  },
  
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  voiceRecordingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  
  voiceRecordingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  voiceRecordingContent: {
    alignItems: 'center',
  },
  
  voiceIcon: {
    marginBottom: MeshSpacing.lg,
  },
  
  voiceRecordingText: {
    fontSize: MeshTypography.sizes.h3,
    fontWeight: MeshTypography.weights.semiBold,
    marginBottom: MeshSpacing.sm,
  },
  
  voiceRecordingDuration: {
    fontSize: MeshTypography.sizes.h2,
    fontWeight: MeshTypography.weights.bold,
    marginBottom: MeshSpacing.xl,
  },
  
  stopRecordingButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QuantumChatScreen;
