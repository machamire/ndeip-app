/**
 * VideoFrame - Premium Video Call Experience
 * Mesh borders around video feeds, picture-in-picture floating windows
 * AR filters with mesh-based effects, AI background blur with mesh replacement
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import Svg, {
  Circle,
  Path,
  G,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Pattern,
  Rect,
  Polygon,
  AnimatedCircle,
  AnimatedPath,
} from 'react-native-svg';

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

// Video quality levels
const VIDEO_QUALITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  HD: 'hd',
  FULL_HD: 'full_hd',
};

// Video modes
const VIDEO_MODES = {
  NORMAL: 'normal',
  PICTURE_IN_PICTURE: 'pip',
  FULLSCREEN: 'fullscreen',
  SPLIT_VIEW: 'split_view',
  GALLERY: 'gallery',
};

// Filter types
const FILTER_TYPES = {
  NONE: 'none',
  BLUR_BACKGROUND: 'blur_background',
  MESH_BACKGROUND: 'mesh_background',
  VIRTUAL_BACKGROUND: 'virtual_background',
  BEAUTY: 'beauty',
  AR_MESH: 'ar_mesh',
  NEON_OUTLINE: 'neon_outline',
};

const VideoFrame = ({
  videoStream,
  participant,
  isLocal = false,
  isPrimaryView = false,
  videoMode = VIDEO_MODES.NORMAL,
  quality = VIDEO_QUALITY.HIGH,
  enableFilters = true,
  enableGestures = true,
  showControls = true,
  onModeChange,
  onQualityChange,
  onFilterChange,
  onParticipantAction,
  style = {},
}) => {
  const { colors } = useMeshColors();
  const { timing } = useMeshAnimations();

  // State management
  const [activeFilter, setActiveFilter] = useState(FILTER_TYPES.NONE);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(16/9);
  const [connectionQuality, setConnectionQuality] = useState('excellent');

  // Animation refs
  const borderAnimation = useRef(new Animated.Value(0)).current;
  const meshAnimation = useRef(new Animated.Value(0)).current;
  const filterAnimation = useRef(new Animated.Value(0)).current;
  const qualityAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(0)).current;

  // Gesture handling refs
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  // User mesh pattern
  const userMeshPattern = generateUserMesh(participant?.id);

  // Initialize animations
  useEffect(() => {
    startBorderAnimation();
    startMeshAnimation();
    
    if (isPrimaryView) {
      startPulseAnimation();
    }
  }, [isPrimaryView]);

  // Handle filter changes
  useEffect(() => {
    if (activeFilter !== FILTER_TYPES.NONE) {
      startFilterAnimation();
    }
  }, [activeFilter]);

  // Start border animation
  const startBorderAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(borderAnimation, {
          toValue: 1,
          duration: timing.mesh * 2,
          useNativeDriver: true,
        }),
        Animated.timing(borderAnimation, {
          toValue: 0,
          duration: timing.mesh * 2,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Start mesh animation
  const startMeshAnimation = () => {
    Animated.loop(
      Animated.timing(meshAnimation, {
        toValue: 1,
        duration: timing.mesh * 3,
        useNativeDriver: true,
      })
    ).start();
  };

  // Start filter animation
  const startFilterAnimation = () => {
    Animated.timing(filterAnimation, {
      toValue: 1,
      duration: timing.normal,
      useNativeDriver: true,
    }).start();
  };

  // Start pulse animation for primary view
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: timing.slow,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0,
          duration: timing.slow,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Handle gesture events
  const handlePanGesture = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const handlePinchGesture = Animated.event(
    [{ nativeEvent: { scale: scale } }],
    { useNativeDriver: true }
  );

  const handleGestureStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      // Reset transformations with spring animation
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Handle filter selection
  const handleFilterSelect = (filter) => {
    setActiveFilter(filter);
    setShowFilterMenu(false);
    
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  // Handle quality selection
  const handleQualitySelect = (newQuality) => {
    setShowQualityMenu(false);
    
    if (onQualityChange) {
      onQualityChange(newQuality);
    }
  };

  // Get frame dimensions based on mode
  const getFrameDimensions = () => {
    switch (videoMode) {
      case VIDEO_MODES.PICTURE_IN_PICTURE:
        return {
          width: screenWidth * 0.3,
          height: screenWidth * 0.3 / aspectRatio,
        };
      case VIDEO_MODES.FULLSCREEN:
        return {
          width: screenWidth,
          height: screenHeight,
        };
      case VIDEO_MODES.SPLIT_VIEW:
        return {
          width: screenWidth / 2,
          height: screenHeight * 0.6,
        };
      default:
        return {
          width: isPrimaryView ? screenWidth * 0.9 : screenWidth * 0.4,
          height: isPrimaryView ? screenHeight * 0.6 : screenWidth * 0.4 / aspectRatio,
        };
    }
  };

  const frameDimensions = getFrameDimensions();

  // Render mesh border
  const renderMeshBorder = () => (
    <Svg
      width={frameDimensions.width}
      height={frameDimensions.height}
      style={StyleSheet.absoluteFillObject}
    >
      <Defs>
        <SvgGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.8" />
          <Stop offset="50%" stopColor={colors.secondary} stopOpacity="1" />
          <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.8" />
        </SvgGradient>
        
        <Pattern id="meshBorderPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <Polygon
            points="0,10 10,0 20,10 10,20"
            fill="none"
            stroke={colors.primary}
            strokeWidth="0.5"
            opacity="0.6"
          />
        </Pattern>
      </Defs>

      {/* Animated border frame */}
      <AnimatedPath
        d={`M 0 0 L ${frameDimensions.width} 0 L ${frameDimensions.width} ${frameDimensions.height} L 0 ${frameDimensions.height} Z`}
        stroke="url(#borderGradient)"
        strokeWidth="3"
        fill="none"
        strokeDasharray={borderAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [`0 ${(frameDimensions.width + frameDimensions.height) * 2}`, `${(frameDimensions.width + frameDimensions.height) * 2} 0`],
        })}
      />

      {/* Mesh pattern overlay */}
      <Rect
        width={frameDimensions.width}
        height={frameDimensions.height}
        fill="url(#meshBorderPattern)"
        opacity={meshAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.1, 0.3],
        })}
      />

      {/* Corner indicators */}
      {isPrimaryView && (
        <G>
          <AnimatedCircle
            cx="10"
            cy="10"
            r="4"
            fill={colors.secondary}
            opacity={pulseAnimation}
          />
          <AnimatedCircle
            cx={frameDimensions.width - 10}
            cy="10"
            r="4"
            fill={colors.secondary}
            opacity={pulseAnimation}
          />
          <AnimatedCircle
            cx="10"
            cy={frameDimensions.height - 10}
            r="4"
            fill={colors.secondary}
            opacity={pulseAnimation}
          />
          <AnimatedCircle
            cx={frameDimensions.width - 10}
            cy={frameDimensions.height - 10}
            r="4"
            fill={colors.secondary}
            opacity={pulseAnimation}
          />
        </G>
      )}
    </Svg>
  );

  // Render video content
  const renderVideoContent = () => {
    if (!videoLoaded) {
      return (
        <View style={[styles.videoPlaceholder, { backgroundColor: colors.surface }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.background }]}>
              {participant?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={[styles.participantName, { color: colors.text }]}>
            {participant?.name || 'Participant'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.videoContent}>
        {/* Video stream placeholder */}
        <View style={[styles.videoStream, { backgroundColor: '#1a1a1a' }]}>
          <Text style={[styles.streamLabel, { color: colors.crystallineWhite }]}>
            {isLocal ? 'Your Video' : `${participant?.name || 'Participant'}'s Video`}
          </Text>
        </View>

        {/* Filter overlays */}
        {renderFilterOverlay()}
      </View>
    );
  };

  // Render filter overlay
  const renderFilterOverlay = () => {
    if (activeFilter === FILTER_TYPES.NONE) return null;

    return (
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { opacity: filterAnimation },
        ]}
      >
        {renderSpecificFilter()}
      </Animated.View>
    );
  };

  // Render specific filter effects
  const renderSpecificFilter = () => {
    switch (activeFilter) {
      case FILTER_TYPES.BLUR_BACKGROUND:
        return (
          <BlurView intensity={80} style={StyleSheet.absoluteFillObject} />
        );
        
      case FILTER_TYPES.MESH_BACKGROUND:
        return renderMeshBackground();
        
      case FILTER_TYPES.AR_MESH:
        return renderARMeshFilter();
        
      case FILTER_TYPES.NEON_OUTLINE:
        return renderNeonOutline();
        
      default:
        return null;
    }
  };

  // Render mesh background replacement
  const renderMeshBackground = () => (
    <View style={StyleSheet.absoluteFillObject}>
      <LinearGradient
        colors={[
          getDynamicColor(colors.primary, 0.3),
          getDynamicColor(colors.secondary, 0.2),
          getDynamicColor(colors.primary, 0.3),
        ]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <Svg
        width={frameDimensions.width}
        height={frameDimensions.height}
        style={StyleSheet.absoluteFillObject}
      >
        {/* Animated mesh pattern */}
        {userMeshPattern.connections?.map((connection, index) => (
          <AnimatedPath
            key={index}
            d={`M ${connection.from.x * 0.5} ${connection.from.y * 0.5} Q ${
              connection.controlPoint ? connection.controlPoint.x * 0.5 : (connection.from.x + connection.to.x) * 0.25
            } ${
              connection.controlPoint ? connection.controlPoint.y * 0.5 : (connection.from.y + connection.to.y) * 0.25
            } ${connection.to.x * 0.5} ${connection.to.y * 0.5}`}
            stroke={colors.primary}
            strokeWidth="1"
            fill="none"
            opacity={meshAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.2, 0.6],
            })}
          />
        ))}
      </Svg>
    </View>
  );

  // Render AR mesh filter
  const renderARMeshFilter = () => (
    <Svg
      width={frameDimensions.width}
      height={frameDimensions.height}
      style={StyleSheet.absoluteFillObject}
    >
      <Defs>
        <SvgGradient id="arGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00FF88" stopOpacity="0.6" />
          <Stop offset="50%" stopColor="#0A71EF" stopOpacity="0.8" />
          <Stop offset="100%" stopColor="#FF00F5" stopOpacity="0.6" />
        </SvgGradient>
      </Defs>

      {/* AR mesh overlay */}
      {Array.from({ length: 8 }, (_, i) => (
        <AnimatedPath
          key={i}
          d={`M 0 ${i * (frameDimensions.height / 8)} Q ${frameDimensions.width / 2} ${
            i * (frameDimensions.height / 8) + Math.sin(meshAnimation._value * Math.PI + i) * 20
          } ${frameDimensions.width} ${i * (frameDimensions.height / 8)}`}
          stroke="url(#arGradient)"
          strokeWidth="2"
          fill="none"
          opacity={meshAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.7],
          })}
        />
      ))}
    </Svg>
  );

  // Render neon outline filter
  const renderNeonOutline = () => (
    <Svg
      width={frameDimensions.width}
      height={frameDimensions.height}
      style={StyleSheet.absoluteFillObject}
    >
      <Defs>
        <SvgGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00F5FF" stopOpacity="1" />
          <Stop offset="100%" stopColor="#FF00F5" stopOpacity="1" />
        </SvgGradient>
      </Defs>

      <AnimatedPath
        d={`M 10 10 L ${frameDimensions.width - 10} 10 L ${frameDimensions.width - 10} ${
          frameDimensions.height - 10
        } L 10 ${frameDimensions.height - 10} Z`}
        stroke="url(#neonGradient)"
        strokeWidth="4"
        fill="none"
        opacity={filterAnimation}
        strokeDasharray={meshAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [`0 ${(frameDimensions.width + frameDimensions.height) * 2}`, `20 10`],
        })}
      />
    </Svg>
  );

  // Render controls overlay
  const renderControlsOverlay = () => {
    if (!showControls) return null;

    return (
      <View style={styles.controlsOverlay}>
        {/* Top controls */}
        <View style={styles.topControls}>
          <ConnectionIndicator quality={connectionQuality} colors={colors} />
          
          {enableFilters && (
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: getDynamicColor(colors.surface, 0.8) }]}
              onPress={() => setShowFilterMenu(true)}
            >
              <MaterialIcons name="filter" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: getDynamicColor(colors.surface, 0.8) }]}
            onPress={() => setShowQualityMenu(true)}
          >
            <MaterialIcons name="hd" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: getDynamicColor(colors.surface, 0.8) }]}
            onPress={() => onModeChange?.(VIDEO_MODES.PICTURE_IN_PICTURE)}
          >
            <MaterialIcons name="picture-in-picture" size={20} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: getDynamicColor(colors.surface, 0.8) }]}
            onPress={() => onModeChange?.(VIDEO_MODES.FULLSCREEN)}
          >
            <MaterialIcons name="fullscreen" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Create gesture handlers
  const VideoContainer = enableGestures ? (
    <PanGestureHandler
      onGestureEvent={handlePanGesture}
      onHandlerStateChange={handleGestureStateChange}
    >
      <PinchGestureHandler
        onGestureEvent={handlePinchGesture}
        onHandlerStateChange={handleGestureStateChange}
      >
        <Animated.View
          style={[
            styles.videoFrame,
            {
              width: frameDimensions.width,
              height: frameDimensions.height,
              transform: [
                { translateX },
                { translateY },
                { scale },
                { rotate: rotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }) },
              ],
            },
            style,
          ]}
        >
          {renderVideoContent()}
          {renderMeshBorder()}
          {renderControlsOverlay()}
        </Animated.View>
      </PinchGestureHandler>
    </PanGestureHandler>
  ) : (
    <View
      style={[
        styles.videoFrame,
        {
          width: frameDimensions.width,
          height: frameDimensions.height,
        },
        style,
      ]}
    >
      {renderVideoContent()}
      {renderMeshBorder()}
      {renderControlsOverlay()}
    </View>
  );

  return (
    <View style={styles.container}>
      {VideoContainer}
      
      {/* Filter selection modal */}
      <FilterSelectionModal
        visible={showFilterMenu}
        activeFilter={activeFilter}
        onFilterSelect={handleFilterSelect}
        onClose={() => setShowFilterMenu(false)}
        colors={colors}
      />
      
      {/* Quality selection modal */}
      <QualitySelectionModal
        visible={showQualityMenu}
        currentQuality={quality}
        onQualitySelect={handleQualitySelect}
        onClose={() => setShowQualityMenu(false)}
        colors={colors}
      />
    </View>
  );
};

