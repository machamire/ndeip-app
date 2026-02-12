/**
 * StatusGallery - Instagram-beats-Stories Experience
 * Mesh borders around status rings, 3D status grid layout
 * Gesture navigation with swipe, pinch, rotate, AI highlights with mesh glow
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Modal,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { PanGestureHandler, PinchGestureHandler, RotationGestureHandler } from 'react-native-gesture-handler';
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

// Status types
const STATUS_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  TEXT: 'text',
  AUDIO: 'audio',
  LIVE: 'live',
};

// View modes
const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
  CAROUSEL: 'carousel',
  FULL_SCREEN: 'fullscreen',
};

// AI highlight reasons
const AI_HIGHLIGHTS = {
  TRENDING: 'trending',
  FREQUENT_CONTACT: 'frequent_contact',
  LOCATION_BASED: 'location_based',
  TIME_SENSITIVE: 'time_sensitive',
  ENGAGEMENT: 'engagement',
};

const StatusGallery = ({
  navigation,
  statuses: initialStatuses = [],
  currentUser,
  onRefresh,
  onStatusPress,
  onStatusLongPress,
  onCreateStatus,
  onDeleteStatus,
  onMuteUser,
  showAIHighlights = true,
  viewMode: initialViewMode = VIEW_MODES.GRID,
}) => {
  const { colors } = useMeshColors();
  const { timing } = useMeshAnimations();

  // State management
  const [statuses, setStatuses] = useState(initialStatuses);
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showStatusViewer, setShowStatusViewer] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [aiHighlights, setAIHighlights] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'name', 'unread'

  // Animation refs
  const gridAnimation = useRef(new Animated.Value(0)).current;
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const highlightAnimations = useRef(new Map()).current;

  // Gesture refs
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  // Initialize animations
  useEffect(() => {
    startInitialAnimations();
    generateAIHighlights();
  }, []);

  // Update statuses when prop changes
  useEffect(() => {
    setStatuses(initialStatuses);
  }, [initialStatuses]);

  // Start initial animations
  const startInitialAnimations = () => {
    Animated.parallel([
      Animated.timing(headerAnimation, {
        toValue: 1,
        duration: timing.normal,
        useNativeDriver: true,
      }),
      Animated.stagger(100, 
        Array.from({ length: 12 }, (_, index) =>
          Animated.timing(gridAnimation, {
            toValue: 1,
            duration: timing.normal,
            delay: index * 50,
            useNativeDriver: true,
          })
        )
      ),
    ]).start();
  };

  // Generate AI highlights
  const generateAIHighlights = () => {
    if (!showAIHighlights) return;

    const highlights = statuses
      .filter(status => {
        // AI logic for determining highlights
        const isRecent = Date.now() - status.timestamp < 3600000; // 1 hour
        const isFromFrequentContact = status.user?.isFrequentContact;
        const hasHighEngagement = status.views > 50 || status.reactions?.length > 10;
        
        return isRecent || isFromFrequentContact || hasHighEngagement;
      })
      .map(status => ({
        ...status,
        highlightReason: determineHighlightReason(status),
      }));

    setAIHighlights(highlights);
    
    // Start highlight animations
    highlights.forEach((highlight, index) => {
      if (!highlightAnimations.current.has(highlight.id)) {
        const animValue = new Animated.Value(0);
        highlightAnimations.current.set(highlight.id, animValue);
        
        Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: timing.mesh,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: timing.mesh,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    });
  };

  // Determine highlight reason
  const determineHighlightReason = (status) => {
    if (status.isLive) return AI_HIGHLIGHTS.TIME_SENSITIVE;
    if (status.user?.isFrequentContact) return AI_HIGHLIGHTS.FREQUENT_CONTACT;
    if (status.views > 100) return AI_HIGHLIGHTS.TRENDING;
    if (status.reactions?.length > 20) return AI_HIGHLIGHTS.ENGAGEMENT;
    return AI_HIGHLIGHTS.TRENDING;
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      generateAIHighlights();
    } finally {
      setRefreshing(false);
    }
  };

  // Handle status press
  const handleStatusPress = (status, index) => {
    setSelectedStatus({ ...status, index });
    setShowStatusViewer(true);
    
    if (onStatusPress) {
      onStatusPress(status, index);
    }
  };

  // Handle status long press
  const handleStatusLongPress = (status) => {
    Alert.alert(
      status.user?.name || 'Status',
      'Choose an action',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mute User', onPress: () => onMuteUser?.(status.user) },
        { text: 'Report', onPress: () => handleReportStatus(status) },
        ...(status.user?.id === currentUser?.id ? [
          { text: 'Delete', style: 'destructive', onPress: () => handleDeleteStatus(status) }
        ] : []),
      ]
    );
    
    if (onStatusLongPress) {
      onStatusLongPress(status);
    }
  };

  // Handle delete status
  const handleDeleteStatus = (status) => {
    Alert.alert(
      'Delete Status',
      'Are you sure you want to delete this status?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setStatuses(prev => prev.filter(s => s.id !== status.id));
            if (onDeleteStatus) onDeleteStatus(status);
          },
        },
      ]
    );
  };

  // Handle report status
  const handleReportStatus = (status) => {
    Alert.alert(
      'Report Status',
      'Why are you reporting this status?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Inappropriate Content', onPress: () => submitReport(status, 'inappropriate') },
        { text: 'Spam', onPress: () => submitReport(status, 'spam') },
        { text: 'False Information', onPress: () => submitReport(status, 'false_info') },
      ]
    );
  };

  // Submit report
  const submitReport = (status, reason) => {
    console.log('Reporting status:', status.id, 'Reason:', reason);
    Alert.alert('Thank you', 'Your report has been submitted.');
  };

  // Gesture handlers
  const handlePanGesture = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const handlePinchGesture = Animated.event(
    [{ nativeEvent: { scale: scale } }],
    { useNativeDriver: true }
  );

  const handleRotationGesture = Animated.event(
    [{ nativeEvent: { rotation: rotation } }],
    { useNativeDriver: true }
  );

  const handleGestureEnd = () => {
    Animated.parallel([
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(rotation, { toValue: 0, useNativeDriver: true }),
    ]).start();
  };

  // Render status ring with mesh border
  const renderStatusRing = (status, isHighlighted = false) => {
    const ringSize = viewMode === VIEW_MODES.GRID ? 80 : 60;
    const borderWidth = 3;
    const highlightAnim = highlightAnimations.current.get(status.id);

    return (
      <View style={[styles.statusRing, { width: ringSize, height: ringSize }]}>
        <Svg width={ringSize} height={ringSize} style={StyleSheet.absoluteFillObject}>
          <Defs>
            <SvgGradient id={`ring-${status.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={status.isViewed ? colors.neutrals.mediumGrey : colors.primary} stopOpacity="1" />
              <Stop offset="50%" stopColor={status.isViewed ? colors.neutrals.mediumGrey : colors.secondary} stopOpacity="1" />
              <Stop offset="100%" stopColor={status.isViewed ? colors.neutrals.mediumGrey : colors.primary} stopOpacity="1" />
            </SvgGradient>
            
            <SvgGradient id={`highlight-${status.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
              <Stop offset="100%" stopColor="#FF6B35" stopOpacity="1" />
            </SvgGradient>

            <Pattern id={`mesh-${status.id}`} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <Circle cx="4" cy="4" r="0.5" fill={colors.secondary} opacity="0.3" />
              <Path
                d="M 2 4 Q 4 2 6 4 Q 4 6 2 4"
                stroke={colors.primary}
                strokeWidth="0.3"
                fill="none"
                opacity="0.5"
              />
            </Pattern>
          </Defs>

          {/* Main ring */}
          <Circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={ringSize / 2 - borderWidth}
            stroke={isHighlighted ? `url(#highlight-${status.id})` : `url(#ring-${status.id})`}
            strokeWidth={borderWidth}
            fill="none"
            strokeDasharray={status.isViewed ? "5 5" : undefined}
          />

          {/* Mesh pattern overlay */}
          <Circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={ringSize / 2 - borderWidth - 2}
            fill={`url(#mesh-${status.id})`}
            opacity="0.1"
          />

          {/* Highlight glow */}
          {isHighlighted && highlightAnim && (
            <AnimatedCircle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringSize / 2 - 1}
              stroke="#FFD700"
              strokeWidth="2"
              fill="none"
              opacity={highlightAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.8],
              })}
            />
          )}

          {/* Live indicator */}
          {status.isLive && (
            <Circle
              cx={ringSize - 10}
              cy={10}
              r="5"
              fill="#FF4757"
            />
          )}

          {/* Multiple status indicator */}
          {status.count > 1 && (
            <Circle
              cx={ringSize - 10}
              cy={ringSize - 10}
              r="8"
              fill={colors.secondary}
            />
          )}
        </Svg>
      </View>
    );
  };

  // Render status item
  const renderStatusItem = ({ item: status, index }) => {
    const isHighlighted = aiHighlights.some(h => h.id === status.id);
    const userMeshPattern = generateUserMesh(status.user?.id);

    return (
      <Animated.View
        style={[
          styles.statusItem,
          viewMode === VIEW_MODES.GRID ? styles.gridItem : styles.listItem,
          {
            opacity: gridAnimation,
            transform: [{
              translateY: gridAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleStatusPress(status, index)}
          onLongPress={() => handleStatusLongPress(status)}
          activeOpacity={0.8}
        >
          <FloatingCard
            variant={viewMode === VIEW_MODES.GRID ? "small" : "compact"}
            interactive={true}
            style={[
              styles.statusCard,
              isHighlighted && styles.highlightedCard,
            ]}
          >
            <View style={styles.statusContent}>
              {/* Status ring and avatar */}
              <View style={styles.avatarContainer}>
                {renderStatusRing(status, isHighlighted)}
                
                <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
                  {status.user?.avatar ? (
                    <Image source={{ uri: status.user.avatar }} style={styles.avatarImage} />
                  ) : (
                    <Text style={[styles.avatarText, { color: colors.text }]}>
                      {status.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  )}
                </View>

                {/* AI highlight badge */}
                {isHighlighted && (
                  <View style={[styles.highlightBadge, { backgroundColor: colors.accents.warning }]}>
                    <MaterialIcons name="auto-awesome" size={12} color={colors.background} />
                  </View>
                )}
              </View>

              {/* Status info */}
              {viewMode === VIEW_MODES.LIST && (
                <View style={styles.statusInfo}>
                  <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                    {status.user?.name || 'Unknown'}
                  </Text>
                  
                  <Text style={[styles.statusTime, { color: colors.textSecondary }]}>
                    {formatStatusTime(status.timestamp)}
                  </Text>
                  
                  {status.isLive && (
                    <View style={[styles.liveIndicator, { backgroundColor: colors.accents.mutedRed }]}>
                      <Text style={[styles.liveText, { color: colors.crystallineWhite }]}>
                        LIVE
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Status preview */}
              {status.type === STATUS_TYPES.TEXT && (
                <View style={styles.textPreview}>
                  <Text style={[styles.textContent, { color: colors.text }]} numberOfLines={2}>
                    {status.content}
                  </Text>
                </View>
              )}
            </View>
          </FloatingCard>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Render user's own status (add status option)
  const renderOwnStatus = () => (
    <Animated.View
      style={[
        styles.statusItem,
        viewMode === VIEW_MODES.GRID ? styles.gridItem : styles.listItem,
        {
          opacity: gridAnimation,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => onCreateStatus?.()}
        activeOpacity={0.8}
      >
        <FloatingCard
          variant={viewMode === VIEW_MODES.GRID ? "small" : "compact"}
          interactive={true}
          style={styles.statusCard}
        >
          <View style={styles.statusContent}>
            <View style={styles.avatarContainer}>
              <View style={[styles.addStatusRing, { borderColor: colors.primary }]}>
                <Svg width={80} height={80} style={StyleSheet.absoluteFillObject}>
                  <Defs>
                    <Pattern id="addMeshPattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                      <Circle cx="5" cy="5" r="0.5" fill={colors.primary} opacity="0.2" />
                    </Pattern>
                  </Defs>
                  
                  <Circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill="url(#addMeshPattern)"
                    opacity="0.1"
                  />
                </Svg>
              </View>

              <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
                {currentUser?.avatar ? (
                  <Image source={{ uri: currentUser.avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={[styles.avatarText, { color: colors.text }]}>
                    {currentUser?.name?.charAt(0)?.toUpperCase() || 'M'}
                  </Text>
                )}
              </View>

              <View style={[styles.addButton, { backgroundColor: colors.primary }]}>
                <Ionicons name="add" size={16} color={colors.crystallineWhite} />
              </View>
            </View>

            {viewMode === VIEW_MODES.LIST && (
              <View style={styles.statusInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>
                  My Status
                </Text>
                <Text style={[styles.statusTime, { color: colors.textSecondary }]}>
                  Tap to add status update
                </Text>
              </View>
            )}
          </View>
        </FloatingCard>
      </TouchableOpacity>
    </Animated.View>
  );

  // Render header
  const renderHeader = () => (
    <Animated.View
      style={[
        styles.header,
        {
          opacity: headerAnimation,
          transform: [{
            translateY: headerAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            }),
          }],
        },
      ]}
    >
      <FloatingCard variant="large" style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Status
            </Text>
            
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerAction}
                onPress={() => setViewMode(viewMode === VIEW_MODES.GRID ? VIEW_MODES.LIST : VIEW_MODES.GRID)}
              >
                <MaterialIcons 
                  name={viewMode === VIEW_MODES.GRID ? "view-list" : "view-module"} 
                  size={24} 
                  color={colors.text} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.headerAction}>
                <Ionicons name="search" size={24} color={colors.text} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.headerAction}>
                <MaterialIcons name="more-vert" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {showAIHighlights && aiHighlights.length > 0 && (
            <View style={styles.aiHighlights}>
              <View style={styles.aiHeader}>
                <MaterialIcons name="auto-awesome" size={16} color={colors.primary} />
                <Text style={[styles.aiTitle, { color: colors.primary }]}>
                  AI Highlights
                </Text>
              </View>
              <Text style={[styles.aiDescription, { color: colors.textSecondary }]}>
                {aiHighlights.length} suggested status updates
              </Text>
            </View>
          )}
        </View>
      </FloatingCard>
    </Animated.View>
  );

  // Render status list
  const renderStatusList = () => {
    const allStatuses = [
      { id: 'own', isOwnStatus: true },
      ...statuses,
    ];

    return (
      <PanGestureHandler
        onGestureEvent={handlePanGesture}
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === 5) handleGestureEnd();
        }}
      >
        <PinchGestureHandler
          onGestureEvent={handlePinchGesture}
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === 5) handleGestureEnd();
          }}
        >
          <RotationGestureHandler
            onGestureEvent={handleRotationGesture}
            onHandlerStateChange={({ nativeEvent }) => {
              if (nativeEvent.state === 5) handleGestureEnd();
            }}
          >
            <Animated.View
              style={[
                styles.listContainer,
                {
                  transform: [
                    { translateX },
                    { translateY },
                    { scale },
                    { rotate: rotation.interpolate({
                      inputRange: [-Math.PI, Math.PI],
                      outputRange: ['-180deg', '180deg'],
                    }) },
                  ],
                },
              ]}
            >
              <FlatList
                data={allStatuses}
                renderItem={({ item, index }) => 
                  item.isOwnStatus ? renderOwnStatus() : renderStatusItem({ item, index: index - 1 })
                }
                keyExtractor={(item) => item.id}
                numColumns={viewMode === VIEW_MODES.GRID ? 3 : 1}
                key={viewMode} // Force re-render when view mode changes
                contentContainerStyle={[
                  styles.statusList,
                  viewMode === VIEW_MODES.GRID ? styles.gridList : styles.verticalList,
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor={colors.primary}
                    colors={[colors.primary]}
                  />
                }
                ListEmptyComponent={
                  <EmptyStatusList colors={colors} onCreateStatus={onCreateStatus} />
                }
              />
            </Animated.View>
          </RotationGestureHandler>
        </PinchGestureHandler>
      </PanGestureHandler>
    );
  };

  // Format status time
  const formatStatusTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Mesh background */}
      <CrystallineMesh
        variant="small"
        animated={true}
        intensity={0.1}
        color={getDynamicColor(colors.primary, 0.03)}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      {renderHeader()}

      {/* Status list */}
      {renderStatusList()}

      {/* Status viewer modal */}
      <StatusViewerModal
        visible={showStatusViewer}
        status={selectedStatus}
        onClose={() => setShowStatusViewer(false)}
        colors={colors}
      />
    </SafeAreaView>
  );
};

// Empty status list component
const EmptyStatusList = ({ colors, onCreateStatus }) => (
  <View style={styles.emptyContainer}>
    <QuantumLoader
      type="pulse"
      size="large"
      color={colors.primary}
      style={styles.emptyLoader}
    />
    
    <Text style={[styles.emptyTitle, { color: colors.text }]}>
      No Status Updates
    </Text>
    
    <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
      Share photos, videos, and thoughts with your contacts
    </Text>
    
    <TouchableOpacity
      style={[styles.createStatusButton, { backgroundColor: colors.primary }]}
      onPress={onCreateStatus}
    >
      <Ionicons name="add" size={20} color={colors.crystallineWhite} />
      <Text style={[styles.createStatusText, { color: colors.crystallineWhite }]}>
        Create Status
      </Text>
    </TouchableOpacity>
  </View>
);

// Status viewer modal component
const StatusViewerModal = ({ visible, status, onClose, colors }) => {
  if (!visible || !status) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.viewerContainer, { backgroundColor: '#000' }]}>
        {/* Close button */}
        <SafeAreaView style={styles.viewerHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Status content */}
        <View style={styles.viewerContent}>
          <Text style={[styles.viewerText, { color: '#fff' }]}>
            Status Viewer - Content would be rendered here
          </Text>
        </View>

        {/* Status info */}
        <View style={styles.viewerFooter}>
          <Text style={[styles.viewerUserName, { color: '#fff' }]}>
            {status.user?.name || 'Unknown'}
          </Text>
          <Text style={[styles.viewerTime, { color: '#ccc' }]}>
            {new Date(status.timestamp).toLocaleString()}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingHorizontal: MeshSpacing.md,
    paddingTop: MeshSpacing.sm,
  },

  headerCard: {
    marginBottom: MeshSpacing.sm,
  },

  headerContent: {
    paddingVertical: MeshSpacing.sm,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MeshSpacing.sm,
  },

  headerTitle: {
    fontSize: MeshTypography.sizes.h2,
    fontWeight: MeshTypography.weights.semiBold,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerAction: {
    marginLeft: MeshSpacing.md,
  },

  aiHighlights: {
    paddingTop: MeshSpacing.md,
    borderTopWidth: 1,
    borderTopColor: getDynamicColor(MeshColors.neutrals.lightGrey, 0.3),
  },

  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: MeshSpacing.xs,
  },

 
