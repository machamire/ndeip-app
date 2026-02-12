/**
 * ndeip Brand System — Design Foundation
 * Typography · Spacing · Shadows · Radii · Animation · Glass Tokens
 * 
 * Philosophy:
 * - Modern and sleek, not sci-fi
 * - iMessage meets WhatsApp meets Telegram — elevated to luxury
 * - Generous whitespace, buttery animations, warm depth
 * - Designed by Apple/Airbnb-caliber team
 */

import { Dimensions, Platform } from 'react-native';

const getScreenWidth = () => {
  try { return Dimensions.get('window').width; }
  catch { return 390; }
};

const getScreenHeight = () => {
  try { return Dimensions.get('window').height; }
  catch { return 844; }
};

// ═══════════════════════════════════════════════════════════
// TYPOGRAPHY — Clean · Confident · Readable
// ═══════════════════════════════════════════════════════════

export const Typography = {
  fonts: {
    primary: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    mono: Platform.select({
      ios: 'SF Mono',
      android: 'monospace',
      default: 'monospace',
    }),
  },

  // Font sizes with clear hierarchy
  sizes: {
    hero: 34,        // Splash / onboarding
    title1: 28,       // Screen titles
    title2: 22,       // Section headers
    title3: 18,       // Card titles
    body: 16,         // Primary body text
    bodySmall: 15,    // Chat messages
    caption: 13,      // Descriptions, subtitles
    footnote: 12,     // Timestamps, secondary info
    micro: 11,        // Badges, labels
    nano: 10,         // Tab bar labels
  },

  // Weights — use contrast aggressively
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },

  // Letter spacing
  tracking: {
    tight: -0.5,      // Large titles
    normal: 0,        // Body text
    wide: 0.3,        // Buttons
    wider: 0.8,       // Section labels
    widest: 1.5,      // Uppercase labels
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },

  // Preset styles
  presets: {
    screenTitle: {
      fontSize: 28,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
    },
    bodyText: {
      fontSize: 16,
      fontWeight: '400',
      letterSpacing: 0,
      lineHeight: 22,
    },
    messageText: {
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 20,
    },
    timestamp: {
      fontSize: 11,
      fontWeight: '400',
      opacity: 0.4,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
  },
};

// ═══════════════════════════════════════════════════════════
// SPACING — 8px Base · Generous Breathing Room
// ═══════════════════════════════════════════════════════════

export const Spacing = {
  // Base scale
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  jumbo: 48,
  mega: 64,

  // Screen padding
  screenHorizontal: 20,
  screenVertical: 16,

  // Section gaps
  sectionGap: 36,
  cardGap: 12,

  // Component-specific
  components: {
    listItemHeight: 76,        // Conversation rows
    settingsRowHeight: 56,     // Settings rows
    avatarSizeSmall: 36,       // Header avatars
    avatarSizeMedium: 52,      // List avatars
    avatarSizeLarge: 68,       // Story avatars
    avatarSizeXL: 80,          // Profile avatar
    top3AvatarSize: 60,        // Top 3 contacts
    tabBarHeight: 64,          // Tab bar
    headerHeight: 56,          // Navigation headers
    inputHeight: 44,           // Input fields
    buttonHeight: 48,          // Primary buttons
    fabSize: 56,               // Floating action button
    searchBarHeight: 44,       // Search bar
    filterPillHeight: 36,      // Filter pills
    dndStripHeight: 36,        // DND status strip
    storyRingSize: 68,         // Story circles
    iconCircleSize: 32,        // Settings icon circles
    badgeSize: 20,             // Unread badges
  },
};

// ═══════════════════════════════════════════════════════════
// BORDER RADIUS — Soft · Friendly · Premium
// ═══════════════════════════════════════════════════════════

export const Radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,

  // Component-specific
  card: 20,
  cardLarge: 24,
  button: 14,
  buttonLarge: 16,
  input: 14,
  modal: 24,
  avatar: 999,
  tabBar: 24,
  badge: 10,
  tag: 8,
  messageSent: 20,        // All corners
  messageSentCorner: 6,   // Bottom-right (sender)
  messageReceived: 20,    // All corners  
  messageReceivedCorner: 6, // Bottom-left (receiver)
  glass: 20,
};

