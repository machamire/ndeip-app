// ndeip Brand Colors — Derived from official logo
// Logo primary: Deep teal-green for "ndei" | Vivid bright blue for "p"
// Crystalline mesh pattern with connected nodes

const ndeipTeal = '#1B4D3E';       // Logo's deep teal-green
const ndeipTealLight = '#2A7A5E';  // Lighter variant for accents
const ndeipTealDark = '#0F3329';   // Darker variant for depth
const ndeipBlue = '#2563EB';       // Logo's vivid blue "p"
const ndeipBlueSoft = '#3B82F6';   // Softer blue for hover/secondary
const ndeipCyan = '#06B6D4';       // Mesh accent cyan
const ndeipEmerald = '#10B981';    // Success/online green
const ndeipGold = '#F59E0B';       // Premium gold accent
const ndeipRose = '#F43F5E';       // Error/alert rose

export const NDEIP_COLORS = {
  // Primary palette from logo
  primaryTeal: ndeipTeal,
  tealLight: ndeipTealLight,
  tealDark: ndeipTealDark,
  electricBlue: ndeipBlue,
  blueSoft: ndeipBlueSoft,

  // Accent colors
  meshCyan: ndeipCyan,
  emerald: ndeipEmerald,
  gold: ndeipGold,
  rose: ndeipRose,

  // Semantic
  success: ndeipEmerald,
  warning: ndeipGold,
  error: ndeipRose,

  // Neutrals — warm-tinted for premium feel
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F7FAF9',
    100: '#EEF2F1',
    200: '#D5DFDC',
    300: '#A8BAB4',
    400: '#7A928A',
    500: '#56716A',
    600: '#3D544D',
    700: '#2A3B36',
    800: '#1A2622',
    900: '#0D1613',
    950: '#080E0C',
  },

  // Gradient presets
  gradients: {
    tealBlue: [ndeipTeal, ndeipBlue],
    tealCyan: [ndeipTeal, ndeipCyan],
    blueCyan: [ndeipBlue, ndeipCyan],
    darkFade: ['#0D1613', '#1A2622'],
    cardGlow: ['rgba(27,77,62,0.15)', 'rgba(37,99,235,0.08)'],
  },
};

export default {
  light: {
    text: '#1A2622',
    secondaryText: '#56716A',
    background: '#F7FAF9',
    surface: '#FFFFFF',
    surfaceElevated: '#EEF2F1',
    tint: ndeipTeal,
    primary: ndeipTeal,
    secondary: ndeipBlue,
    accent: ndeipEmerald,
    tabIconDefault: '#A8BAB4',
    tabIconSelected: ndeipTeal,
    border: '#D5DFDC',
    separator: '#EEF2F1',
    card: '#FFFFFF',
    notification: ndeipBlue,
    destructive: ndeipRose,
    overlay: 'rgba(27,77,62,0.5)',
    messageBubbleSent: ndeipTeal,
    messageBubbleReceived: '#EEF2F1',
    messageBubbleSentText: '#FFFFFF',
    messageBubbleReceivedText: '#1A2622',
    statusBarStyle: 'dark',
  },
  dark: {
    text: '#EEF2F1',
    secondaryText: '#7A928A',
    background: '#080E0C',
    surface: '#0D1613',
    surfaceElevated: '#1A2622',
    tint: ndeipEmerald,
    primary: ndeipEmerald,
    secondary: ndeipBlue,
    accent: ndeipCyan,
    tabIconDefault: '#3D544D',
    tabIconSelected: ndeipEmerald,
    border: '#1A2622',
    separator: '#1A2622',
    card: '#0D1613',
    notification: ndeipBlue,
    destructive: '#FB7185',
    overlay: 'rgba(0,0,0,0.7)',
    messageBubbleSent: ndeipTeal,
    messageBubbleReceived: '#1A2622',
    messageBubbleSentText: '#FFFFFF',
    messageBubbleReceivedText: '#EEF2F1',
    statusBarStyle: 'light',
  },
};
