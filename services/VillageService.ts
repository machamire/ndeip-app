/**
 * VillageService — Community features (noticeboard, polls, rooms, events)
 * 
 * Manages all village interactions with AsyncStorage persistence.
 * Ready for Supabase swap.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notice {
    id: string;
    villageId: string;
    type: 'announcement' | 'poll' | 'event';
    author: string;
    authorId: string;
    content: string;
    timestamp: number;
    timeAgo: string;
    likes: number;
    liked: boolean;
    replies: number;
    // Poll specific
    pollOptions?: { text: string; votes: number; voted: boolean }[];
    totalVotes?: number;
    // Event specific  
    eventDate?: string;
    eventTime?: string;
    eventLocation?: string;
    rsvpGoing?: boolean;
    rsvpCount?: number;
}

export interface LiveRoom {
    id: string;
    villageId: string;
    title: string;
    host: string;
    participants: number;
    maxParticipants: number;
    isLive: boolean;
    category: string;
}

export interface UpcomingEvent {
    id: string;
    villageId: string;
    title: string;
    date: string;
    time: string;
    host: string;
    attendees: number;
    reminded: boolean;
}

export interface Village {
    id: string;
    name: string;
    memberCount: number;
    description: string;
}

const KEYS = {
    villages: 'ndeip_villages',
    notices: (villageId: string) => `ndeip_notices_${villageId}`,
    rooms: 'ndeip_rooms',
    events: 'ndeip_events',
    initialized: 'ndeip_villages_initialized',
};

// ─── Seed Data ────────────────────────────────────────────
const SEED_VILLAGES: Village[] = [
    { id: 'v1', name: 'Zim Diaspora Connect', memberCount: 1247, description: 'Connecting Zimbabweans worldwide' },
    { id: 'v2', name: 'Dev Village', memberCount: 583, description: 'Tech builders community' },
];

const SEED_NOTICES: Notice[] = [
    {
        id: 'n1', villageId: 'v1', type: 'announcement', author: 'Sarah Chen', authorId: '1',
        content: 'Welcome to the village! 🎉 Make sure to introduce yourself and join our weekend hangouts.',
        timestamp: Date.now() - 3600000 * 2, timeAgo: '2h ago',
        likes: 24, liked: false, replies: 8,
    },
    {
        id: 'n2', villageId: 'v1', type: 'poll', author: 'Marcus Johnson', authorId: '2',
        content: 'What time works best for our weekly village call?',
        timestamp: Date.now() - 3600000 * 5, timeAgo: '5h ago',
        likes: 12, liked: false, replies: 3,
        pollOptions: [
            { text: '6 PM (Harare time)', votes: 34, voted: false },
            { text: '8 PM (Harare time)', votes: 52, voted: false },
            { text: '10 AM Saturday', votes: 28, voted: false },
            { text: 'Rotate weekly', votes: 15, voted: false },
        ],
        totalVotes: 129,
    },
    {
        id: 'n3', villageId: 'v1', type: 'event', author: 'Thandi Nkosi', authorId: '3',
        content: 'Village Cultural Night — Share your favorite recipes, music, and stories!',
        timestamp: Date.now() - 3600000 * 8, timeAgo: '8h ago',
        likes: 45, liked: false, replies: 12,
        eventDate: 'Saturday, Feb 22', eventTime: '7:00 PM', eventLocation: 'Virtual (ndeip Room)',
        rsvpGoing: false, rsvpCount: 38,
    },
    {
        id: 'n4', villageId: 'v1', type: 'announcement', author: 'Kai Chen', authorId: '4',
        content: 'Just launched the community resource hub! Check it out and share with family back home. 🇿🇼',
        timestamp: Date.now() - 3600000 * 24, timeAgo: '1d ago',
        likes: 67, liked: true, replies: 15,
    },
];

const SEED_ROOMS: LiveRoom[] = [
    { id: 'r1', villageId: 'v1', title: 'Saturday Hangout', host: 'Sarah Chen', participants: 12, maxParticipants: 25, isLive: true, category: 'Social' },
    { id: 'r2', villageId: 'v1', title: 'Business Ideas', host: 'Marcus Johnson', participants: 8, maxParticipants: 20, isLive: true, category: 'Business' },
];

const SEED_EVENTS: UpcomingEvent[] = [
    { id: 'e1', villageId: 'v1', title: 'Village Cultural Night', date: 'Feb 22', time: '7:00 PM', host: 'Thandi Nkosi', attendees: 38, reminded: false },
    { id: 'e2', villageId: 'v1', title: 'Tech Talk: AI & Africa', date: 'Feb 25', time: '6:00 PM', host: 'Kai Chen', attendees: 24, reminded: false },
    { id: 'e3', villageId: 'v1', title: 'Weekend Braai (Virtual)', date: 'Mar 1', time: '2:00 PM', host: 'Priya Sharma', attendees: 15, reminded: false },
];

class VillageServiceClass {
    async initialize(): Promise<void> {
        const initialized = await AsyncStorage.getItem(KEYS.initialized);
        if (!initialized) {
            await AsyncStorage.setItem(KEYS.villages, JSON.stringify(SEED_VILLAGES));
            await AsyncStorage.setItem(KEYS.notices('v1'), JSON.stringify(SEED_NOTICES));
            await AsyncStorage.setItem(KEYS.rooms, JSON.stringify(SEED_ROOMS));
            await AsyncStorage.setItem(KEYS.events, JSON.stringify(SEED_EVENTS));
            await AsyncStorage.setItem(KEYS.initialized, 'true');
        }
    }

    // ─── Villages ───────────────────────────────────────────
    async getVillages(): Promise<Village[]> {
        await this.initialize();
        const data = await AsyncStorage.getItem(KEYS.villages);
        return data ? JSON.parse(data) : [];
    }

    // ─── Noticeboard ────────────────────────────────────────
    async getNotices(villageId: string): Promise<Notice[]> {
        await this.initialize();
        const data = await AsyncStorage.getItem(KEYS.notices(villageId));
        return data ? JSON.parse(data) : [];
    }

    async likeNotice(noticeId: string, villageId: string = 'v1'): Promise<void> {
        const notices = await this.getNotices(villageId);
        const notice = notices.find(n => n.id === noticeId);
        if (notice) {
            notice.liked = !notice.liked;
            notice.likes += notice.liked ? 1 : -1;
            await AsyncStorage.setItem(KEYS.notices(villageId), JSON.stringify(notices));
        }
    }

    async voteOnPoll(noticeId: string, optionIndex: number, villageId: string = 'v1'): Promise<void> {
        const notices = await this.getNotices(villageId);
        const notice = notices.find(n => n.id === noticeId);
        if (notice && notice.pollOptions) {
            // Clear previous vote
            notice.pollOptions.forEach(o => {
                if (o.voted) { o.votes--; o.voted = false; }
            });
            // Cast new vote
            notice.pollOptions[optionIndex].voted = true;
            notice.pollOptions[optionIndex].votes++;
            notice.totalVotes = notice.pollOptions.reduce((sum, o) => sum + o.votes, 0);
            await AsyncStorage.setItem(KEYS.notices(villageId), JSON.stringify(notices));
        }
    }

    async rsvpEvent(noticeId: string, going: boolean, villageId: string = 'v1'): Promise<void> {
        const notices = await this.getNotices(villageId);
        const notice = notices.find(n => n.id === noticeId);
        if (notice) {
            const wasGoing = notice.rsvpGoing;
            notice.rsvpGoing = going;
            notice.rsvpCount = (notice.rsvpCount || 0) + (going && !wasGoing ? 1 : !going && wasGoing ? -1 : 0);
            await AsyncStorage.setItem(KEYS.notices(villageId), JSON.stringify(notices));
        }
    }

    async createNotice(villageId: string, content: string, type: 'announcement' = 'announcement'): Promise<void> {
        const notices = await this.getNotices(villageId);
        const newNotice: Notice = {
            id: `n_${Date.now()}`, villageId, type, author: 'You', authorId: 'me',
            content, timestamp: Date.now(), timeAgo: 'Just now',
            likes: 0, liked: false, replies: 0,
        };
        notices.unshift(newNotice);
        await AsyncStorage.setItem(KEYS.notices(villageId), JSON.stringify(notices));
    }

    // ─── Live Rooms ─────────────────────────────────────────
    async getLiveRooms(): Promise<LiveRoom[]> {
        await this.initialize();
        const data = await AsyncStorage.getItem(KEYS.rooms);
        return data ? JSON.parse(data) : [];
    }

    // ─── Upcoming Events ───────────────────────────────────
    async getUpcomingEvents(): Promise<UpcomingEvent[]> {
        await this.initialize();
        const data = await AsyncStorage.getItem(KEYS.events);
        return data ? JSON.parse(data) : [];
    }

    async setReminder(eventId: string): Promise<void> {
        const events = await this.getUpcomingEvents();
        const event = events.find(e => e.id === eventId);
        if (event) {
            event.reminded = !event.reminded;
            await AsyncStorage.setItem(KEYS.events, JSON.stringify(events));
        }
    }
}

export const VillageService = new VillageServiceClass();
export default VillageService;
