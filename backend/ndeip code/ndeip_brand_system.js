/**
 * ndeip Brand System - Revolutionary Design Foundation
 * Complete design system with mesh generators, dynamic gradients, and responsive spacing
 * Target: Gen Z/Millennial users with Instagram-level visual appeal
 */

import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Revolutionary Color System with Dynamic Mesh Generation
export const MeshColors = {
  // Primary Brand Colors (from branding guide)
  primaryTeal: '#003B3B',
  electricBlue: '#0A71EF',
  crystallineWhite: '#FFFFFF',
  
  // Extended Palette
  neutrals: {
    lightGrey: '#F5F5F5',
    mediumGrey: '#C0C0C0', 
    charcoalGrey: '#404040',
    meshShadow: 'rgba(0, 59, 59, 0.1)',
    crystalOverlay: 'rgba(255, 255, 255, 0.9)',
  },
  
  // Dynamic Gradients
  meshGradients: {
    primary: ['#0A71EF', '#320096'],
    secondary: ['#003B3B', '#0A71EF'],
    quantum: ['#0A71EF', '#00F5FF', '#320096'],
    crystalline: ['rgba(255,255,255,0.1)', 'rgba(10,113,239,0.05)'],
    callConnect: ['#0A71EF', '#003B3B', '#0A71EF'],
  },
  
  // Status Colors
  status: {
    online: '#00FF88',
    away: '#FFB800',
    busy: '#FF4757',
    offline: '#C0C0C0',
  },
  
  // Accent Colors
  accents: {
    mutedRed: '#C83232',
    success: '#00D68F',
    warning: '#FFB800',
    info: '#0A71EF',
  },
};

