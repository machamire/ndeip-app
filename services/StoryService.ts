/**
 * StoryService — Story management with TTL
 * 
 * Handles story upload, viewing, expiry (24h), and persistence.
 * Uses AsyncStorage locally, ready for Supabase Storage swap.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StorySegment {
    id: string;
    imageUri: string;
    caption?: string;
    timestamp: number;
    seen: boolean;
}

export interface UserStory {
    userId: string;
    userName: string;
    avatar?: string;
    isMyStory: boolean;
    segments: StorySegment[];
    lastUpdated: number;
}

const KEYS = {
    stories: 'ndeip_stories',
    initialized: 'ndeip_stories_initialized',
};

const TTL = 24 * 60 * 60 * 1000; // 24 hours

// ─── Seed Data ────────────────────────────────────────────
const SEED_STORIES: UserStory[] = [
    {
        userId: 'me', userName: 'My Story', isMyStory: true, lastUpdated: Date.now() - 3600000,
        segments: [
            { id: 's_me_1', imageUri: 'gradient_story_1', caption: 'Working on something exciting! 🚀', timestamp: Date.now() - 3600000, seen: false },
        ],
    },
    {
        userId: '1', userName: 'Sarah Chen', isMyStory: false, lastUpdated: Date.now() - 1800000,
        segments: [
            { id: 's1_1', imageUri: 'gradient_story_2', caption: 'Beautiful sunset 🌅', timestamp: Date.now() - 7200000, seen: false },
            { id: 's1_2', imageUri: 'gradient_story_3', caption: 'Village meeting prep!', timestamp: Date.now() - 1800000, seen: false },
        ],
    },
    {
        userId: '2', userName: 'Marcus Johnson', isMyStory: false, lastUpdated: Date.now() - 3600000 * 3,
        segments: [
            { id: 's2_1', imageUri: 'gradient_story_4', caption: 'New design system is 🔥', timestamp: Date.now() - 3600000 * 3, seen: false },
        ],
    },
    {
        userId: '3', userName: 'Thandi Nkosi', isMyStory: false, lastUpdated: Date.now() - 3600000 * 5,
        segments: [
            { id: 's3_1', imageUri: 'gradient_story_5', caption: 'Morning hike 🏔️', timestamp: Date.now() - 3600000 * 6, seen: true },
            { id: 's3_2', imageUri: 'gradient_story_6', caption: 'Best view ever!', timestamp: Date.now() - 3600000 * 5, seen: true },
        ],
    },
    {
        userId: '5', userName: 'Mom ❤️', isMyStory: false, lastUpdated: Date.now() - 3600000 * 8,
        segments: [
            { id: 's5_1', imageUri: 'gradient_story_7', caption: 'Garden is blooming 🌺', timestamp: Date.now() - 3600000 * 8, seen: false },
        ],
    },
    {
        userId: '7', userName: 'Priya Sharma', isMyStory: false, lastUpdated: Date.now() - 3600000 * 12,
        segments: [
            { id: 's7_1', imageUri: 'gradient_story_8', caption: 'Coffee time ☕', timestamp: Date.now() - 3600000 * 12, seen: true },
        ],
    },
];

class StoryServiceClass {
    async initialize(): Promise<void> {
        const initialized = await AsyncStorage.getItem(KEYS.initialized);
        if (!initialized) {
            await AsyncStorage.setItem(KEYS.stories, JSON.stringify(SEED_STORIES));
            await AsyncStorage.setItem(KEYS.initialized, 'true');
        }
    }

    async getAllStories(): Promise<UserStory[]> {
        await this.initialize();
        const data = await AsyncStorage.getItem(KEYS.stories);
        const stories: UserStory[] = data ? JSON.parse(data) : [];
        // Filter expired segments
        const now = Date.now();
        return stories.map(s => ({
            ...s,
            segments: s.segments.filter(seg => now - seg.timestamp < TTL),
        })).filter(s => s.segments.length > 0);
    }

    async getMyStory(): Promise<UserStory | null> {
        const stories = await this.getAllStories();
        return stories.find(s => s.isMyStory) || null;
    }

    async getContactStories(): Promise<UserStory[]> {
        const stories = await this.getAllStories();
        return stories.filter(s => !s.isMyStory);
    }

    async uploadStory(imageUri: string, caption?: string): Promise<void> {
        const stories = await this.getAllStories();
        let myStory = stories.find(s => s.isMyStory);

        const segment: StorySegment = {
            id: `s_me_${Date.now()}`,
            imageUri,
            caption,
            timestamp: Date.now(),
            seen: false,
        };

        if (myStory) {
            myStory.segments.push(segment);
            myStory.lastUpdated = Date.now();
        } else {
            myStory = {
                userId: 'me', userName: 'My Story', isMyStory: true,
                lastUpdated: Date.now(), segments: [segment],
            };
            stories.unshift(myStory);
        }

        await AsyncStorage.setItem(KEYS.stories, JSON.stringify(stories));
    }

    async markSeen(userId: string, segmentId: string): Promise<void> {
        const stories = await this.getAllStories();
        const story = stories.find(s => s.userId === userId);
        if (story) {
            const seg = story.segments.find(s => s.id === segmentId);
            if (seg) seg.seen = true;
            await AsyncStorage.setItem(KEYS.stories, JSON.stringify(stories));
        }
    }

    async deleteMyStory(segmentId: string): Promise<void> {
        const stories = await this.getAllStories();
        const myStory = stories.find(s => s.isMyStory);
        if (myStory) {
            myStory.segments = myStory.segments.filter(s => s.id !== segmentId);
            await AsyncStorage.setItem(KEYS.stories, JSON.stringify(stories));
        }
    }

    hasUnseenStories(story: UserStory): boolean {
        return story.segments.some(s => !s.seen);
    }
}

export const StoryService = new StoryServiceClass();
export default StoryService;
