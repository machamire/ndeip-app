/**
 * useMeshTheme - Dynamic Theming System with Mesh Pattern Generation
 * Auto dark mode, seasonal themes, user customization
 * Manages all theme state and mesh visual preferences
 */

import {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  MeshColors,
  MeshThemes,
  MeshPatterns,
  MeshAnimations,
  getDynamicColor,
  interpolateColor,
} from "../constants/ndeipBrandSystem";

// Theme context
const MeshThemeContext = createContext(null);

// Theme storage keys
const THEME_STORAGE_KEYS = {
  THEME_MODE: "ndeip_theme_mode",
  MESH_DENSITY: "ndeip_mesh_density",
  ANIMATION_SPEED: "ndeip_animation_speed",
  COLOR_SCHEME: "ndeip_color_scheme",
  ACCESSIBILITY_SETTINGS: "ndeip_accessibility",
  SEASONAL_ENABLED: "ndeip_seasonal_enabled",
  USER_PREFERENCES: "ndeip_user_preferences",
};

// Seasonal theme configurations
const SEASONAL_THEMES = {
  spring: {
    primaryColor: "#00E5A5",
    secondaryColor: "#0A71EF",
    meshOpacity: 0.15,
    animationSpeed: 0.8,
    gradients: ["#00E5A5", "#0A71EF", "#00F5FF"],
  },
  summer: {
    primaryColor: "#00F5FF",
    secondaryColor: "#FFB800",
    meshOpacity: 0.2,
    animationSpeed: 1.2,
    gradients: ["#00F5FF", "#FFB800", "#FF6B9D"],
  },
  autumn: {
    primaryColor: "#FF6B35",
    secondaryColor: "#003B3B",
    meshOpacity: 0.12,
    animationSpeed: 0.6,
    gradients: ["#FF6B35", "#FF8E53", "#003B3B"],
  },
  winter: {
    primaryColor: "#B8E6E6",
    secondaryColor: "#003B3B",
    meshOpacity: 0.08,
    animationSpeed: 0.4,
    gradients: ["#B8E6E6", "#7ED3F7", "#003B3B"],
  },
};

// Time-based theme detection
const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
};

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
};

// Default theme configuration
const DEFAULT_THEME_CONFIG = {
  mode: "auto", // 'light', 'dark', 'auto', 'quantum'
  meshDensity: 0.5, // 0-1 scale
  animationSpeed: 1.0, // 0.1-2.0 scale
  colorScheme: "default", // 'default', 'custom', 'seasonal'
  seasonalEnabled: true,
  accessibilitySettings: {
    reducedMotion: false,
    highContrast: false,
    largeText: false,
  },
  customColors: {
    primary: MeshColors.primaryTeal,
    secondary: MeshColors.electricBlue,
    accent: MeshColors.accents.success,
  },
};

// Main theme hook
export const useMeshTheme = () => {
  const context = useContext(MeshThemeContext);

  if (!context) {
    throw new Error("useMeshTheme must be used within a MeshThemeProvider");
  }

  return context;
};

