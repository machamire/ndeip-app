
/**
 * MediaEditor - Professional Media Editing Tools
 * Mesh filters with crystalline photo/video effects, advanced editing tools
 * Crop, rotate, color adjustment with mesh UI, video timeline with mesh styling
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Image,
  Alert,
  Modal,
  ScrollView,
  PanResponder,
  Slider,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { PinchGestureHandler, PanGestureHandler, RotationGestureHandler } from 'react-native-gesture-handler';
// expo-image-manipulator is native-only; lazy-load to avoid web build crash
let ImageManipulator = null;
try { ImageManipulator = require('expo-image-manipulator'); } catch (e) { }
// expo-file-system is native-only; lazy-load to avoid web build crash
let FileSystem = null;
try { FileSystem = require('expo-file-system'); } catch (e) { }
import Svg, {
  Circle,
  Path,
  G,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  AnimatedCircle,
  AnimatedPath,
  Pattern,
  Rect,
  Polygon,
} from 'react-native-svg';

// Import our mesh components
import CrystallineMesh from '../../components/ndeip/CrystallineMesh';
import FloatingCard from '../../components/ui/FloatingCards';
import QuantumLoader from '../../components/ndeip/QuantumLoader';
import { useMeshTheme, useMeshColors, useMeshAnimations } from '../../hooks/useMeshTheme';
import { generateUserMesh } from '../../utils/MeshGenerator';
import {
  MeshColors,
  MeshTypography,
  MeshSpacing,
  MeshBorderRadius,
  MeshShadows,
  getDynamicColor,
} from '../../constants/ndeipBrandSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Editing tools
const EDIT_TOOLS = {
  CROP: 'crop',
  ROTATE: 'rotate',
  FILTERS: 'filters',
  ADJUST: 'adjust',
  TEXT: 'text',
  STICKERS: 'stickers',
  DRAW: 'draw',
  MESH: 'mesh',
};

// Mesh filters
const MESH_FILTERS = {
  NONE: 'none',
  CRYSTALLINE: 'crystalline',
  NEON_GRID: 'neon_grid',
  PARTICLE_FLOW: 'particle_flow',
  QUANTUM_BLUR: 'quantum_blur',
  HOLOGRAPHIC: 'holographic',
  DIGITAL_RAIN: 'digital_rain',
  CYBER_WAVE: 'cyber_wave',
};

// Adjustment types
const ADJUSTMENTS = {
  BRIGHTNESS: 'brightness',
  CONTRAST: 'contrast',
  SATURATION: 'saturation',
  WARMTH: 'warmth',
  SHARPNESS: 'sharpness',
  VIGNETTE: 'vignette',
  GRAIN: 'grain',
  FADE: 'fade',
};

// Crop presets
const CROP_PRESETS = {
  ORIGINAL: 'original',
  SQUARE: '1:1',
  PORTRAIT: '3:4',
  LANDSCAPE: '4:3',
  WIDE: '16:9',
  STORY: '9:16',
};

const MediaEditor = ({
  route,
  navigation,
  media,
  onSave,
  onCancel,
  allowedTools = Object.values(EDIT_TOOLS),
  maxOutputSize = 2048,
}) => {
  const { colors } = useMeshColors();
  const { timing } = useMeshAnimations();

  // Editing state
  const [activeTool, setActiveTool] = useState(null);
  const [editedImage, setEditedImage] = useState(media?.uri);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Filter and adjustment state
  const [activeFilter, setActiveFilter] = useState(MESH_FILTERS.NONE);
  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    warmth: 0,
    sharpness: 0,
    vignette: 0,
    grain: 0,
    fade: 0,
  });

  // Crop state
  const [cropData, setCropData] = useState({
    originX: 0,
    originY: 0,
    width: media?.width || screenWidth,
    height: media?.height || screenHeight,
    rotation: 0,
  });

  // Transform state
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [rotation, setRotation] = useState(0);

  // Text overlay state
  const [textOverlays, setTextOverlays] = useState([]);
  const [showTextModal, setShowTextModal] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textSize, setTextSize] = useState(24);

  // Animation refs
  const toolbarAnimation = useRef(new Animated.Value(0)).current;
  const previewAnimation = useRef(new Animated.Value(0)).current;
  const meshAnimation = useRef(new Animated.Value(0)).current;
  const processingAnimation = useRef(new Animated.Value(0)).current;

  // Gesture refs
  const gestureScale = useRef(new Animated.Value(1)).current;
  const gestureTranslateX = useRef(new Animated.Value(0)).current;
  const gestureTranslateY = useRef(new Animated.Value(0)).current;
  const gestureRotation = useRef(new Animated.Value(0)).current;

  // Initialize editor
  useEffect(() => {
    if (media) {
      initializeEditor();
      startAnimations();
    }
  }, [media]);

  // Handle tool changes
  useEffect(() => {
    Animated.timing(toolbarAnimation, {
      toValue: activeTool ? 1 : 0,
      duration: timing.normal,
      useNativeDriver: true,
    }).start();
  }, [activeTool]);

  // Initialize editor
  const initializeEditor = () => {
    setEditedImage(media.uri);
    setCropData({
      originX: 0,
      originY: 0,
      width: media.width || screenWidth,
      height: media.height || screenHeight,
      rotation: 0,
    });
  };

  // Start animations
  const startAnimations = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(meshAnimation, {
          toValue: 1,
          duration: timing.mesh * 2,
          useNativeDriver: true,
        }),
        Animated.timing(meshAnimation, {
          toValue: 0,
          duration: timing.mesh * 2,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Handle tool selection
  const handleToolSelect = (tool) => {
    if (activeTool === tool) {
      setActiveTool(null);
    } else {
      setActiveTool(tool);
    }
  };

  // Handle filter application
  const handleFilterApply = async (filter) => {
    if (filter === activeFilter) return;

    setActiveFilter(filter);
    setHasChanges(true);

    if (filter !== MESH_FILTERS.NONE) {
      await applyMeshFilter(filter);
    }
  };

  // Apply mesh filter
  const applyMeshFilter = async (filter) => {
    try {
      setIsProcessing(true);
      startProcessingAnimation();

      // In a real implementation, this would apply the actual filter
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Here you would use image processing libraries to apply mesh effects
      const processedImage = await ImageManipulator.manipulateAsync(
        editedImage,
        [],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      setEditedImage(processedImage.uri);

    } catch (error) {
      console.error('Failed to apply filter:', error);
      Alert.alert('Error', 'Failed to apply filter');
    } finally {
      setIsProcessing(false);
      stopProcessingAnimation();
    }
  };

  // Handle adjustment changes
  const handleAdjustmentChange = (type, value) => {
    setAdjustments(prev => ({
      ...prev,
      [type]: value,
    }));
    setHasChanges(true);
  };

  // Apply adjustments
  const applyAdjustments = async () => {
    try {
      setIsProcessing(true);

      const actions = [];

      // Convert adjustments to ImageManipulator actions
      if (adjustments.brightness !== 0) {
        // Note: expo-image-manipulator has limited built-in adjustments
        // In a real app, you'd use a more powerful image processing library
      }

      const result = await ImageManipulator.manipulateAsync(
        editedImage,
        actions,
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      setEditedImage(result.uri);

    } catch (error) {
      console.error('Failed to apply adjustments:', error);
      Alert.alert('Error', 'Failed to apply adjustments');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle crop
  const handleCrop = async (preset) => {
    try {
      setIsProcessing(true);

      let cropRect = { ...cropData };

      if (preset !== CROP_PRESETS.ORIGINAL) {
        const aspectRatio = getCropAspectRatio(preset);
        const imageAspect = media.width / media.height;

        if (aspectRatio > imageAspect) {
          // Crop height
          const newHeight = media.width / aspectRatio;
          cropRect = {
            originX: 0,
            originY: (media.height - newHeight) / 2,
            width: media.width,
            height: newHeight,
          };
        } else {
          // Crop width
          const newWidth = media.height * aspectRatio;
          cropRect = {
            originX: (media.width - newWidth) / 2,
            originY: 0,
            width: newWidth,
            height: media.height,
          };
        }
      }

      const result = await ImageManipulator.manipulateAsync(
        editedImage,
        [
          {
            crop: {
              originX: cropRect.originX,
              originY: cropRect.originY,
              width: cropRect.width,
              height: cropRect.height,
            },
          },
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      setEditedImage(result.uri);
      setCropData(cropRect);
      setHasChanges(true);

    } catch (error) {
      console.error('Failed to crop image:', error);
      Alert.alert('Error', 'Failed to crop image');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle rotation
  const handleRotate = async (degrees) => {
    try {
      setIsProcessing(true);

      const result = await ImageManipulator.manipulateAsync(
        editedImage,
        [{ rotate: degrees }],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      setEditedImage(result.uri);
      setRotation(prev => prev + degrees);
      setHasChanges(true);

    } catch (error) {
      console.error('Failed to rotate image:', error);
      Alert.alert('Error', 'Failed to rotate image');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle text overlay
  const handleAddText = () => {
    if (currentText.trim()) {
      const newTextOverlay = {
        id: Date.now(),
        text: currentText,
        color: textColor,
        size: textSize,
        x: screenWidth / 2,
        y: screenHeight / 2,
      };

      setTextOverlays(prev => [...prev, newTextOverlay]);
      setCurrentText('');
      setShowTextModal(false);
      setHasChanges(true);
    }
  };

  // Remove text overlay
  const removeTextOverlay = (id) => {
    setTextOverlays(prev => prev.filter(overlay => overlay.id !== id));
    setHasChanges(true);
  };

  // Save edited media
  const handleSave = async () => {
    try {
      setIsProcessing(true);
      startProcessingAnimation();

      // Apply final processing
      const finalResult = await ImageManipulator.manipulateAsync(
        editedImage,
        [],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      if (onSave) {
        onSave({
          ...media,
          uri: finalResult.uri,
          width: finalResult.width,
          height: finalResult.height,
          filter: activeFilter,
          adjustments,
          textOverlays,
          edited: true,
        });
      }

      navigation.goBack();

    } catch (error) {
      console.error('Failed to save media:', error);
      Alert.alert('Error', 'Failed to save edited media');
    } finally {
      setIsProcessing(false);
      stopProcessingAnimation();
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              if (onCancel) onCancel();
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      if (onCancel) onCancel();
      navigation.goBack();
    }
  };

  // Start processing animation
  const startProcessingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(processingAnimation, {
          toValue: 1,
          duration: timing.normal,
          useNativeDriver: true,
        }),
        Animated.timing(processingAnimation, {
          toValue: 0,
          duration: timing.normal,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Stop processing animation
  const stopProcessingAnimation = () => {
    processingAnimation.stopAnimation();
    processingAnimation.setValue(0);
  };

  // Get crop aspect ratio
  const getCropAspectRatio = (preset) => {
    switch (preset) {
      case CROP_PRESETS.SQUARE:
        return 1;
      case CROP_PRESETS.PORTRAIT:
        return 3 / 4;
      case CROP_PRESETS.LANDSCAPE:
        return 4 / 3;
      case CROP_PRESETS.WIDE:
        return 16 / 9;
      case CROP_PRESETS.STORY:
        return 9 / 16;
      default:
        return (media?.width || screenWidth) / (media?.height || screenHeight);
    }
  };

  // Get tool icon
  const getToolIcon = (tool) => {
    switch (tool) {
      case EDIT_TOOLS.CROP:
        return 'crop';
      case EDIT_TOOLS.ROTATE:
        return 'rotate-90-degrees-ccw';
      case EDIT_TOOLS.FILTERS:
        return 'filter';
      case EDIT_TOOLS.ADJUST:
        return 'tune';
      case EDIT_TOOLS.TEXT:
        return 'text-fields';
      case EDIT_TOOLS.STICKERS:
        return 'emoji-emotions';
      case EDIT_TOOLS.DRAW:
        return 'brush';
      case EDIT_TOOLS.MESH:
        return 'auto-awesome';
      default:
        return 'edit';
    }
  };

  // Get filter name
  const getFilterName = (filter) => {
    switch (filter) {
      case MESH_FILTERS.NONE:
        return 'None';
      case MESH_FILTERS.CRYSTALLINE:
        return 'Crystalline';
      case MESH_FILTERS.NEON_GRID:
        return 'Neon Grid';
      case MESH_FILTERS.PARTICLE_FLOW:
        return 'Particle Flow';
      case MESH_FILTERS.QUANTUM_BLUR:
        return 'Quantum Blur';
      case MESH_FILTERS.HOLOGRAPHIC:
        return 'Holographic';
      case MESH_FILTERS.DIGITAL_RAIN:
        return 'Digital Rain';
      case MESH_FILTERS.CYBER_WAVE:
        return 'Cyber Wave';
      default:
        return filter;
    }
  };

  // Render mesh filter overlay
  const renderMeshFilterOverlay = () => {
    if (activeFilter === MESH_FILTERS.NONE) return null;

    return (
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { opacity: meshAnimation.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] }) },
        ]}
        pointerEvents="none"
      >
        {renderMeshEffect()}
      </Animated.View>
    );
  };

  // Render specific mesh effect
  const renderMeshEffect = () => {
    const meshPattern = generateUserMesh('editor_filter');

    switch (activeFilter) {
      case MESH_FILTERS.CRYSTALLINE:
        return (
          <Svg width={screenWidth} height={screenHeight} style={StyleSheet.absoluteFillObject}>
            <Defs>
              <SvgGradient id="crystallineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#00F5FF" stopOpacity="0.4" />
                <Stop offset="50%" stopColor="#0A71EF" stopOpacity="0.6" />
                <Stop offset="100%" stopColor="#320096" stopOpacity="0.4" />
              </SvgGradient>

              <Pattern id="crystallinePattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                <Polygon
                  points="0,15 15,0 30,15 15,30"
                  fill="none"
                  stroke="#00F5FF"
                  strokeWidth="0.5"
                  opacity="0.6"
                />
                <Circle cx="15" cy="15" r="2" fill="#0A71EF" opacity="0.4" />
              </Pattern>
            </Defs>

            <Rect width="100%" height="100%" fill="url(#crystallinePattern)" />

            {meshPattern.connections?.slice(0, 15).map((connection, index) => (
              <AnimatedPath
                key={index}
                d={`M ${connection.from.x * 5} ${connection.from.y * 5} L ${connection.to.x * 5} ${connection.to.y * 5}`}
                stroke="url(#crystallineGradient)"
                strokeWidth="1"
                opacity={meshAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 0.6],
                })}
              />
            ))}
          </Svg>
        );

      case MESH_FILTERS.NEON_GRID:
        return (
          <Svg width={screenWidth} height={screenHeight} style={StyleSheet.absoluteFillObject}>
            <Defs>
              <SvgGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#00FF88" stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#00F5FF" stopOpacity="0.6" />
              </SvgGradient>
            </Defs>

            {/* Vertical lines */}
            {Array.from({ length: 12 }, (_, index) => (
              <AnimatedPath
                key={`v-${index}`}
                d={`M ${(index / 12) * screenWidth} 0 L ${(index / 12) * screenWidth} ${screenHeight}`}
                stroke="url(#neonGradient)"
                strokeWidth="1"
                opacity={meshAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 0.6],
                })}
              />
            ))}

            {/* Horizontal lines */}
            {Array.from({ length: 8 }, (_, index) => (
              <AnimatedPath
                key={`h-${index}`}
                d={`M 0 ${(index / 8) * screenHeight} L ${screenWidth} ${(index / 8) * screenHeight}`}
                stroke="url(#neonGradient)"
                strokeWidth="1"
                opacity={meshAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 0.6],
                })}
              />
            ))}
          </Svg>
        );

      case MESH_FILTERS.PARTICLE_FLOW:
        return (
          <Svg width={screenWidth} height={screenHeight} style={StyleSheet.absoluteFillObject}>
            <Defs>
              <SvgGradient id="particleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#FF00F5" stopOpacity="0.6" />
                <Stop offset="100%" stopColor="#00F5FF" stopOpacity="0.4" />
              </SvgGradient>
            </Defs>

            {Array.from({ length: 50 }, (_, index) => {
              const x = (index * 50) % screenWidth;
              const y = (index * 30) % screenHeight;
              const radius = 2 + (index % 3);

              return (
                <AnimatedCircle
                  key={index}
                  cx={x}
                  cy={y}
                  r={radius}
                  fill="url(#particleGradient)"
                  opacity={meshAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.1, 0.7],
                  })}
                />
              );
            })}
          </Svg>
        );

      default:
        return null;
    }
  };

  // Render top toolbar
  const renderTopToolbar = () => (
    <SafeAreaView style={styles.topToolbar}>
      <View style={styles.topToolbarContent}>
        <TouchableOpacity
          style={[styles.toolbarButton, { backgroundColor: getDynamicColor(colors.surface, 0.9) }]}
          onPress={handleCancel}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.editorTitle, { color: colors.text }]}>
          Edit Media
        </Text>

        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: hasChanges ? colors.primary : colors.surface },
          ]}
          onPress={handleSave}
          disabled={!hasChanges || isProcessing}
        >
          {isProcessing ? (
            <QuantumLoader type="dots" size="small" color={colors.crystallineWhite} />
          ) : (
            <Text
              style={[
                styles.saveButtonText,
                { color: hasChanges ? colors.crystallineWhite : colors.textSecondary },
              ]}
            >
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // Render image canvas
  const renderImageCanvas = () => (
    <View style={styles.canvasContainer}>
      <PinchGestureHandler>
        <PanGestureHandler>
          <RotationGestureHandler>
            <Animated.View style={styles.imageContainer}>
              <Image
                source={{ uri: editedImage }}
                style={styles.editImage}
                resizeMode="contain"
              />

              {/* Mesh filter overlay */}
              {renderMeshFilterOverlay()}

              {/* Text overlays */}
              {textOverlays.map((overlay) => (
                <TouchableOpacity
                  key={overlay.id}
                  style={[
                    styles.textOverlay,
                    {
                      left: overlay.x - 50,
                      top: overlay.y - 20,
                    },
                  ]}
                  onPress={() => removeTextOverlay(overlay.id)}
                >
                  <Text
                    style={[
                      styles.overlayText,
                      {
                        color: overlay.color,
                        fontSize: overlay.size,
                      },
                    ]}
                  >
                    {overlay.text}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Crop overlay */}
              {activeTool === EDIT_TOOLS.CROP && (
                <CropOverlay
                  cropData={cropData}
                  onCropChange={setCropData}
                  colors={colors}
                />
              )}
            </Animated.View>
          </RotationGestureHandler>
        </PanGestureHandler>
      </PinchGestureHandler>
    </View>
  );

  // Render bottom tools
  const renderBottomTools = () => (
    <View style={styles.bottomTools}>
      {/* Main tools */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.toolsContainer}
      >
        {allowedTools.map((tool) => (
          <TouchableOpacity
            key={tool}
            style={[
              styles.toolButton,
              activeTool === tool && { backgroundColor: colors.primary },
            ]}
            onPress={() => handleToolSelect(tool)}
          >
            <MaterialIcons
              name={getToolIcon(tool)}
              size={24}
              color={activeTool === tool ? colors.crystallineWhite : colors.text}
            />
            <Text
              style={[
                styles.toolText,
                {
                  color: activeTool === tool ? colors.crystallineWhite : colors.text,
                },
              ]}
            >
              {tool.charAt(0).toUpperCase() + tool.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tool-specific controls */}
      <Animated.View
        style={[
          styles.toolControls,
          {
            opacity: toolbarAnimation,
            transform: [{
              translateY: toolbarAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            }],
          },
        ]}
      >
        {renderToolControls()}
      </Animated.View>
    </View>
  );

  // Render tool-specific controls
  const renderToolControls = () => {
    switch (activeTool) {
      case EDIT_TOOLS.FILTERS:
        return <FiltersPanel activeFilter={activeFilter} onFilterSelect={handleFilterApply} colors={colors} />;

      case EDIT_TOOLS.ADJUST:
        return <AdjustmentsPanel adjustments={adjustments} onAdjustmentChange={handleAdjustmentChange} colors={colors} />;

      case EDIT_TOOLS.CROP:
        return <CropPanel onCropSelect={handleCrop} colors={colors} />;

      case EDIT_TOOLS.ROTATE:
        return <RotatePanel onRotate={handleRotate} colors={colors} />;

      case EDIT_TOOLS.TEXT:
        return <TextPanel onAddText={() => setShowTextModal(true)} colors={colors} />;

      default:
        return null;
    }
  };

  if (!media) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          No media to edit
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      {/* Mesh background */}
      <CrystallineMesh
        variant="small"
        animated={true}
        intensity={0.05}
        color={getDynamicColor(colors.primary, 0.03)}
        style={[StyleSheet.absoluteFillObject, { zIndex: -1 }]}
      />

      {/* Top toolbar */}
      {renderTopToolbar()}

      {/* Image canvas */}
      {renderImageCanvas()}

      {/* Bottom tools */}
      {renderBottomTools()}

      {/* Text input modal */}
      <Modal
        visible={showTextModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTextModal(false)}
      >
        <View style={styles.modalOverlay}>
          <FloatingCard style={styles.textModal}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Text</Text>

            <TextInput
              style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
              value={currentText}
              onChangeText={setCurrentText}
              placeholder="Enter text..."
              placeholderTextColor={colors.textSecondary}
              multiline={true}
              autoFocus={true} />

            <View style={styles.colorPicker}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Text Color</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['#FFFFFF', '#000000', colors.primary, colors.electricBlue, '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'].map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      textColor === color && { borderColor: colors.primary, borderWidth: 3 },
                    ]}
                    onPress={() => setTextColor(color)}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.sliderContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Text Size: {textSize}pt</Text>
              <Slider
                style={styles.slider}
                minimumValue={12}
                maximumValue={48}
                value={textSize}
                onValueChange={setTextSize}
                step={2}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.surface}
                thumbStyle={{ backgroundColor: colors.electricBlue }}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.surface }]}
                onPress={() => setShowTextModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleAddText}
              >
                <Text style={[styles.modalButtonText, { color: colors.crystallineWhite }]}>Add Text</Text>
              </TouchableOpacity>
            </View>
          </FloatingCard>
        </View>
      </Modal>

      {/* Processing overlay */}
      {isProcessing && (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            styles.processingOverlay,
            {
              opacity: processingAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ]}
        >
          <View style={styles.processingContent}>
            <QuantumLoader type="mesh" size="large" color={colors.electricBlue} />
            <Text style={[styles.processingText, { color: colors.crystallineWhite }]}>
              Processing...
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

// Filters Panel Component
const FiltersPanel = ({ activeFilter, onFilterSelect, colors }) => (
  <View style={styles.filtersPanel}>
    <Text style={[styles.panelTitle, { color: colors.text }]}>Mesh Filters</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {Object.values(MESH_FILTERS).map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterButton,
            {
              backgroundColor: activeFilter === filter ? colors.primary : colors.surface,
            },
          ]}
          onPress={() => onFilterSelect(filter)}
        >
          <View style={[styles.filterPreview, { backgroundColor: colors.background }]}>
            {renderFilterPreview(filter, colors)}
          </View>
          <Text
            style={[
              styles.filterText,
              {
                color: activeFilter === filter ? colors.crystallineWhite : colors.text,
              },
            ]}
          >
            {getFilterName(filter)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

// Adjustments Panel Component
const AdjustmentsPanel = ({ adjustments, onAdjustmentChange, colors }) => (
  <View style={styles.adjustmentsPanel}>
    <Text style={[styles.panelTitle, { color: colors.text }]}>Adjustments</Text>
    <ScrollView>
      {Object.entries(ADJUSTMENTS).map(([key, type]) => (
        <View key={type} style={styles.adjustmentRow}>
          <Text style={[styles.adjustmentLabel, { color: colors.text }]}>
            {key.charAt(0) + key.slice(1).toLowerCase()}
          </Text>
          <View style={styles.adjustmentSlider}>
            <Text style={[styles.adjustmentValue, { color: colors.textSecondary }]}>
              {adjustments[type]}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={-100}
              maximumValue={100}
              value={adjustments[type]}
              onValueChange={(value) => onAdjustmentChange(type, Math.round(value))}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.surface}
              thumbStyle={{ backgroundColor: colors.electricBlue }}
            />
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.applyButton, { backgroundColor: colors.electricBlue }]}
        onPress={() => { }}
      >
        <Text style={[styles.applyButtonText, { color: colors.crystallineWhite }]}>
          Apply Changes
        </Text>
      </TouchableOpacity>
    </ScrollView>
  </View>
);

// Crop Panel Component
const CropPanel = ({ onCropSelect, colors }) => (
  <View style={styles.cropPanel}>
    <Text style={[styles.panelTitle, { color: colors.text }]}>Crop Ratio</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {Object.entries(CROP_PRESETS).map(([key, ratio]) => (
        <TouchableOpacity
          key={key}
          style={[styles.cropButton, { backgroundColor: colors.surface }]}
          onPress={() => onCropSelect(ratio)}
        >
          <View style={[styles.cropPreview, getCropPreviewStyle(ratio)]}>
            <View style={[styles.cropFrame, { backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.cropText, { color: colors.text }]}>
            {key === 'ORIGINAL' ? 'Original' : ratio}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

// Rotate Panel Component
const RotatePanel = ({ onRotate, colors }) => (
  <View style={styles.rotatePanel}>
    <Text style={[styles.panelTitle, { color: colors.text }]}>Rotate</Text>
    <View style={styles.rotateButtons}>
      <TouchableOpacity
        style={[styles.rotateButton, { backgroundColor: colors.surface }]}
        onPress={() => onRotate(-90)}
      >
        <MaterialIcons name="rotate-left" size={24} color={colors.text} />
        <Text style={[styles.rotateText, { color: colors.text }]}>90° Left</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.rotateButton, { backgroundColor: colors.surface }]}
        onPress={() => onRotate(90)}
      >
        <MaterialIcons name="rotate-right" size={24} color={colors.text} />
        <Text style={[styles.rotateText, { color: colors.text }]}>90° Right</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.rotateButton, { backgroundColor: colors.surface }]}
        onPress={() => onRotate(180)}
      >
        <MaterialIcons name="flip" size={24} color={colors.text} />
        <Text style={[styles.rotateText, { color: colors.text }]}>180°</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// Text Panel Component
const TextPanel = ({ onAddText, colors }) => (
  <View style={styles.textPanel}>
    <Text style={[styles.panelTitle, { color: colors.text }]}>Text Tools</Text>
    <TouchableOpacity
      style={[styles.textToolButton, { backgroundColor: colors.primary }]}
      onPress={onAddText}
    >
      <MaterialIcons name="text-fields" size={24} color={colors.crystallineWhite} />
      <Text style={[styles.textToolText, { color: colors.crystallineWhite }]}>
        Add Text
      </Text>
    </TouchableOpacity>
  </View>
);

// Crop Overlay Component
const CropOverlay = ({ cropData, onCropChange, colors }) => {
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      // Handle crop area adjustment
      const { dx, dy } = gestureState;
      onCropChange({
        ...cropData,
        originX: Math.max(0, cropData.originX + dx),
        originY: Math.max(0, cropData.originY + dy),
      });
    },
  });

  return (
    <View style={StyleSheet.absoluteFillObject} {...panResponder.panHandlers}>
      {/* Crop overlay with mesh pattern */}
      <Svg width={screenWidth} height={screenHeight} style={StyleSheet.absoluteFillObject}>
        <Defs>
          <SvgGradient id="cropOverlay" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={colors.electricBlue} stopOpacity="0.1" />
          </SvgGradient>
        </Defs>

        {/* Crop frame */}
        <Rect
          x={cropData.originX}
          y={cropData.originY}
          width={cropData.width}
          height={cropData.height}
          fill="none"
          stroke={colors.electricBlue}
          strokeWidth="2"
          strokeDasharray="5,5"
        />

        {/* Corner handles */}
        {[
          { x: cropData.originX, y: cropData.originY },
          { x: cropData.originX + cropData.width, y: cropData.originY },
          { x: cropData.originX, y: cropData.originY + cropData.height },
          { x: cropData.originX + cropData.width, y: cropData.originY + cropData.height },
        ].map((corner, index) => (
          <Circle
            key={index}
            cx={corner.x}
            cy={corner.y}
            r="8"
            fill={colors.electricBlue}
            stroke={colors.crystallineWhite}
            strokeWidth="2"
          />
        ))}
      </Svg>
    </View>
  );
};

// Helper function to render filter preview
const renderFilterPreview = (filter, colors) => {
  switch (filter) {
    case MESH_FILTERS.NONE:
      return <View style={[styles.noFilterPreview, { backgroundColor: colors.surface }]} />;

    case MESH_FILTERS.CRYSTALLINE:
      return (
        <Svg width={40} height={40}>
          <Polygon
            points="5,20 20,5 35,20 20,35"
            fill={colors.primary}
            opacity="0.6"
          />
          <Circle cx="20" cy="20" r="3" fill={colors.electricBlue} />
        </Svg>
      );

    case MESH_FILTERS.NEON_GRID:
      return (
        <Svg width={40} height={40}>
          {[0, 1, 2, 3].map((i) => (
            <React.Fragment key={i}>
              <Path
                d={`M ${i * 10} 0 L ${i * 10} 40`}
                stroke={colors.electricBlue}
                strokeWidth="1"
                opacity="0.7"
              />
              <Path
                d={`M 0 ${i * 10} L 40 ${i * 10}`}
                stroke={colors.electricBlue}
                strokeWidth="1"
                opacity="0.7"
              />
            </React.Fragment>
          ))}
        </Svg>
      );

    default:
      return (
        <View style={[styles.defaultFilterPreview, { backgroundColor: colors.primary }]}>
          <MaterialIcons name="auto-awesome" size={16} color={colors.crystallineWhite} />
        </View>
      );
  }
};

// Helper function to get crop preview style
const getCropPreviewStyle = (ratio) => {
  const baseSize = 40;

  switch (ratio) {
    case '1:1':
      return { width: baseSize, height: baseSize };
    case '3:4':
      return { width: baseSize * 0.75, height: baseSize };
    case '4:3':
      return { width: baseSize, height: baseSize * 0.75 };
    case '16:9':
      return { width: baseSize, height: baseSize * 0.5625 };
    case '9:16':
      return { width: baseSize * 0.5625, height: baseSize };
    default:
      return { width: baseSize, height: baseSize * 0.8 };
  }
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topToolbar: {
    zIndex: 100,
  },
  topToolbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: MeshSpacing.md,
    paddingVertical: MeshSpacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  toolbarButton: {
    width: 44,
    height: 44,
    borderRadius: MeshBorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...MeshShadows.medium,
  },
  editorTitle: {
    fontSize: MeshTypography.sizes.lg,
    fontWeight: MeshTypography.weights.semibold,
    fontFamily: MeshTypography.families.primary,
  },
  saveButton: {
    paddingHorizontal: MeshSpacing.md,
    paddingVertical: MeshSpacing.sm,
    borderRadius: MeshBorderRadius.lg,
    ...MeshShadows.medium,
  },
  saveButtonText: {
    fontSize: MeshTypography.sizes.md,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.families.primary,
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editImage: {
    width: screenWidth,
    height: screenHeight * 0.7,
  },
  textOverlay: {
    position: 'absolute',
    padding: MeshSpacing.sm,
    borderRadius: MeshBorderRadius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayText: {
    fontFamily: MeshTypography.families.primary,
    fontWeight: MeshTypography.weights.medium,
    textAlign: 'center',
  },
  bottomTools: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingBottom: MeshSpacing.xl,
  },
  toolsContainer: {
    paddingHorizontal: MeshSpacing.md,
    paddingVertical: MeshSpacing.sm,
  },
  toolButton: {
    alignItems: 'center',
    marginRight: MeshSpacing.md,
    paddingHorizontal: MeshSpacing.sm,
    paddingVertical: MeshSpacing.xs,
    borderRadius: MeshBorderRadius.lg,
    minWidth: 80,
  },
  toolText: {
    fontSize: MeshTypography.sizes.xs,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.families.primary,
    marginTop: MeshSpacing.xs,
  },
  toolControls: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    paddingVertical: MeshSpacing.md,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: MeshSpacing.lg,
  },
  textModal: {
    width: '90%',
    padding: MeshSpacing.lg,
  },
  modalTitle: {
    fontSize: MeshTypography.sizes.xl,
    fontWeight: MeshTypography.weights.bold,
    fontFamily: MeshTypography.families.primary,
    marginBottom: MeshSpacing.md,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: MeshBorderRadius.lg,
    padding: MeshSpacing.md,
    fontSize: MeshTypography.sizes.md,
    fontFamily: MeshTypography.families.primary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: MeshSpacing.md,
  },
  colorPicker: {
    marginBottom: MeshSpacing.md,
  },
  inputLabel: {
    fontSize: MeshTypography.sizes.sm,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.families.primary,
    marginBottom: MeshSpacing.xs,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: MeshBorderRadius.full,
    marginRight: MeshSpacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sliderContainer: {
    marginBottom: MeshSpacing.lg,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: MeshSpacing.md,
    borderRadius: MeshBorderRadius.lg,
    alignItems: 'center',
    marginHorizontal: MeshSpacing.xs,
  },
  modalButtonText: {
    fontSize: MeshTypography.sizes.md,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.families.primary,
  },

  // Processing overlay
  processingOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingContent: {
    alignItems: 'center',
  },
  processingText: {
    fontSize: MeshTypography.sizes.lg,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.families.primary,
    marginTop: MeshSpacing.md,
  },

  // Panel styles
  filtersPanel: {
    paddingHorizontal: MeshSpacing.md,
    paddingVertical: MeshSpacing.sm,
  },
  panelTitle: {
    fontSize: MeshTypography.sizes.md,
    fontWeight: MeshTypography.weights.semibold,
    fontFamily: MeshTypography.families.primary,
    marginBottom: MeshSpacing.sm,
    textAlign: 'center',
  },
  filterButton: {
    alignItems: 'center',
    marginRight: MeshSpacing.md,
    paddingHorizontal: MeshSpacing.sm,
    paddingVertical: MeshSpacing.xs,
    borderRadius: MeshBorderRadius.lg,
    minWidth: 70,
  },
  filterPreview: {
    width: 40,
    height: 40,
    borderRadius: MeshBorderRadius.md,
    marginBottom: MeshSpacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: MeshTypography.sizes.xs,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.families.primary,
    textAlign: 'center',
  },
  noFilterPreview: {
    width: '100%',
    height: '100%',
    borderRadius: MeshBorderRadius.md,
  },
  defaultFilterPreview: {
    width: '100%',
    height: '100%',
    borderRadius: MeshBorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Adjustments panel
  adjustmentsPanel: {
    paddingHorizontal: MeshSpacing.md,
    paddingVertical: MeshSpacing.sm,
    maxHeight: 300,
  },
  adjustmentRow: {
    marginBottom: MeshSpacing.md,
  },
  adjustmentLabel: {
    fontSize: MeshTypography.sizes.sm,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.families.primary,
    marginBottom: MeshSpacing.xs,
  },
  adjustmentSlider: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adjustmentValue: {
    fontSize: MeshTypography.sizes.sm,
    fontFamily: MeshTypography.families.primary,
    width: 40,
    textAlign: 'right',
    marginRight: MeshSpacing.sm,
  },
  applyButton: {
    paddingVertical: MeshSpacing.md,
    borderRadius: MeshBorderRadius.lg,
    alignItems: 'center',
    marginTop: MeshSpacing.md,
  },
  applyButtonText: {
    fontSize: MeshTypography.sizes.md,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.families.primary,
  },

  // Crop panel
  cropPanel: {
    paddingHorizontal: MeshSpacing.md,
    paddingVertical: MeshSpacing.sm,
  },
  cropButton: {
    alignItems: 'center',
    marginRight: MeshSpacing.md,
    paddingHorizontal: MeshSpacing.sm,
    paddingVertical: MeshSpacing.xs,
    borderRadius: MeshBorderRadius.lg,
    minWidth: 60,
  },
  cropPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: MeshSpacing.xs,
    borderRadius: MeshBorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropFrame: {
    width: '80%',
    height: '80%',
    borderRadius: MeshBorderRadius.xs,
  },
  cropText: {
    fontSize: MeshTypography.sizes.xs,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.families.primary,
    textAlign: 'center',
  },

  // Rotate panel
  rotatePanel: {
    paddingHorizontal: MeshSpacing.md,
    paddingVertical: MeshSpacing.sm,
  },
  rotateButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rotateButton: {
    alignItems: 'center',
    paddingHorizontal: MeshSpacing.md,
    paddingVertical: MeshSpacing.sm,
    borderRadius: MeshBorderRadius.lg,
    minWidth: 80,
  },
  rotateText: {
    fontSize: MeshTypography.sizes.xs,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.families.primary,
    marginTop: MeshSpacing.xs,
  },

  // Text panel
  textPanel: {
    paddingHorizontal: MeshSpacing.md,
    paddingVertical: MeshSpacing.sm,
    alignItems: 'center',
  },
  textToolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MeshSpacing.lg,
    paddingVertical: MeshSpacing.md,
    borderRadius: MeshBorderRadius.lg,
  },
  textToolText: {
    fontSize: MeshTypography.sizes.md,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.families.primary,
    marginLeft: MeshSpacing.sm,
  },

  // Error state
  errorText: {
    fontSize: MeshTypography.sizes.lg,
    fontWeight: MeshTypography.weights.medium,
    fontFamily: MeshTypography.families.primary,
    textAlign: 'center',
  },
});

export default MediaEditor;