// Connection quality indicator
const ConnectionIndicator = ({ quality, colors }) => {
  const getQualityColor = () => {
    switch (quality) {
      case 'excellent': return colors.accents.success;
      case 'good': return colors.primary;
      case 'fair': return colors.accents.warning;
      case 'poor': return colors.accents.mutedRed;
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={[styles.connectionIndicator, { backgroundColor: getDynamicColor(colors.surface, 0.8) }]}>
      <View style={[styles.qualityDot, { backgroundColor: getQualityColor() }]} />
      <Text style={[styles.qualityText, { color: colors.text }]}>
        {quality}
      </Text>
    </View>
  );
};

// Filter selection modal
const FilterSelectionModal = ({ visible, activeFilter, onFilterSelect, onClose, colors }) => (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
    <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.modalTitle, { color: colors.text }]}>
          Video Filters
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.modalContent}>
        {Object.values(FILTER_TYPES).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterOption,
              activeFilter === filter && { backgroundColor: getDynamicColor(colors.primary, 0.1) },
            ]}
            onPress={() => onFilterSelect(filter)}
          >
            <FilterPreview filter={filter} colors={colors} />
            <Text style={[styles.filterLabel, { color: colors.text }]}>
              {getFilterLabel(filter)}
            </Text>
            {activeFilter === filter && (
              <Ionicons name="checkmark" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  </Modal>
);

// Quality selection modal
const QualitySelectionModal = ({ visible, currentQuality, onQualitySelect, onClose, colors }) => (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
    <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.modalTitle, { color: colors.text }]}>
          Video Quality
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.modalContent}>
        {Object.values(VIDEO_QUALITY).map((quality) => (
          <TouchableOpacity
            key={quality}
            style={[
              styles.qualityOption,
              currentQuality === quality && { backgroundColor: getDynamicColor(colors.primary, 0.1) },
            ]}
            onPress={() => onQualitySelect(quality)}
          >
            <Text style={[styles.qualityLabel, { color: colors.text }]}>
              {getQualityLabel(quality)}
            </Text>
            <Text style={[styles.qualityDescription, { color: colors.textSecondary }]}>
              {getQualityDescription(quality)}
            </Text>
            {currentQuality === quality && (
              <Ionicons name="checkmark" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  </Modal>
);

// Filter preview component
const FilterPreview = ({ filter, colors }) => {
  const getFilterIcon = () => {
    switch (filter) {
      case FILTER_TYPES.NONE: return 'remove';
      case FILTER_TYPES.BLUR_BACKGROUND: return 'blur';
      case FILTER_TYPES.MESH_BACKGROUND: return 'grid';
      case FILTER_TYPES.VIRTUAL_BACKGROUND: return 'image';
      case FILTER_TYPES.BEAUTY: return 'face-recognition';
      case FILTER_TYPES.AR_MESH: return 'scatter-plot';
      case FILTER_TYPES.NEON_OUTLINE: return 'highlight';
      default: return 'filter';
    }
  };

  return (
    <View style={[styles.filterPreview, { backgroundColor: getDynamicColor(colors.surface, 0.5) }]}>
      <MaterialIcons name={getFilterIcon()} size={24} color={colors.primary} />
    </View>
  );
};

// Utility functions
const getFilterLabel = (filter) => {
  switch (filter) {
    case FILTER_TYPES.NONE: return 'No Filter';
    case FILTER_TYPES.BLUR_BACKGROUND: return 'Blur Background';
    case FILTER_TYPES.MESH_BACKGROUND: return 'Mesh Background';
    case FILTER_TYPES.VIRTUAL_BACKGROUND: return 'Virtual Background';
    case FILTER_TYPES.BEAUTY: return 'Beauty Filter';
    case FILTER_TYPES.AR_MESH: return 'AR Mesh';
    case FILTER_TYPES.NEON_OUTLINE: return 'Neon Outline';
    default: return 'Unknown Filter';
  }
};

const getQualityLabel = (quality) => {
  switch (quality) {
    case VIDEO_QUALITY.LOW: return 'Low (360p)';
    case VIDEO_QUALITY.MEDIUM: return 'Medium (480p)';
    case VIDEO_QUALITY.HIGH: return 'High (720p)';
    case VIDEO_QUALITY.HD: return 'HD (1080p)';
    case VIDEO_QUALITY.FULL_HD: return 'Full HD (1440p)';
    default: return 'Auto';
  }
};

const getQualityDescription = (quality) => {
  switch (quality) {
    case VIDEO_QUALITY.LOW: return 'Lower bandwidth usage';
    case VIDEO_QUALITY.MEDIUM: return 'Balanced quality and performance';
    case VIDEO_QUALITY.HIGH: return 'Good quality for most calls';
    case VIDEO_QUALITY.HD: return 'High definition video';
    case VIDEO_QUALITY.FULL_HD: return 'Maximum quality';
    default: return 'Automatically adjusts based on connection';
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  
  videoFrame: {
    borderRadius: MeshBorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    ...MeshShadows.floating.medium,
  },
  
  videoContent: {
    flex: 1,
    position: 'relative',
  },
  
  videoStream: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  streamLabel: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.medium,
  },
  
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: MeshSpacing.lg,
  },
  
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: MeshSpacing.md,
  },
  
  avatarText: {
    fontSize: MeshTypography.sizes.h3,
    fontWeight: MeshTypography.weights.bold,
  },
  
  participantName: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.medium,
    textAlign: 'center',
  },
  
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: MeshSpacing.sm,
  },
  
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: MeshSpacing.sm,
  },
  
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...MeshShadows.floating.light,
  },
  
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MeshSpacing.sm,
    paddingVertical: MeshSpacing.xs,
    borderRadius: MeshBorderRadius.sm,
  },
  
  qualityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: MeshSpacing.xs,
  },
  
  qualityText: {
    fontSize: MeshTypography.sizes.caption,
    fontWeight: MeshTypography.weights.medium,
  },
  
  modalContainer: {
    flex: 1,
  },
  
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: MeshSpacing.lg,
    paddingVertical: MeshSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: getDynamicColor(MeshColors.neutrals.mediumGrey, 0.2),
  },
  
  modalTitle: {
    fontSize: MeshTypography.sizes.h3,
    fontWeight: MeshTypography.weights.semiBold,
  },
  
  modalContent: {
    flex: 1,
    paddingHorizontal: MeshSpacing.lg,
  },
  
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: MeshSpacing.md,
    borderRadius: MeshBorderRadius.sm,
    marginVertical: MeshSpacing.xs,
    paddingHorizontal: MeshSpacing.md,
  },
  
  filterPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: MeshSpacing.md,
  },
  
  filterLabel: {
    flex: 1,
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.medium,
  },
  
  qualityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: MeshSpacing.md,
    borderRadius: MeshBorderRadius.sm,
    marginVertical: MeshSpacing.xs,
    paddingHorizontal: MeshSpacing.md,
  },
  
  qualityLabel: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.medium,
    marginBottom: 2,
  },
  
  qualityDescription: {
    fontSize: MeshTypography.sizes.caption,
    flex: 1,
  },
});

// Export specialized video frame components
export const LocalVideoFrame = (props) => (
  <VideoFrame {...props} isLocal={true} />
);

export const RemoteVideoFrame = (props) => (
  <VideoFrame {...props} isLocal={false} />
);

export const PictureInPictureFrame = (props) => (
  <VideoFrame {...props} videoMode={VIDEO_MODES.PICTURE_IN_PICTURE} />
);

export const FullscreenVideoFrame = (props) => (
  <VideoFrame {...props} videoMode={VIDEO_MODES.FULLSCREEN} />
);

export default VideoFrame;
export { VIDEO_QUALITY, VIDEO_MODES, FILTER_TYPES };