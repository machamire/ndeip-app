/**
 * Channel Templates — Predefined channel configs for quick creation
 */
export interface ChannelTemplate {
    id: string;
    category: string;
    categoryIcon: string;
    name: string;
    description: string;
    rules: string[];
    suggestedTopics: string[];
    privacySuggestion: 'public' | 'private';
}

export const TEMPLATE_CATEGORIES = [
    { key: 'neighborhood', label: 'Neighborhood & Local', icon: 'home' },
    { key: 'school', label: 'School & Campus', icon: 'graduation-cap' },
    { key: 'work', label: 'Work & Professional', icon: 'briefcase' },
    { key: 'faith', label: 'Faith & Community', icon: 'heart' },
    { key: 'sports', label: 'Sports & Fitness', icon: 'futbol-o' },
    { key: 'business', label: 'Business & Creators', icon: 'line-chart' },
    { key: 'family', label: 'Family & Friends', icon: 'users' },
    { key: 'travel', label: 'Travel & Events', icon: 'plane' },
];

export const CHANNEL_TEMPLATES: ChannelTemplate[] = [
    // Neighborhood
    {
        id: 'n1', category: 'neighborhood', categoryIcon: 'home',
        name: 'Community Watch', description: 'Stay alert and keep our neighborhood safe together.',
        rules: ['Be respectful', 'No false alarms', 'Share verified information only'],
        suggestedTopics: ['Safety alerts', 'Lost & found', 'Suspicious activity'],
        privacySuggestion: 'private',
    },
    {
        id: 'n2', category: 'neighborhood', categoryIcon: 'home',
        name: 'Local Marketplace', description: 'Buy, sell, and trade within the community.',
        rules: ['No scams', 'Fair pricing', 'Describe items honestly'],
        suggestedTopics: ['For sale', 'Wanted', 'Free items', 'Services'],
        privacySuggestion: 'public',
    },
    // School
    {
        id: 's1', category: 'school', categoryIcon: 'graduation-cap',
        name: 'Study Group', description: 'Collaborate on assignments and share study resources.',
        rules: ['No plagiarism', 'Be helpful', 'Stay on topic'],
        suggestedTopics: ['Assignments', 'Exam prep', 'Study notes', 'Tutoring'],
        privacySuggestion: 'private',
    },
    {
        id: 's2', category: 'school', categoryIcon: 'graduation-cap',
        name: 'Campus Events', description: 'Stay updated on everything happening on campus.',
        rules: ['Post verified events only', 'Include dates and venues'],
        suggestedTopics: ['Parties', 'Workshops', 'Club meetings', 'Sports'],
        privacySuggestion: 'public',
    },
    // Work
    {
        id: 'w1', category: 'work', categoryIcon: 'briefcase',
        name: 'Team Standup', description: 'Daily updates and blockers for the team.',
        rules: ['Keep it brief', 'Post daily', 'Flag blockers early'],
        suggestedTopics: ['Yesterday', 'Today', 'Blockers', 'Wins'],
        privacySuggestion: 'private',
    },
    {
        id: 'w2', category: 'work', categoryIcon: 'briefcase',
        name: 'Industry News', description: 'Share articles, trends, and insights from our field.',
        rules: ['Cite sources', 'No spam', 'Add your take'],
        suggestedTopics: ['Articles', 'Trends', 'Job postings', 'Events'],
        privacySuggestion: 'public',
    },
    // Faith
    {
        id: 'f1', category: 'faith', categoryIcon: 'heart',
        name: 'Prayer Circle', description: 'Share prayers, encouragement, and spiritual support.',
        rules: ['Respect all beliefs', 'Be encouraging', 'Confidentiality matters'],
        suggestedTopics: ['Prayer requests', 'Testimonies', 'Devotionals'],
        privacySuggestion: 'private',
    },
    // Sports
    {
        id: 'sp1', category: 'sports', categoryIcon: 'futbol-o',
        name: 'Game Day Chat', description: 'Live reactions and commentary during matches.',
        rules: ['Keep it fun', 'No spoilers outside thread', 'Respect all teams'],
        suggestedTopics: ['Live reactions', 'Predictions', 'Highlights', 'Stats'],
        privacySuggestion: 'public',
    },
    {
        id: 'sp2', category: 'sports', categoryIcon: 'futbol-o',
        name: 'Fitness Squad', description: 'Workout plans, progress tracking, and motivation.',
        rules: ['No body shaming', 'Share progress respectfully', 'Encourage everyone'],
        suggestedTopics: ['Workouts', 'Meal plans', 'Progress pics', 'Challenges'],
        privacySuggestion: 'private',
    },
    // Business
    {
        id: 'b1', category: 'business', categoryIcon: 'line-chart',
        name: 'Startup Hub', description: 'Connect with entrepreneurs, share ideas, get feedback.',
        rules: ['No pitching without permission', 'Constructive feedback only'],
        suggestedTopics: ['Ideas', 'Funding', 'Marketing', 'Hiring'],
        privacySuggestion: 'public',
    },
    // Family
    {
        id: 'fm1', category: 'family', categoryIcon: 'users',
        name: 'Family Updates', description: 'Stay connected with family news and photos.',
        rules: ['Be kind', 'Share responsibly', 'Respect privacy'],
        suggestedTopics: ['Photos', 'Milestones', 'Visits', 'Recipes'],
        privacySuggestion: 'private',
    },
    // Travel
    {
        id: 't1', category: 'travel', categoryIcon: 'plane',
        name: 'Travel Buddies', description: 'Plan trips, share tips, and find travel companions.',
        rules: ['Verified info only', 'Be honest about costs', 'Safety first'],
        suggestedTopics: ['Destinations', 'Deals', 'Tips', 'Itineraries'],
        privacySuggestion: 'public',
    },
];
