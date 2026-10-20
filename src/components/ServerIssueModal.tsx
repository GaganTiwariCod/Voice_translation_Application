import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';

interface ServerIssueModalProps {
  visible: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  onClose: () => void;
}

export const ServerIssueModal: React.FC<ServerIssueModalProps> = ({
  visible,
  errorMessage,
  onRetry,
  onClose,
}) => {
  // Strip any domain, URL, or IP address so internal infrastructure is never shown
  const displayError = useMemo(() => {
    if (!errorMessage) {
      return 'Unable to establish a streaming connection to the translation server.';
    }
    const clean = errorMessage
      .replace(/wss?:\/\/[^\s/$.?#].[^\s]*/gi, '')
      .replace(/https?:\/\/[^\s/$.?#].[^\s]*/gi, '')
      .replace(/[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/gi, (match) => {
        if (match.includes('.')) return 'Translation Server';
        return match;
      })
      .trim();

    return clean || 'Unable to establish a streaming connection to the translation server.';
  }, [errorMessage]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>🔌</Text>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Server Connection Issue</Text>
              <Text style={styles.subtitle}>Translation service is currently unreachable</Text>
            </View>
            <TouchableOpacity
              style={styles.closeIconButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeIconText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Error Details */}
          <View style={styles.errorBox}>
            <Text style={styles.errorLabel}>STATUS / DETAILS</Text>
            <Text style={styles.errorText}>{displayError}</Text>
          </View>

          {/* Diagnostic Checklist */}
          <View style={styles.suggestionsContainer}>
            <View style={styles.suggestionRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.suggestionText}>
                Check if your device has an active internet connection (Wi-Fi or Mobile Data).
              </Text>
            </View>
            <View style={styles.suggestionRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.suggestionText}>
                The backend service may be temporarily unavailable or restarting.
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={onRetry}
              activeOpacity={0.85}
            >
              <Text style={styles.retryButtonText}>🔄 Retry Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#161922',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A3042',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#252B3B',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 11.5,
    marginTop: 2,
  },
  closeIconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#232838',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  closeIconText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    padding: 12,
    marginTop: 14,
    marginBottom: 12,
  },
  errorLabel: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '500',
  },
  suggestionsContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  suggestionRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  bulletPoint: {
    color: '#6366F1',
    fontSize: 14,
    marginRight: 8,
    lineHeight: 18,
  },
  suggestionText: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 6,
  },
  dismissButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#232838',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#374151',
  },
  dismissButtonText: {
    color: '#D1D5DB',
    fontSize: 13,
    fontWeight: '600',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
