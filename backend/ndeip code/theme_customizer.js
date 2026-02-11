/**
 * ThemeCustomizer - Advanced Theme Customization for ndeip
 * Mesh patterns, color builder, animation speed controls
 * Accessibility options and real-time preview system
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Slider,
  Animated,
  Dimensions,
  StyleSheet,
  Switch,
  PanResponder,
  Alert,
  StatusBar,
  Haptics,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, {
  Circle,
  Path,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Pattern,
  Rect,
  Polygon,
} from 'react-native-svg';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CrystallineMesh from '../ndeip/CrystallineMesh';
import FloatingCard from '../ui/FloatingCards';
import QuantumLoader from '../ndeip/QuantumLoader';
import { useMeshTheme, useMeshColors, useMeshAnimations } from '../../hooks/useMeshTheme';
import {
  MeshColors,
  MeshTypography,
  MeshSpacing,
  MeshBorderRadius,
  MeshShadows,
  getDynamicColor,
} from '../../constants/ndeipBrandSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Predefined theme presets
const THEME_PRESETS = {
  DEFAULT: {
    id: 'default',
    name: 'ndeip Classic',
    colors: {
      primary: '#003B3B',
      electricBlue: '#0A71EF',
      accent: '#320096',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#000000',
    },
    meshIntensity: 0.7,
    animationSpeed: 1.0,
    crystallineStyle: 'geometric',
  },
  DARK: {
    id: 'dark',
    name: 'Midnight Mesh',
    colors: {
      primary: '#00F5FF',
      electricBlue: '#0A71EF',
      accent: '#9D4EDD',
      background: '#000000',
      surface: '#1A1A1A',
      text: '#FFFFFF',
    },
    meshIntensity: 0.9,
    animationSpeed: 1.2,
    crystallineStyle: 'flowing',
  },
  OCEAN: {
    id: 'ocean',
    name: 'Ocean Depths',
    colors: {
      primary: '#006994',
      electricBlue: '#4FC3F7',
      accent: '#0277BD',
      background: '#E0F7FA',
      surface: '#B2EBF2',
      text: '#01579B',
    },
    meshIntensity: 0.6,
    animationSpeed: 0.8,
    crystallineStyle: 'organic',
  },
  SUNSET: {
    id: 'sunset',
    name: 'Digital Sunset',
    colors: {
      primary: '#FF6B35',
      electricBlue: '#FF8E53',
      accent: '#D84315',
      background: '#FFF3E0',
      surface: '#FFE0B2',
      text: '#BF360C',
    },
    meshIntensity: 0.8,
    animationSpeed: 1.1,
    crystallineStyle: 'radiant',
  },
  FOREST: {
    id: 'forest',
    name: 'Quantum Forest',
    colors: {
      primary: '#2E7D32',
      electricBlue: '#4CAF50',
      accent: '#1B5E20',
      background: '#E8F5E8',
      surface: '#C8E6C9',
      text: '#1B5E20',
    },
    meshIntensity: 0.5,
    animationSpeed: 0.9,
    crystallineStyle: 'natural',
  },
  CYBERPUNK: {
    id: 'cyberpunk',
    name: 'Cyberpunk 2084',
    colors: {
      primary: '#FF00FF',
      electricBlue: '#00FFFF',
      accent: '#FFFF00',
      background: '#0A0A0A',
      surface: '#1A0A1A',
      text: '#00FF00',
    },
    meshIntensity: 1.0,
    animationSpeed: 1.5,
    crystallineStyle: 'neon',
  },
};

// Mesh pattern styles
const MESH_STYLES = {
  geometric: 'Geometric Crystalline',
  flowing: 'Flowing Organic',
  organic: 'Natural Patterns',
  radiant: 'Radiant Burst',
  natural: 'Forest Network',
  neon: 'Neon Grid',
};

// Animation speeds
const ANIMATION_SPEEDS = {
  VERY_SLOW: { value: 0.5, name: 'Very Slow' },
  SLOW: { value: 0.8, name: 'Slow' },
  NORMAL: { value: 1.0, name: 'Normal' },
  FAST: { value: 1.2, name: 'Fast' },
  VERY_FAST: { value: 1.5, name: 'Very Fast' },
};

// Accessibility options
const ACCESSIBILITY_OPTIONS = {
  reduceMotion: 'Reduce motion effects',
  highContrast: 'High contrast mode',
  largerText: 'Larger text size',
  boldText: 'Bold text everywhere',
  colorBlind: 'Color blind friendly',
  focusIndicators: 'Enhanced focus indicators',
};

const ThemeCustomizer = ({ navigation, onThemeChange }) => {
  const { colors, isDark } = useMeshColors();
  const { timing } = useMeshAnimations();
  
  // State management
  const [activePreset, setActivePreset] = useState('default');
  const [customTheme, setCustomTheme] = useState(THEME_PRESETS.DEFAULT);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedColorProperty, setSelectedColorProperty] = useState(null);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [meshPreview, setMeshPreview] = useState(null);
  const [accessibilitySettings, setAccessibilitySettings] = useState({});
  const [previewMode, setPreviewMode] = useState(false);
  
  // Animation refs
  const previewAnimation = useRef(new Animated.Value(0)).current;
  const meshAnimation = useRef(new Animated.Value(0)).current;
  const colorPickerAnimation = useRef(new Animated.Value(0)).current;
  const customizationAnimation = useRef(new Animated.Value(0)).current;
  
  // Color picker state
  const [colorPickerPosition, setColorPickerPosition] = useState({ x: 0, y: 0 });
  const [selectedColor, setSelectedColor] = useState('#0A71EF');
  const [colorHistory, setColorHistory] = useState([]);
  
  // Initialize component
  useEffect(() => {
    loadThemeSettings();
    generateMeshPreview();
    startMeshAnimation();
  }, []);
  
  // Load theme settings
  const loadThemeSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('custom_theme');
      const savedAccessibility = await AsyncStorage.getItem('accessibility_settings');
      
      if (savedTheme) {
        const parsed = JSON.parse(savedTheme);
        setCustomTheme(parsed);
        setActivePreset(parsed.id || 'custom');
      }
      
      if (savedAccessibility) {
        setAccessibilitySettings(JSON.parse(savedAccessibility));
      }
      
    } catch (error) {
      console.error('Failed to load theme settings:', error);
    }
  };
  
  // Save theme settings
  const saveThemeSettings = async (theme, accessibility = null) => {
    try {
      await AsyncStorage.setItem('custom_theme', JSON.stringify(theme));
      
      if (accessibility) {
        await AsyncStorage.setItem('accessibility_settings', JSON.stringify(accessibility));
      }
      
      // Trigger theme change callback
      if (onThemeChange) {
        onThemeChange(theme);
      }
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
    } catch (error) {
      console.error('Failed to save theme settings:', error);
    }
  };
  
  // Generate mesh preview
  const generateMeshPreview = () => {
    const preview = {
      nodes: Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: (i % 5) * 20 + Math.random() * 10,
        y: Math.floor(i / 5) * 20 + Math.random() * 10,
        size: Math.random() * 3 + 2,
        intensity: Math.random(),
        color: customTheme.colors.primary,
      })),
      connections: [],
      style: customTheme.crystallineStyle || 'geometric',
    };
    
    // Generate connections based on style
    for (let i = 0; i < preview.nodes.length; i++) {
      for (let j = i + 1; j < preview.nodes.length; j++) {
        const distance = Math.sqrt(
          Math.pow(preview.nodes[i].x - preview.nodes[j].x, 2) +
          Math.pow(preview.nodes[i].y - preview.nodes[j].y, 2)
        );
        
        if (distance < 25) {
          preview.connections.push({
            from: preview.nodes[i],
            to: preview.nodes[j],
            strength: 1 - (distance / 25),
            style: customTheme.crystallineStyle,
          });
        }
      }
    }
    
    setMeshPreview(preview);
  };
  
  // Start mesh animation
  const startMeshAnimation = () => {
    const animationSpeed = customTheme.animationSpeed || 1.0;
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(meshAnimation, {
          toValue: 1,
          duration: timing.mesh * 2 / animationSpeed,
          useNativeDriver: true,
        }),
        Animated.timing(meshAnimation, {
          toValue: 0,
          duration: timing.mesh * 2 / animationSpeed,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };
  
  // Handle preset selection
  const handlePresetSelect = (presetId) => {
    const preset = THEME_PRESETS[presetId.toUpperCase()];
    if (preset) {
      setActivePreset(presetId);
      setCustomTheme(preset);
      saveThemeSettings(preset);
      generateMeshPreview();
      
      // Trigger haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  // Handle custom color change
  const handleColorChange = (property, color) => {
    const updatedTheme = {
      ...customTheme,
      colors: {
        ...customTheme.colors,
        [property]: color,
      },
    };
    
    setCustomTheme(updatedTheme);
    setActivePreset('custom');
    setIsCustomizing(true);
    
    // Add to color history
    if (!colorHistory.includes(color)) {
      setColorHistory(prev => [color, ...prev.slice(0, 9)]);
    }
    
    generateMeshPreview();
  };
  
  // Handle mesh intensity change
  const handleMeshIntensityChange = (intensity) => {
    const updatedTheme = {
      ...customTheme,
      meshIntensity: intensity,
    };
    
    setCustomTheme(updatedTheme);
    generateMeshPreview();
  };
  
  // Handle animation speed change
  const handleAnimationSpeedChange = (speed) => {
    const updatedTheme = {
      ...customTheme,
      animationSpeed: speed,
    };
    
    setCustomTheme(updatedTheme);
    startMeshAnimation();
  };
  
  // Handle mesh style change
  const handleMeshStyleChange = (style) => {
    const updatedTheme = {
      ...customTheme,
      crystallineStyle: style,
    };
    
    setCustomTheme(updatedTheme);
    generateMeshPreview();
  };
  
  // Handle accessibility setting change
  const handleAccessibilityChange = (setting, value) => {
    const updatedSettings = {
      ...accessibilitySettings,
      [setting]: value,
    };
    
    setAccessibilitySettings(updatedSettings);
    saveThemeSettings(customTheme, updatedSettings);
  };
  
  // Toggle preview mode
  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
    
    Animated.timing(previewAnimation, {
      toValue: previewMode ? 0 : 1,
      duration: timing.normal,
      useNativeDriver: true,
    }).start();
  };
  
  // Save custom theme
  const saveCustomTheme = () => {
    Alert.alert(
      'Save Custom Theme',
      'Would you like to save this theme as your default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: () => {
            const customThemeWithId = {
              ...customTheme,
              id: 'custom',
              name: 'My Custom Theme',
            };
            
            saveThemeSettings(customThemeWithId);
            setIsCustomizing(false);
            
            Alert.alert('Success', 'Custom theme saved successfully!');
          },
        },
      ]
    );
  };
  
  // Reset to default theme
  const resetToDefault = () => {
    Alert.alert(
      'Reset Theme',
      'This will reset your theme to the default ndeip style. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            handlePresetSelect('default');
            setIsCustomizing(false);
          },
        },
      ]
    );
  };
  
  // Color picker component
  const ColorPicker = () => {
    const [hue, setHue] = useState(0);
    const [saturation, setSaturation] = useState(1);
    const [lightness, setLightness] = useState(0.5);
    
    const generateColor = useCallback((h, s, l) => {
      // HSL to RGB conversion
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = l - c / 2;
      
      let r, g, b;
      
      if (h < 60) {
        r = c; g = x; b = 0;
      } else if (h < 120) {
        r = x; g = c; b = 0;
      } else if (h < 180) {
        r = 0; g = c; b = x;
      } else if (h < 240) {
        r = 0; g = x; b = c;
      } else if (h < 300) {
        r = x; g = 0; b = c;
      } else {
        r = c; g = 0; b = x;
      }
      
      r = Math.round((r + m) * 255);
      g = Math.round((g + m) * 255);
      b = Math.round((b + m) * 255);
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }, []);
    
    useEffect(() => {
      const color = generateColor(hue, saturation, lightness);
      setSelectedColor(color);
    }, [hue, saturation, lightness, generateColor]);
    
    return (
      <View style={styles.colorPicker}>
        <View style={styles.colorPreview}>
          <View
            style={[
              styles.colorSample,
              { backgroundColor: selectedColor },
            ]}
          />
          <Text style={[styles.colorValue, { color: colors.text }]}>
            {selectedColor}
          </Text>
        </View>
        
        <View style={styles.colorSliders}>
          <View style={styles.sliderRow}>
            <Text style={[styles.sliderLabel, { color: colors.text }]}>Hue</Text>
            <Slider
              style={styles.colorSlider}
              value={hue}
              minimumValue={0}
              maximumValue={360}
              onValueChange={setHue}
              minimumTrackTintColor="#FF0000"
              maximumTrackTintColor="#0000FF"
            />
          </View>
          
          <View style={styles.sliderRow}>
            <Text style={[styles.sliderLabel, { color: colors.text }]}>Saturation</Text>
            <Slider
              style={styles.colorSlider}
              value={saturation}
              minimumValue={0}
              maximumValue={1}
              onValueChange={setSaturation}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.surface}
            />
          </View>
          
          <View style={styles.sliderRow}>
            <Text style={[styles.sliderLabel, { color: colors.text }]}>Lightness</Text>
            <Slider
              style={styles.colorSlider}
              value={lightness}
              minimumValue={0}
              maximumValue={1}
              onValueChange={setLightness}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.surface}
            />
          </View>
        </View>
        
        <View style={styles.colorActions}>
          <TouchableOpacity
            style={[styles.colorButton, { backgroundColor: colors.surface }]}
            onPress={() => setColorPickerVisible(false)}
          >
            <Text style={[styles.colorButtonText, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.colorButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              handleColorChange(selectedColorProperty, selectedColor);
              setColorPickerVisible(false);
            }}
          >
            <Text style={[styles.colorButtonText, { color: colors.crystallineWhite }]}>
              Apply
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Color history */}
        {colorHistory.length > 0 && (
          <View style={styles.colorHistory}>
            <Text style={[styles.historyTitle, { color: colors.text }]}>Recent Colors</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {colorHistory.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.historyColor, { backgroundColor: color }]}
                  onPress={() => {
                    setSelectedColor(color);
                    handleColorChange(selectedColorProperty, color);
                    setColorPickerVisible(false);
                  }}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };
  
  // Render mesh preview
  const renderMeshPreview = () => {
    if (!meshPreview) return null;
    
    return (
      <View style={styles.meshPreviewContainer}>
        <Svg width="100%" height="100%" viewBox="0 0 100 60">
          <Defs>
            <SvgGradient id="meshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={customTheme.colors.primary} stopOpacity="0.8" />
              <Stop offset="50%" stopColor={customTheme.colors.electricBlue} stopOpacity="0.6" />
              <Stop offset="100%" stopColor={customTheme.colors.accent} stopOpacity="0.4" />
            </SvgGradient>
          </Defs>
          
          {/* Render connections */}
          {meshPreview.connections.map((conn, index) => (
            <Path
              key={`conn-${index}`}
              d={`M ${conn.from.x} ${conn.from.y} L ${conn.to.x} ${conn.to.y}`}
              stroke="url(#meshGradient)"
              strokeWidth={conn.strength * 2}
              opacity={customTheme.meshIntensity * conn.strength}
            />
          ))}
          
          {/* Render nodes */}
          {meshPreview.nodes.map((node, index) => (
            <Circle
              key={`node-${index}`}
              cx={node.x}
              cy={node.y}
              r={node.size}
              fill={customTheme.colors.electricBlue}
              opacity={customTheme.meshIntensity * node.intensity}
            />
          ))}
        </Svg>
      </View>
    );
  };
  
  // Render color property button
  const renderColorProperty = (property, label) => (
    <TouchableOpacity
      key={property}
      style={[
        styles.colorProperty,
        { backgroundColor: customTheme.colors[property] },
      ]}
      onPress={() => {
        setSelectedColorProperty(property);
        setSelectedColor(customTheme.colors[property]);
        setColorPickerVisible(true);
        
        Animated.timing(colorPickerAnimation, {
          toValue: 1,
          duration: timing.normal,
          useNativeDriver: true,
        }).start();
      }}
    >
      <Text style={[styles.colorPropertyLabel, { 
        color: property === 'text' ? customTheme.colors.background : customTheme.colors.text 
      }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: customTheme.colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      {/* Mesh background with live preview */}
      <CrystallineMesh
        variant="large"
        animated={true}
        intensity={customTheme.meshIntensity}
        color={getDynamicColor(customTheme.colors.primary, 0.1)}
        style={[StyleSheet.absoluteFillObject, { zIndex: -1 }]}
      />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: 'rgba(0, 0, 0, 0.1)' }]}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: getDynamicColor(customTheme.colors.surface, 0.9) }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={customTheme.colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: customTheme.colors.text }]}>
          Theme Customizer
        </Text>
        
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: getDynamicColor(customTheme.colors.primary, 0.9) }]}
          onPress={togglePreviewMode}
        >
          <Ionicons name={previewMode ? "eye-off" : "eye"} size={24} color={customTheme.colors.crystallineWhite} />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme presets */}
        <FloatingCard style={styles.section}>
          <Text style={[styles.sectionTitle, { color: customTheme.colors.text }]}>
            Theme Presets
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.entries(THEME_PRESETS).map(([key, preset]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.presetCard,
                  { backgroundColor: preset.colors.surface },
                  activePreset === preset.id && { borderColor: customTheme.colors.primary, borderWidth: 2 },
                ]}
                onPress={() => handlePresetSelect(preset.id)}
              >
                <LinearGradient
                  colors={[preset.colors.primary, preset.colors.electricBlue]}
                  style={styles.presetPreview}
                />
                <Text style={[styles.presetName, { color: preset.colors.text }]}>
                  {preset.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </FloatingCard>
        
        {/* Custom colors */}
        <FloatingCard style={styles.section}>
          <Text style={[styles.sectionTitle, { color: customTheme.colors.text }]}>
            Custom Colors
          </Text>
          
          <View style={styles.colorGrid}>
            {renderColorProperty('primary', 'Primary')}
            {renderColorProperty('electricBlue', 'Electric Blue')}
            {renderColorProperty('accent', 'Accent')}
            {renderColorProperty('background', 'Background')}
            {renderColorProperty('surface', 'Surface')}
            {renderColorProperty('text', 'Text')}
          </View>
          
          {isCustomizing && (
            <View style={styles.customActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: customTheme.colors.surface }]}
                onPress={resetToDefault}
              >
                <Text style={[styles.actionButtonText, { color: customTheme.colors.text }]}>
                  Reset
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: customTheme.colors.primary }]}
                onPress={saveCustomTheme}
              >
                <Text style={[styles.actionButtonText, { color: customTheme.colors.crystallineWhite }]}>
                  Save Theme
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </FloatingCard>
        
        {/* Mesh settings */}
        <FloatingCard style={styles.section}>
          <Text style={[styles.sectionTitle, { color: customTheme.colors.text }]}>
            Mesh Effects
          </Text>
          
          {/* Mesh intensity */}
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: customTheme.colors.text }]}>
              Intensity: {Math.round(customTheme.meshIntensity * 100)}%
            </Text>
            <Slider
              style={styles.settingSlider}
              value={customTheme.meshIntensity}
              minimumValue={0}
              maximumValue={1}
              onValueChange={handleMeshIntensityChange}
              minimumTrackTintColor={customTheme.colors.primary}
              maximumTrackTintColor={customTheme.colors.surface}
            />
          </View>
          
          {/* Animation speed */}
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: customTheme.colors.text }]}>
              Animation Speed: {customTheme.animationSpeed}x
            </Text>
            <Slider
              style={styles.settingSlider}
              value={customTheme.animationSpeed}
              minimumValue={0.5}
              maximumValue={2.0}
              step={0.1}
              onValueChange={handleAnimationSpeedChange}
              minimumTrackTintColor={customTheme.colors.primary}
              maximumTrackTintColor={customTheme.colors.surface}
            />
          </View>
          
          {/* Mesh style */}
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: customTheme.colors.text }]}>
              Pattern Style
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Object.entries(MESH_STYLES).map(([key, name]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.styleOption,
                    { backgroundColor: customTheme.colors.surface },
                    customTheme.crystallineStyle === key && { 
                      backgroundColor: customTheme.colors.primary 
                    },
                  ]}
                  onPress={() => handleMeshStyleChange(key)}
                >
                  <Text style={[
                    styles.styleOptionText,
                    { 
                      color: customTheme.crystallineStyle === key 
                        ? customTheme.colors.crystallineWhite 
                        : customTheme.colors.text 
                    }
                  ]}>
                    {name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Live preview */}
          <View style={styles.previewContainer}>
            <Text style={[styles.previewLabel, { color: customTheme.colors.text }]}>
              Live Preview
            </Text>
            {renderMeshPreview()}
          </View>
        </FloatingCard>
        
        {/* Accessibility */}
        <FloatingCard style={styles.section}>
          <Text style={[styles.sectionTitle, { color: customTheme.colors.text }]}>
            Accessibility
          </Text>
          
          {Object.entries(ACCESSIBILITY_OPTIONS).map(([key, label]) => (
            <View key={key} style={styles.accessibilityRow}>
              <Text style={[styles.accessibilityLabel, { color: customTheme.colors.text }]}>
                {label}
              </Text>
              <Switch
                value={accessibilitySettings[key] || false}
                onValueChange={(value) => handleAccessibilityChange(key, value)}
                trackColor={{
                  false: customTheme.colors.surface,
                  true: getDynamicColor(customTheme.colors.primary, 0.3),
                }}
                thumbColor={
                  accessibilitySettings[key] ? customTheme.colors.primary : customTheme.colors.text
                }
              />
            </View>
          ))}
        </FloatingCard>
      </ScrollView>
      
      {/* Color picker modal */}
      {colorPickerVisible && (
        <Animated.View
          style={[
            styles.colorPickerModal,
            {
              opacity: colorPickerAnimation,
              transform: [{
                scale: colorPickerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              }],
            },
          ]}
        >
          <BlurView intensity={80} style={styles.colorPickerBlur}>
            <FloatingCard style={styles.colorPickerCard}>
              <ColorPicker />
            </FloatingCard>
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: MeshSpacing.md,
    paddingVertical: MeshSpacing.sm,
    paddingTop: MeshSpacing.xl,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: MeshBorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...MeshShadows.medium,
  },
  headerTitle: {
    fontSize: MeshTypography.sizes.xl,
    fontWeight: MeshTypography.weights.bold,
    fontFamily: MeshTypography.families.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: MeshSpacing.md,
    paddingBottom: MeshSpacing.xl,
  },
  section: {
    marginBottom: MeshSpacing.lg,
    padding: MeshSpacing.md,
  },
  sectionTitle: {
    fontSize: MeshTypography.sizes.lg,
    fontWeight: MeshTypography.weights.semibold,
    fontFamily: MeshTypography.families.primary,
    marginBottom: MeshSpacing.md,
  },
  
  // Theme presets
  presetCard: {
    width: 120,
    marginRight: MeshSpacing.sm,
    borderRadius: MeshBorderRadius.lg,
    overflow: 'hidden',
    ...MeshShadows.small,
  },
  presetPreview: {
    height: 60,
    width: '100%',
  },
  presetName: {
    fontSize: MeshTypography.sizes.sm,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.families.primary,
    textAlign: 'center',
    padding: MeshSpacing.sm,
  },
  
  // Color customization
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: MeshSpacing.md,
  },
  colorProperty: {
    width: (screenWidth - MeshSpacing.md * 4) / 3,
    height: 60,
    margin: MeshSpacing.xs,
    borderRadius: MeshBorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...MeshShadows.small,
  },
  colorPropertyLabel: {
    fontSize: MeshTypography.sizes.sm,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.families.primary,
  },
  customActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: MeshSpacing.md,
    borderRadius: MeshBorderRadius.lg,
    alignItems: 'center',
    marginHorizontal: MeshSpacing.xs,
  },
  actionButtonText: {
    fontSize: MeshTypography.sizes.md,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.families.primary,
  },
  
  // Settings
  settingRow: {
    marginBottom: MeshSpacing.md,
  },
  settingLabel: {
    fontSize: MeshTypography.sizes.md,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.families.primary,
    marginBottom: MeshSpacing.sm,
  },
  settingSlider: {
    width: '100%',
    height: 40,
  },
  styleOption: {
    paddingHorizontal: MeshSpacing.md,
    paddingVertical: MeshSpacing.sm,
    marginRight: MeshSpacing.sm,
    borderRadius: MeshBorderRadius.md,
  },
  styleOptionText: {
    fontSize: MeshTypography.sizes.sm,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.families.primary,
  },
  
  // Preview
  previewContainer: {
    marginTop: MeshSpacing.md,
  },
  previewLabel: {
    fontSize: MeshTypography.sizes.md,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.families.primary,
    marginBottom: MeshSpacing.sm,
  },
  meshPreviewContainer: {
    height: 120,
    borderRadius: MeshBorderRadius.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  
  // Accessibility
  accessibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: MeshSpacing.sm,
  },
  accessibilityLabel: {
    flex: 1,
    fontSize: MeshTypography.sizes.md,
    fontFamily: MeshTypography.families.primary,
  },
  
  // Color picker modal
  colorPickerModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorPickerBlur: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorPickerCard: {
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.7,
  },
  colorPicker: {
    padding: MeshSpacing.lg,
  },
  colorPreview: {
    alignItems: 'center',
    marginBottom: MeshSpacing.lg,
  },
  colorSample: {
    width: 80,
    height: 80,
    borderRadius: MeshBorderRadius.lg,
    marginBottom: MeshSpacing.sm,
    ...MeshShadows.medium,
  },
  colorValue: {
    fontSize: MeshTypography.sizes.md,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.families.primary,
  },
  colorSliders: {
    marginBottom: MeshSpacing.lg,
  },
  sliderRow: {
    marginBottom: MeshSpacing.md,
  },
  sliderLabel: {
    fontSize: MeshTypography.sizes.sm,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.families.primary,
    marginBottom: MeshSpacing.xs,
  },
  colorSlider: {
    width: '100%',
    height: 40,
  },
  colorActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: MeshSpacing.md,
  },
  colorButton: {
    flex: 1,
    paddingVertical: MeshSpacing.md,
    borderRadius: MeshBorderRadius.lg,
    alignItems: 'center',
    marginHorizontal: MeshSpacing.xs,
  },
  colorButtonText: {
    fontSize: MeshTypography.sizes.md,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.families.primary,
  },
  colorHistory: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: MeshSpacing.md,
  },
  historyTitle: {
    fontSize: MeshTypography.sizes.sm,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.families.primary,
    marginBottom: MeshSpacing.sm,
  },
  historyColor: {
    width: 32,
    height: 32,
    borderRadius: MeshBorderRadius.sm,
    marginRight: MeshSpacing.xs,
    ...MeshShadows.small,
  },
});

export default ThemeCustomizer;