// Continuation of StatusGallery.js styles and remaining components

  aiTitle: {
    fontSize: MeshTypography.sizes.bodySmall,
    fontWeight: MeshTypography.weights.semiBold,
    marginLeft: MeshSpacing.xs,
  },

  aiDescription: {
    fontSize: MeshTypography.sizes.caption,
  },

  listContainer: {
    flex: 1,
  },

  statusList: {
    paddingHorizontal: MeshSpacing.md,
    paddingBottom: MeshSpacing.lg,
  },

  gridList: {
    justifyContent: 'space-between',
  },

  verticalList: {
    paddingTop: MeshSpacing.sm,
  },

  statusItem: {
    marginBottom: MeshSpacing.md,
  },

  gridItem: {
    width: (screenWidth - MeshSpacing.md * 4) / 3,
    marginHorizontal: MeshSpacing.xs,
  },

  listItem: {
    width: '100%',
    marginBottom: MeshSpacing.sm,
  },

  statusCard: {
    overflow: 'visible',
  },

  highlightedCard: {
    borderWidth: 1,
    borderColor: getDynamicColor('#FFD700', 0.5),
  },

  statusContent: {
    alignItems: 'center',
    paddingVertical: MeshSpacing.sm,
  },

  avatarContainer: {
    position: 'relative',
    marginBottom: MeshSpacing.sm,
  },

  statusRing: {
    position: 'absolute',
    top: -10,
    left: -10,
    zIndex: 1,
  },

  addStatusRing: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderStyle: 'dashed',
    zIndex: 1,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    zIndex: 2,
    ...MeshShadows.floating.light,
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  avatarText: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.semiBold,
  },

  addButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    ...MeshShadows.floating.light,
  },

  highlightBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },

  statusInfo: {
    alignItems: 'center',
    paddingHorizontal: MeshSpacing.sm,
  },

  userName: {
    fontSize: MeshTypography.sizes.bodySmall,
    fontWeight: MeshTypography.weights.medium,
    textAlign: 'center',
    marginBottom: 2,
  },

  statusTime: {
    fontSize: MeshTypography.sizes.caption,
    textAlign: 'center',
  },

  liveIndicator: {
    paddingHorizontal: MeshSpacing.xs,
    paddingVertical: 2,
    borderRadius: MeshBorderRadius.xs,
    marginTop: MeshSpacing.xs,
  },

  liveText: {
    fontSize: MeshTypography.sizes.caption,
    fontWeight: MeshTypography.weights.bold,
  },

  textPreview: {
    marginTop: MeshSpacing.xs,
    paddingHorizontal: MeshSpacing.sm,
  },

  textContent: {
    fontSize: MeshTypography.sizes.caption,
    textAlign: 'center',
    lineHeight: MeshTypography.lineHeights.normal * MeshTypography.sizes.caption,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: MeshSpacing.xxxl,
  },

  emptyLoader: {
    marginBottom: MeshSpacing.lg,
  },

  emptyTitle: {
    fontSize: MeshTypography.sizes.h3,
    fontWeight: MeshTypography.weights.semiBold,
    marginBottom: MeshSpacing.sm,
    textAlign: 'center',
  },

  emptyDescription: {
    fontSize: MeshTypography.sizes.body,
    textAlign: 'center',
    marginBottom: MeshSpacing.xl,
    paddingHorizontal: MeshSpacing.xl,
  },

  createStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MeshSpacing.lg,
    paddingVertical: MeshSpacing.md,
    borderRadius: MeshBorderRadius.components.button,
    ...MeshShadows.floating.medium,
  },

  createStatusText: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.medium,
    marginLeft: MeshSpacing.sm,
  },

  // Status viewer modal styles
  viewerContainer: {
    flex: 1,
  },

  viewerHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: MeshSpacing.lg,
    paddingVertical: MeshSpacing.md,
  },

  closeButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  viewerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  viewerText: {
    fontSize: MeshTypography.sizes.body,
    textAlign: 'center',
  },

  viewerFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: MeshSpacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },

  viewerUserName: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.semiBold,
    marginBottom: MeshSpacing.xs,
  },

  viewerTime: {
    fontSize: MeshTypography.sizes.bodySmall,
  },
});

