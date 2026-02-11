/**
 * MeshGenerator - Procedural Mesh Pattern Generation Utility
 * Unique patterns for each user, performance optimized with caching
 * Accessibility support with reduced motion options
 */

import { Dimensions } from 'react-native';
import {
  MeshColors,
  MeshAnimations,
  getDynamicColor,
  interpolateColor,
} from '../constants/ndeipBrandSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Pattern cache for performance optimization
class MeshPatternCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.accessOrder = [];
  }

  get(key) {
    if (this.cache.has(key)) {
      // Move to end of access order (most recently used)
      this.accessOrder = this.accessOrder.filter(k => k !== key);
      this.accessOrder.push(key);
      return this.cache.get(key);
    }
    return null;
  }

  set(key, value) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.accessOrder.shift();
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, value);
    
    // Update access order
    if (!this.accessOrder.includes(key)) {
      this.accessOrder.push(key);
    }
  }

  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0,
    };
  }
}

// Global pattern cache instance
const patternCache = new MeshPatternCache();

// Mesh generation utilities
export class MeshGenerator {
  constructor() {
    this.cache = patternCache;
    this.seedGenerator = new SeededRandom();
  }

  /**
   * Generate unique mesh pattern for a user
   * @param {string} userId - User identifier for consistent patterns
   * @param {Object} options - Generation options
   * @returns {Object} Generated mesh configuration
   */
  generateUserMesh(userId, options = {}) {
    const defaultOptions = {
      density: 0.5,
      complexity: 5,
      primaryNodes: 8,
      animationSpeed: 3000,
      opacity: 0.1,
      colorScheme: 'light',
      seasonal: null,
      accessibility: {
        reducedMotion: false,
        highContrast: false,
      },
    };

    const config = { ...defaultOptions, ...options };
    const cacheKey = `user_${userId}_${JSON.stringify(config)}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Generate new pattern
    const pattern = this._generatePattern(userId, config);
    
    // Cache the result
    this.cache.set(cacheKey, pattern);
    
    return pattern;
  }

  /**
   * Generate mesh pattern for specific context
   * @param {string} context - Context type (chat, call, status, etc.)
   * @param {Object} options - Generation options
   * @returns {Object} Generated mesh configuration
   */
  generateContextMesh(context, options = {}) {
    const contextConfigs = {
      chat: {
        density: 0.2,
        complexity: 3,
        primaryNodes: 6,
        opacity: 0.05,
        animationSpeed: 4000,
      },
      call: {
        density: 0.8,
        complexity: 8,
        primaryNodes: 12,
        opacity: 0.15,
        animationSpeed: 2000,
      },
      status: {
        density: 0.4,
        complexity: 5,
        primaryNodes: 8,
        opacity: 0.1,
        animationSpeed: 3000,
      },
      splash: {
        density: 1.0,
        complexity: 10,
        primaryNodes: 16,
        opacity: 0.2,
        animationSpeed: 1500,
      },
      settings: {
        density: 0.1,
        complexity: 2,
        primaryNodes: 4,
        opacity: 0.03,
        animationSpeed: 5000,
      },
    };

    const contextConfig = contextConfigs[context] || contextConfigs.chat;
    const config = { ...contextConfig, ...options };
    const cacheKey = `context_${context}_${JSON.stringify(config)}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Generate new pattern
    const pattern = this._generatePattern(`context_${context}`, config);
    
    // Cache the result
    this.cache.set(cacheKey, pattern);
    
    return pattern;
  }

  /**
   * Generate animated mesh sequence
   * @param {string} identifier - Unique identifier
   * @param {Array} keyframes - Animation keyframes
   * @param {Object} options - Generation options
   * @returns {Array} Mesh animation sequence
   */
  generateAnimatedMesh(identifier, keyframes, options = {}) {
    const cacheKey = `animated_${identifier}_${JSON.stringify(keyframes)}_${JSON.stringify(options)}`;
    
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const sequence = keyframes.map((keyframe, index) => {
      const frameConfig = { ...options, ...keyframe };
      return this._generatePattern(`${identifier}_frame_${index}`, frameConfig);
    });

    this.cache.set(cacheKey, sequence);
    return sequence;
  }

