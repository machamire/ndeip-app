import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Platform,
    Animated,
    TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { NDEIP_COLORS } from '@/constants/Colors';
import { StoryService, UserStory, StorySegment } from '@/services/StoryService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Gradient backgrounds for stories (since we don't have real images)
const STORY_GRADIENTS: [string, string][] = [
    ['#1B4D3E', '#2A7A5E'],
    ['#2563EB', '#7C3AED'],
    ['#F59E0B', '#EF4444'],
    ['#10B981', '#0EA5E9'],
    ['#8B5CF6', '#EC4899'],
    ['#06B6D4', '#3B82F6'],
    ['#F97316', '#F43F5E'],
    ['#14B8A6', '#6366F1'],
];

export default function StoryViewer() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const userId = (params.userId as string) || '';

    const [story, setStory] = useState<UserStory | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [replyText, setReplyText] = useState('');
    const progressAnim = useRef(new Animated.Value(0)).current;
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const load = async () => {
            const stories = await StoryService.getAllStories();
            const found = stories.find(s => s.userId === userId);
            if (found) {
                setStory(found);
                // Mark first segment as seen
                StoryService.markSeen(userId, found.segments[0]?.id);
            } else {
                router.back();
            }
        };
        load();
    }, [userId]);

    // Auto-advance timer
    useEffect(() => {
        if (!story) return;

        progressAnim.setValue(0);
        const animation = Animated.timing(progressAnim, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: false,
        });
        animation.start(({ finished }) => {
            if (finished) {
                goNext();
            }
        });

        return () => animation.stop();
    }, [currentIndex, story]);

    const goNext = useCallback(() => {
        if (!story) return;
        if (currentIndex < story.segments.length - 1) {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            StoryService.markSeen(userId, story.segments[nextIdx].id);
        } else {
            router.back();
        }
    }, [currentIndex, story, router, userId]);

    const goPrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    }, [currentIndex]);

    const handleTap = useCallback((x: number) => {
        if (x < SCREEN_WIDTH * 0.3) {
            goPrev();
        } else {
            goNext();
        }
    }, [goPrev, goNext]);

    if (!story) return <View style={styles.container} />;

    const segment = story.segments[currentIndex];
    const gradientIndex = segment.id.charCodeAt(segment.id.length - 1) % STORY_GRADIENTS.length;
    const gradient = STORY_GRADIENTS[gradientIndex];
    const timeAgo = getTimeAgo(segment.timestamp);

    return (
        <View style={styles.container}>
            {/* Background */}
            <LinearGradient colors={gradient as any} style={StyleSheet.absoluteFill} />

            {/* Tap zones */}
            <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={(e) => handleTap(e.nativeEvent.locationX)}
            />

            {/* Progress bars */}
            <View style={styles.progressContainer}>
                {story.segments.map((_, i) => (
                    <View key={i} style={styles.progressTrack}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                {
                                    width: i < currentIndex
                                        ? '100%'
                                        : i === currentIndex
                                            ? progressAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0%', '100%'],
                                            })
                                            : '0%',
                                },
                            ]}
                        />
                    </View>
                ))}
            </View>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <LinearGradient
                        colors={[NDEIP_COLORS.primaryTeal, NDEIP_COLORS.electricBlue]}
                        style={styles.headerAvatar}
                    >
                        <Text style={styles.headerAvatarText}>
                            {story.userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </Text>
                    </LinearGradient>
                    <View>
                        <Text style={styles.headerName}>{story.userName}</Text>
                        <Text style={styles.headerTime}>{timeAgo}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <FontAwesome name="times" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Caption */}
            {segment.caption && (
                <View style={styles.captionArea}>
                    <Text style={styles.captionText}>{segment.caption}</Text>
                </View>
            )}

            {/* Story content placeholder */}
            <View style={styles.storyContent}>
                <FontAwesome name="image" size={60} color="rgba(255,255,255,0.3)" />
            </View>

            {/* Reply input */}
            <View style={styles.replyArea}>
                <View style={styles.replyInputWrap}>
                    <TextInput
                        value={replyText}
                        onChangeText={setReplyText}
                        placeholder={`Reply to ${story.userName.split(' ')[0]}...`}
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        style={styles.replyInput}
                    />
                </View>
                {replyText.length > 0 && (
                    <TouchableOpacity style={styles.replySendBtn} onPress={() => setReplyText('')}>
                        <FontAwesome name="send" size={16} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

function getTimeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    progressContainer: {
        flexDirection: 'row', gap: 4,
        paddingHorizontal: 8, paddingTop: Platform.OS === 'ios' ? 56 : 36,
    },
    progressTrack: {
        flex: 1, height: 2.5, backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 1.5, overflow: 'hidden',
    },
    progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 1.5 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 12, paddingTop: 12,
    },
    userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerAvatar: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
    },
    headerAvatarText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    headerName: { color: '#fff', fontSize: 15, fontWeight: '600' },
    headerTime: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
    closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    storyContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    captionArea: {
        position: 'absolute', bottom: 100, left: 0, right: 0,
        paddingHorizontal: 20, alignItems: 'center',
    },
    captionText: {
        color: '#fff', fontSize: 18, fontWeight: '600',
        textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
    },
    replyArea: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 12, paddingBottom: Platform.OS === 'ios' ? 40 : 20, paddingTop: 8,
    },
    replyInputWrap: {
        flex: 1, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
        paddingHorizontal: 16, paddingVertical: 10,
    },
    replyInput: { color: '#fff', fontSize: 15 },
    replySendBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: NDEIP_COLORS.primaryTeal,
        alignItems: 'center', justifyContent: 'center',
    },
});
