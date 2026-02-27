/**
 * AnimatedSvg — Shared animated SVG components
 *
 * react-native-svg does NOT export AnimatedCircle, AnimatedPath, AnimatedRect, etc.
 * They must be created via Animated.createAnimatedComponent().
 * This module provides them as a single import source.
 */
import { Animated } from 'react-native';
import { Circle, Path, Rect, G } from 'react-native-svg';

export const AnimatedCircle = Animated.createAnimatedComponent(Circle);
export const AnimatedPath = Animated.createAnimatedComponent(Path);
export const AnimatedRect = Animated.createAnimatedComponent(Rect);
export const AnimatedG = Animated.createAnimatedComponent(G);