  /**
   * Generate SVG path string for mesh pattern
   * @param {Object} config - Mesh configuration
   * @returns {string} SVG path string
   */
  generateSVGPattern(config) {
    const { nodes, connections } = config;
    let pathString = '';

    // Generate paths for connections
    connections.forEach(connection => {
      const { from, to, controlPoint } = connection;
      
      if (controlPoint) {
        // Curved path with control point
        pathString += `M ${from.x} ${from.y} Q ${controlPoint.x} ${controlPoint.y} ${to.x} ${to.y} `;
      } else {
        // Straight line
        pathString += `M ${from.x} ${from.y} L ${to.x} ${to.y} `;
      }
    });

    return pathString;
  }

  /**
   * Generate mesh for specific device dimensions
   * @param {Object} dimensions - Screen dimensions
   * @param {Object} options - Generation options
   * @returns {Object} Device-optimized mesh
   */
  generateResponsiveMesh(dimensions, options = {}) {
    const { width, height } = dimensions;
    const aspectRatio = width / height;
    
    // Adjust mesh density based on screen size
    let adjustedDensity = options.density || 0.5;
    
    if (width < 400) {
      // Small screens - reduce density
      adjustedDensity *= 0.7;
    } else if (width > 800) {
      // Large screens - increase density
      adjustedDensity *= 1.3;
    }

    // Adjust node count based on aspect ratio
    let adjustedNodes = options.primaryNodes || 8;
    adjustedNodes = Math.round(adjustedNodes * Math.sqrt(aspectRatio));

    const config = {
      ...options,
      density: adjustedDensity,
      primaryNodes: adjustedNodes,
      screenWidth: width,
      screenHeight: height,
    };

    return this._generatePattern(`responsive_${width}x${height}`, config);
  }

  /**
   * Internal pattern generation logic
   * @private
   */
  _generatePattern(seed, config) {
    this.seedGenerator.setSeed(seed);
    
    const {
      density,
      complexity,
      primaryNodes,
      opacity,
      animationSpeed,
      colorScheme,
      seasonal,
      accessibility,
      screenWidth = screenWidth,
      screenHeight = screenHeight,
    } = config;

    // Generate nodes
    const nodes = this._generateNodes(primaryNodes, density, screenWidth, screenHeight);
    
    // Generate connections
    const connections = this._generateConnections(nodes, complexity);
    
    // Generate colors
    const colors = this._generateColors(colorScheme, seasonal);
    
    // Apply accessibility modifications
    const accessibleConfig = this._applyAccessibility(
      { nodes, connections, colors, opacity, animationSpeed },
      accessibility
    );

    return {
      ...accessibleConfig,
      id: this._generateId(seed),
      metadata: {
        seed,
        generated: Date.now(),
        version: '1.0',
        config,
      },
    };
  }

  /**
   * Generate mesh nodes
   * @private
   */
  _generateNodes(nodeCount, density, width, height) {
    const nodes = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.4 * density;

    // Generate primary nodes in various patterns
    const patterns = ['circle', 'spiral', 'grid', 'organic'];
    const pattern = patterns[Math.floor(this.seedGenerator.next() * patterns.length)];

    switch (pattern) {
      case 'circle':
        nodes.push(...this._generateCircularNodes(nodeCount, centerX, centerY, maxRadius));
        break;
      case 'spiral':
        nodes.push(...this._generateSpiralNodes(nodeCount, centerX, centerY, maxRadius));
        break;
      case 'grid':
        nodes.push(...this._generateGridNodes(nodeCount, width, height, density));
        break;
      case 'organic':
        nodes.push(...this._generateOrganicNodes(nodeCount, centerX, centerY, maxRadius));
        break;
      default:
        nodes.push(...this._generateCircularNodes(nodeCount, centerX, centerY, maxRadius));
    }

    // Add secondary nodes for complexity
    const secondaryCount = Math.floor(nodeCount * 0.3);
    for (let i = 0; i < secondaryCount; i++) {
      nodes.push({
        id: `secondary_${i}`,
        x: this.seedGenerator.next() * width,
        y: this.seedGenerator.next() * height,
        type: 'secondary',
        size: 1 + this.seedGenerator.next() * 2,
        animationPhase: this.seedGenerator.next() * Math.PI * 2,
      });
    }

    return nodes;
  }

  /**
   * Generate circular node pattern
   * @private
   */
  _generateCircularNodes(count, centerX, centerY, radius) {
    const nodes = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI;
      const r = radius * (0.5 + this.seedGenerator.next() * 0.5);
      
      nodes.push({
        id: `primary_${i}`,
        x: centerX + Math.cos(angle) * r,
        y: centerY + Math.sin(angle) * r,
        type: 'primary',
        size: 2 + this.seedGenerator.next() * 3,
        animationPhase: (i / count) * Math.PI * 2,
      });
    }
    
