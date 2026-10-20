import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';

interface HeadphoneGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

export const HeadphoneGuideModal: React.FC<HeadphoneGuideModalProps> = ({
  visible,
  onClose,
}) => {
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
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <Text style={styles.headphoneIcon}>🎧</Text>
              </View>
              <View style={styles.titleTextContainer}>
                <Text style={styles.title}>Headphones Recommended</Text>
                <Text style={styles.subtitle}>Crucial for Clear Live Translation</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeIconButton}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <Text style={styles.closeIconText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Why Notice Banner */}
            <View style={styles.warningBox}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.warningText}>
                <Text style={styles.boldText}>Echo Prevention Notice: </Text>
                Without headphones, translated speech from your device speaker will leak into the microphone, creating an endless audio feedback loop.
              </Text>
            </View>

            {/* Step-by-Step Complete Flow */}
            <Text style={styles.flowSectionTitle}>RECOMMENDED SETUP FLOW</Text>

            {/* Step 1 */}
            <View style={styles.stepCard}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Plug in or Pair Headphones</Text>
                <Text style={styles.stepDesc}>
                  Connect wired earphones (3.5mm / Type-C) or pair your Bluetooth earbuds before tapping Start.
                </Text>
              </View>
            </View>

            {/* Step 2 */}
            <View style={styles.stepCard}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Microphone Isolation</Text>
                <Text style={styles.stepDesc}>
                  Headphones guarantee isolated input. Your microphone captures only your voice and not the app's translated speech.
                </Text>
              </View>
            </View>

            {/* Step 3 */}
            <View style={styles.stepCard}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Adjust Volume to 60-70%</Text>
                <Text style={styles.stepDesc}>
                  Keep volume comfortable so you hear translated output clearly without needing to shout.
                </Text>
              </View>
            </View>

            {/* Step 4 */}
            <View style={styles.stepCard}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Speak Naturally & Translate</Text>
                <Text style={styles.stepDesc}>
                  Press "Start Listening", speak continuously in your chosen language, and listen to instant real-time translated voice.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Got It, Let's Start 🚀</Text>
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
    maxHeight: '84%',
    backgroundColor: '#161922',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A3042',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#252B3B',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  headphoneIcon: {
    fontSize: 22,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  closeIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#232838',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  closeIconText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollArea: {
    marginTop: 14,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.35)',
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  warningText: {
    color: '#FDE047',
    fontSize: 12.5,
    lineHeight: 18,
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
  },
  flowSectionTitle: {
    color: '#6366F1',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1E2330',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D3548',
    padding: 12,
    marginBottom: 10,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  stepDesc: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#252B3B',
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
