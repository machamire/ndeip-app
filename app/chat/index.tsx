import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Typography, Spacing, Radii, Glass } from '@/constants/ndeipBrandSystem';

// ─── Types ────────────────────────────────────────────────
type MessageType = 'text' | 'voice' | 'video' | 'viewonce';
interface ChatMessage {
    id: string;
    text?: string;
    sent: boolean;
    time: string;
    status: string;
    type: MessageType;
    ephemeral?: boolean;
    duration?: number;
    consumed?: boolean;
    kept?: boolean;
    caption?: string;
    viewOnceViewed?: boolean;
    scheduled?: boolean;
    scheduledTime?: string;
}

// ─── Quick Phrases Data ───────────────────────────────────
const LANGUAGE_PAIRS = [
    { id: 'sn', label: 'Shona \u2192 English' },
    { id: 'nd', label: 'Ndebele \u2192 English' },
];

const QUICK_PHRASES: Record<string, { category: string; phrases: { original: string; translated: string }[] }[]> = {
    sn: [
        {
            category: '\ud83d\udc4b Greetings',
            phrases: [
                { original: 'Makadii', translated: 'Hello, how are you?' },
                { original: 'Ndiripo kana makadiiwo', translated: 'I am fine if you are fine too' },
                { original: 'Mangwanani', translated: 'Good morning' },
                { original: 'Masikati', translated: 'Good afternoon' },
                { original: 'Manheru', translated: 'Good evening' },
            ],
        },
        {
            category: '\ud83c\udfe0 Family',
            phrases: [
                { original: 'Mhuri yese iripo?', translated: 'Is the whole family well?' },
                { original: 'Vana vakadii?', translated: 'How are the children?' },
                { original: 'Amai vangu', translated: 'My mother' },
                { original: 'Baba vangu', translated: 'My father' },
            ],
        },
        {
            category: '\ud83d\udcb0 Money',
            phrases: [
                { original: 'Zvakawanda sei?', translated: 'How much is it?' },
                { original: 'Ndinokutumira mari', translated: 'I will send you money' },
                { original: 'Maita basa', translated: 'Thank you (for the work)' },
                { original: 'Handina mari', translated: "I don't have money" },
            ],
        },
        {
            category: '\u2708\ufe0f Travel',
            phrases: [
                { original: 'Ndiri kumba', translated: 'I am at home' },
                { original: 'Ndiri panzira', translated: 'I am on my way' },
                { original: 'Ndakasvika', translated: 'I have arrived' },
                { original: 'Tichazoonana', translated: 'We will see each other' },
            ],
        },
        {
            category: '\ud83d\udcbc Work',
            phrases: [
                { original: 'Ndiri kubasa', translated: 'I am at work' },
                { original: 'Ndichadzoka', translated: 'I will come back' },
                { original: 'Pane basa rakawanda', translated: 'There is a lot of work' },
            ],
        },
    ],
    nd: [
        {
            category: '\ud83d\udc4b Greetings',
            phrases: [
                { original: 'Salibonani', translated: 'Hello (to many)' },
                { original: 'Sawubona', translated: 'Hello (to one)' },
                { original: 'Kuhle', translated: 'It is fine / I am well' },
                { original: 'Linjani?', translated: 'How are you (plural)?' },
                { original: 'Unjani?', translated: 'How are you (singular)?' },
            ],
        },
        {
            category: '\ud83c\udfe0 Family',
            phrases: [
                { original: 'Imuli yonke iyaphila?', translated: 'Is the whole family well?' },
                { original: 'Abantwana banjani?', translated: 'How are the children?' },
                { original: 'Umama wami', translated: 'My mother' },
                { original: 'Ubaba wami', translated: 'My father' },
            ],
        },
        {
            category: '\ud83d\udcb0 Money',
            phrases: [
                { original: 'Malini?', translated: 'How much?' },
                { original: 'Ngizakuthumela imali', translated: 'I will send you money' },
                { original: 'Ngiyabonga', translated: 'Thank you' },
                { original: 'Angilayo imali', translated: "I don't have money" },
            ],
        },
        {
            category: '\u2708\ufe0f Travel',
            phrases: [
                { original: 'Ngisekhaya', translated: 'I am at home' },
                { original: 'Ngisendleleni', translated: 'I am on my way' },
                { original: 'Sengifikile', translated: 'I have arrived' },
                { original: 'Sizabonana', translated: 'We will see each other' },
            ],
        },
        {
            category: '\ud83d\udcbc Work',
            phrases: [
                { original: 'Ngisemsebenzini', translated: 'I am at work' },
                { original: 'Ngizabuya', translated: 'I will come back' },
                { original: 'Kulomsebenzi omunengi', translated: 'There is a lot of work' },
            ],
        },
    ],
};

