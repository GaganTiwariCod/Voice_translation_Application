import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { ConnectionState } from '../services/translatorSocket';

interface Props {
  isListening: boolean;
  connectionState: ConnectionState;
  isPlayingAudio: boolean;
}

export const ListeningIndicator: React.FC<Props> = ({
  isListening,
  connectionState,
  isPlayingAudio,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation;
    if (isListening) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      if (animation) animation.stop();
    };
  }, [isListening]);

  const getConnectionBadge = () => {
    switch (connectionState) {
      case 'session_active':
        return { label: 'STREAMING', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'connected':
        return { label: 'STANDBY', color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.15)' };
      case 'connecting':
        return { label: 'CONNECTING...', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'error':
        return { label: 'OFFLINE / ERROR', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' };
      default:
        return { label: 'DISCONNECTED', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.15)' };
    }
  };

  const badge = getConnectionBadge();

  return (
    <View style={styles.container}>
      {/* State Badges Row */}
      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.color }]}>
          <View style={[styles.dot, { backgroundColor: badge.color }]} />
          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>

        {isPlayingAudio && (
          <View style={[styles.badge, styles.audioBadge]}>
            <Text style={styles.audioBadgeText}>🔊 HEADPHONES PLAYING</Text>
          </View>
        )}
      </View>

      {/* Main Mic Visualizer Circle */}
      <View style={styles.micContainer}>
        {isListening ? (
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={styles.innerActiveCircle}>
              <Text style={styles.micIcon}>🎙</Text>
            </View>
          </Animated.View>
        ) : (
          <View style={styles.idleCircle}>
            <Text style={styles.micIconDisabled}>🎙</Text>
          </View>
        )}
        <Text style={styles.statusSubtext}>
          {isListening ? 'Listening continuously to speaker...' : 'Tap Start Listening to begin translation'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  audioBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: '#8B5CF6',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  audioBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A78BFA',
  },
  micContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerActiveCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  idleCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#202430',
    borderWidth: 1,
    borderColor: '#2D3446',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: {
    fontSize: 26,
  },
  micIconDisabled: {
    fontSize: 24,
    opacity: 0.4,
  },
  statusSubtext: {
    marginTop: 8,
    fontSize: 12,
    color: '#9CA3AF',
  },
});
