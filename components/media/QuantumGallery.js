
/**
 * QuantumGallery - Apple Photos-level Media Experience
 * Smart albums with AI-organized photos, mesh thumbnails with crystalline effects
 * Mesh zoom animations, batch select with mesh highlight system, cloud sync progress
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Image,
  Alert,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { PinchGestureHandler, PanGestureHandler, State } from 'react-native-gesture-handler';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
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

// Gallery view modes
const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
  ALBUMS: 'albums',
  MAP: 'map',
  MOMENTS: 'moments',
};

// Sort options
const SORT_OPTIONS = {
  DATE_DESC: 'date_desc',
  DATE_ASC: 'date_asc',
  NAME: 'name',
  SIZE: 'size',
  TYPE: 'type',
  LOCATION: 'location',
};

// Media types
const MEDIA_TYPES = {
  ALL: 'all',
  PHOTOS: 'photos',
  VIDEOS: 'videos',
  ALBUMS: 'albums',
  FAVORITES: 'favorites',
  RECENT: 'recent',
  SHARED: 'shared',
};

// AI album categories
const AI_ALBUMS = {
  PEOPLE: 'people',
  PLACES: 'places',
  THINGS: 'things',
  MOMENTS: 'moments',
  SELFIES: 'selfies',
  SCREENSHOTS: 'screenshots',
  VIDEOS: 'videos',
  PANORAMAS: 'panoramas',
};

// Continuation of QuantumGallery.js

const QuantumGallery = ({
  navigation,
  onMediaSelect,
  onMediaShare,
  onMediaDelete,
  multiSelect = false,
  maxSelection = 10,
  mediaTypes = [MEDIA_TYPES.ALL],
  showCloudSync = true,
  enableAIAlbums = true,
  allowEditing = true,
}) => {
  const { colors } = useMeshColors();
  const { timing } = useMeshAnimations();

  // State management
  const [media, setMedia] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [aiAlbums, setAIAlbums] = useState([]);
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.DATE_DESC);
  const [selectedMedia, setSelectedMedia] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncProgress, setSyncProgress] = useState(0);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomedMedia, setZoomedMedia] = useState(null);

  // Filter and search state
  const [activeFilter, setActiveFilter] = useState(MEDIA_TYPES.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Animation refs
  const gridAnimation = useRef(new Animated.Value(0)).current;
  const selectionAnimation = useRef(new Animated.Value(0)).current;
  const syncAnimation = useRef(new Animated.Value(0)).current;
  const headerAnimation = useRef(new Animated.Value(0)).current;

  // Zoom gesture refs
  const zoomScale = useRef(new Animated.Value(1)).current;
  const zoomTranslateX = useRef(new Animated.Value(0)).current;
  const zoomTranslateY = useRef(new Animated.Value(0)).current;

  // Initialize gallery
  useEffect(() => {
    initializeGallery();
    startHeaderAnimation();
  }, []);

  // Handle selection mode changes
  useEffect(() => {
    Animated.timing(selectionAnimation, {
      toValue: isSelectionMode ? 1 : 0,
      duration: timing.normal,
      useNativeDriver: true,
    }).start();
  }, [isSelectionMode]);

  // Start sync animation
  useEffect(() => {
    if (showCloudSync && syncProgress > 0) {
      Animated.timing(syncAnimation, {
        toValue: syncProgress,
        duration: timing.normal,
        useNativeDriver: false,
      }).start();
    }
  }, [syncProgress, showCloudSync]);

  // Initialize gallery data
  const initializeGallery = async () => {
    try {
      setLoading(true);

      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media library access to view your photos.');
        return;
      }

      // Load media
      await loadMedia();
      await loadAlbums();
      
      if (enableAIAlbums) {
        await generateAIAlbums();
      }

      // Start grid animation
      startGridAnimation();

    } catch (error) {
      console.error('Failed to initialize gallery:', error);
      Alert.alert('Error', 'Failed to load media gallery.');
    } finally {
      setLoading(false);
    }
  };

  // Load media from device
  const loadMedia = async () => {
    try {
      const assets = await MediaLibrary.getAssetsAsync({
        mediaType: getMediaLibraryType(activeFilter),
        sortBy: MediaLibrary.SortBy.creationTime,
        first: 1000, // Load first 1000 items
      });

      const processedMedia = await Promise.all(
        assets.assets.map(async (asset) => ({
          ...asset,
          thumbnail: await generateMeshThumbnail(asset),
          isSelected: false,
          meshPattern: generateUserMesh(asset.id),
        }))
      );

      setMedia(processedMedia);
    } catch (error) {
      console.error('Failed to load media:', error);
    }
  };

  // Load albums
  const loadAlbums = async () => {
    try {
      const albumsData = await MediaLibrary.getAlbumsAsync();
      const processedAlbums = albumsData.map(album => ({
        ...album,
        meshPattern: generateUserMesh(album.id),
        coverThumbnail: null, // Will be loaded separately
      }));

      setAlbums(processedAlbums);

      // Load cover thumbnails
      for (const album of processedAlbums) {
        const coverAsset = await MediaLibrary.getAssetsAsync({
          album: album.id,
          first: 1,
        });
        
        if (coverAsset.assets.length > 0) {
          album.coverThumbnail = await generateMeshThumbnail(coverAsset.assets[0]);
        }
      }

      setAlbums([...processedAlbums]);
    } catch (error) {
      console.error('Failed to load albums:', error);
    }
  };

  // Generate AI-organized albums
  const generateAIAlbums = async () => {
    try {
      const aiCategories = [];

      // People detection (mock implementation)
      aiCategories.push({
        id: 'people',
        title: 'People',
        type: AI_ALBUMS.PEOPLE,
        count: Math.floor(Math.random() * 50) + 10,
        thumbnail: null,
        color: colors.primary,
      });

      // Screenshots
      const screenshots = media.filter(item => 
        item.filename?.toLowerCase().includes('screenshot') ||
        item.width === screenWidth && item.height === screenHeight
      );
      
      if (screenshots.length > 0) {
        aiCategories.push({
          id: 'screenshots',
          title: 'Screenshots',
          type: AI_ALBUMS.SCREENSHOTS,
          count: screenshots.length,
          thumbnail: await generateMeshThumbnail(screenshots[0]),
          color: colors.secondary,
        });
      }

      // Videos
      const videos = media.filter(item => item.mediaType === 'video');
      if (videos.length > 0) {
        aiCategories.push({
          id: 'videos',
          title: 'Videos',
          type: AI_ALBUMS.VIDEOS,
          count: videos.length,
          thumbnail: await generateMeshThumbnail(videos[0]),
          color: colors.accents.success,
        });
      }

      setAIAlbums(aiCategories);
    } catch (error) {
      console.error('Failed to generate AI albums:', error);
    }
  };

  // Generate mesh thumbnail
  const generateMeshThumbnail = async (asset) => {
    try {
      // In a real implementation, this would apply mesh effects to thumbnails
      return {
        uri: asset.uri,
        meshEffect: 'crystalline',
        processed: true,
      };
    } catch (error) {
      console.error('Failed to generate mesh thumbnail:', error);
      return { uri: asset.uri, processed: false };
    }
  };

  // Start header animation
  const startHeaderAnimation = () => {
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: timing.normal,
      useNativeDriver: true,
    }).start();
  };

  // Start grid animation
  const startGridAnimation = () => {
    Animated.stagger(50,
      Array.from({ length: Math.min(media.length, 20) }, (_, index) =>
        Animated.timing(gridAnimation, {
          toValue: 1,
          duration: timing.normal,
          useNativeDriver: true,
        })
      )
    ).start();
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadMedia();
      await loadAlbums();
      if (enableAIAlbums) {
        await generateAIAlbums();
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Handle media selection
  const handleMediaSelect = (item) => {
    if (multiSelect) {
      const newSelection = new Set(selectedMedia);
      
      if (newSelection.has(item.id)) {
        newSelection.delete(item.id);
      } else if (newSelection.size < maxSelection) {
        newSelection.add(item.id);
      } else {
        Alert.alert('Selection Limit', `You can only select up to ${maxSelection} items.`);
        return;
      }
      
      setSelectedMedia(newSelection);
      
      if (newSelection.size === 0) {
        setIsSelectionMode(false);
      }
    } else {
      if (onMediaSelect) {
        onMediaSelect(item);
      }
    }
  };

  // Handle media long press
  const handleMediaLongPress = (item) => {
    if (multiSelect && !isSelectionMode) {
      setIsSelectionMode(true);
      const newSelection = new Set([item.id]);
      setSelectedMedia(newSelection);
    } else {
      // Show context menu
      showMediaContextMenu(item);
    }
  };

  // Show media context menu
  const showMediaContextMenu = (item) => {
    Alert.alert(
      'Media Options',
      'Choose an action',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => handleShare([item]) },
        { text: 'Delete', style: 'destructive', onPress: () => handleDelete([item]) },
        ...(allowEditing ? [
          { text: 'Edit', onPress: () => handleEdit(item) },
        ] : []),
      ]
    );
  };

  // Handle zoom gesture
  const handleZoomMedia = (item) => {
    setZoomedMedia(item);
    setShowZoomModal(true);
  };

  // Handle share
  const handleShare = async (items) => {
    if (onMediaShare) {
      onMediaShare(items);
    }
  };

  // Handle delete
  const handleDelete = async (items) => {
    Alert.alert(
      'Delete Media',
      `Are you sure you want to delete ${items.length} item(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const item of items) {
                await MediaLibrary.deleteAssetsAsync([item]);
              }
              
              setMedia(prev => prev.filter(m => !items.find(i => i.id === m.id)));
              setSelectedMedia(new Set());
              setIsSelectionMode(false);
              
              if (onMediaDelete) {
                onMediaDelete(items);
              }
            } catch (error) {
              console.error('Failed to delete media:', error);
              Alert.alert('Error', 'Failed to delete media.');
            }
          },
        },
      ]
    );
  };

  // Handle edit
  const handleEdit = (item) => {
    // Navigate to media editor
    navigation.navigate('MediaEditor', { media: item });
  };

  // Batch operations
  const handleBatchShare = () => {
    const items = media.filter(m => selectedMedia.has(m.id));
    handleShare(items);
  };

  const handleBatchDelete = () => {
    const items = media.filter(m => selectedMedia.has(m.id));
    handleDelete(items);
  };

  const clearSelection = () => {
    setSelectedMedia(new Set());
    setIsSelectionMode(false);
  };

  // Get media library type
  const getMediaLibraryType = (filter) => {
    switch (filter) {
      case MEDIA_TYPES.PHOTOS:
        return MediaLibrary.MediaType.photo;
      case MEDIA_TYPES.VIDEOS:
        return MediaLibrary.MediaType.video;
      default:
        return MediaLibrary.MediaType.all;
    }
  };

  // Filtered and sorted media
  const filteredMedia = useMemo(() => {
    let filtered = media;

    // Apply filter
    if (activeFilter !== MEDIA_TYPES.ALL) {
      filtered = filtered.filter(item => {
        switch (activeFilter) {
          case MEDIA_TYPES.PHOTOS:
            return item.mediaType === 'photo';
          case MEDIA_TYPES.VIDEOS:
            return item.mediaType === 'video';
          case MEDIA_TYPES.FAVORITES:
            return item.isFavorite;
          case MEDIA_TYPES.RECENT:
            return Date.now() - item.creationTime < 7 * 24 * 60 * 60 * 1000; // Last 7 days
          default:
            return true;
        }
      });
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.filename?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case SORT_OPTIONS.DATE_ASC:
          return a.creationTime - b.creationTime;
        case SORT_OPTIONS.DATE_DESC:
          return b.creationTime - a.creationTime;
        case SORT_OPTIONS.NAME:
          return (a.filename || '').localeCompare(b.filename || '');
        case SORT_OPTIONS.SIZE:
          return (b.width * b.height) - (a.width * a.height);
        default:
          return b.creationTime - a.creationTime;
      }
    });

    return filtered;
  }, [media, activeFilter, searchQuery, sortBy]);

  // Render media item
  const renderMediaItem = ({ item, index }) => {
    const isSelected = selectedMedia.has(item.id);
    const itemSize = viewMode === VIEW_MODES.GRID ? 
      (screenWidth - MeshSpacing.md * 4) / 3 : 
      screenWidth - MeshSpacing.md * 2;

    return (
      <MediaGridItem
        media={item}
        size={itemSize}
        isSelected={isSelected}
        isSelectionMode={isSelectionMode}
        onPress={() => handleMediaSelect(item)}
        onLongPress={() => handleMediaLongPress(item)}
        onZoom={() => handleZoomMedia(item)}
        colors={colors}
        timing={timing}
        gridAnimation={gridAnimation}
        selectionAnimation={selectionAnimation}
      />
    );
  };

  // Render album item
  const renderAlbumItem = ({ item }) => (
    <AlbumGridItem
      album={item}
      onPress={() => navigation.navigate('AlbumView', { album: item })}
      colors={colors}
    />
  );

  // Render AI album item
  const renderAIAlbumItem = ({ item }) => (
    <AIAlbumCard
      album={item}
      onPress={() => navigation.navigate('AIAlbumView', { album: item })}
      colors={colors}
    />
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
              {isSelectionMode ? `${selectedMedia.size} Selected` : 'Gallery'}
            </Text>
            
            <View style={styles.headerActions}>
              {isSelectionMode ? (
                <>
                  <TouchableOpacity
                    style={styles.headerAction}
                    onPress={handleBatchShare}
                    disabled={selectedMedia.size === 0}
                  >
                    <Ionicons 
                      name="share" 
                      size={24} 
                      color={selectedMedia.size > 0 ? colors.primary : colors.textSecondary} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.headerAction}
                    onPress={handleBatchDelete}
                    disabled={selectedMedia.size === 0}
                  >
                    <Ionicons 
                      name="trash" 
                      size={24} 
                      color={selectedMedia.size > 0 ? colors.accents.mutedRed : colors.textSecondary} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.headerAction}
                    onPress={clearSelection}
                  >
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </>
              ) : (
                <>
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
                </>
              )}
            </View>
          </View>

          {/* Cloud sync progress */}
          {showCloudSync && syncProgress > 0 && (
            <CloudSyncProgress progress={syncProgress} colors={colors} />
          )}

          {/* Filter tabs */}
          <MediaFilterTabs
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            colors={colors}
          />
        </View>
      </FloatingCard>
    </Animated.View>
  );

  // Render content based on view mode
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <QuantumLoader type="particles" size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading your media...
          </Text>
        </View>
      );
    }

    switch (viewMode) {
      case VIEW_MODES.ALBUMS:
        return (
          <ScrollView style={styles.albumsContainer} showsVerticalScrollIndicator={false}>
            {enableAIAlbums && aiAlbums.length > 0 && (
              <View style={styles.aiAlbumsSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Smart Albums
                </Text>
                <FlatList
                  data={aiAlbums}
                  renderItem={renderAIAlbumItem}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  scrollEnabled={false}
                  contentContainerStyle={styles.aiAlbumsList}
                />
              </View>
            )}
            
            <View style={styles.albumsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                My Albums
              </Text>
              <FlatList
                data={albums}
                renderItem={renderAlbumItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.albumsList}
              />
            </View>
          </ScrollView>
        );

      default:
        return (
          <FlatList
            data={filteredMedia}
            renderItem={renderMediaItem}
            keyExtractor={(item) => item.id}
            numColumns={viewMode === VIEW_MODES.GRID ? 3 : 1}
            contentContainerStyle={styles.mediaList}
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
              <EmptyGallery colors={colors} />
            }
          />
        );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Mesh background */}
      <CrystallineMesh
        variant="small"
        animated={true}
        intensity={0.05}
        color={getDynamicColor(colors.primary, 0.02)}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      {renderHeader()}

      {/* Content */}
      {renderContent()}

      {/* Zoom modal */}
      <ZoomModal
        visible={showZoomModal}
        media={zoomedMedia}
        onClose={() => setShowZoomModal(false)}
        colors={colors}
      />
    </SafeAreaView>
  );
};