    return nodes;
  }

  /**
   * Generate spiral node pattern
   * @private
   */
  _generateSpiralNodes(count, centerX, centerY, maxRadius) {
    const nodes = [];
    const spiralTurns = 2;
    
    for (let i = 0; i < count; i++) {
      const progress = i / count;
      const angle = progress * spiralTurns * 2 * Math.PI;
      const radius = maxRadius * progress;
      
      nodes.push({
        id: `primary_${i}`,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        type: 'primary',
        size: 2 + this.seedGenerator.next() * 3,
        animationPhase: angle,
      });
    }
    
    return nodes;
  }

  /**
   * Generate grid node pattern
   * @private
   */
  _generateGridNodes(count, width, height, density) {
    const nodes = [];
    const gridSize = Math.ceil(Math.sqrt(count));
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize && nodes.length < count; j++) {
        const baseX = (i + 0.5) * cellWidth;
        const baseY = (j + 0.5) * cellHeight;
        
        // Add some randomness to grid positions
        const offsetX = (this.seedGenerator.next() - 0.5) * cellWidth * 0.3;
        const offsetY = (this.seedGenerator.next() - 0.5) * cellHeight * 0.3;
        
        nodes.push({
          id: `primary_${nodes.length}`,
          x: baseX + offsetX,
          y: baseY + offsetY,
          type: 'primary',
          size: 2 + this.seedGenerator.next() * 3,
          animationPhase: this.seedGenerator.next() * Math.PI * 2,
        });
      }
    }
    
    return nodes;
  }

  /**
   * Generate organic node pattern
   * @private
   */
  _generateOrganicNodes(count, centerX, centerY, maxRadius) {
    const nodes = [];
    
    // Create clusters
    const clusterCount = Math.max(2, Math.floor(count / 4));
    const clusters = [];
    
    for (let i = 0; i < clusterCount; i++) {
      const angle = (i / clusterCount) * 2 * Math.PI;
      const distance = maxRadius * (0.3 + this.seedGenerator.next() * 0.4);
      
      clusters.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        radius: maxRadius * (0.2 + this.seedGenerator.next() * 0.3),
      });
    }
    
    // Distribute nodes among clusters
    for (let i = 0; i < count; i++) {
      const cluster = clusters[i % clusters.length];
      const angle = this.seedGenerator.next() * 2 * Math.PI;
      const distance = this.seedGenerator.next() * cluster.radius;
      
      nodes.push({
        id: `primary_${i}`,
        x: cluster.x + Math.cos(angle) * distance,
        y: cluster.y + Math.sin(angle) * distance,
        type: 'primary',
        size: 2 + this.seedGenerator.next() * 3,
        animationPhase: this.seedGenerator.next() * Math.PI * 2,
        cluster: i % clusters.length,
      });
    }
    
    return nodes;
  }

  /**
   * Generate connections between nodes
   * @private
   */
  _generateConnections(nodes, complexity) {
    const connections = [];
    const maxDistance = Math.min(screenWidth, screenHeight) * 0.3;
    
    nodes.forEach((node, index) => {
      const connectionCount = Math.min(complexity, nodes.length - 1);
      const nearestNodes = this._findNearestNodes(node, nodes, connectionCount, maxDistance);
      
      nearestNodes.forEach(targetNode => {
        if (targetNode.id !== node.id) {
          const connection = this._createConnection(node, targetNode);
          connections.push(connection);
        }
      });
    });
    
    // Remove duplicate connections
    return this._removeDuplicateConnections(connections);
  }

  /**
   * Find nearest nodes to a given node
   * @private
   */
  _findNearestNodes(node, allNodes, count, maxDistance) {
    const distances = allNodes
      .filter(n => n.id !== node.id)
      .map(n => ({
        node: n,
        distance: Math.sqrt(Math.pow(n.x - node.x, 2) + Math.pow(n.y - node.y, 2)),
      }))
      .filter(d => d.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count);
    
    return distances.map(d => d.node);
  }

  /**
   * Create connection between two nodes
   * @private
   */
  _createConnection(from, to) {
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    
    // Add some curve to the connection
    const curvature = 20 + this.seedGenerator.next() * 30;
    const angle = Math.atan2(to.y - from.y, to.x - from.x) + Math.PI / 2;
    
    const controlPoint = {
      x: midX + Math.cos(angle) * curvature,
      y: midY + Math.sin(angle) * curvature,
    };
    
    return {
      id: `${from.id}_${to.id}`,
      from,
      to,
      controlPoint,
      opacity: 0.3 + this.seedGenerator.next() * 0.4,
      strokeWidth: 0.5 + this.seedGenerator.next() * 1.5,
    };
  }

  /**
   * Remove duplicate connections
   * @private
   */
  _removeDuplicateConnections(connections) {
    const unique = new Map();
    
    connections.forEach(conn => {
      const key1 = `${conn.from.id}_${conn.to.id}`;
      const key2 = `${conn.to.id}_${conn.from.id}`;
      
      if (!unique.has(key1) && !unique.has(key2)) {
        unique.set(key1, conn);
      }
    });
    
    return Array.from(unique.values());
  }

  /**
   * Generate colors based on scheme
   * @private
   */
  _generateColors(colorScheme, seasonal) {
    let baseColors = {
      primary: MeshColors.primaryTeal,
      secondary: MeshColors.electricBlue,
      accent: MeshColors.accents.success,
    };

    if (seasonal && SEASONAL_COLORS[seasonal]) {
      baseColors = { ...baseColors, ...SEASONAL_COLORS[seasonal] };
    }

    // Generate variations
    return {
      ...baseColors,
      variations: this._generateColorVariations(baseColors.primary, 5),
      gradients: this._generateGradients(baseColors),
    };
  }

  /**
   * Generate color variations
   * @private
   */
  _generateColorVariations(baseColor, count) {
    const variations = [];
    
    for (let i = 0; i < count; i++) {
      const lightness = 0.3 + (i / count) * 0.4;
      variations.push(getDynamicColor(baseColor, lightness));
    }
    
    return variations;
  }

  /**
   * Generate gradient definitions
   * @private
   */
  _generateGradients(colors) {
    return {
      primary: [colors.primary, getDynamicColor(colors.primary, 0.7)],
      secondary: [colors.secondary, getDynamicColor(colors.secondary, 0.7)],
      accent: [colors.accent, getDynamicColor(colors.accent, 0.7)],
      mixed: [colors.primary, colors.secondary, colors.accent],
    };
  }

  /**
   * Apply accessibility modifications
   * @private
   */
  _applyAccessibility(pattern, accessibility) {
    const { reducedMotion, highContrast } = accessibility;
    
    if (reducedMotion) {
      pattern.animationSpeed *= 3; // Slower animations
      pattern.opacity *= 0.5; // Reduced opacity
    }
    
    if (highContrast) {
      pattern.opacity *= 1.5; // Increased opacity
      pattern.connections.forEach(conn => {
        conn.strokeWidth *= 1.5; // Thicker lines
        conn.opacity *= 1.3; // More visible
      });
    }
    
    return pattern;
  }

  /**
   * Generate unique pattern ID
   * @private
   */
  _generateId(seed) {
    return `mesh_${seed}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}

// Seeded random number generator for consistent patterns
class SeededRandom {
  constructor(seed = Date.now()) {
    this.seed = seed;
  }

  setSeed(seed) {
    if (typeof seed === 'string') {
      this.seed = seed.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    } else {
      this.seed = seed;
    }
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

// Seasonal color configurations
const SEASONAL_COLORS = {
  spring: {
    primary: '#00E5A5',
    secondary: '#0A71EF',
    accent: '#00F5FF',
  },
  summer: {
    primary: '#00F5FF',
    secondary: '#FFB800',
    accent: '#FF6B9D',
  },
  autumn: {
    primary: '#FF6B35',
    secondary: '#003B3B',
    accent: '#FF8E53',
  },
  winter: {
    primary: '#B8E6E6',
    secondary: '#003B3B',
    accent: '#7ED3F7',
  },
};

// Export singleton instance
export const meshGenerator = new MeshGenerator();

// Utility functions
export const generateUserMesh = (userId, options) => {
  return meshGenerator.generateUserMesh(userId, options);
};

export const generateContextMesh = (context, options) => {
  return meshGenerator.generateContextMesh(context, options);
};

export const generateResponsiveMesh = (dimensions, options) => {
  return meshGenerator.generateResponsiveMesh(dimensions, options);
};

export const clearMeshCache = () => {
  meshGenerator.clearCache();
};

export const getMeshCacheStats = () => {
  return meshGenerator.getCacheStats();
};

// Performance monitoring
export const withMeshPerformanceMonitoring = (fn, label) => {
  return (...args) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    if (__DEV__) {
      console.log(`[MeshGenerator] ${label}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  };
};

export default MeshGenerator;