// ─── Mock Messages ────────────────────────────────────────
const INITIAL_MESSAGES: ChatMessage[] = [
    { id: '1', text: 'Hey! Are you coming to the village meeting tonight?', sent: false, time: '2:30 PM', status: 'read', type: 'text' },
    { id: '2', text: "Yes! Wouldn't miss it \ud83c\udf89", sent: true, time: '2:31 PM', status: 'read', type: 'text' },
    { id: '3', text: "Great! I'll save you a seat", sent: false, time: '2:31 PM', status: 'read', type: 'text' },
    { id: '4', sent: false, time: '2:32 PM', status: 'read', type: 'voice', ephemeral: true, duration: 12, caption: 'Directions to the venue' },
    { id: '5', text: 'Should I bring anything?', sent: true, time: '2:32 PM', status: 'read', type: 'text' },
    { id: '6', text: "Just your amazing self \ud83d\ude0a\nOh and maybe some snacks if you can", sent: false, time: '2:33 PM', status: 'read', type: 'text' },
    { id: '7', sent: true, time: '2:34 PM', status: 'delivered', type: 'voice', ephemeral: true, duration: 8 },
    { id: '8', text: "Haha deal! I'll grab some from the store", sent: true, time: '2:34 PM', status: 'delivered', type: 'text' },
    { id: '9', sent: false, time: '2:35 PM', status: 'read', type: 'viewonce', duration: 15 },
    { id: '10', text: 'See you there! \ud83e\udd17', sent: true, time: '2:36 PM', status: 'sent', type: 'text' },
];