// Media grid item component
const MediaGridItem = ({ 
  media, 
  size, 
  isSelected, 
  isSelectionMode, 
  onPress, 
  onLongPress, 
  onZoom,
  colors,
  timing,
  gridAnimation,
  selectionAnimation,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const selectionScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(selectionScale, {
      toValue: isSelected ? 1 : 0,
      duration: timing.fast,
      useNativeDriver: true,
    }).start();
  }, [isSelected]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.mediaItem,
        {
          width: size,
          height: size,
          opacity: gridAnimation,
          transform: [
            { scale: scaleAnim },
            {
              translateY: gridAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={onLongPress}
        activeOpacity={0.8}
      >
        <View style={styles.mediaContainer}>
          {/* Mesh border */}
          <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
            <Defs>
              <SvgGradient id={`border-${media.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.3" />
                <Stop offset="100%" stopColor={colors.secondary} stopOpacity="0.3" />
              </SvgGradient>
            </Defs>
            
            <Rect
              width={size}
              height={size}
              stroke={`url(#border-${media.id})`}
              strokeWidth="1"
              fill="none"
              rx="8"
            />
          </Svg>

          {/* Media thumbnail */}
          <Image
            source={{ uri: media.thumbnail?.uri || media.uri }}
            style={[styles.mediaThumbnail, { borderRadius: 8 }]}
            resizeMode="cover"
          />

          {/* Video indicator */}
          {media.mediaType === 'video' && (
            <View style={[styles.videoIndicator, { backgroundColor: getDynamicColor('#000', 0.6) }]}>
              <Ionicons name="play" size={16} color={colors.crystallineWhite} />
              <Text style={[styles.videoDuration, { color: colors.crystallineWhite }]}>
                {formatDuration(media.duration)}
              </Text>
            </View>
          )}

          {/* Selection indicator */}
          {isSelectionMode && (
            <Animated.View
              style={[
                styles.selectionIndicator,
                {
                  backgroundColor: colors.primary,
                  opacity: selectionScale,
                  transform: [{ scale: selectionScale }],
                },
              ]}
            >
              <Ionicons name="checkmark" size={16} color={colors.crystallineWhite} />
            </Animated.View>
          )}

          {/* Mesh overlay effect */}
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: getDynamicColor(colors.primary, 0.1),
                opacity: selectionAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.3],
                }),
              },
            ]}
            pointerEvents="none"
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Album grid item component
const AlbumGridItem = ({ album, onPress, colors }) => (
  <TouchableOpacity style={styles.albumItem} onPress={onPress}>
    <FloatingCard variant="medium" style={styles.albumCard}>
      <View style={styles.albumContent}>
        <View style={styles.albumThumbnail}>
          {album.coverThumbnail ? (
            <Image
              source={{ uri: album.coverThumbnail.uri }}
              style={styles.albumCover}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.albumPlaceholder, { backgroundColor: colors.surface }]}>
              <MaterialIcons name="photo-album" size={32} color={colors.textSecondary} />
            </View>
          )}
        </View>
        
        <Text style={[styles.albumTitle, { color: colors.text }]} numberOfLines={1}>
          {album.title}
        </Text>
        
        <Text style={[styles.albumCount, { color: colors.textSecondary }]}>
          {album.assetCount} items
        </Text>
      </View>
    </FloatingCard>
  </TouchableOpacity>
);