// Revolutionary Typography System
export const MeshTypography = {
  // Font Families (Poppins, Manrope, Circular Std)
  fonts: {
    primary: Platform.select({
      ios: 'Poppins',
      android: 'Poppins-Regular',
      default: 'System',
    }),
    secondary: Platform.select({
      ios: 'Manrope',
      android: 'Manrope-Regular', 
      default: 'System',
    }),
    mono: Platform.select({
      ios: 'SF Mono',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  
  // Responsive Font Sizes
  sizes: {
    // Headings (20pt+)
    h1: screenWidth > 400 ? 32 : 28,
    h2: screenWidth > 400 ? 28 : 24,
    h3: screenWidth > 400 ? 24 : 20,
    h4: screenWidth > 400 ? 20 : 18,
    
    // Body Text (11-12pt)
    body: 16,
    bodySmall: 14,
    caption: 12,
    overline: 10,
    
    // Special Sizes
    logo: screenWidth > 400 ? 40 : 32,
    button: 16,
    input: 16,
  },
  
  // Font Weights
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  },
  
  // Line Heights (generous spacing for clarity)
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
    loose: 2.0,
  },
};

// Revolutionary Spacing System
export const MeshSpacing = {
  // Base unit (8px system)
  base: 8,
  
  // Responsive spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  
  // Dynamic spacing based on screen size
  responsive: {
    xs: screenWidth * 0.01,
    sm: screenWidth * 0.02,
    md: screenWidth * 0.04,
    lg: screenWidth * 0.06,
    xl: screenWidth * 0.08,
  },
  
  // Component-specific spacing
  components: {
    messageMargin: 12,
    cardPadding: 20,
    buttonPadding: 16,
    inputPadding: 14,
    headerHeight: 88,
    tabBarHeight: 83,
    floatingCardElevation: 8,
  },
};

// Revolutionary Mesh Pattern Generator
export const MeshPatterns = {
  // Generate unique mesh patterns for each user
  generateUserMesh: (userId) => {
    const seed = userId ? userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 0;
    const random = (min, max) => min + (seed % (max - min));
    
    return {
      density: random(0.3, 0.8),
      complexity: random(3, 8),
      primaryNodes: random(5, 12),
      animationSpeed: random(2000, 5000),
      opacity: random(0.05, 0.15),
    };
  },
  
  // Mesh SVG patterns
  crystalline: {
    small: `
      <pattern id="meshSmall" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <polygon points="0,20 20,0 40,20 20,40" fill="none" stroke="${MeshColors.electricBlue}" stroke-width="0.5" opacity="0.1"/>
        <polygon points="10,10 30,10 20,30" fill="${MeshColors.primaryTeal}" opacity="0.03"/>
      </pattern>
    `,
    medium: `
      <pattern id="meshMedium" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <polygon points="0,40 40,0 80,40 40,80" fill="none" stroke="${MeshColors.electricBlue}" stroke-width="1" opacity="0.15"/>
        <polygon points="20,20 60,20 40,60" fill="${MeshColors.primaryTeal}" opacity="0.05"/>
        <circle cx="40" cy="40" r="3" fill="${MeshColors.electricBlue}" opacity="0.1"/>
      </pattern>
    `,
    large: `
      <pattern id="meshLarge" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
        <polygon points="0,60 60,0 120,60 60,120" fill="none" stroke="${MeshColors.electricBlue}" stroke-width="1.5" opacity="0.2"/>
        <polygon points="30,30 90,30 60,90" fill="${MeshColors.primaryTeal}" opacity="0.08"/>
        <circle cx="60" cy="60" r="5" fill="${MeshColors.electricBlue}" opacity="0.15"/>
        <circle cx="30" cy="30" r="2" fill="${MeshColors.electricBlue}" opacity="0.1"/>
        <circle cx="90" cy="90" r="2" fill="${MeshColors.electricBlue}" opacity="0.1"/>
      </pattern>
    `,
  },
  
  // Animation keyframes for mesh patterns
  animations: {
    breathe: 'breathe 4s ease-in-out infinite',
    pulse: 'pulse 2s ease-in-out infinite', 
    flow: 'flow 6s ease-in-out infinite',
    quantum: 'quantum 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
};

// Revolutionary Shadow System
export const MeshShadows = {
  // Floating card shadows
  floating: {
    light: {
      shadowColor: MeshColors.primaryTeal,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
    },
    medium: {
      shadowColor: MeshColors.primaryTeal,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
    },
    heavy: {
      shadowColor: MeshColors.primaryTeal,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.2,
      shadowRadius: 32,
      elevation: 16,
    },
  },
  
  // Mesh-specific shadows
  crystalline: {
    shadowColor: MeshColors.electricBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Interactive shadows (pressed state)
  pressed: {
    shadowColor: MeshColors.primaryTeal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
};

// Revolutionary Border Radius System
export const MeshBorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  
  // Component-specific radius
  components: {
    button: 12,
    card: 16,
    input: 10,
    modal: 20,
    avatar: 999, // Perfect circle
    messageBubble: 18,
    floatingButton: 28,
  },
  
  // Mesh-inspired radius (crystalline shapes)
  crystalline: {
    small: 6,
    medium: 14,
    large: 22,
  },
};

// Revolutionary Animation System
export const MeshAnimations = {
  // Timing functions
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
    mesh: 800, // For mesh transformations
    quantum: 1200, // For quantum effects
  },
  
  // Easing curves
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    mesh: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Custom mesh easing
    quantum: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Quantum bounce
  },
  
  // Spring configurations
  springs: {
    gentle: { tension: 300, friction: 20 },
    bouncy: { tension: 400, friction: 15 },
    mesh: { tension: 250, friction: 25 },
    quantum: { tension: 500, friction: 10 },
  },
};

// Revolutionary Theme System
export const MeshThemes = {
  light: {
    background: MeshColors.crystallineWhite,
    surface: MeshColors.neutrals.lightGrey,
    primary: MeshColors.primaryTeal,
    secondary: MeshColors.electricBlue,
    text: MeshColors.neutrals.charcoalGrey,
    textSecondary: MeshColors.neutrals.mediumGrey,
    border: MeshColors.neutrals.lightGrey,
    meshOverlay: 'rgba(0, 59, 59, 0.03)',
  },
  
  dark: {
    background: '#0A0A0A',
    surface: '#1A1A1A',
    primary: '#00E5FF', // Brighter teal for dark mode
    secondary: MeshColors.electricBlue,
    text: MeshColors.crystallineWhite,
    textSecondary: MeshColors.neutrals.mediumGrey,
    border: '#2A2A2A',
    meshOverlay: 'rgba(0, 229, 255, 0.05)',
  },
  
  // Quantum theme (premium)
  quantum: {
    background: 'linear-gradient(135deg, #0A0A0A, #001A1A)',
    surface: 'rgba(10, 113, 239, 0.1)',
    primary: '#00F5FF',
    secondary: '#FF00F5',
    text: MeshColors.crystallineWhite,
    textSecondary: '#B0B0B0',
    border: 'rgba(0, 245, 255, 0.2)',
    meshOverlay: 'rgba(0, 245, 255, 0.08)',
  },
};

// Revolutionary Breakpoints
export const MeshBreakpoints = {
  mobile: screenWidth,
  tablet: 768,
  desktop: 1024,
  
  // Device detection
  isMobile: screenWidth < 768,
  isTablet: screenWidth >= 768 && screenWidth < 1024,
  isDesktop: screenWidth >= 1024,
  
  // Safe area calculations
  safeArea: {
    top: Platform.select({ ios: 44, android: 24, default: 0 }),
    bottom: Platform.select({ ios: 34, android: 0, default: 0 }),
  },
};

// Revolutionary Z-Index System
export const MeshZIndex = {
  background: 0,
  content: 1,
  card: 10,
  overlay: 100,
  modal: 1000,
  tooltip: 1100,
  notification: 1200,
  mesh: 5, // Mesh patterns sit between background and content
  quantum: 1500, // Highest level for quantum effects
};

// Export complete brand system
export default {
  colors: MeshColors,
  typography: MeshTypography,
  spacing: MeshSpacing,
  patterns: MeshPatterns,
  shadows: MeshShadows,
  borderRadius: MeshBorderRadius,
  animations: MeshAnimations,
  themes: MeshThemes,
  breakpoints: MeshBreakpoints,
  zIndex: MeshZIndex,
};

// Utility functions for dynamic theming
export const getDynamicColor = (baseColor, opacity = 1) => {
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const generateMeshId = () => {
  return `mesh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const interpolateColor = (color1, color2, factor) => {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);
  
  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);
  
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};