// Theme provider component
export const MeshThemeProvider = ({ children }) => {
  // Core state
  const [themeConfig, setThemeConfig] = useState(DEFAULT_THEME_CONFIG);
  const [systemColorScheme, setSystemColorScheme] = useState(
    Appearance.getColorScheme(),
  );
  const [currentTheme, setCurrentTheme] = useState(MeshThemes.light);
  const [isLoading, setIsLoading] = useState(true);

  // Derived state
  const [effectiveColorScheme, setEffectiveColorScheme] = useState("light");
  const [currentSeason, setCurrentSeason] = useState(getCurrentSeason());
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());
  const [meshPatternConfig, setMeshPatternConfig] = useState({});

  // Initialize theme from storage
  useEffect(() => {
    loadThemeFromStorage();

    // Listen for system color scheme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    // Update time-based themes periodically
    const timeInterval = setInterval(() => {
      setCurrentSeason(getCurrentSeason());
      setTimeOfDay(getTimeOfDay());
    }, 60000); // Check every minute

    return () => {
      subscription?.remove();
      clearInterval(timeInterval);
    };
  }, []);

  // Update effective theme when dependencies change
  useEffect(() => {
    updateEffectiveTheme();
  }, [themeConfig, systemColorScheme, currentSeason, timeOfDay]);

  // Load theme configuration from storage
  const loadThemeFromStorage = async () => {
    try {
      const keys = Object.values(THEME_STORAGE_KEYS);
      const values = await AsyncStorage.multiGet(keys);

      const storedConfig = { ...DEFAULT_THEME_CONFIG };

      values.forEach(([key, value]) => {
        if (value) {
          const parsedValue = JSON.parse(value);

          switch (key) {
            case THEME_STORAGE_KEYS.THEME_MODE:
              storedConfig.mode = parsedValue;
              break;
            case THEME_STORAGE_KEYS.MESH_DENSITY:
              storedConfig.meshDensity = parsedValue;
              break;
            case THEME_STORAGE_KEYS.ANIMATION_SPEED:
              storedConfig.animationSpeed = parsedValue;
              break;
            case THEME_STORAGE_KEYS.COLOR_SCHEME:
              storedConfig.colorScheme = parsedValue;
              break;
            case THEME_STORAGE_KEYS.ACCESSIBILITY_SETTINGS:
              storedConfig.accessibilitySettings = {
                ...storedConfig.accessibilitySettings,
                ...parsedValue,
              };
              break;
            case THEME_STORAGE_KEYS.SEASONAL_ENABLED:
              storedConfig.seasonalEnabled = parsedValue;
              break;
            case THEME_STORAGE_KEYS.USER_PREFERENCES:
              Object.assign(storedConfig, parsedValue);
              break;
            default:
              break;
          }
        }
      });

      setThemeConfig(storedConfig);
    } catch (error) {
      console.warn("Failed to load theme from storage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save theme configuration to storage
  const saveThemeToStorage = async (config) => {
    try {
      const storageOperations = [
        [THEME_STORAGE_KEYS.THEME_MODE, JSON.stringify(config.mode)],
        [THEME_STORAGE_KEYS.MESH_DENSITY, JSON.stringify(config.meshDensity)],
        [
          THEME_STORAGE_KEYS.ANIMATION_SPEED,
          JSON.stringify(config.animationSpeed),
        ],
        [THEME_STORAGE_KEYS.COLOR_SCHEME, JSON.stringify(config.colorScheme)],
        [
          THEME_STORAGE_KEYS.ACCESSIBILITY_SETTINGS,
          JSON.stringify(config.accessibilitySettings),
        ],
        [
          THEME_STORAGE_KEYS.SEASONAL_ENABLED,
          JSON.stringify(config.seasonalEnabled),
        ],
        [THEME_STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(config)],
      ];

      await AsyncStorage.multiSet(storageOperations);
    } catch (error) {
      console.warn("Failed to save theme to storage:", error);
    }
  };

  // Update effective theme based on all configuration
  const updateEffectiveTheme = useCallback(() => {
    let baseTheme;
    let colorScheme = "light";

    // Determine color scheme
    if (themeConfig.mode === "auto") {
      colorScheme = systemColorScheme || "light";
    } else if (themeConfig.mode === "quantum") {
      colorScheme = "quantum";
    } else {
      colorScheme = themeConfig.mode;
    }

    // Get base theme
    baseTheme = { ...MeshThemes[colorScheme] };

    // Apply seasonal modifications if enabled
    if (themeConfig.seasonalEnabled && themeConfig.colorScheme === "seasonal") {
      const seasonalTheme = SEASONAL_THEMES[currentSeason];
      baseTheme = applySeasonalTheme(baseTheme, seasonalTheme);
    }

    // Apply custom colors
    if (themeConfig.colorScheme === "custom") {
      baseTheme.primary = themeConfig.customColors.primary;
      baseTheme.secondary = themeConfig.customColors.secondary;
    }

    // Apply accessibility modifications
    if (themeConfig.accessibilitySettings.highContrast) {
      baseTheme = applyHighContrastTheme(baseTheme);
    }

    // Update mesh pattern configuration
    const meshConfig = generateMeshConfig(
      themeConfig,
      currentSeason,
      timeOfDay,
    );
    setMeshPatternConfig(meshConfig);

    setEffectiveColorScheme(colorScheme);
    setCurrentTheme(baseTheme);
  }, [themeConfig, systemColorScheme, currentSeason, timeOfDay]);

  // Apply seasonal theme modifications
  const applySeasonalTheme = (baseTheme, seasonalTheme) => {
    return {
      ...baseTheme,
      primary: seasonalTheme.primaryColor,
      secondary: seasonalTheme.secondaryColor,
      meshOverlay: getDynamicColor(
        seasonalTheme.primaryColor,
        seasonalTheme.meshOpacity,
      ),
    };
  };

  // Apply high contrast accessibility theme
  const applyHighContrastTheme = (baseTheme) => {
    return {
      ...baseTheme,
      text: effectiveColorScheme === "dark" ? "#FFFFFF" : "#000000",
      background: effectiveColorScheme === "dark" ? "#000000" : "#FFFFFF",
      surface: effectiveColorScheme === "dark" ? "#1A1A1A" : "#F5F5F5",
      border: effectiveColorScheme === "dark" ? "#FFFFFF" : "#000000",
    };
  };

  // Generate mesh configuration based on settings
  const generateMeshConfig = (config, season, time) => {
    const baseConfig = {
      density: config.meshDensity,
      animationSpeed: config.animationSpeed,
      opacity: 0.1,
      particleCount: Math.floor(config.meshDensity * 80),
    };

    // Adjust for accessibility
    if (config.accessibilitySettings.reducedMotion) {
      baseConfig.animationSpeed *= 0.3;
      baseConfig.opacity *= 0.5;
    }

    // Seasonal adjustments
    if (config.seasonalEnabled && SEASONAL_THEMES[season]) {
      const seasonalConfig = SEASONAL_THEMES[season];
      baseConfig.opacity = seasonalConfig.meshOpacity;
      baseConfig.animationSpeed *= seasonalConfig.animationSpeed;
    }

    // Time of day adjustments
    switch (time) {
      case "night":
        baseConfig.opacity *= 0.6;
        baseConfig.animationSpeed *= 0.7;
        break;
      case "morning":
        baseConfig.animationSpeed *= 1.2;
        break;
      case "evening":
        baseConfig.opacity *= 0.8;
        break;
      default:
        break;
    }

    return baseConfig;
  };

  // Theme update functions
  const updateThemeMode = useCallback(
    async (mode) => {
      const newConfig = { ...themeConfig, mode };
      setThemeConfig(newConfig);
      await saveThemeToStorage(newConfig);
    },
    [themeConfig],
  );

  const updateMeshDensity = useCallback(
    async (density) => {
      const clampedDensity = Math.max(0, Math.min(1, density));
      const newConfig = { ...themeConfig, meshDensity: clampedDensity };
      setThemeConfig(newConfig);
      await saveThemeToStorage(newConfig);
    },
    [themeConfig],
  );

  const updateAnimationSpeed = useCallback(
    async (speed) => {
      const clampedSpeed = Math.max(0.1, Math.min(2.0, speed));
      const newConfig = { ...themeConfig, animationSpeed: clampedSpeed };
      setThemeConfig(newConfig);
      await saveThemeToStorage(newConfig);
    },
    [themeConfig],
  );

  const updateColorScheme = useCallback(
    async (scheme) => {
      const newConfig = { ...themeConfig, colorScheme: scheme };
      setThemeConfig(newConfig);
      await saveThemeToStorage(newConfig);
    },
    [themeConfig],
  );

  const updateCustomColors = useCallback(
    async (colors) => {
      const newConfig = {
        ...themeConfig,
        customColors: { ...themeConfig.customColors, ...colors },
      };
      setThemeConfig(newConfig);
      await saveThemeToStorage(newConfig);
    },
    [themeConfig],
  );

  const updateAccessibilitySettings = useCallback(
    async (settings) => {
      const newConfig = {
        ...themeConfig,
        accessibilitySettings: {
          ...themeConfig.accessibilitySettings,
          ...settings,
        },
      };
      setThemeConfig(newConfig);
      await saveThemeToStorage(newConfig);
    },
    [themeConfig],
  );

  const toggleSeasonalThemes = useCallback(async () => {
    const newConfig = {
      ...themeConfig,
      seasonalEnabled: !themeConfig.seasonalEnabled,
    };
    setThemeConfig(newConfig);
    await saveThemeToStorage(newConfig);
  }, [themeConfig]);

  const resetToDefaults = useCallback(async () => {
    setThemeConfig(DEFAULT_THEME_CONFIG);
    await saveThemeToStorage(DEFAULT_THEME_CONFIG);
  }, []);

  // Utility functions
  const getThemeColor = useCallback(
    (colorKey, opacity = 1) => {
      const color = currentTheme[colorKey] || MeshColors.primaryTeal;
      return opacity === 1 ? color : getDynamicColor(color, opacity);
    },
    [currentTheme],
  );

  const interpolateThemeColor = useCallback(
    (color1Key, color2Key, factor) => {
      const color1 = currentTheme[color1Key] || MeshColors.primaryTeal;
      const color2 = currentTheme[color2Key] || MeshColors.electricBlue;
      return interpolateColor(color1, color2, factor);
    },
    [currentTheme],
  );

  const generateUserMeshPattern = useCallback(
    (userId) => {
      return MeshPatterns.generateUserMesh(userId, {
        ...meshPatternConfig,
        colorScheme: effectiveColorScheme,
        seasonal: themeConfig.seasonalEnabled ? currentSeason : null,
      });
    },
    [
      meshPatternConfig,
      effectiveColorScheme,
      themeConfig.seasonalEnabled,
      currentSeason,
    ],
  );

  const getAnimationDuration = useCallback(
    (baseDuration) => {
      const speedMultiplier = themeConfig.accessibilitySettings.reducedMotion
        ? 0.3
        : themeConfig.animationSpeed;
      return Math.round(baseDuration * speedMultiplier);
    },
    [
      themeConfig.animationSpeed,
      themeConfig.accessibilitySettings.reducedMotion,
    ],
  );

  // Context value
  const contextValue = {
    // Current state
    theme: currentTheme,
    config: themeConfig,
    colorScheme: effectiveColorScheme,
    season: currentSeason,
    timeOfDay,
    meshConfig: meshPatternConfig,
    isLoading,

    // Update functions
    updateThemeMode,
    updateMeshDensity,
    updateAnimationSpeed,
    updateColorScheme,
    updateCustomColors,
    updateAccessibilitySettings,
    toggleSeasonalThemes,
    resetToDefaults,

    // Utility functions
    getThemeColor,
    interpolateThemeColor,
    generateUserMeshPattern,
    getAnimationDuration,

    // Theme presets
    themes: MeshThemes,
    seasonalThemes: SEASONAL_THEMES,
  };

  return (
    <MeshThemeContext.Provider value={contextValue}>
      {children}
    </MeshThemeContext.Provider>
  );
};

// Additional hooks for specific theme aspects
export const useMeshColors = () => {
  const { theme, getThemeColor } = useMeshTheme();

  return {
    colors: theme,
    getColor: getThemeColor,
    primary: theme.primary,
    secondary: theme.secondary,
    background: theme.background,
    surface: theme.surface,
    text: theme.text,
    border: theme.border,
  };
};

export const useMeshAnimations = () => {
  const { config, getAnimationDuration } = useMeshTheme();

  return {
    speed: config.animationSpeed,
    reducedMotion: config.accessibilitySettings.reducedMotion,
    getDuration: getAnimationDuration,
    timing: {
      fast: getAnimationDuration(MeshAnimations.timing.fast),
      normal: getAnimationDuration(MeshAnimations.timing.normal),
      slow: getAnimationDuration(MeshAnimations.timing.slow),
      mesh: getAnimationDuration(MeshAnimations.timing.mesh),
      quantum: getAnimationDuration(MeshAnimations.timing.quantum),
    },
  };
};

export const useMeshConfig = () => {
  const { meshConfig, config, generateUserMeshPattern } = useMeshTheme();

  return {
    ...meshConfig,
    density: config.meshDensity,
    generateUserPattern: generateUserMeshPattern,
  };
};

export const useSeasonalTheme = () => {
  const { season, config, seasonalThemes } = useMeshTheme();

  return {
    currentSeason: season,
    enabled: config.seasonalEnabled,
    seasonalColors: seasonalThemes[season],
    allSeasons: seasonalThemes,
  };
};

export const useAccessibilityTheme = () => {
  const { config, updateAccessibilitySettings } = useMeshTheme();

  return {
    settings: config.accessibilitySettings,
    updateSettings: updateAccessibilitySettings,
    reducedMotion: config.accessibilitySettings.reducedMotion,
    highContrast: config.accessibilitySettings.highContrast,
    largeText: config.accessibilitySettings.largeText,
  };
};

// Theme selector hook for settings screens
export const useThemeSelector = () => {
  const {
    config,
    colorScheme,
    updateThemeMode,
    updateColorScheme,
    updateMeshDensity,
    updateAnimationSpeed,
    toggleSeasonalThemes,
    resetToDefaults,
  } = useMeshTheme();

  const themeOptions = [
    { key: "auto", label: "Auto", description: "Follow system preference" },
    { key: "light", label: "Light", description: "Light theme" },
    { key: "dark", label: "Dark", description: "Dark theme" },
    { key: "quantum", label: "Quantum", description: "Premium quantum theme" },
  ];

  const colorSchemeOptions = [
    { key: "default", label: "Default", description: "ndeip brand colors" },
    { key: "seasonal", label: "Seasonal", description: "Changes with seasons" },
    { key: "custom", label: "Custom", description: "Your custom colors" },
  ];

  return {
    // Current selections
    currentTheme: config.mode,
    currentColorScheme: config.colorScheme,
    meshDensity: config.meshDensity,
    animationSpeed: config.animationSpeed,
    seasonalEnabled: config.seasonalEnabled,

    // Options
    themeOptions,
    colorSchemeOptions,

    // Actions
    selectTheme: updateThemeMode,
    selectColorScheme: updateColorScheme,
    setMeshDensity: updateMeshDensity,
    setAnimationSpeed: updateAnimationSpeed,
    toggleSeasonal: toggleSeasonalThemes,
    reset: resetToDefaults,
  };
};

export default useMeshTheme;