// Export specialized status gallery components
export const GridStatusGallery = (props) => (
  <StatusGallery {...props} viewMode={VIEW_MODES.GRID} />
);

export const ListStatusGallery = (props) => (
  <StatusGallery {...props} viewMode={VIEW_MODES.LIST} />
);

export const AIStatusGallery = (props) => (
  <StatusGallery {...props} showAIHighlights={true} />
);

// Hook for managing status gallery
export const useStatusGallery = (initialStatuses = []) => {
  const [statuses, setStatuses] = useState(initialStatuses);
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const addStatus = useCallback((newStatus) => {
    setStatuses(prev => [newStatus, ...prev]);
  }, []);

  const removeStatus = useCallback((statusId) => {
    setStatuses(prev => prev.filter(status => status.id !== statusId));
  }, []);

  const markAsViewed = useCallback((statusId) => {
    setStatuses(prev =>
      prev.map(status =>
        status.id === statusId
          ? { ...status, isViewed: true }
          : status
      )
    );
  }, []);

  const refresh = useCallback(async (refreshFunction) => {
    setRefreshing(true);
    try {
      if (refreshFunction) {
        const newStatuses = await refreshFunction();
        setStatuses(newStatuses);
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === VIEW_MODES.GRID ? VIEW_MODES.LIST : VIEW_MODES.GRID);
  }, []);

  return {
    statuses,
    viewMode,
    selectedStatus,
    refreshing,
    addStatus,
    removeStatus,
    markAsViewed,
    refresh,
    toggleViewMode,
    setSelectedStatus,
    setViewMode,
  };
};

export default StatusGallery;
export { STATUS_TYPES, VIEW_MODES, AI_HIGHLIGHTS };