// ─── View-Once Bubble ─────────────────────────────────────
function ViewOnceBubble({ message, isDark, sent, bubbleRadius }: {
    message: ChatMessage; isDark: boolean; sent: boolean; bubbleRadius: any;
}) {
    const [revealed, setRevealed] = useState(false);
    const viewed = message.viewOnceViewed || false;

    if (viewed) {
        return (
            <View style={[styles.bubbleRow, sent && styles.bubbleRowSent]}>
                <View style={[styles.bubble, bubbleRadius, {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    paddingHorizontal: 16, paddingVertical: 12,
                    flexDirection: 'row', alignItems: 'center', gap: 8,
                }]}>
                    <FontAwesome name="eye-slash" size={14} color={NDEIP_COLORS.gray[500]} />
                    <Text style={{ color: NDEIP_COLORS.gray[500], fontSize: 13, fontStyle: 'italic' }}>
                        View once media · Viewed
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.bubbleRow, sent && styles.bubbleRowSent]}>
            <TouchableOpacity
                onPress={() => setRevealed(!revealed)}
                activeOpacity={0.8}
                style={{ maxWidth: '75%' }}
            >
                <View style={[styles.bubble, bubbleRadius, {
                    backgroundColor: isDark ? NDEIP_COLORS.gray[800] : NDEIP_COLORS.gray[100],
                    paddingHorizontal: 16, paddingVertical: 14,
                    alignItems: 'center', minWidth: 200,
                }]}>
                    {!revealed ? (
                        <View style={{ alignItems: 'center', gap: 8 }}>
                            <View style={{
                                width: 48, height: 48, borderRadius: 24,
                                backgroundColor: 'rgba(16,185,129,0.12)',
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <FontAwesome name="photo" size={22} color={NDEIP_COLORS.emerald} />
                            </View>
                            <Text style={{ color: isDark ? '#F0F4F3' : NDEIP_COLORS.gray[900], fontSize: 14, fontWeight: '600' }}>
                                View Once Photo
                            </Text>
                            <Text style={{ color: NDEIP_COLORS.gray[500], fontSize: 11 }}>
                                Tap to reveal · Disappears after closing
                            </Text>
                        </View>
                    ) : (
                        <View style={{ alignItems: 'center', gap: 8 }}>
                            <View style={{
                                width: '100%' as any, height: 160, borderRadius: 12,
                                backgroundColor: 'rgba(27,77,62,0.15)',
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <FontAwesome name="image" size={40} color={NDEIP_COLORS.primaryTeal} />
                                <Text style={{ color: NDEIP_COLORS.primaryTeal, fontSize: 12, marginTop: 8 }}>Media placeholder</Text>
                            </View>
                            <Text style={{ color: NDEIP_COLORS.gray[500], fontSize: 10 }}>
                                Tap again to close · Cannot be reopened
                            </Text>
                        </View>
                    )}
                    <Text style={[styles.bubbleTimeReceived, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400], marginTop: 6 }]}>
                        {message.time}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

// ─── Message Bubble ───────────────────────────────────────
function MessageBubble({ message, isDark, isFirst, isLast, onConsume, onKeep }: {
    message: ChatMessage; isDark: boolean; isFirst: boolean; isLast: boolean;
    onConsume: (id: string) => void; onKeep: (id: string) => void;
}) {
    const sent = message.sent;
    const statusColor = message.status === 'read' ? NDEIP_COLORS.electricBlue : 'rgba(255,255,255,0.4)';
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    const handlePlay = useCallback(() => {
        if (message.consumed || message.kept) return;
        setPlaying(true);
        const dur = (message.duration || 5) * 1000;
        const interval = 100;
        let elapsed = 0;
        const timer = setInterval(() => {
            elapsed += interval;
            setProgress(Math.min(elapsed / dur, 1));
            if (elapsed >= dur) {
                clearInterval(timer);
                setPlaying(false);
                if (!message.kept) onConsume(message.id);
            }
        }, interval);
    }, [message, onConsume]);

    const bubbleRadius = sent
        ? { borderTopLeftRadius: 20, borderTopRightRadius: isFirst ? 20 : 8, borderBottomLeftRadius: 20, borderBottomRightRadius: isLast ? 6 : 8 }
        : { borderTopLeftRadius: isFirst ? 20 : 8, borderTopRightRadius: 20, borderBottomLeftRadius: isLast ? 6 : 8, borderBottomRightRadius: 20 };

    // View-once media
    if (message.type === 'viewonce') {
        return <ViewOnceBubble message={message} isDark={isDark} sent={sent} bubbleRadius={bubbleRadius} />;
    }

    // Ephemeral voice/video bubble
    if (message.type === 'voice' || message.type === 'video') {
        const isVoice = message.type === 'voice';
        const icon = isVoice ? 'microphone' : 'play-circle';
        const label = isVoice ? 'Voice Note' : 'Video Message';
        const epLabel = message.ephemeral ? ' · Plays once' : '';

        return (
            <View style={[styles.bubbleRow, sent && styles.bubbleRowSent]}>
                <View style={{ maxWidth: '75%' }}>
                    {sent ? (
                        <LinearGradient
                            colors={NDEIP_COLORS.gradients.sentBubble as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.bubble, styles.bubbleSent, bubbleRadius, { minWidth: 180 }]}
                        >
                            <View style={styles.mediaRow}>
                                <TouchableOpacity onPress={handlePlay} disabled={playing || message.consumed}>
                                    <FontAwesome name={playing ? 'pause' : icon} size={20} color="#fff" />
                                </TouchableOpacity>
                                <View style={styles.mediaInfo}>
                                    <Text style={styles.bubbleTextSent}>{label}{epLabel}</Text>
                                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
                                        {message.duration}s
                                    </Text>
                                </View>
                            </View>
                            {isVoice && message.caption && (
                                <View style={{ marginTop: 6, paddingTop: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.15)' }}>
                                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontStyle: 'italic' }}>
                                        \ud83d\udcdd {message.caption}
                                    </Text>
                                </View>
                            )}
                            {(playing || progress > 0) && (
                                <View style={styles.progressTrack}>
                                    <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
                                </View>
                            )}
                            {message.ephemeral && playing && !message.kept && (
                                <TouchableOpacity style={styles.keepButton} onPress={() => onKeep(message.id)}>
                                    <FontAwesome name="bookmark" size={11} color="#fff" />
                                    <Text style={styles.keepText}>Keep</Text>
                                </TouchableOpacity>
                            )}
                            <View style={styles.bubbleMeta}>
                                <Text style={styles.bubbleTimeSent}>{message.time}</Text>
                            </View>
                        </LinearGradient>
                    ) : (
                        <View style={[
                            styles.bubble, styles.bubbleReceived, bubbleRadius,
                            { backgroundColor: isDark ? NDEIP_COLORS.gray[800] : NDEIP_COLORS.gray[100], minWidth: 180 },
                        ]}>
                            <View style={styles.mediaRow}>
                                <TouchableOpacity onPress={handlePlay} disabled={playing || message.consumed}>
                                    <FontAwesome name={playing ? 'pause' : icon} size={20} color={isDark ? '#F0F4F3' : NDEIP_COLORS.gray[900]} />
                                </TouchableOpacity>
                                <View style={styles.mediaInfo}>
                                    <Text style={[styles.bubbleTextReceived, { color: isDark ? '#F0F4F3' : NDEIP_COLORS.gray[900] }]}>{label}{epLabel}</Text>
                                    <Text style={{ color: NDEIP_COLORS.gray[500], fontSize: 11 }}>{message.duration}s</Text>
                                </View>
                            </View>
                            {isVoice && message.caption && (
                                <View style={{ marginTop: 6, paddingTop: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                                    <Text style={{ color: isDark ? NDEIP_COLORS.gray[400] : NDEIP_COLORS.gray[600], fontSize: 12, fontStyle: 'italic' }}>
                                        \ud83d\udcdd {message.caption}
                                    </Text>
                                </View>
                            )}
                            {(playing || progress > 0) && (
                                <View style={[styles.progressTrack, { backgroundColor: 'rgba(0,0,0,0.1)' }]}>
                                    <View style={[styles.progressFill, { width: `${progress * 100}%` as any, backgroundColor: NDEIP_COLORS.primaryTeal }]} />
                                </View>
                            )}
                            {message.ephemeral && playing && !message.kept && (
                                <TouchableOpacity
                                    style={[styles.keepButton, { backgroundColor: 'rgba(27,77,62,0.2)' }]}
                                    onPress={() => onKeep(message.id)}
                                >
                                    <FontAwesome name="bookmark" size={11} color={NDEIP_COLORS.primaryTeal} />
                                    <Text style={[styles.keepText, { color: NDEIP_COLORS.primaryTeal }]}>Keep</Text>
                                </TouchableOpacity>
                            )}
                            <Text style={[styles.bubbleTimeReceived, { color: isDark ? NDEIP_COLORS.gray[500] : NDEIP_COLORS.gray[400] }]}>
                                {message.time}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        );
    }

    // Scheduled message indicator
    if (message.scheduled) {
        return (
            <View style={[styles.bubbleRow, styles.bubbleRowSent]}>
                <View style={{ maxWidth: '75%' }}>
                    <View style={[styles.bubble, bubbleRadius, {
                        backgroundColor: isDark ? 'rgba(37,99,235,0.12)' : 'rgba(37,99,235,0.08)',
                        borderWidth: 1, borderColor: 'rgba(37,99,235,0.2)',
                        borderStyle: 'dashed' as any,
                    }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <FontAwesome name="clock-o" size={12} color={NDEIP_COLORS.electricBlue} />
                            <Text style={{ color: NDEIP_COLORS.electricBlue, fontSize: 11, fontWeight: '600' }}>
                                Scheduled · {message.scheduledTime}
                            </Text>
                        </View>
                        <Text style={{ color: isDark ? '#F0F4F3' : NDEIP_COLORS.gray[900], fontSize: 15, lineHeight: 21 }}>
                            {message.text}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    // Standard text bubble
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
                        styles.bubble, styles.bubbleReceived, bubbleRadius,
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

// ─── Quick Phrases Modal ──────────────────────────────────
function QuickPhrasesModal({ visible, onClose, onSelect, isDark }: {
    visible: boolean; onClose: () => void;
    onSelect: (original: string, translated: string) => void;
    isDark: boolean;
}) {
    const [activeLang, setActiveLang] = useState('sn');
    const phrases = QUICK_PHRASES[activeLang] || [];

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, {
                    backgroundColor: isDark ? NDEIP_COLORS.gray[900] : '#fff',
                }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: isDark ? '#F0F4F3' : NDEIP_COLORS.gray[900] }]}>
                            Quick Phrases
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <FontAwesome name="times" size={20} color={NDEIP_COLORS.gray[500]} />
                        </TouchableOpacity>
                    </View>

                    {/* Language Toggle */}
                    <View style={styles.langToggle}>
                        {LANGUAGE_PAIRS.map(lp => (
                            <TouchableOpacity
                                key={lp.id}
                                onPress={() => setActiveLang(lp.id)}
                                style={[styles.langBtn, activeLang === lp.id && {
                                    backgroundColor: isDark ? 'rgba(27,77,62,0.2)' : 'rgba(27,77,62,0.1)',
                                }]}
                            >
                                <Text style={[
                                    styles.langBtnText,
                                    { color: activeLang === lp.id ? NDEIP_COLORS.primaryTeal : NDEIP_COLORS.gray[500] },
                                ]}>{lp.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                        {phrases.map((group, gi) => (
                            <View key={gi} style={{ marginBottom: 16 }}>
                                <Text style={[styles.phraseCategoryLabel, { color: isDark ? NDEIP_COLORS.gray[400] : NDEIP_COLORS.gray[500] }]}>
                                    {group.category}
                                </Text>
                                {group.phrases.map((p, pi) => (
                                    <TouchableOpacity
                                        key={pi}
                                        style={[styles.phraseRow, {
                                            backgroundColor: isDark ? Glass.dark.background : Glass.light.background,
                                            borderColor: isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle,
                                        }]}
                                        onPress={() => onSelect(p.original, p.translated)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.phraseOriginal, { color: isDark ? '#F0F4F3' : NDEIP_COLORS.gray[900] }]}>
                                            {p.original}
                                        </Text>
                                        <Text style={[styles.phraseTranslated, { color: NDEIP_COLORS.gray[500] }]}>
                                            {p.translated}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

// ─── Schedule Picker Modal ────────────────────────────────
function ScheduleModal({ visible, onClose, onSchedule, isDark }: {
    visible: boolean; onClose: () => void;
    onSchedule: (timeLabel: string) => void;
    isDark: boolean;
}) {
    const scheduleOptions = [
        { label: 'In 30 minutes', value: '30m' },
        { label: 'In 1 hour', value: '1h' },
        { label: 'In 2 hours', value: '2h' },
        { label: 'Tomorrow morning (9 AM)', value: 'tomorrow_9am' },
        { label: 'Tomorrow evening (6 PM)', value: 'tomorrow_6pm' },
        { label: 'This weekend (Sat 10 AM)', value: 'weekend' },
    ];

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, {
                    backgroundColor: isDark ? NDEIP_COLORS.gray[900] : '#fff',
                    maxHeight: 400,
                }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: isDark ? '#F0F4F3' : NDEIP_COLORS.gray[900] }]}>
                            Schedule Message
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <FontAwesome name="times" size={20} color={NDEIP_COLORS.gray[500]} />
                        </TouchableOpacity>
                    </View>
                    <Text style={{ color: NDEIP_COLORS.gray[500], fontSize: 12, marginBottom: 16, paddingHorizontal: 4 }}>
                        Message will be sent when your phone is online and the app is open.
                    </Text>
                    {scheduleOptions.map((opt, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[styles.scheduleOption, {
                                backgroundColor: isDark ? Glass.dark.background : Glass.light.background,
                                borderColor: isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle,
                            }]}
                            onPress={() => onSchedule(opt.label)}
                            activeOpacity={0.7}
                        >
                            <FontAwesome name="clock-o" size={16} color={NDEIP_COLORS.electricBlue} />
                            <Text style={{ color: isDark ? '#F0F4F3' : NDEIP_COLORS.gray[900], fontSize: 15, flex: 1 }}>
                                {opt.label}
                            </Text>
                            <FontAwesome name="chevron-right" size={10} color={NDEIP_COLORS.gray[600]} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Modal>
    );
}

// ─── Main Chat Screen ─────────────────────────────────────
export default function ChatDetailScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const router = useRouter();
    const params = useLocalSearchParams();
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES.filter(m => !m.consumed));
    const [showPhrases, setShowPhrases] = useState(false);
    const [showSchedule, setShowSchedule] = useState(false);
    const contactName = (params.name as string) || 'Sarah Chen';

    const handleConsume = useCallback((id: string) => {
        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === id ? { ...m, viewOnceViewed: true, consumed: true } : m));
        }, 800);
    }, []);

    const handleKeep = useCallback((id: string) => {
        setMessages(prev => prev.map(m =>
            m.id === id ? { ...m, kept: true, ephemeral: false } : m
        ));
    }, []);

    const handleSend = useCallback(() => {
        if (!inputText.trim()) return;
        const newMsg: ChatMessage = {
            id: String(Date.now()),
            text: inputText.trim(),
            sent: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
            type: 'text',
        };
        setMessages(prev => [...prev, newMsg]);
        setInputText('');
    }, [inputText]);

    const handlePhraseSelect = useCallback((original: string, translated: string) => {
        setInputText(`${original}\n${translated}`);
        setShowPhrases(false);
    }, []);

    const handleSchedule = useCallback((timeLabel: string) => {
        if (!inputText.trim()) {
            setShowSchedule(false);
            return;
        }
        const scheduledMsg: ChatMessage = {
            id: String(Date.now()),
            text: inputText.trim(),
            sent: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'scheduled',
            type: 'text',
            scheduled: true,
            scheduledTime: timeLabel,
        };
        setMessages(prev => [...prev, scheduledMsg]);
        setInputText('');
        setShowSchedule(false);
    }, [inputText]);

    const bg = isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50];
    const initials = contactName.split(' ').map((n: string) => n[0]).join('').slice(0, 2);

    const getGroupInfo = (index: number) => {
        const msg = messages[index];
        const prev = index > 0 ? messages[index - 1] : null;
        const next = index < messages.length - 1 ? messages[index + 1] : null;
        const isFirst = !prev || prev.sent !== msg.sent;
        const isLast = !next || next.sent !== msg.sent;
        return { isFirst, isLast };
    };

    return (
        <View style={[styles.container, { backgroundColor: bg }]}>
            {/* ─── Header ─── */}
            <View style={[styles.header, {
                backgroundColor: isDark ? 'rgba(20,30,27,0.92)' : 'rgba(248,250,250,0.92)',
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
                <View style={styles.e2eBadge}>
                    <FontAwesome name="lock" size={10} color={NDEIP_COLORS.emerald} />
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
                {messages.map((msg, i) => {
                    const { isFirst, isLast } = getGroupInfo(i);
                    return (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isDark={isDark}
                            isFirst={isFirst}
                            isLast={isLast}
                            onConsume={handleConsume}
                            onKeep={handleKeep}
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
                    backgroundColor: isDark ? 'rgba(20,30,27,0.92)' : 'rgba(248,250,250,0.92)',
                    borderTopColor: isDark ? Glass.dark.borderSubtle : Glass.light.borderSubtle,
                }]}>
                    <TouchableOpacity style={styles.inputAction}>
                        <FontAwesome name="plus" size={20} color={NDEIP_COLORS.gray[500]} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.inputAction} onPress={() => setShowPhrases(true)}>
                        <FontAwesome name="language" size={18} color={NDEIP_COLORS.electricBlue} />
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
                    <TouchableOpacity
                        onPress={handleSend}
                        onLongPress={() => { if (inputText.trim()) setShowSchedule(true); }}
                        activeOpacity={0.85}
                    >
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

            {/* Modals */}
            <QuickPhrasesModal
                visible={showPhrases}
                onClose={() => setShowPhrases(false)}
                onSelect={handlePhraseSelect}
                isDark={isDark}
            />
            <ScheduleModal
                visible={showSchedule}
                onClose={() => setShowSchedule(false)}
                onSchedule={handleSchedule}
                isDark={isDark}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
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
    headerAvatarText: { color: '#fff', fontSize: 14, fontWeight: '600' as any },
    headerInfo: { flex: 1 },
    headerName: { fontSize: 16, fontWeight: '600' as any },
    headerStatus: { fontSize: 12, fontWeight: '500' as any },
    headerAction: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    messagesArea: { flex: 1 },
    messagesContent: { paddingHorizontal: 12, paddingVertical: 16, gap: 3 },
    bubbleRow: { flexDirection: 'row', marginBottom: 1 },
    bubbleRowSent: { justifyContent: 'flex-end' },
    bubble: { paddingHorizontal: 14, paddingVertical: 10 },
    bubbleSent: {},
    bubbleReceived: {},
    bubbleTextSent: { color: '#fff', fontSize: 15, lineHeight: 21 },
    bubbleTextReceived: { fontSize: 15, lineHeight: 21 },
    bubbleMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, gap: 4 },
    bubbleTimeSent: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
    bubbleTimeReceived: { fontSize: 10, marginTop: 4, textAlign: 'right' as any },
    statusIcons: { flexDirection: 'row', alignItems: 'center' },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 10,
        paddingVertical: 10,
        paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        gap: 6,
    },
    inputAction: { width: 36, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
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
    mediaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    mediaInfo: { flex: 1 },
    progressTrack: {
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 2,
        marginTop: 8,
        overflow: 'hidden' as const,
    },
    progressFill: {
        height: '100%' as any,
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderRadius: 2,
    },
    keepButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
        marginTop: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    keepText: { fontSize: 11, fontWeight: '600' as any, color: '#fff' },
    e2eBadge: {
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: 'rgba(16,185,129,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        maxHeight: '70%' as any,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: { fontSize: 18, fontWeight: '700' as any },
    langToggle: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    langBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
    langBtnText: { fontSize: 13, fontWeight: '600' as any },
    phraseCategoryLabel: { fontSize: 13, fontWeight: '600' as any, marginBottom: 8 },
    phraseRow: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        marginBottom: 8,
    },
    phraseOriginal: { fontSize: 15, fontWeight: '600' as any, marginBottom: 2 },
    phraseTranslated: { fontSize: 13 },
    scheduleOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        marginBottom: 8,
    },
});
