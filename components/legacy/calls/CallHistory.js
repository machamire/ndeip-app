/**
 * CallHistory - Beautiful Call Log with Insights
 * Call duration visualization with mesh growth, missed call alerts
 * Quick callback with mesh trail animation, rich contact cards
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Svg, {
  Circle,
  Path,
  G,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  AnimatedCircle,
  AnimatedPath,
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

// Call types
const CALL_TYPES = {
  INCOMING: 'incoming',
  OUTGOING: 'outgoing',
  MISSED: 'missed',
  REJECTED: 'rejected',
  FAILED: 'failed',
  VOICEMAIL: 'voicemail',
};

// Call status
const CALL_STATUS = {
  COMPLETED: 'completed',
  MISSED: 'missed',
  REJECTED: 'rejected',
  FAILED: 'failed',
  BUSY: 'busy',
  NO_ANSWER: 'no_answer',
};

const CallHistory = ({
  navigation,
  calls: initialCalls = [],
  onRefresh,
  onCallBack,
  onDeleteCall,
  onBlockContact,
  onCallDetails,
  showInsightsSummary = true,
}) => {
  const { colors } = useMeshColors();
  const { timing } = useMeshAnimations();

  // State management
  const [calls, setCalls] = useState(initialCalls);
  const [selectedCall, setSelectedCall] = useState(null);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCalls, setSelectedCalls] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  // Animation refs
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const insightsAnimation = useRef(new Animated.Value(0)).current;

  // Initialize animations
  useEffect(() => {
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: timing.normal,
      useNativeDriver: true,
    }).start();
  }, []);

  // Filter calls based on active filter
  const filteredCalls = useMemo(() => {
    switch (activeFilter) {
      case 'missed':
        return calls.filter(call => call.status === CALL_STATUS.MISSED);
      case 'outgoing':
        return calls.filter(call => call.type === CALL_TYPES.OUTGOING);
      case 'incoming':
        return calls.filter(call => call.type === CALL_TYPES.INCOMING && call.status === CALL_STATUS.COMPLETED);
      case 'video':
        return calls.filter(call => call.isVideoCall);
      case 'voice':
        return calls.filter(call => !call.isVideoCall);
      default:
        return calls;
    }
  }, [calls, activeFilter]);

  // Generate call insights
  const callInsights = useMemo(() => {
    const totalCalls = calls.length;
    const missedCalls = calls.filter(call => call.status === CALL_STATUS.MISSED).length;
    const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0);
    const videoCalls = calls.filter(call => call.isVideoCall).length;
    const avgDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;

    const today = new Date();
    const todayCalls = calls.filter(call => {
      const callDate = new Date(call.timestamp);
      return callDate.toDateString() === today.toDateString();
    }).length;

    const thisWeek = calls.filter(call => {
      const callDate = new Date(call.timestamp);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return callDate >= weekAgo;
    }).length;

    return {
      totalCalls,
      missedCalls,
      totalDuration,
      videoCalls,
      avgDuration,
      todayCalls,
      thisWeek,
      missedRate: totalCalls > 0 ? (missedCalls / totalCalls) * 100 : 0,
    };
  }, [calls]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Handle call back
  const handleCallBack = (call) => {
    if (onCallBack) {
      onCallBack(call);
    }
  };

  // Handle call deletion
  const handleDeleteCall = (call) => {
    Alert.alert(
      'Delete Call',
      'Are you sure you want to delete this call from history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCalls(prev => prev.filter(c => c.id !== call.id));
            if (onDeleteCall) onDeleteCall(call);
          },
        },
      ]
    );
  };

  // Handle multiple call selection
  const toggleCallSelection = (callId) => {
    const newSelection = new Set(selectedCalls);
    if (newSelection.has(callId)) {
      newSelection.delete(callId);
    } else {
      newSelection.add(callId);
    }
    setSelectedCalls(newSelection);
    
    if (newSelection.size === 0) {
      setSelectionMode(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    Alert.alert(
      'Delete Calls',
      `Are you sure you want to delete ${selectedCalls.size} call(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCalls(prev => prev.filter(call => !selectedCalls.has(call.id)));
            setSelectedCalls(new Set());
            setSelectionMode(false);
          },
        },
      ]
    );
  };

  // Render header with insights
  const renderHeader = () => (
    <Animated.View
      style={[
        styles.header,
        {
          opacity: headerAnimation,
          transform: [{
            translateY: headerAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0],
            }),
          }],
        },
      ]}
    >
      <FloatingCard variant="large" style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Call History
            </Text>
            
            <View style={styles.headerActions}>
              {selectionMode ? (
                <>
                  <TouchableOpacity
                    style={styles.headerAction}
                    onPress={handleBulkDelete}
                    disabled={selectedCalls.size === 0}
                  >
                    <Ionicons 
                      name="trash" 
                      size={24} 
                      color={selectedCalls.size > 0 ? colors.accents.mutedRed : colors.textSecondary} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.headerAction}
                    onPress={() => {
                      setSelectedCalls(new Set());
                      setSelectionMode(false);
                    }}
                  >
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.headerAction}
                    onPress={() => setShowInsightsModal(true)}
                  >
                    <MaterialIcons name="insights" size={24} color={colors.text} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.headerAction}
                    onPress={() => setShowFilterMenu(true)}
                  >
                    <Ionicons name="filter" size={24} color={colors.text} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.headerAction}
                    onPress={() => setSelectionMode(true)}
                  >
                    <MaterialIcons name="checklist" size={24} color={colors.text} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {showInsightsSummary && !selectionMode && (
            <CallInsightsSummary insights={callInsights} colors={colors} />
          )}
        </View>
      </FloatingCard>
    </Animated.View>
  );

  // Render filter tabs
  const renderFilterTabs = () => (
    <View style={styles.filterTabs}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterTabsContent}
      >
        {[
          { key: 'all', label: 'All', count: calls.length },
          { key: 'missed', label: 'Missed', count: callInsights.missedCalls },
          { key: 'outgoing', label: 'Outgoing', count: calls.filter(c => c.type === CALL_TYPES.OUTGOING).length },
          { key: 'incoming', label: 'Incoming', count: calls.filter(c => c.type === CALL_TYPES.INCOMING && c.status === CALL_STATUS.COMPLETED).length },
          { key: 'video', label: 'Video', count: callInsights.videoCalls },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              activeFilter === filter.key && { backgroundColor: colors.primary },
            ]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: activeFilter === filter.key ? colors.background : colors.text },
              ]}
            >
              {filter.label}
            </Text>
            <Text
              style={[
                styles.filterTabCount,
                { color: activeFilter === filter.key ? colors.background : colors.textSecondary },
              ]}
            >
              {filter.count}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render individual call item
  const renderCallItem = ({ item: call, index }) => (
    <CallHistoryItem
      call={call}
      index={index}
      isSelected={selectedCalls.has(call.id)}
      selectionMode={selectionMode}
      onPress={() => {
        if (selectionMode) {
          toggleCallSelection(call.id);
        } else {
          setSelectedCall(call);
          if (onCallDetails) onCallDetails(call);
        }
      }}
      onLongPress={() => {
        if (!selectionMode) {
          setSelectionMode(true);
          toggleCallSelection(call.id);
        }
      }}
      onCallBack={() => handleCallBack(call)}
      onDelete={() => handleDeleteCall(call)}
      colors={colors}
      timing={timing}
    />
  );

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

      {/* Filter tabs */}
      {renderFilterTabs()}

      {/* Calls list */}
      <FlatList
        data={filteredCalls}
        renderItem={renderCallItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.callsList}
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
          <EmptyCallHistory activeFilter={activeFilter} colors={colors} />
        }
      />

      {/* Call insights modal */}
      <CallInsightsModal
        visible={showInsightsModal}
        insights={callInsights}
        calls={calls}
        onClose={() => setShowInsightsModal(false)}
        colors={colors}
      />

      {/* Filter menu modal */}
      <FilterMenuModal
        visible={showFilterMenu}
        activeFilter={activeFilter}
        onFilterSelect={setActiveFilter}
        onClose={() => setShowFilterMenu(false)}
        colors={colors}
      />
    </SafeAreaView>
  );
};

