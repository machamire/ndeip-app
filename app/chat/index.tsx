import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';

// ─── Mock Messages ────────────────────────────────────────
const MESSAGES = [
  { id: '1', text: 'Hey! Are you coming to the village meeting tonight?', sent: false, time: '2:30 PM', status: 'read' },
  { id: '2', text: 'Yes! Wouldn\'t miss it 🎉', sent: true, time: '2:31 PM', status: 'read' },
  { id: '3', text: 'Great! I\'ll save you a seat', sent: false, time: '2:31 PM', status: 'read' },
  { id: '4', text: 'Should I bring anything?', sent: true, time: '2:32 PM', status: 'read' },
  { id: '5', text: 'Just your amazing self 😊\nOh and maybe some snacks if you can', sent: false, time: '2:33 PM', status: 'read' },
  { id: '6', text: 'Haha deal! I\'ll grab some from the store', sent: true, time: '2:34 PM', status: 'delivered' },
  { id: '7', text: 'You\'re the best! See you at 7 🙌', sent: false, time: '2:35 PM', status: 'read' },
  { id: '8', text: 'See you there! 🤗', sent: true, time: '2:36 PM', status: 'sent' },
];

// ─── Message Bubble ───────────────────────────────────────
function MessageBubble({ message, isDark, isFirst, isLast }: { message: any; isDark: boolean; isFirst: boolean; isLast: boolean }) {
  const sent = message.sent;

  const bubbleRadius = sent
    ? { borderTopLeftRadius: 20, borderTopRightRadius: isFirst ? 20 : 8, borderBottomLeftRadius: 20, borderBottomRightRadius: isLast ? 6 : 8 }
    : { borderTopLeftRadius: isFirst ? 20 : 8, borderTopRightRadius: 20, borderBottomLeftRadius: isLast ? 6 : 8, borderBottomRightRadius: 20 };

  const statusIcon = message.status === 'read' ? 'check' : message.status === 'delivered' ? 'check' : 'check';
  const statusColor = message.status === 'read' ? NDEIP_COLORS.electricBlue : 'rgba(255,255,255,0.4)';

  return (
    <View style={[styles.bubbleRow, sent && styles.bubbleRowSent]}>
      <View style={{ maxWidth: '75%' }}>
        {sent ? (
          <LinearGradient
            colors={NDEIP_COLORS.gradients.sentBubble as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.bubbleSent, bubbleRadius]}
          >
            <Text style={styles.bubbleTextSent}>{message.text}</Text>
            <View style={styles.bubbleMeta}>
              <Text style={styles.bubbleTimeSent}>{message.time}</Text>
              <View style={styles.statusIcons}>
                <FontAwesome name="check" size={9} color={statusColor} />
                {(message.status === 'read' || message.status === 'delivered') && (
                  <FontAwesome name="check" size={9} color={statusColor} style={{ marginLeft: -4 }} />
                )}
              </View>
            </View>
          </LinearGradient>
        ) : (
          <View style={[
            styles.bubble,
            styles.bubbleReceived,
            bubbleRadius,
            { backgroundColor: isDark ? NDEIP_COLORS.gray[800] : NDEIP_COLORS.gray[100] },
          ]}>
            <Text style={[styles.bubbleTextReceived, { color: isDark ? '#F0F4F3' : NDEIP_COLORS.gray[900] }]}>
              {message.text}
            </Text>
            <Text style={[styles.bubbleTimeReceived, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>
              {message.time}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function ChatDetailScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const params = useLocalSearchParams();
  const [inputText, setInputText] = useState('');
  const contactName = (params.name as string) || 'Sarah Chen';

  const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];
  const initials = contactName.split(' ').map((n: string) => n[0]).join('').slice(0, 2);

  // Group consecutive messages from same sender
  const getGroupInfo = (index: number) => {
    const msg = MESSAGES[index];
    const prev = index > 0 ? MESSAGES[index - 1] : null;
    const next = index < MESSAGES.length - 1 ? MESSAGES[index + 1] : null;
    const isFirst = !prev || prev.sent !== msg.sent;
    const isLast = !next || next.sent !== msg.sent;
    return { isFirst, isLast };
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* ─── Header ─── */}
      <View style={[styles.header, {
        backgroundColor: isDark ? 'rgba(10,15,14,0.92)' : 'rgba(248,250,250,0.92)',
        borderBottomColor: isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle,
      }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <FontAwesome name="arrow-left" size={18} color={colors.text} />
        </TouchableOpacity>
        <LinearGradient
          colors={[NDEIP_COLORS.primaryTeal, NDEIP_COLORS.electricBlue] as any}
          style={styles.headerAvatar}
        >
          <Text style={styles.headerAvatarText}>{initials}</Text>
        </LinearGradient>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: colors.text }]}>{contactName}</Text>
          <Text style={[styles.headerStatus, { color: NDEIP_COLORS.emerald }]}>Online</Text>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <FontAwesome name="phone" size={18} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAction}>
          <FontAwesome name="video-camera" size={16} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* ─── Messages ─── */}
      <ScrollView
        style={styles.messagesArea}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {MESSAGES.map((msg, i) => {
          const { isFirst, isLast } = getGroupInfo(i);
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isDark={isDark}
              isFirst={isFirst}
              isLast={isLast}
            />
          );
        })}
      </ScrollView>

      {/* ─── Input Area ─── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.inputArea, {
          backgroundColor: isDark ? 'rgba(10,15,14,0.92)' : 'rgba(248,250,250,0.92)',
          borderTopColor: isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle,
        }]}>
          <TouchableOpacity style={styles.inputAction}>
            <FontAwesome name="plus" size={20} color={NDEIP_COLORS.gray[500]} />
          </TouchableOpacity>
          <View style={[styles.inputWrap, {
            backgroundColor: isDark ? Glass.dark.background : Glass.light.background,
          }]}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor={NDEIP_COLORS.gray[500]}
              style={[styles.textInput, { color: colors.text }]}
              multiline
            />
            <TouchableOpacity>
              <FontAwesome name="smile-o" size={20} color={NDEIP_COLORS.gray[500]} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity activeOpacity={0.85}>
            <LinearGradient
              colors={NDEIP_COLORS.gradients.brand as any}
              style={styles.sendBtn}
            >
              <FontAwesome
                name={inputText.length > 0 ? 'send' : 'microphone'}
                size={inputText.length > 0 ? 16 : 20}
                color="#fff"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: 12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  headerBack: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerAvatarText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '600' },
  headerStatus: { fontSize: 12, fontWeight: '500' },
  headerAction: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  // Messages
  messagesArea: { flex: 1 },
  messagesContent: { paddingHorizontal: 12, paddingVertical: 16, gap: 3 },
  // Bubbles
  bubbleRow: { flexDirection: 'row', marginBottom: 1 },
  bubbleRowSent: { justifyContent: 'flex-end' },
  bubble: { paddingHorizontal: 14, paddingVertical: 10 },
  bubbleSent: {},
  bubbleReceived: {},
  bubbleTextSent: { color: '#fff', fontSize: 15, lineHeight: 21 },
  bubbleTextReceived: { fontSize: 15, lineHeight: 21 },
  bubbleMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, gap: 4 },
  bubbleTimeSent: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
  bubbleTimeReceived: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  statusIcons: { flexDirection: 'row', alignItems: 'center' },
  // Input Area
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  inputAction: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 120,
    gap: 8,
  },
  textInput: { flex: 1, fontSize: 15, maxHeight: 100, paddingTop: 2 },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
