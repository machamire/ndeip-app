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

import { Dimensions, Platform } from "react-native";

const getScreenWidth = () => {
  try {
    return Dimensions.get("window").width;
  } catch {
    return 390;
  }
};

const getScreenHeight = () => {
  try {
    return Dimensions.get("window").height;
  } catch {
    return 844;
  }
};

// ═══════════════════════════════════════════════════════════
// TYPOGRAPHY — Clean · Confident · Readable
// ═══════════════════════════════════════════════════════════

export const Typography = {
  fonts: {
    primary: Platform.select({
      ios: "System",
      android: "Roboto",
      default: "System",
    }),
    mono: Platform.select({
      ios: "SF Mono",
      android: "monospace",
      default: "monospace",
    }),
  },

  // Font sizes with clear hierarchy
  sizes: {
    hero: 34, // Splash / onboarding
    title1: 28, // Screen titles
    title2: 22, // Section headers
    title3: 18, // Card titles
    body: 16, // Primary body text
    bodySmall: 15, // Chat messages
    caption: 13, // Descriptions, subtitles
    footnote: 12, // Timestamps, secondary info
    micro: 11, // Badges, labels
    nano: 10, // Tab bar labels
  },

  // Weights — use contrast aggressively
  weights: {
    light: "300",
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    heavy: "800",
  },

  // Letter spacing
  tracking: {
    tight: -0.5, // Large titles
    normal: 0, // Body text
    wide: 0.3, // Buttons
    wider: 0.8, // Section labels
    widest: 1.5, // Uppercase labels
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
      fontWeight: "700",
      letterSpacing: -0.5,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    bodyText: {
      fontSize: 16,
      fontWeight: "400",
      letterSpacing: 0,
      lineHeight: 22,
    },
    messageText: {
      fontSize: 15,
      fontWeight: "400",
      lineHeight: 20,
    },
    timestamp: {
      fontSize: 11,
      fontWeight: "400",
      opacity: 0.4,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
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
    listItemHeight: 76, // Conversation rows
    settingsRowHeight: 56, // Settings rows
    avatarSizeSmall: 36, // Header avatars
    avatarSizeMedium: 52, // List avatars
    avatarSizeLarge: 68, // Story avatars
    avatarSizeXL: 80, // Profile avatar
    top3AvatarSize: 60, // Top 3 contacts
    tabBarHeight: 64, // Tab bar
    headerHeight: 56, // Navigation headers
    inputHeight: 44, // Input fields
    buttonHeight: 48, // Primary buttons
    fabSize: 56, // Floating action button
    searchBarHeight: 44, // Search bar
    filterPillHeight: 36, // Filter pills
    dndStripHeight: 36, // DND status strip
    storyRingSize: 68, // Story circles
    iconCircleSize: 32, // Settings icon circles
    badgeSize: 20, // Unread badges
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
  messageSent: 20, // All corners
  messageSentCorner: 6, // Bottom-right (sender)
  messageReceived: 20, // All corners
  messageReceivedCorner: 6, // Bottom-left (receiver)
  glass: 20,
};

// ═══════════════════════════════════════════════════════════
// SHADOWS — Soft · Diffused · Multi-Layered
// ═══════════════════════════════════════════════════════════

export const Shadows = {
  // Elevation levels
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 8,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 48,
    elevation: 12,
  },
  // Glow effects (brand colored)
  tealGlow: {
    shadowColor: "#1B4D3E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
  blueGlow: {
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  // Interactive states
  pressed: {
    shadowColor: "#1B4D3E",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  fab: {
    shadowColor: "#1B4D3E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
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
    background: "rgba(255, 255, 255, 0.06)",
    backgroundHover: "rgba(255, 255, 255, 0.10)",
    backgroundActive: "rgba(255, 255, 255, 0.14)",
    border: "rgba(255, 255, 255, 0.08)",
    borderSubtle: "rgba(255, 255, 255, 0.04)",
  },

  // Surface styles (light mode)
  light: {
    background: "rgba(0, 0, 0, 0.03)",
    backgroundHover: "rgba(0, 0, 0, 0.06)",
    backgroundActive: "rgba(0, 0, 0, 0.08)",
    border: "rgba(0, 0, 0, 0.06)",
    borderSubtle: "rgba(0, 0, 0, 0.03)",
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
    listItem: 30, // ms per item
    message: 50, // ms per message
    card: 60, // ms per card
  },

  // Easing (for withTiming)
  easing: "cubic", // Easing.out(Easing.cubic)
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
  online: "#10B981",
  away: "#F59E0B",
  busy: "#EF4444",
  offline: "#6B7280",
  dnd: "#EF4444",
};

// ═══════════════════════════════════════════════════════════
// MESH COLORS — Primary Color Palette
// ═══════════════════════════════════════════════════════════

export const MeshColors = {
  primaryTeal: "#1B4D3E",
  electricBlue: "#2563EB",
  accentTeal: "#00D9A3",
  accentBlue: "#0A71EF",
  accentCyan: "#00F5FF",
  accentPurple: "#9D4EDD",
  accentPink: "#FF6B9D",
  accentOrange: "#FF8C42",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
  accents: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
};

// ═══════════════════════════════════════════════════════════
// MESH THEMES — Complete Theme Definitions
// ═══════════════════════════════════════════════════════════

export const MeshThemes = {
  light: {
    primary: "#1B4D3E",
    secondary: "#2563EB",
    accent: "#00D9A3",
    background: "#FFFFFF",
    surface: "#F9FAFB",
    text: "#111827",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    meshOverlay: "rgba(27, 77, 62, 0.08)",
    crystallineWhite: "#FFFFFF",
    accents: {
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      mutedRed: "#EF4444",
      info: "#3B82F6",
    },
  },
  dark: {
    primary: "#00D9A3",
    secondary: "#0A71EF",
    accent: "#00F5FF",
    background: "#0F172A",
    surface: "#1E293B",
    text: "#F8FAFC",
    textSecondary: "#CBD5E1",
    border: "#334155",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    meshOverlay: "rgba(0, 217, 163, 0.08)",
    crystallineWhite: "#FFFFFF",
    accents: {
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      mutedRed: "#EF4444",
      info: "#3B82F6",
    },
  },
  quantum: {
    primary: "#00F5FF",
    secondary: "#9D4EDD",
    accent: "#FF6B9D",
    background: "#0A0E27",
    surface: "#151A3F",
    text: "#E0E7FF",
    textSecondary: "#A5B4FC",
    border: "#4C1D95",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    meshOverlay: "rgba(0, 245, 255, 0.12)",
    crystallineWhite: "#FFFFFF",
    accents: {
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      mutedRed: "#EF4444",
      info: "#3B82F6",
    },
  },
};

// ═══════════════════════════════════════════════════════════
// MESH PATTERNS — Pattern Generation System
// ═══════════════════════════════════════════════════════════

export const MeshPatterns = {
  generateUserMesh: (userId, options = {}) => {
    // Deterministic mesh generation based on userId
    const seed = userId
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const density = (options.density || 0.5) * 100;
    const opacity = (options.opacity || 0.1) * 100;

    return {
      seed,
      density,
      opacity,
      colors: options.colors || [MeshColors.primaryTeal, MeshColors.accentTeal],
      pattern: "mesh",
    };
  },

  generateGradientMesh: (colors, options = {}) => ({
    colors,
    density: options.density || 50,
    opacity: options.opacity || 10,
    pattern: "gradient-mesh",
  }),

  generateAnimatedMesh: (options = {}) => ({
    animating: true,
    animationSpeed: options.animationSpeed || 1.0,
    density: options.density || 50,
    opacity: options.opacity || 8,
    pattern: "animated-mesh",
  }),
};

// ═══════════════════════════════════════════════════════════
// COLOR UTILITIES — Dynamic Color Generation
// ═══════════════════════════════════════════════════════════

export const getDynamicColor = (color, opacity = 1) => {
  // Convert hex to rgba with opacity
  if (!color) return "rgba(0, 0, 0, 0)";

  if (color.startsWith("rgba")) {
    const parts = color.match(/[\d.]+/g);
    if (parts && parts.length >= 3) {
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${opacity})`;
    }
  }

  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return color;
};

export const interpolateColor = (color1, color2, factor = 0.5) => {
  // Simple color interpolation
  const parseColor = (color) => {
    if (color.startsWith("#")) {
      const hex = color.slice(1);
      return [
        parseInt(hex.substring(0, 2), 16),
        parseInt(hex.substring(2, 4), 16),
        parseInt(hex.substring(4, 6), 16),
      ];
    }
    if (color.startsWith("rgb")) {
      const matches = color.match(/\d+/g);
      return matches ? matches.slice(0, 3).map(Number) : [0, 0, 0];
    }
    return [0, 0, 0];
  };

  const [r1, g1, b1] = parseColor(color1);
  const [r2, g2, b2] = parseColor(color2);

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `rgb(${r}, ${g}, ${b})`;
};

// ═══════════════════════════════════════════════════════════
// MESH ANIMATIONS — Animation Specifications
// ═══════════════════════════════════════════════════════════

export const MeshAnimations = {
  meshPulse: {
    duration: 3000,
    strength: 0.3,
    easing: "ease-in-out",
  },
  meshShift: {
    duration: 4000,
    distance: 20,
    easing: "ease-in-out",
  },
  meshFlow: {
    duration: 5000,
    intensity: 0.5,
    easing: "linear",
  },
  // Timing tokens used by useMeshAnimations hook
  timing: {
    fast: 150,
    normal: 250,
    slow: 400,
    mesh: 1500,
    quantum: 2000,
  },
};

// ═══════════════════════════════════════════════════════════
// COMPATIBILITY ALIASES
// Components reference these names; map them to the canonical exports
// ═══════════════════════════════════════════════════════════

export const MeshTypography = Typography;
export const MeshSpacing = Spacing;
export const MeshBorderRadius = Radii;
export const MeshShadows = Shadows;

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
  meshColors: MeshColors,
  meshThemes: MeshThemes,
  meshPatterns: MeshPatterns,
  meshAnimations: MeshAnimations,
  // Aliases
  meshTypography: Typography,
  meshSpacing: Spacing,
  meshBorderRadius: Radii,
  meshShadows: Shadows,
};

export default NdeipDesignSystem;