// AI album card component
const AIAlbumCard = ({ album, onPress, colors }) => (
  <TouchableOpacity style={styles.aiAlbumItem} onPress={onPress}>
    <LinearGradient
      colors={[
        getDynamicColor(album.color, 0.8),
        getDynamicColor(album.color, 0.6),
      ]}
      style={styles.aiAlbumGradient}
    >
      <View style={styles.aiAlbumContent}>
        <MaterialIcons name="auto-awesome" size={24} color={colors.crystallineWhite} />
        <Text style={[styles.aiAlbumTitle, { color: colors.crystallineWhite }]}>
          {album.title}
        </Text>
        <Text style={[styles.aiAlbumCount, { color: getDynamicColor(colors.crystallineWhite, 0.8) }]}>
          {album.count} items
        </Text>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

// Cloud sync progress component
const CloudSyncProgress = ({ progress, colors }) => (
  <View style={styles.syncProgress}>
    <View style={styles.syncHeader}>
      <MaterialIcons name="cloud-sync" size={16} color={colors.primary} />
      <Text style={[styles.syncText, { color: colors.primary }]}>
        Syncing to Cloud
      </Text>
    </View>
    <View style={[styles.progressBar, { backgroundColor: getDynamicColor(colors.surface, 0.5) }]}>
      <Animated.View
        style={[
          styles.progressFill,
          {
            backgroundColor: colors.primary,
            width: `${progress * 100}%`,
          },
        ]}
      />
    </View>
  </View>
);

// Media filter tabs component
const MediaFilterTabs = ({ activeFilter, onFilterChange, colors }) => (
  <ScrollView 
    horizontal 
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.filterTabs}
  >
    {Object.values(MEDIA_TYPES).map((filter) => (
      <TouchableOpacity
        key={filter}
        style={[
          styles.filterTab,
          activeFilter === filter && { backgroundColor: colors.primary },
        ]}
        onPress={() => onFilterChange(filter)}
      >
        <Text
          style={[
            styles.filterTabText,
            { color: activeFilter === filter ? colors.crystallineWhite : colors.text },
          ]}
        >
          {filter.charAt(0).toUpperCase() + filter.slice(1)}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

// Empty gallery component
const EmptyGallery = ({ colors }) => (
  <View style={styles.emptyContainer}>
    <MaterialIcons name="photo-library" size={64} color={colors.textSecondary} />
    <Text style={[styles.emptyTitle, { color: colors.text }]}>
      No Media Found
    </Text>
    <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
      Your photos and videos will appear here
    </Text>
  </View>
);

// Zoom modal component
const ZoomModal = ({ visible, media, onClose, colors }) => {
  if (!visible || !media) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.zoomContainer, { backgroundColor: '#000' }]}>
        <SafeAreaView style={styles.zoomHeader}>
          <TouchableOpacity
            style={styles.zoomCloseButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </SafeAreaView>

        <PinchGestureHandler>
          <PanGestureHandler>
            <Animated.View style={styles.zoomContent}>
              <Image
                source={{ uri: media.uri }}
                style={styles.zoomedImage}
                resizeMode="contain"
              />
            </Animated.View>
          </PanGestureHandler>
        </PinchGestureHandler>
      </View>
    </Modal>
  );
};

// Utility functions
const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
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

  syncProgress: {
    marginBottom: MeshSpacing.md,
  },

  syncHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: MeshSpacing.xs,
  },

  syncText: {
    fontSize: MeshTypography.sizes.caption,
    marginLeft: MeshSpacing.xs,
  },

  progressBar: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },

  filterTabs: {
    paddingRight: MeshSpacing.md,
  },

  filterTab: {
    paddingHorizontal: MeshSpacing.md,
    paddingVertical: MeshSpacing.sm,
    borderRadius: MeshBorderRadius.lg,
    marginRight: MeshSpacing.sm,
    backgroundColor: getDynamicColor(MeshColors.neutrals.lightGrey, 0.3),
  },

  filterTabText: {
    fontSize: MeshTypography.sizes.bodySmall,
    fontWeight: MeshTypography.weights.medium,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: MeshTypography.sizes.body,
    marginTop: MeshSpacing.lg,
  },

  mediaList: {
    paddingHorizontal: MeshSpacing.md,
    paddingBottom: MeshSpacing.lg,
  },

  mediaItem: {
    marginBottom: MeshSpacing.sm,
    marginHorizontal: MeshSpacing.xs,
  },

  mediaContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },

  mediaThumbnail: {
    width: '100%',
    height: '100%',
  },

  videoIndicator: {
    position: 'absolute',
    bottom: MeshSpacing.xs,
    left: MeshSpacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MeshSpacing.xs,
    paddingVertical: 2,
    borderRadius: MeshBorderRadius.xs,
  },

  videoDuration: {
    fontSize: MeshTypography.sizes.caption,
    marginLeft: 2,
  },

  selectionIndicator: {
    position: 'absolute',
    top: MeshSpacing.xs,
    right: MeshSpacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  albumsContainer: {
    flex: 1,
    paddingHorizontal: MeshSpacing.md,
  },

  aiAlbumsSection: {
    marginBottom: MeshSpacing.xl,
  },

  albumsSection: {
    marginBottom: MeshSpacing.xl,
  },

  sectionTitle: {
    fontSize: MeshTypography.sizes.h3,
    fontWeight: MeshTypography.weights.semiBold,
    marginBottom: MeshSpacing.md,
  },

  aiAlbumsList: {
    gap: MeshSpacing.md,
  },

  albumsList: {
    gap: MeshSpacing.md,
  },

  albumItem: {
    flex: 1,
    marginHorizontal: MeshSpacing.xs,
  },

  albumCard: {
    overflow: 'hidden',
  },

  albumContent: {
    padding: MeshSpacing.md,
    alignItems: 'center',
  },

  albumThumbnail: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: MeshSpacing.sm,
    borderRadius: MeshBorderRadius.sm,
    overflow: 'hidden',
  },

  albumCover: {
    width: '100%',
    height: '100%',
  },

  albumPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  albumTitle: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.medium,
    textAlign: 'center',
    marginBottom: MeshSpacing.xs,
  },

  albumCount: {
    fontSize: MeshTypography.sizes.caption,
    textAlign: 'center',
  },

  aiAlbumItem: {
    flex: 1,
    marginHorizontal: MeshSpacing.xs,
    borderRadius: MeshBorderRadius.lg,
    overflow: 'hidden',
    height: 120,
  },

  aiAlbumGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: MeshSpacing.md,
  },

  aiAlbumContent: {
    alignItems: 'center',
  },

  aiAlbumTitle: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.semiBold,
    marginTop: MeshSpacing.sm,
    textAlign: 'center',
  },

  aiAlbumCount: {
    fontSize: MeshTypography.sizes.caption,
    marginTop: MeshSpacing.xs,
    textAlign: 'center',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: MeshSpacing.xxxl,
  },

  emptyTitle: {
    fontSize: MeshTypography.sizes.h3,
    fontWeight: MeshTypography.weights.semiBold,
    marginTop: MeshSpacing.lg,
    marginBottom: MeshSpacing.sm,
  },

  emptyDescription: {
    fontSize: MeshTypography.sizes.body,
    textAlign: 'center',
  },

  zoomContainer: {
    flex: 1,
  },

  zoomHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: MeshSpacing.lg,
  },

  zoomCloseButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  zoomContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  zoomedImage: {
    width: screenWidth,
    height: screenHeight,
  },
});

