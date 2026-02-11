import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import QuantumChatScreen from './Quantumchatscreen';

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Mock data for testing
  const mockContact = {
    id: params.contactId || '1',
    name: params.contactName || 'John Doe',
    status: 'Online',
  };

  const mockCurrentUser = {
    id: 'current-user',
    name: 'You',
  };

  const mockMessages = [
    {
      id: '1',
      text: 'Hello! How are you?',
      timestamp: Date.now() - 3600000,
      isOwn: false,
      type: 'text',
      status: 'read',
    },
    {
      id: '2',
      text: 'I\'m doing great, thanks for asking!',
      timestamp: Date.now() - 3300000,
      isOwn: true,
      type: 'text',
      status: 'read',
    },
    {
      id: '3',
      text: 'This is a test message to see the chat interface.',
      timestamp: Date.now() - 3000000,
      isOwn: false,
      type: 'text',
      status: 'read',
    },
  ];

  const handleSendMessage = async (message) => {
    console.log('Sending message:', message);
    // Add your message sending logic here
  };

  const handleVoiceMessage = async (audioUri) => {
    console.log('Sending voice message:', audioUri);
    // Add your voice message logic here
  };

  const handleMessageAction = (message, action) => {
    console.log('Message action:', action, message);
    // Add your message action logic here
  };

  return (
    <QuantumChatScreen
      route={{ params }}
      navigation={{
        goBack: () => router.back(),
        navigate: (screen, params) => router.push({ pathname: screen, params }),
      }}
      messages={mockMessages}
      contact={mockContact}
      currentUser={mockCurrentUser}
      onSendMessage={handleSendMessage}
      onVoiceMessage={handleVoiceMessage}
      onMessageAction={handleMessageAction}
    />
  );
}

