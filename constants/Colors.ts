/**
 * ndeip Design System — Color Palette
 *
 * Brand DNA: Deep Teal (#1B4D3E) + Electric Blue (#2563EB)
 * Philosophy: Rich, organic, jewel-toned — never neon or harsh
 * Glassmorphism-first with warm charcoal backgrounds
 */

// ─── Brand Primaries ──────────────────────────────────────
const teal = "#1B4D3E";
const tealLight = "#2A7A5E";
const tealDark = "#0F3329";
const blue = "#2563EB";
const blueSoft = "#3B82F6";

// ─── Jewel-Toned Accents ──────────────────────────────────
const emerald = "#10B981";
const sapphire = "#3B82F6";
const amber = "#F59E0B";
const ruby = "#EF4444";
const rose = "#F43F5E";
const cyan = "#06B6D4";
const amethyst = "#8B5CF6";
const coral = "#FB7185";

// ─── Neutrals — Warm Charcoal with Teal Undertone ─────────
const gray = {
  50: "#F8FAFA", // Light mode background
  100: "#EFF3F2", // Light surfaces
  200: "#D8E0DE", // Light borders
  300: "#A8B8B3", // Muted text (light)
  400: "#7A908A", // Secondary text
  500: "#56716A", // Placeholder text
  600: "#3D544D", // Dark mode secondary
  700: "#2A3B36", // Dark mode surfaces elevated
  800: "#1C2A26", // Dark mode surfaces
  850: "#151F1C", // Dark mode cards
  900: "#111918", // Dark mode background (warm charcoal)
  950: "#0A0F0E", // Deepest dark (app background)
};

// ─── Glass Surfaces ───────────────────────────────────────
const glass = {
  light: "rgba(255, 255, 255, 0.06)", // Dark mode frost
  lighter: "rgba(255, 255, 255, 0.10)", // Dark mode hover
  lightest: "rgba(255, 255, 255, 0.15)", // Dark mode active
  dark: "rgba(0, 0, 0, 0.03)", // Light mode frost
  darker: "rgba(0, 0, 0, 0.06)", // Light mode hover
  border: "rgba(255, 255, 255, 0.08)", // Glass border dark
  borderLight: "rgba(0, 0, 0, 0.06)", // Glass border light
  glow: "rgba(27, 77, 62, 0.12)", // Teal glow
  blueGlow: "rgba(37, 99, 235, 0.10)", // Blue glow
};

export const NDEIP_COLORS = {
  // Brand
  primaryTeal: teal,
  tealLight,
  tealDark,
  electricBlue: blue,
  blueSoft,

  // Jewel Accents
  emerald,
  sapphire,
  amber,
  ruby,
  rose,
  cyan,
  amethyst,
  coral,

  // Semantic
  success: emerald,
  warning: amber,
  error: rose,
  info: blue,

  // Neutrals
  white: "#FFFFFF",
  black: "#000000",
  gray,
  glass,

  // Gradient Presets
  gradients: {
    brand: [teal, blue],
    brandSubtle: ["rgba(27,77,62,0.8)", "rgba(37,99,235,0.6)"],
    tealEmerald: [teal, emerald],
    surface: [gray[900], gray[950]],
    cardGlow: ["rgba(27,77,62,0.12)", "rgba(37,99,235,0.06)"],
    warmDark: ["#111918", "#0A0F0E"],
    sentBubble: ["#1B5A47", "#1B4D3E"],
    gold: ["#F59E0B", "#D97706"],
    danger: ["#EF4444", "#DC2626"],
  },
};

// ─── Theme Tokens ─────────────────────────────────────────
const DEFAULT_THEME = {
  light: {
    text: gray[900],
    secondaryText: gray[500],
    tertiaryText: gray[400],
    background: gray[50],
    surface: "#FFFFFF",
    surfaceElevated: gray[100],
    surfaceGlass: glass.dark,
    surfaceGlassHover: glass.darker,
    glassBorder: glass.borderLight,
    tint: teal,
    primary: teal,
    secondary: blue,
    accent: emerald,
    tabIconDefault: gray[300],
    tabIconSelected: teal,
    border: gray[200],
    separator: gray[100],
    card: "#FFFFFF",
    cardElevated: gray[50],
    notification: blue,
    destructive: rose,
    overlay: "rgba(0, 0, 0, 0.5)",
    messageBubbleSent: teal,
    messageBubbleReceived: gray[100],
    messageBubbleSentText: "#FFFFFF",
    messageBubbleReceivedText: gray[900],
    inputBackground: gray[100],
    statusBarStyle: "dark" as const,
  },
  dark: {
    text: "#F0F4F3",
    secondaryText: gray[400],
    tertiaryText: gray[500],
    background: gray[950],
    surface: gray[900],
    surfaceElevated: gray[800],
    surfaceGlass: glass.light,
    surfaceGlassHover: glass.lighter,
    glassBorder: glass.border,
    tint: emerald,
    primary: emerald,
    secondary: blue,
    accent: cyan,
    tabIconDefault: gray[600],
    tabIconSelected: emerald,
    border: gray[800],
    separator: "rgba(255,255,255,0.04)",
    card: gray[850],
    cardElevated: gray[800],
    notification: blue,
    destructive: coral,
    overlay: "rgba(0, 0, 0, 0.7)",
    messageBubbleSent: teal,
    messageBubbleReceived: gray[800],
    messageBubbleSentText: "#FFFFFF",
    messageBubbleReceivedText: "#F0F4F3",
    inputBackground: gray[800],
    statusBarStyle: "light" as const,
  },
  // Expose the raw palette on the default/theme export for convenience
  NDEIP_COLORS,
};

export default DEFAULT_THEME;