// Export specialized gallery components
export const PhotoGallery = (props) => (
  <QuantumGallery {...props} mediaTypes={[MEDIA_TYPES.PHOTOS]} />
);

export const VideoGallery = (props) => (
  <QuantumGallery {...props} mediaTypes={[MEDIA_TYPES.VIDEOS]} />
);

export const AlbumGallery = (props) => (
  <QuantumGallery {...props} viewMode={VIEW_MODES.ALBUMS} />
);

// Hook for managing gallery state
export const useQuantumGallery = () => {
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [selectedMedia, setSelectedMedia] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState(MEDIA_TYPES.ALL);

  const toggleSelection = useCallback((mediaId) => {
    const newSelection = new Set(selectedMedia);
    if (newSelection.has(mediaId)) {
      newSelection.delete(mediaId);
    } else {
      newSelection.add(mediaId);
    }
    setSelectedMedia(newSelection);
    setIsSelectionMode(newSelection.size > 0);
  }, [selectedMedia]);

  const clearSelection = useCallback(() => {
    setSelectedMedia(new Set());
    setIsSelectionMode(false);
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === VIEW_MODES.GRID ? VIEW_MODES.LIST : VIEW_MODES.GRID);
  }, []);

  return {
    viewMode,
    selectedMedia,
    isSelectionMode,
    activeFilter,
    setViewMode,
    setActiveFilter,
    toggleSelection,
    clearSelection,
    toggleViewMode,
  };
};

export default QuantumGallery;
export { VIEW_MODES, SORT_OPTIONS, MEDIA_TYPES, AI_ALBUMS };
