/**
 * WebRTCQuantum - High-Quality WebRTC Service with Fallbacks
 * Quality adaptation with mesh indicators, real-time connection monitoring
 * AI noise cancellation with mesh sound waves, privacy-first recording
 */

import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, mediaDevices } from 'react-native-webrtc';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// Import encryption utilities
import { encryptData, decryptData } from '../utils/encryption';

// WebRTC configuration
const WEBRTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    // TURN servers would be added here for production
  ],
  iceCandidatePoolSize: 10,
};

// Call states
export const CALL_STATES = {
  IDLE: 'idle',
  INITIATING: 'initiating',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  DISCONNECTED: 'disconnected',
  ENDED: 'ended',
  FAILED: 'failed',
};

// Quality levels
export const QUALITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  HD: 'hd',
  AUTO: 'auto',
};

// Codec preferences
const CODEC_PREFERENCES = {
  video: ['VP9', 'VP8', 'H264'],
  audio: ['OPUS', 'G722', 'PCMU'],
};

class WebRTCQuantumService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.socket = null;
    this.callState = CALL_STATES.IDLE;
    this.qualityLevel = QUALITY_LEVELS.AUTO;
    this.isRecording = false;
    this.currentUser = null;
    this.remoteUser = null;
    
    // Event listeners
    this.eventListeners = new Map();
    
    // Quality monitoring
    this.qualityMonitor = {
      interval: null,
      stats: {
        packetsLost: 0,
        jitter: 0,
        rtt: 0,
        bitrate: 0,
        resolution: null,
        frameRate: 0,
      },
    };
    
    // Recording state
    this.recordingState = {
      isRecording: false,
      recordingStream: null,
      mediaRecorder: null,
      recordedChunks: [],
      startTime: null,
      duration: 0,
    };
    
    // Audio processing
    this.audioProcessing = {
      noiseSuppressionEnabled: false,
      echoCancellationEnabled: true,
      autoGainControlEnabled: true,
      audioContext: null,
      analyser: null,
    };
    
    this.initializeService();
  }

  // Initialize the WebRTC service
  async initializeService() {
    try {
      await this.setupSocketConnection();
      await this.initializeAudioProcessing();
      console.log('WebRTCQuantum service initialized');
    } catch (error) {
      console.error('Failed to initialize WebRTCQuantum service:', error);
      this.emit('error', { error: error.message });
    }
  }

  // Setup socket connection for signaling
  async setupSocketConnection() {
    const serverUrl = __DEV__ 
      ? 'http://localhost:3000' 
      : 'wss://api.ndeip.com';

    this.socket = io(serverUrl, {
      transports: ['websocket'],
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('WebRTC signaling connected');
    });

    this.socket.on('call-offer', this.handleCallOffer.bind(this));
    this.socket.on('call-answer', this.handleCallAnswer.bind(this));
    this.socket.on('ice-candidate', this.handleIceCandidate.bind(this));
    this.socket.on('call-end', this.handleCallEnd.bind(this));
    this.socket.on('call-rejected', this.handleCallRejected.bind(this));
  }

  // Initialize audio processing
  async initializeAudioProcessing() {
    try {
      // Set up audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to initialize audio processing:', error);
    }
  }

  // Start a call
  async startCall(remoteUserId, options = {}) {
    try {
      this.remoteUser = { id: remoteUserId };
      this.callState = CALL_STATES.INITIATING;
      this.emit('callStateChanged', { state: this.callState });

      const { video = true, audio = true } = options;

      // Get user media
      await this.getUserMedia({ video, audio });

      // Create peer connection
      await this.createPeerConnection();

      // Add local stream to peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.localStream);
        });
      }

      // Create and send offer
      const offer = await this.createOffer();
      await this.sendSignalingMessage('call-offer', {
        to: remoteUserId,
        offer: offer.sdp,
        type: offer.type,
        callOptions: options,
      });

      this.callState = CALL_STATES.CONNECTING;
      this.emit('callStateChanged', { state: this.callState });

    } catch (error) {
      console.error('Failed to start call:', error);
      this.handleCallFailure(error);
    }
  }

  // Answer incoming call
  async answerCall(offer, options = {}) {
    try {
      this.callState = CALL_STATES.CONNECTING;
      this.emit('callStateChanged', { state: this.callState });

      const { video = true, audio = true } = options;

      // Get user media
      await this.getUserMedia({ video, audio });

      // Create peer connection
      await this.createPeerConnection();

      // Add local stream to peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.localStream);
        });
      }

      // Set remote description
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription({ type: 'offer', sdp: offer })
      );

      // Create and send answer
      const answer = await this.createAnswer();
      await this.sendSignalingMessage('call-answer', {
        to: this.remoteUser.id,
        answer: answer.sdp,
        type: answer.type,
      });

    } catch (error) {
      console.error('Failed to answer call:', error);
      this.handleCallFailure(error);
    }
  }

  // Get user media with constraints
  async getUserMedia(constraints) {
    try {
      const mediaConstraints = {
        audio: constraints.audio ? {
          echoCancellation: this.audioProcessing.echoCancellationEnabled,
          noiseSuppression: this.audioProcessing.noiseSuppressionEnabled,
          autoGainControl: this.audioProcessing.autoGainControlEnabled,
          sampleRate: 48000,
          channelCount: 1,
        } : false,
        video: constraints.video ? this.getVideoConstraints() : false,
      };

      this.localStream = await mediaDevices.getUserMedia(mediaConstraints);
      this.emit('localStreamReceived', { stream: this.localStream });

      return this.localStream;
    } catch (error) {
      console.error('Failed to get user media:', error);
      throw error;
    }
  }

  // Get video constraints based on quality level
  getVideoConstraints() {
    const constraints = {
      facingMode: 'user',
      frameRate: { min: 15, ideal: 30, max: 60 },
    };

    switch (this.qualityLevel) {
      case QUALITY_LEVELS.LOW:
        constraints.width = { ideal: 320 };
        constraints.height = { ideal: 240 };
        constraints.frameRate = { ideal: 15, max: 24 };
        break;
      case QUALITY_LEVELS.MEDIUM:
        constraints.width = { ideal: 640 };
        constraints.height = { ideal: 480 };
        constraints.frameRate = { ideal: 24, max: 30 };
        break;
      case QUALITY_LEVELS.HIGH:
        constraints.width = { ideal: 1280 };
        constraints.height = { ideal: 720 };
        constraints.frameRate = { ideal: 30 };
        break;
      case QUALITY_LEVELS.HD:
        constraints.width = { ideal: 1920 };
        constraints.height = { ideal: 1080 };
        constraints.frameRate = { ideal: 30 };
        break;
      default: // AUTO
        constraints.width = { ideal: 1280 };
        constraints.height = { ideal: 720 };
        break;
    }

    return constraints;
  }

  // Create peer connection
  async createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(WEBRTC_CONFIG);

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState;
      console.log('Connection state changed:', state);
      
      switch (state) {
        case 'connected':
          this.callState = CALL_STATES.CONNECTED;
          this.startQualityMonitoring();
          break;
        case 'disconnected':
          this.callState = CALL_STATES.DISCONNECTED;
          this.handleReconnection();
          break;
        case 'failed':
          this.callState = CALL_STATES.FAILED;
          this.handleCallFailure(new Error('Connection failed'));
          break;
        case 'closed':
          this.callState = CALL_STATES.ENDED;
          this.cleanup();
          break;
      }
      
      this.emit('callStateChanged', { state: this.callState });
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage('ice-candidate', {
          to: this.remoteUser.id,
          candidate: event.candidate,
        });
      }
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      this.emit('remoteStreamReceived', { stream: this.remoteStream });
    };

    return this.peerConnection;
  }

  // Create offer
  async createOffer() {
    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  // Create answer
  async createAnswer() {
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  // Handle call offer
  async handleCallOffer(data) {
    try {
      this.remoteUser = { id: data.from };
      this.emit('incomingCall', {
        caller: data.from,
        offer: data.offer,
        callOptions: data.callOptions,
      });
    } catch (error) {
      console.error('Failed to handle call offer:', error);
    }
  }

  // Handle call answer
  async handleCallAnswer(data) {
    try {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription({ type: 'answer', sdp: data.answer })
      );
    } catch (error) {
      console.error('Failed to handle call answer:', error);
    }
  }

  // Handle ICE candidate
  async handleIceCandidate(data) {
    try {
      await this.peerConnection.addIceCandidate(
        new RTCIceCandidate(data.candidate)
      );
    } catch (error) {
      console.error('Failed to handle ICE candidate:', error);
    }
  }

  // Handle call end
  handleCallEnd() {
    this.endCall();
  }

  // Handle call rejection
  handleCallRejected() {
    this.emit('callRejected');
    this.cleanup();
  }

  // Send signaling message
  async sendSignalingMessage(type, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(type, data);
    }
  }

  // Start quality monitoring
  startQualityMonitoring() {
    this.qualityMonitor.interval = setInterval(async () => {
      await this.updateQualityMetrics();
    }, 2000);
  }

  // Update quality metrics
  async updateQualityMetrics() {
    try {
      if (!this.peerConnection) return;

      const stats = await this.peerConnection.getStats();
      const metrics = this.parseRTCStats(stats);
      
      this.qualityMonitor.stats = { ...this.qualityMonitor.stats, ...metrics };
      
      // Emit quality update
      this.emit('qualityUpdate', {
        stats: this.qualityMonitor.stats,
        level: this.calculateQualityLevel(metrics),
      });

      // Auto-adjust quality if needed
      if (this.qualityLevel === QUALITY_LEVELS.AUTO) {
        await this.autoAdjustQuality(metrics);
      }

    } catch (error) {
      console.error('Failed to update quality metrics:', error);
    }
  }

  // Parse RTC stats
  parseRTCStats(stats) {
    const metrics = {
      packetsLost: 0,
      jitter: 0,
      rtt: 0,
      bitrate: 0,
      resolution: null,
      frameRate: 0,
    };

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
        metrics.packetsLost = report.packetsLost || 0;
        metrics.jitter = report.jitter || 0;
        metrics.frameRate = report.framesPerSecond || 0;
        
        if (report.frameWidth && report.frameHeight) {
          metrics.resolution = `${report.frameWidth}x${report.frameHeight}`;
        }
      }
      
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        metrics.rtt = report.currentRoundTripTime * 1000 || 0;
      }
      
      if (report.type === 'outbound-rtp') {
        const bitrate = report.bytesSent * 8 / report.timestamp * 1000;
        metrics.bitrate = bitrate || 0;
      }
    });

    return metrics;
  }

  // Calculate quality level based on metrics
  calculateQualityLevel(metrics) {
    const { packetsLost, rtt, bitrate } = metrics;
    
    if (packetsLost > 5 || rtt > 300 || bitrate < 100000) {
      return 'poor';
    } else if (packetsLost > 2 || rtt > 150 || bitrate < 500000) {
      return 'fair';
    } else if (rtt < 50 && bitrate > 1000000) {
      return 'excellent';
    } else {
      return 'good';
    }
  }

  // Auto-adjust quality based on network conditions
  async autoAdjustQuality(metrics) {
    const { packetsLost, rtt, bitrate } = metrics;
    let newQuality = this.qualityLevel;

    if (packetsLost > 5 || rtt > 300) {
      // Poor conditions - reduce quality
      if (this.qualityLevel === QUALITY_LEVELS.HD) {
        newQuality = QUALITY_LEVELS.HIGH;
      } else if (this.qualityLevel === QUALITY_LEVELS.HIGH) {
        newQuality = QUALITY_LEVELS.MEDIUM;
      } else if (this.qualityLevel === QUALITY_LEVELS.MEDIUM) {
        newQuality = QUALITY_LEVELS.LOW;
      }
    } else if (packetsLost < 1 && rtt < 50 && bitrate > 1000000) {
      // Good conditions - increase quality
      if (this.qualityLevel === QUALITY_LEVELS.LOW) {
        newQuality = QUALITY_LEVELS.MEDIUM;
      } else if (this.qualityLevel === QUALITY_LEVELS.MEDIUM) {
        newQuality = QUALITY_LEVELS.HIGH;
      } else if (this.qualityLevel === QUALITY_LEVELS.HIGH) {
        newQuality = QUALITY_LEVELS.HD;
      }
    }

    if (newQuality !== this.qualityLevel) {
      await this.setQuality(newQuality);
    }
  }

  // Set video quality
  async setQuality(quality) {
    try {
      this.qualityLevel = quality;
      
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
          const constraints = this.getVideoConstraints();
          await videoTrack.applyConstraints(constraints);
        }
      }

      this.emit('qualityChanged', { quality });
    } catch (error) {
      console.error('Failed to set video quality:', error);
    }
  }

  // Toggle video
  async toggleVideo(enabled) {
    try {
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = enabled;
          this.emit('videoToggled', { enabled });
        }
      }
    } catch (error) {
      console.error('Failed to toggle video:', error);
    }
  }

  // Toggle audio
  async toggleAudio(enabled) {
    try {
      if (this.localStream) {
        const audioTrack = this.localStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = enabled;
          this.emit('audioToggled', { enabled });
        }
      }
    } catch (error) {
      console.error('Failed to toggle audio:', error);
    }
  }

  // Enable noise suppression
  async enableNoiseSuppression(enabled) {
    try {
      this.audioProcessing.noiseSuppressionEnabled = enabled;
      
      if (this.localStream) {
        const audioTrack = this.localStream.getAudioTracks()[0];
        if (audioTrack) {
          await audioTrack.applyConstraints({
            noiseSuppression: enabled,
            echoCancellation: this.audioProcessing.echoCancellationEnabled,
            autoGainControl: this.audioProcessing.autoGainControlEnabled,
          });
        }
      }

      this.emit('noiseSuppressionToggled', { enabled });
    } catch (error) {
      console.error('Failed to toggle noise suppression:', error);
    }
  }

  // Start call recording
  async startRecording(options = {}) {
    try {
      if (this.recordingState.isRecording) {
        throw new Error('Recording already in progress');
      }

      const { includeLocalVideo = true, includeRemoteVideo = true } = options;

      // Create recording stream
      const audioTracks = [];
      const videoTracks = [];

      if (this.localStream && includeLocalVideo) {
        this.localStream.getTracks().forEach(track => {
          if (track.kind === 'audio') audioTracks.push(track);
          if (track.kind === 'video') videoTracks.push(track);
        });
      }

      if (this.remoteStream && includeRemoteVideo) {
        this.remoteStream.getTracks().forEach(track => {
          if (track.kind === 'audio') audioTracks.push(track);
          if (track.kind === 'video') videoTracks.push(track);
        });
      }

      this.recordingState.recordingStream = new MediaStream([...audioTracks, ...videoTracks]);

      // Create media recorder
      this.recordingState.mediaRecorder = new MediaRecorder(
        this.recordingState.recordingStream,
        {
          mimeType: Platform.OS === 'ios' ? 'video/mp4' : 'video/webm',
        }
      );

      this.recordingState.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordingState.recordedChunks.push(event.data);
        }
      };

      this.recordingState.mediaRecorder.onstop = () => {
        this.handleRecordingComplete();
      };

      // Start recording
      this.recordingState.mediaRecorder.start(1000); // Record in 1-second chunks
      this.recordingState.isRecording = true;
      this.recordingState.startTime = Date.now();

      this.emit('recordingStarted');

    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  // Stop call recording
  async stopRecording() {
    try {
      if (!this.recordingState.isRecording) {
        throw new Error('No recording in progress');
      }

      this.recordingState.mediaRecorder.stop();
      this.recordingState.isRecording = false;
      this.recordingState.duration = Date.now() - this.recordingState.startTime;

    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }

  // Handle recording completion
  async handleRecordingComplete() {
    try {
      const blob = new Blob(this.recordingState.recordedChunks, {
        type: Platform.OS === 'ios' ? 'video/mp4' : 'video/webm',
      });

      // Encrypt recording for privacy
      const encryptedBlob = await encryptData(blob);

      this.emit('recordingComplete', {
        recording: encryptedBlob,
        duration: this.recordingState.duration,
        timestamp: this.recordingState.startTime,
      });

      // Clean up recording state
      this.recordingState.recordedChunks = [];
      this.recordingState.recordingStream = null;
      this.recordingState.mediaRecorder = null;

    } catch (error) {
      console.error('Failed to handle recording completion:', error);
    }
  }

  // Handle reconnection
  async handleReconnection() {
    try {
      this.callState = CALL_STATES.RECONNECTING;
      this.emit('callStateChanged', { state: this.callState });

      // Attempt to restart ICE
      if (this.peerConnection) {
        this.peerConnection.restartIce();
      }

      // Set timeout for reconnection
      setTimeout(() => {
        if (this.callState === CALL_STATES.RECONNECTING) {
          this.handleCallFailure(new Error('Reconnection timeout'));
        }
      }, 10000);

    } catch (error) {
      console.error('Failed to handle reconnection:', error);
      this.handleCallFailure(error);
    }
  }

  // Handle call failure
  handleCallFailure(error) {
    console.error('Call failed:', error);
    this.callState = CALL_STATES.FAILED;
    this.emit('callFailed', { error: error.message });
    this.cleanup();
  }

  // End call
  endCall() {
    try {
      this.callState = CALL_STATES.ENDED;
      this.emit('callStateChanged', { state: this.callState });

      if (this.socket) {
        this.sendSignalingMessage('call-end', {
          to: this.remoteUser?.id,
        });
      }

      this.cleanup();
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  }

  // Cleanup resources
  cleanup() {
    try {
      // Stop recording if active
      if (this.recordingState.isRecording) {
        this.stopRecording();
      }

      // Stop quality monitoring
      if (this.qualityMonitor.interval) {
        clearInterval(this.qualityMonitor.interval);
        this.qualityMonitor.interval = null;
      }

      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      // Stop local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }

      // Clear remote stream
      this.remoteStream = null;

      // Reset state
      this.callState = CALL_STATES.IDLE;
      this.remoteUser = null;

      this.emit('callEnded');

    } catch (error) {
      console.error('Failed to cleanup:', error);
    }
  }

  // Event management
  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
  }

  off(event, listener) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Get call statistics
  getCallStats() {
    return {
      callState: this.callState,
      qualityLevel: this.qualityLevel,
      qualityStats: this.qualityMonitor.stats,
      isRecording: this.recordingState.isRecording,
      recordingDuration: this.recordingState.isRecording 
        ? Date.now() - this.recordingState.startTime 
        : 0,
    };
  }

  // Authenticate user
  authenticate(user) {
    this.currentUser = user;
    if (this.socket) {
      this.socket.emit('authenticate', {
        userId: user.id,
        token: user.token,
      });
    }
  }

  // Disconnect service
  disconnect() {
    if (this.callState !== CALL_STATES.IDLE) {
      this.endCall();
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.eventListeners.clear();
  }
}

// Create singleton instance
const webRTCQuantum = new WebRTCQuantumService();

// Export service and constants
export default webRTCQuantum;
export { CALL_STATES, QUALITY_LEVELS };

// React hook for using WebRTC service
export const useWebRTCQuantum = () => {
  const [callState, setCallState] = React.useState(webRTCQuantum.callState);
  const [qualityStats, setQualityStats] = React.useState(webRTCQuantum.qualityMonitor.stats);
  const [localStream, setLocalStream] = React.useState(null);
  const [remoteStream, setRemoteStream] = React.useState(null);

  React.useEffect(() => {
    const handleCallStateChange = ({ state }) => {
      setCallState(state);
    };

    const handleQualityUpdate = ({ stats }) => {
      setQualityStats(stats);
    };

    const handleLocalStream = ({ stream }) => {
      setLocalStream(stream);
    };

    const handleRemoteStream = ({ stream }) => {
      setRemoteStream(stream);
    };

    webRTCQuantum.on('callStateChanged', handleCallStateChange);
    webRTCQuantum.on('qualityUpdate', handleQualityUpdate);
    webRTCQuantum.on('localStreamReceived', handleLocalStream);
    webRTCQuantum.on('remoteStreamReceived', handleRemoteStream);

    return () => {
      webRTCQuantum.off('callStateChanged', handleCallStateChange);
      webRTCQuantum.off('qualityUpdate', handleQualityUpdate);
      webRTCQuantum.off('localStreamReceived', handleLocalStream);
      webRTCQuantum.off('remoteStreamReceived', handleRemoteStream);
    };
  }, []);

  return {
    service: webRTCQuantum,
    callState,
    qualityStats,
    localStream,
    remoteStream,
    startCall: webRTCQuantum.startCall.bind(webRTCQuantum),
    answerCall: webRTCQuantum.answerCall.bind(webRTCQuantum),
    endCall: webRTCQuantum.endCall.bind(webRTCQuantum),
    toggleVideo: webRTCQuantum.toggleVideo.bind(webRTCQuantum),
    toggleAudio: webRTCQuantum.toggleAudio.bind(webRTCQuantum),
    setQuality: webRTCQuantum.setQuality.bind(webRTCQuantum),
    startRecording: webRTCQuantum.startRecording.bind(webRTCQuantum),
    stopRecording: webRTCQuantum.stopRecording.bind(webRTCQuantum),
  };
};