// Call history item component
const CallHistoryItem = ({
  call,
  index,
  isSelected,
  selectionMode,
  onPress,
  onLongPress,
  onCallBack,
  onDelete,
  colors,
  timing,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const selectionAnim = useRef(new Animated.Value(0)).current;
  const missedPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate selection state
    Animated.timing(selectionAnim, {
      toValue: isSelected ? 1 : 0,
      duration: timing.fast,
      useNativeDriver: true,
    }).start();

    // Pulse animation for missed calls
    if (call.status === CALL_STATUS.MISSED) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(missedPulse, {
            toValue: 1,
            duration: timing.slow,
            useNativeDriver: true,
          }),
          Animated.timing(missedPulse, {
            toValue: 0,
            duration: timing.slow,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isSelected, call.status]);

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
    ]).start(() => {
      onPress();
    });
  };

  const getCallIcon = () => {
    switch (call.type) {
      case CALL_TYPES.INCOMING:
        return call.status === CALL_STATUS.MISSED ? 'call-received' : 'call-received';
      case CALL_TYPES.OUTGOING:
        return 'call-made';
      case CALL_TYPES.MISSED:
        return 'call-received';
      default:
        return 'call';
    }
  };

  const getCallIconColor = () => {
    if (call.status === CALL_STATUS.MISSED) {
      return colors.accents.mutedRed;
    }
    return call.type === CALL_TYPES.OUTGOING ? colors.accents.success : colors.primary;
  };

  const getStatusText = () => {
    switch (call.status) {
      case CALL_STATUS.MISSED:
        return 'Missed';
      case CALL_STATUS.REJECTED:
        return 'Rejected';
      case CALL_STATUS.FAILED:
        return 'Failed';
      case CALL_STATUS.BUSY:
        return 'Busy';
      case CALL_STATUS.NO_ANSWER:
        return 'No answer';
      default:
        return formatDuration(call.duration);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Animated.View
      style={[
        styles.callItemContainer,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.callItem}
        onPress={handlePress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
      >
        <FloatingCard
          variant="medium"
          style={[
            styles.callCard,
            call.status === CALL_STATUS.MISSED && styles.missedCallCard,
          ]}
          interactive={false}
        >
          {/* Selection indicator */}
          {selectionMode && (
            <Animated.View
              style={[
                styles.selectionIndicator,
                {
                  backgroundColor: colors.primary,
                  opacity: selectionAnim,
                  transform: [{
                    scale: selectionAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  }],
                },
              ]}
            >
              <Ionicons name="checkmark" size={16} color={colors.background} />
            </Animated.View>
          )}

          {/* Missed call pulse */}
          {call.status === CALL_STATUS.MISSED && (
            <Animated.View
              style={[
                styles.missedPulse,
                {
                  backgroundColor: colors.accents.mutedRed,
                  opacity: missedPulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.2, 0.6],
                  }),
                },
              ]}
            />
          )}

          <View style={styles.callContent}>
            {/* Contact info */}
            <View style={styles.contactSection}>
              <View style={[styles.contactAvatar, { backgroundColor: colors.primary }]}>
                <Text style={[styles.contactAvatarText, { color: colors.background }]}>
                  {call.contact?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>

              <View style={styles.contactInfo}>
                <Text style={[styles.contactName, { color: colors.text }]}>
                  {call.contact?.name || call.phoneNumber || 'Unknown'}
                </Text>
                
                <View style={styles.callMeta}>
                  <Ionicons
                    name={getCallIcon()}
                    size={16}
                    color={getCallIconColor()}
                  />
                  
                  {call.isVideoCall && (
                    <MaterialIcons
                      name="videocam"
                      size={16}
                      color={colors.textSecondary}
                      style={{ marginLeft: MeshSpacing.xs }}
                    />
                  )}
                  
                  <Text style={[styles.callTime, { color: colors.textSecondary }]}>
                    {new Date(call.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Call details */}
            <View style={styles.callDetails}>
              <Text style={[styles.callStatus, { color: getCallIconColor() }]}>
                {getStatusText()}
              </Text>
              
              {call.duration > 0 && (
                <CallDurationVisualization
                  duration={call.duration}
                  maxDuration={Math.max(...calls.map(c => c.duration || 0))}
                  colors={colors}
                />
              )}
            </View>

            {/* Quick actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: colors.primary }]}
                onPress={(e) => {
                  e.stopPropagation();
                  onCallBack();
                }}
              >
                <Ionicons name="call" size={18} color={colors.background} />
              </TouchableOpacity>
              
              {call.isVideoCall && (
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: colors.secondary }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    onCallBack();
                  }}
                >
                  <MaterialIcons name="videocam" size={18} color={colors.background} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </FloatingCard>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Call duration visualization component
const CallDurationVisualization = ({ duration, maxDuration, colors }) => {
  const progress = maxDuration > 0 ? duration / maxDuration : 0;
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={styles.durationVisualization}>
      <Svg width={60} height={8}>
        <Defs>
          <SvgGradient id="durationGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={colors.secondary} stopOpacity="1" />
          </SvgGradient>
        </Defs>
        
        <Rect
          width={60}
          height={8}
          rx={4}
          fill={getDynamicColor(colors.surface, 0.5)}
        />
        
        <AnimatedPath
          d={`M 0 4 L ${animValue._value * 60} 4`}
          stroke="url(#durationGradient)"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

// Call insights summary component
const CallInsightsSummary = ({ insights, colors }) => (
  <View style={styles.insightsSummary}>
    <View style={styles.insightItem}>
      <Text style={[styles.insightValue, { color: colors.primary }]}>
        {insights.todayCalls}
      </Text>
      <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
        Today
      </Text>
    </View>
    
    <View style={styles.insightItem}>
      <Text style={[styles.insightValue, { color: colors.accents.mutedRed }]}>
        {insights.missedCalls}
      </Text>
      <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
        Missed
      </Text>
    </View>
    
    <View style={styles.insightItem}>
      <Text style={[styles.insightValue, { color: colors.secondary }]}>
        {Math.round(insights.avgDuration / 60)}m
      </Text>
      <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
        Avg
      </Text>
    </View>
  </View>
);

// Empty call history component
const EmptyCallHistory = ({ activeFilter, colors }) => (
  <View style={styles.emptyContainer}>
    <QuantumLoader
      type="dots"
      size="large"
      color={colors.primary}
      style={styles.emptyLoader}
    />
    
    <Text style={[styles.emptyTitle, { color: colors.text }]}>
      No {activeFilter === 'all' ? '' : activeFilter} calls
    </Text>
    
    <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
      {activeFilter === 'all' 
        ? 'Your call history will appear here'
        : `No ${activeFilter} calls found`
      }
    </Text>
  </View>
);

// Call insights modal
const CallInsightsModal = ({ visible, insights, calls, onClose, colors }) => (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
    <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
      {/* Modal header */}
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.modalTitle, { color: colors.text }]}>
          Call Insights
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.modalContent}>
        {/* Overview stats */}
        <FloatingCard variant="large" style={styles.insightsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Overview
          </Text>
          
          <View style={styles.statsGrid}>
            <InsightStat
              label="Total Calls"
              value={insights.totalCalls}
              color={colors.primary}
            />
            <InsightStat
              label="This Week"
              value={insights.thisWeek}
              color={colors.secondary}
            />
            <InsightStat
              label="Missed Rate"
              value={`${Math.round(insights.missedRate)}%`}
              color={colors.accents.mutedRed}
            />
            <InsightStat
              label="Video Calls"
              value={insights.videoCalls}
              color={colors.accents.success}
            />
          </View>
        </FloatingCard>

        {/* Call patterns */}
        <FloatingCard variant="large" style={styles.insightsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Patterns
          </Text>
          
          <CallPatternChart calls={calls} colors={colors} />
        </FloatingCard>
      </ScrollView>
    </SafeAreaView>
  </Modal>
);

// Filter menu modal
const FilterMenuModal = ({ visible, activeFilter, onFilterSelect, onClose, colors }) => (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
    <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.modalTitle, { color: colors.text }]}>
          Filter Calls
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.modalContent}>
        {[
          { key: 'all', label: 'All Calls', icon: 'call' },
          { key: 'missed', label: 'Missed Calls', icon: 'call-received' },
          { key: 'outgoing', label: 'Outgoing Calls', icon: 'call-made' },
          { key: 'incoming', label: 'Incoming Calls', icon: 'call-received' },
          { key: 'video', label: 'Video Calls', icon: 'videocam' },
          { key: 'voice', label: 'Voice Calls', icon: 'call' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterOption,
              activeFilter === filter.key && { backgroundColor: getDynamicColor(colors.primary, 0.1) },
            ]}
            onPress={() => {
              onFilterSelect(filter.key);
              onClose();
            }}
          >
            <Ionicons name={filter.icon} size={24} color={colors.text} />
            <Text style={[styles.filterOptionText, { color: colors.text }]}>
              {filter.label}
            </Text>
            {activeFilter === filter.key && (
              <Ionicons name="checkmark" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  </Modal>
);

// Insight stat component
const InsightStat = ({ label, value, color }) => (
  <View style={styles.insightStat}>
    <Text style={[styles.insightStatValue, { color }]}>
      {value}
    </Text>
    <Text style={[styles.insightStatLabel, { color: colors.textSecondary }]}>
      {label}
    </Text>
  </View>
);

// Call pattern chart component
const CallPatternChart = ({ calls, colors }) => {
  const hourlyData = useMemo(() => {
    const hours = Array(24).fill(0);
    calls.forEach(call => {
      const hour = new Date(call.timestamp).getHours();
      hours[hour]++;
    });
    return hours;
  }, [calls]);

  const maxCalls = Math.max(...hourlyData);

  return (
    <View style={styles.patternChart}>
      <Text style={[styles.chartTitle, { color: colors.text }]}>
        Call Activity by Hour
      </Text>
      
      <Svg width={screenWidth - 80} height={120}>
        <Defs>
          <SvgGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.2" />
          </SvgGradient>
        </Defs>
        
        {hourlyData.map((count, hour) => {
          const barHeight = maxCalls > 0 ? (count / maxCalls) * 80 : 0;
          const x = (hour / 24) * (screenWidth - 80);
          
          return (
            <Rect
              key={hour}
              x={x}
              y={100 - barHeight}
              width={(screenWidth - 80) / 24 - 2}
              height={barHeight}
              fill="url(#chartGradient)"
              rx={2}
            />
          );
        })}
      </Svg>
    </View>
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
  
  insightsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: MeshSpacing.md,
    borderTopWidth: 1,
    borderTopColor: getDynamicColor(MeshColors.neutrals.lightGrey, 0.3),
  },
  
  insightItem: {
    alignItems: 'center',
  },
  
  insightValue: {
    fontSize: MeshTypography.sizes.h3,
    fontWeight: MeshTypography.weights.bold,
  },
  
  insightLabel: {
    fontSize: MeshTypography.sizes.caption,
    marginTop: 2,
  },
  
  filterTabs: {
    paddingHorizontal: MeshSpacing.md,
    marginBottom: MeshSpacing.sm,
  },
  
  filterTabsContent: {
    paddingRight: MeshSpacing.md,
  },
  
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MeshSpacing.md,
    paddingVertical: MeshSpacing.sm,
    borderRadius: MeshBorderRadius.lg,
    marginRight: MeshSpacing.sm,
    backgroundColor: getDynamicColor(MeshColors.neutrals.lightGrey, 0.3),
  },
  
  filterTabText: {
    fontSize: MeshTypography.sizes.bodySmall,
    fontWeight: MeshTypography.weights.medium,
    marginRight: MeshSpacing.xs,
  },
  
  filterTabCount: {
    fontSize: MeshTypography.sizes.caption,
    fontWeight: MeshTypography.weights.medium,
  },
  
  callsList: {
    paddingHorizontal: MeshSpacing.md,
    paddingBottom: MeshSpacing.lg,
  },
  
  callItemContainer: {
    marginBottom: MeshSpacing.sm,
  },
  
  callItem: {
    position: 'relative',
  },
  
  callCard: {
    position: 'relative',
    overflow: 'visible',
  },
  
  missedCallCard: {
    borderWidth: 1,
    borderColor: getDynamicColor(MeshColors.accents.mutedRed, 0.3),
  },
  
  selectionIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  
  missedPulse: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: MeshBorderRadius.components.card + 4,
  },
  
  callContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: MeshSpacing.xs,
  },
  
  contactSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: MeshSpacing.md,
  },
  
  contactAvatarText: {
    fontSize: MeshTypography.sizes.h4,
    fontWeight: MeshTypography.weights.semiBold,
  },
  
  contactInfo: {
    flex: 1,
  },
  
  contactName: {
    fontSize: MeshTypography.sizes.body,
    fontWeight: MeshTypography.weights.medium,
    marginBottom: 2,
  },
  
  callMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  callTime: {
    fontSize: MeshTypography.sizes.caption,
    marginLeft: MeshSpacing.sm,
  },
  
  callDetails: {
    alignItems: 'flex-end',
    marginRight: MeshSpacing.sm,
  },
  
  callStatus: {
    fontSize: MeshTypography.sizes.bodySmall,
    fontWeight: MeshTypography.weights.medium,
    marginBottom: MeshSpacing.xs,
  },
  
  durationVisualization: {
    marginTop: MeshSpacing.xs,
  },
  
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  quickActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: MeshSpacing.xs,
    ...MeshShadows.floating.light,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: MeshSpacing.xxl,
  },
  
  emptyLoader: {
    marginBottom: MeshSpacing.lg,
  },
  
  emptyTitle: {
    fontSize: MeshTypography.sizes.h3,
    fontWeight: MeshTypography.weights.semiBold,
    marginBottom: MeshSpacing.sm,
  },
  
  emptyDescription: {
    fontSize: MeshTypography.sizes.body,
    textAlign: 'center',
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
  
  insightsCard: {
    marginVertical: MeshSpacing.md,
  },
  
  sectionTitle: {
    fontSize: MeshTypography.sizes.h4,
    fontWeight: MeshTypography.weights.semiBold,
    marginBottom: MeshSpacing.md,
  },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  insightStat: {
    width: '48%',
    alignItems: 'center',
    marginBottom: MeshSpacing.md,
  },
  
  insightStatValue: {
    fontSize: MeshTypography.sizes.h2,
    fontWeight: MeshTypography.weights.bold,
  },
  
  insightStatLabel: {
    fontSize: MeshTypography.sizes.caption,
    marginTop: 4,
  },
  
  patternChart: {
    alignItems: 'center',
  },
  
  chartTitle: {
    fontSize: MeshTypography.sizes.bodySmall,
    fontWeight: MeshTypography.weights.medium,
    marginBottom: MeshSpacing.md,
  },
  
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: MeshSpacing.md,
    paddingHorizontal: MeshSpacing.md,
    borderRadius: MeshBorderRadius.sm,
    marginVertical: MeshSpacing.xs,
  },
  
  filterOptionText: {
    flex: 1,
    fontSize: MeshTypography.sizes.body,
    marginLeft: MeshSpacing.md,
  },
});

export default CallHistory;