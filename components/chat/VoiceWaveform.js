/**
 * VoiceWaveform - Stunning Voice Note Visualization Component
 * Real-time waveform during recording, mesh integration, playback animation
 * Voice to text preview with AI transcription overlay (future-ready)
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Animated,
  Dimensions,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// Audio functionality temporarily disabled - expo-av removed
import Svg, {
  Rect,
  Path,
  G,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from 'react-native-svg';
import { AnimatedRect, AnimatedPath } from '../../utils/AnimatedSvg';

import { useMeshTheme, useMeshColors, useMeshAnimations } from '../../hooks/useMeshTheme';
import QuantumLoader from '../ndeip/QuantumLoader';
import {
  MeshColors,
  MeshTypography,
  MeshSpacing,
  MeshBorderRadius,
  MeshAnimations,
  getDynamicColor,
} from '../../constants/ndeipBrandSystem';

const { width: screenWidth } = Dimensions.get('window');

const VoiceWaveform = ({
  audioUri = null,
  isRecording = false,
  isPlaying = false,
  currentPosition = 0,
  duration = 0,
  waveformData = [],
  onPlay,
  onPause,
  onSeek,
  onTranscribe,
  showTranscription = false,
  transcriptionText = '',
  isTranscribing = false,
  realTimeAmplitude = 0,
  style = {},
  variant = 'standard', // 'standard', 'compact', 'expanded', 'recorder'
}) => {
  const { colors } = useMeshColors();
  const { timing } = useMeshAnimations();

  // Animation refs
  const waveformAnimation = useRef(new Animated.Value(0)).current;
  const playButtonScale = useRef(new Animated.Value(1)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const recordingPulse = useRef(new Animated.Value(0)).current;
  const transcriptionOpacity = useRef(new Animated.Value(0)).current;

  // State
  const [localIsPlaying, setLocalIsPlaying] = useState(isPlaying);
  const [visualWaveform, setVisualWaveform] = useState([]);
  const [recordingWaveform, setRecordingWaveform] = useState([]);
  const [showFullTranscription, setShowFullTranscription] = useState(false);

  // Configuration based on variant
  const config = getVariantConfig(variant);
  const waveformBars = config.waveformBars;
  const barWidth = (config.width - config.spacing * (waveformBars - 1)) / waveformBars;

  // Initialize waveform data
  useEffect(() => {
    if (waveformData && waveformData.length > 0) {
      setVisualWaveform(normalizeWaveformData(waveformData, waveformBars));
    } else {
      // Generate placeholder waveform
      setVisualWaveform(generatePlaceholderWaveform(waveformBars));
    }
  }, [waveformData, waveformBars]);

  // Handle recording amplitude updates
  useEffect(() => {
    if (isRecording && realTimeAmplitude > 0) {
      setRecordingWaveform(prev => {
        const newWaveform = [...prev, realTimeAmplitude];
        // Keep only the last N bars
        return newWaveform.slice(-waveformBars);
      });
    }
  }, [isRecording, realTimeAmplitude, waveformBars]);

  // Recording pulse animation
  useEffect(() => {
    if (isRecording) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(recordingPulse, {
            toValue: 1,
            duration: timing.normal,
            useNativeDriver: true,
          }),
          Animated.timing(recordingPulse, {
            toValue: 0,
            duration: timing.normal,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    }
  }, [isRecording]);

  // Waveform animation
  useEffect(() => {
    if (localIsPlaying) {
      Animated.loop(
        Animated.timing(waveformAnimation, {
          toValue: 1,
          duration: timing.mesh,
          useNativeDriver: true,
        })
      ).start();
    } else {
      waveformAnimation.stopAnimation();
      waveformAnimation.setValue(0);
    }
  }, [localIsPlaying]);

  // Progress animation
  useEffect(() => {
    if (duration > 0) {
      const progress = currentPosition / duration;
      Animated.timing(progressAnimation, {
        toValue: progress,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  }, [currentPosition, duration]);

  // Transcription animation
  useEffect(() => {
    if (showTranscription && transcriptionText) {
      Animated.timing(transcriptionOpacity, {
        toValue: 1,
        duration: timing.normal,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(transcriptionOpacity, {
        toValue: 0,
        duration: timing.fast,
        useNativeDriver: true,
      }).start();
    }
  }, [showTranscription, transcriptionText]);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    Animated.sequence([
      Animated.timing(playButtonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(playButtonScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    if (localIsPlaying) {
      setLocalIsPlaying(false);
      if (onPause) onPause();
    } else {
      setLocalIsPlaying(true);
      if (onPlay) onPlay();
    }
  }, [localIsPlaying, onPlay, onPause]);

  // Handle waveform tap for seeking
  const handleWaveformTap = (event) => {
    if (!duration || isRecording) return;

    const { locationX } = event.nativeEvent;
    const progress = locationX / config.width;
    const seekPosition = progress * duration;

    if (onSeek) {
      onSeek(seekPosition);
    }
  };

  // Handle transcription toggle
  const handleTranscriptionToggle = () => {
    if (isTranscribing) return;

    if (showTranscription) {
      setShowFullTranscription(!showFullTranscription);
    } else if (onTranscribe) {
      onTranscribe();
    }
  };

  // Render recording waveform
  const renderRecordingWaveform = () => {
    const currentWaveform = recordingWaveform.length > 0 ? recordingWaveform : [0.1];
    const pulseScale = recordingPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.1],
    });

    return (
      <Animated.View style={[styles.waveformContainer, { transform: [{ scaleY: pulseScale }] }]}>
        <Svg width={config.width} height={config.height}>
          <Defs>
            <SvgGradient id="recordingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={colors.accents.mutedRed} stopOpacity="0.8" />
              <Stop offset="50%" stopColor={colors.accents.mutedRed} stopOpacity="1" />
              <Stop offset="100%" stopColor={colors.accents.mutedRed} stopOpacity="0.8" />
            </SvgGradient>
          </Defs>

          {currentWaveform.map((amplitude, index) => {
            const height = Math.max(2, amplitude * config.height * 0.8);
            const x = index * (barWidth + config.spacing);
            const y = (config.height - height) / 2;

            return (
              <AnimatedRect
                key={index}
                x={x}
                y={y}
                width={barWidth}
                height={height}
                fill="url(#recordingGradient)"
                rx={barWidth / 2}
                opacity={recordingPulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.6, 1],
                })}
              />
            );
          })}
        </Svg>
      </Animated.View>
    );
  };

  // Render playback waveform
  const renderPlaybackWaveform = () => {
    const progress = progressAnimation._value || 0;

    return (
      <TouchableOpacity
        style={styles.waveformContainer}
        onPress={handleWaveformTap}
        activeOpacity={0.8}
      >
        <Svg width={config.width} height={config.height}>
          <Defs>
            <SvgGradient id="playbackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.6" />
              <Stop offset="50%" stopColor={colors.primary} stopOpacity="1" />
              <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.6" />
            </SvgGradient>

            <SvgGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={colors.secondary} stopOpacity="0.8" />
              <Stop offset="50%" stopColor={colors.secondary} stopOpacity="1" />
              <Stop offset="100%" stopColor={colors.secondary} stopOpacity="0.8" />
            </SvgGradient>
          </Defs>

          {visualWaveform.map((amplitude, index) => {
            const height = Math.max(2, amplitude * config.height * 0.8);
            const x = index * (barWidth + config.spacing);
            const y = (config.height - height) / 2;
            const isPlayed = (index / visualWaveform.length) <= progress;

            return (
              <G key={index}>
                <AnimatedRect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={height}
                  fill={isPlayed ? "url(#progressGradient)" : "url(#playbackGradient)"}
                  rx={barWidth / 2}
                  opacity={isPlayed ? 1 : 0.4}
                />

                {/* Mesh effect for active bars */}
                {localIsPlaying && isPlayed && (
                  <AnimatedPath
                    d={`M ${x} ${y} Q ${x + barWidth / 2} ${y - 5} ${x + barWidth} ${y} L ${x + barWidth} ${y + height} Q ${x + barWidth / 2} ${y + height + 5} ${x} ${y + height} Z`}
                    fill="none"
                    stroke={getDynamicColor(colors.secondary, 0.3)}
                    strokeWidth="0.5"
                    opacity={waveformAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.8],
                    })}
                  />
                )}
              </G>
            );
          })}

          {/* Progress indicator */}
          <AnimatedRect
            x={progress * config.width - 1}
            y={0}
            width={2}
            height={config.height}
            fill={colors.secondary}
            opacity={0.8}
          />
        </Svg>
      </TouchableOpacity>
    );
  };

  // Render controls
  const renderControls = () => {
    if (variant === 'recorder') {
      return (
        <View style={styles.recorderControls}>
          <View style={[styles.recordingIndicator, { backgroundColor: colors.accents.mutedRed }]}>
            <Animated.View
              style={[
                styles.recordingDot,
                {
                  backgroundColor: colors.crystallineWhite,
                  opacity: recordingPulse,
                },
              ]}
            />
          </View>
          <Text style={[styles.recordingText, { color: colors.text }]}>
            Recording...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.controls}>
        <Animated.View style={[styles.playButton, { transform: [{ scale: playButtonScale }] }]}>
          <TouchableOpacity
            onPress={handlePlayPause}
            style={[styles.playButtonInner, { backgroundColor: colors.primary }]}
          >
            <Ionicons
              name={localIsPlaying ? 'pause' : 'play'}
              size={variant === 'compact' ? 16 : 20}
              color={colors.background}
            />
          </TouchableOpacity>
        </Animated.View>

        {variant === 'expanded' && (
          <>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="play-back" size={18} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="play-forward" size={18} color={colors.text} />
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  // Render duration
  const renderDuration = () => {
    if (variant === 'recorder') return null;

    return (
      <View style={styles.durationContainer}>
        <Text style={[styles.durationText, { color: colors.textSecondary }]}>
          {formatDuration(currentPosition)} / {formatDuration(duration)}
        </Text>
      </View>
    );
  };

  // Render transcription
  const renderTranscription = () => {
    if (!showTranscription && !isTranscribing) return null;

    return (
      <Animated.View
        style={[
          styles.transcriptionContainer,
          { opacity: transcriptionOpacity },
        ]}
      >
        <TouchableOpacity
          style={styles.transcriptionHeader}
          onPress={handleTranscriptionToggle}
        >
          <MaterialIcons name="transcribe" size={16} color={colors.primary} />
          <Text style={[styles.transcriptionLabel, { color: colors.primary }]}>
            {isTranscribing ? 'Transcribing...' : 'Transcription'}
          </Text>
          {!isTranscribing && (
            <Ionicons
              name={showFullTranscription ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.primary}
            />
          )}
        </TouchableOpacity>

        {isTranscribing && (
          <View style={styles.transcribingIndicator}>
            <QuantumLoader type="dots" size="small" color={colors.primary} />
          </View>
        )}

        {transcriptionText && (
          <Text
            style={[
              styles.transcriptionText,
              { color: colors.text },
              !showFullTranscription && styles.transcriptionTextCollapsed,
            ]}
            numberOfLines={showFullTranscription ? 0 : 2}
          >
            {transcriptionText}
          </Text>
        )}
      </Animated.View>
    );
  };

  const containerStyle = [
    styles.container,
    config.containerStyle,
    { backgroundColor: variant === 'recorder' ? 'transparent' : colors.surface },
    style,
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.waveformSection}>
        {renderControls()}

        <View style={styles.waveformWrapper}>
          {isRecording ? renderRecordingWaveform() : renderPlaybackWaveform()}
          {renderDuration()}
        </View>
      </View>

      {renderTranscription()}
    </View>
  );
};

// Variant configurations
const getVariantConfig = (variant) => {
  const configs = {
    standard: {
      width: screenWidth * 0.6,
      height: 40,
      waveformBars: 30,
      spacing: 2,
      containerStyle: {
        paddingHorizontal: MeshSpacing.md,
        paddingVertical: MeshSpacing.sm,
        borderRadius: MeshBorderRadius.components.card,
      },
    },
    compact: {
      width: screenWidth * 0.4,
      height: 24,
      waveformBars: 20,
      spacing: 1,
      containerStyle: {
        paddingHorizontal: MeshSpacing.sm,
        paddingVertical: MeshSpacing.xs,
        borderRadius: MeshBorderRadius.sm,
      },
    },
    expanded: {
      width: screenWidth * 0.8,
      height: 60,
      waveformBars: 50,
      spacing: 2,
      containerStyle: {
        paddingHorizontal: MeshSpacing.lg,
        paddingVertical: MeshSpacing.md,
        borderRadius: MeshBorderRadius.lg,
      },
    },
    recorder: {
      width: screenWidth * 0.7,
      height: 50,
      waveformBars: 40,
      spacing: 2,
      containerStyle: {
        paddingHorizontal: MeshSpacing.md,
        paddingVertical: MeshSpacing.md,
      },
    },
  };

  return configs[variant] || configs.standard;
};

// Utility functions
const normalizeWaveformData = (data, targetLength) => {
  if (!data || data.length === 0) {
    return generatePlaceholderWaveform(targetLength);
  }

  const step = data.length / targetLength;
  const normalized = [];

  for (let i = 0; i < targetLength; i++) {
    const index = Math.floor(i * step);
    const value = Math.abs(data[index] || 0);
    normalized.push(Math.min(1, Math.max(0.1, value)));
  }

  return normalized;
};

const generatePlaceholderWaveform = (length) => {
  const waveform = [];
  for (let i = 0; i < length; i++) {
    // Generate a realistic waveform pattern
    const base = Math.sin(i * 0.3) * 0.5 + 0.5;
    const noise = Math.random() * 0.3;
    waveform.push(Math.min(1, Math.max(0.1, base + noise)));
  }
  return waveform;
};

const formatDuration = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },

  waveformSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: MeshSpacing.sm,
  },

  playButton: {
    marginRight: MeshSpacing.xs,
  },

  playButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  controlButton: {
    padding: MeshSpacing.xs,
    marginHorizontal: MeshSpacing.xs,
  },

  recorderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: MeshSpacing.md,
  },

  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: MeshSpacing.xs,
  },

  recordingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  recordingText: {
    fontSize: MeshTypography.sizes.bodySmall,
    fontWeight: MeshTypography.weights.medium,
  },

  waveformWrapper: {
    flex: 1,
    alignItems: 'center',
  },

  waveformContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  durationContainer: {
    marginTop: MeshSpacing.xs,
  },

  durationText: {
    fontSize: MeshTypography.sizes.caption,
    textAlign: 'center',
  },

  transcriptionContainer: {
    marginTop: MeshSpacing.sm,
    paddingTop: MeshSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: getDynamicColor(MeshColors.neutrals.mediumGrey, 0.3),
  },

  transcriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: MeshSpacing.xs,
  },

  transcriptionLabel: {
    fontSize: MeshTypography.sizes.bodySmall,
    fontWeight: MeshTypography.weights.medium,
    marginLeft: MeshSpacing.xs,
    flex: 1,
  },

  transcribingIndicator: {
    alignItems: 'center',
    paddingVertical: MeshSpacing.sm,
  },

  transcriptionText: {
    fontSize: MeshTypography.sizes.bodySmall,
    lineHeight: MeshTypography.lineHeights.normal * MeshTypography.sizes.bodySmall,
  },

  transcriptionTextCollapsed: {
    opacity: 0.8,
  },
});

// Export specialized components
export const RecordingWaveform = (props) => (
  <VoiceWaveform {...props} variant="recorder" isRecording={true} />
);

export const CompactWaveform = (props) => (
  <VoiceWaveform {...props} variant="compact" />
);

export const ExpandedWaveform = (props) => (
  <VoiceWaveform {...props} variant="expanded" showTranscription={true} />
);

export default VoiceWaveform;