// ═══════════════════════════════════════════════════════════
// SHADOWS — Soft · Diffused · Multi-Layered
// ═══════════════════════════════════════════════════════════

export const Shadows = {
  // Elevation levels
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 48,
    elevation: 12,
  },
  // Glow effects (brand colored)
  tealGlow: {
    shadowColor: '#1B4D3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
  blueGlow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  // Interactive states
  pressed: {
    shadowColor: '#1B4D3E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  fab: {
    shadowColor: '#1B4D3E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.20,
    shadowRadius: 24,
    elevation: 10,
  },
};

// ═══════════════════════════════════════════════════════════
// GLASS — Frosted Surfaces · Tasteful Translucency
// ═══════════════════════════════════════════════════════════

export const Glass = {
  // Blur intensities
  blur: {
    light: 40,
    medium: 60,
    heavy: 80,
    ultra: 100,
  },

  // Surface styles (dark mode)
  dark: {
    background: 'rgba(255, 255, 255, 0.06)',
    backgroundHover: 'rgba(255, 255, 255, 0.10)',
    backgroundActive: 'rgba(255, 255, 255, 0.14)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderSubtle: 'rgba(255, 255, 255, 0.04)',
  },

  // Surface styles (light mode)
  light: {
    background: 'rgba(0, 0, 0, 0.03)',
    backgroundHover: 'rgba(0, 0, 0, 0.06)',
    backgroundActive: 'rgba(0, 0, 0, 0.08)',
    border: 'rgba(0, 0, 0, 0.06)',
    borderSubtle: 'rgba(0, 0, 0, 0.03)',
  },
};

// ═══════════════════════════════════════════════════════════
// ANIMATIONS — Natural · Organic · Physics-Based
// ═══════════════════════════════════════════════════════════

export const Animations = {
  // Durations
  duration: {
    instant: 100,
    fast: 150,
    normal: 200,
    medium: 300,
    slow: 400,
    slower: 500,
    entrance: 400,
    exit: 300,
  },

  // Spring configs (for Reanimated)
  spring: {
    gentle: { damping: 20, stiffness: 120 },
    default: { damping: 18, stiffness: 140 },
    bouncy: { damping: 12, stiffness: 180 },
    snappy: { damping: 20, stiffness: 250 },
    heavy: { damping: 25, stiffness: 100 },
  },

  // Scale values
  scale: {
    pressed: 0.97,
    fab: 0.92,
    cardPress: 0.98,
    popIn: 1.1,
    normal: 1.0,
  },

  // Stagger delays
  stagger: {
    listItem: 30,       // ms per item
    message: 50,        // ms per message
    card: 60,           // ms per card
  },

  // Easing (for withTiming)
  easing: 'cubic',  // Easing.out(Easing.cubic)
};

// ═══════════════════════════════════════════════════════════
// Z-INDEX — Layering System
// ═══════════════════════════════════════════════════════════

export const ZIndex = {
  base: 0,
  card: 1,
  sticky: 10,
  header: 20,
  tabBar: 30,
  modal: 40,
  overlay: 50,
  toast: 60,
  tooltip: 70,
};

// ═══════════════════════════════════════════════════════════
// STATUS COLORS — Online · Away · Busy · DND
// ═══════════════════════════════════════════════════════════

export const StatusColors = {
  online: '#10B981',
  away: '#F59E0B',
  busy: '#EF4444',
  offline: '#6B7280',
  dnd: '#EF4444',
};

// ═══════════════════════════════════════════════════════════
// COMBINED EXPORT
// ═══════════════════════════════════════════════════════════

export const NdeipDesignSystem = {
  typography: Typography,
  spacing: Spacing,
  radii: Radii,
  shadows: Shadows,
  glass: Glass,
  animations: Animations,
  zIndex: ZIndex,
  statusColors: StatusColors,
};

export default NdeipDesignSystem;