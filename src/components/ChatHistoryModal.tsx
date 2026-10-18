import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  NativeModules,
} from 'react-native';
import { HistoryExchange } from '../services/historyStorage';

const { NativeTextToSpeech } = NativeModules;

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  mr: 'Marathi',
  gu: 'Gujarati',
  bn: 'Bengali',
  ta: 'Tamil',
  te: 'Telugu',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
};

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
};

interface Props {
  visible: boolean;
  onClose: () => void;
  historyItems: HistoryExchange[];
  isSaveEnabled: boolean;
  onToggleSave: () => void;
  onClearHistory: () => void;
}

export const ChatHistoryModal: React.FC<Props> = ({
  visible,
  onClose,
  historyItems,
  isSaveEnabled,
  onToggleSave,
  onClearHistory,
}) => {
  const [playingUtteranceId, setPlayingUtteranceId] = useState<string | null>(null);

  const playIsolatedAudio = async (id: string, text: string, langCode: string) => {
    if (playingUtteranceId === id) {
      // Toggle off / stop
      if (NativeTextToSpeech) {
        try {
          await NativeTextToSpeech.stop();
        } catch (_) {}
      }
      setPlayingUtteranceId(null);
      return;
    }

    if (!text || text.trim().length === 0) return;

    if (NativeTextToSpeech) {
      try {
        setPlayingUtteranceId(id);
        const resolvedLocale = LOCALE_MAP[langCode.toLowerCase()] || langCode;
        await NativeTextToSpeech.speak(text, resolvedLocale);
      } catch (err) {
        console.warn('Reader TTS error:', err);
      } finally {
        setPlayingUtteranceId(null);
      }
    }
  };

  const handleClose = () => {
    if (playingUtteranceId && NativeTextToSpeech) {
      try {
        NativeTextToSpeech.stop();
      } catch (_) {}
    }
    setPlayingUtteranceId(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>📜 Session Conversation</Text>
              <Text style={styles.modalSubtitle}>
                Full Session History ({historyItems.length} {historyItems.length === 1 ? 'exchange' : 'exchanges'})
              </Text>
            </View>
            <TouchableOpacity style={styles.closeHeaderBtn} onPress={handleClose}>
              <Text style={styles.closeHeaderBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Action Row: Save Toggle & Clear */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.saveToggleBtn,
                isSaveEnabled ? styles.saveToggleActive : styles.saveToggleInactive,
              ]}
              onPress={onToggleSave}
            >
              <Text
                style={[
                  styles.saveToggleText,
                  isSaveEnabled ? styles.saveToggleTextActive : styles.saveToggleTextInactive,
                ]}
              >
                {isSaveEnabled ? '💾 Auto-Save: ON' : '💾 Auto-Save: OFF'}
              </Text>
            </TouchableOpacity>

            {historyItems.length > 0 && (
              <TouchableOpacity style={styles.clearBtn} onPress={onClearHistory}>
                <Text style={styles.clearBtnText}>🗑️ Clear Session</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Chat History List */}
          <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
            {historyItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No Session History Yet</Text>
                <Text style={styles.emptyStateText}>
                  When Auto-Save is ON, every spoken request and translated response across your entire
                  session will be stored here in text with interactive audio readers.
                </Text>
              </View>
            ) : (
              historyItems.map((item, index) => {
                const srcId = `${item.id}_src`;
                const tgtId = `${item.id}_tgt`;
                const isPlayingSrc = playingUtteranceId === srcId;
                const isPlayingTgt = playingUtteranceId === tgtId;

                const srcLangName = LANGUAGE_NAMES[item.sourceLanguage.toLowerCase()] || item.sourceLanguage.toUpperCase();
                const tgtLangName = LANGUAGE_NAMES[item.targetLanguage.toLowerCase()] || item.targetLanguage.toUpperCase();

                return (
                  <View key={item.id} style={styles.chatCard}>
                    {/* Card Meta */}
                    <View style={styles.cardMetaRow}>
                      <Text style={styles.cardIndexBadge}>Chat #{index + 1}</Text>
                      <Text style={styles.cardTimestamp}>{item.timestamp}</Text>
                    </View>

                    {/* Original Request Script */}
                    <View style={styles.exchangeBox}>
                      <View style={styles.exchangeHeader}>
                        <Text style={styles.exchangeLabel}>
                          Request Script ({srcLangName}):
                        </Text>
                        <TouchableOpacity
                          style={[styles.audioPlayBtn, isPlayingSrc && styles.audioPlayBtnActive]}
                          onPress={() => playIsolatedAudio(srcId, item.sourceText, item.sourceLanguage)}
                        >
                          <Text style={styles.audioPlayBtnText}>
                            {isPlayingSrc ? '⏹️ Stop' : '🔊 Listen'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.sourceText}>{item.sourceText}</Text>
                    </View>

                    {/* Translated Response Script */}
                    <View style={[styles.exchangeBox, styles.responseBox]}>
                      <View style={styles.exchangeHeader}>
                        <Text style={styles.responseLabel}>
                          Response Script ({tgtLangName}):
                        </Text>
                        <TouchableOpacity
                          style={[styles.audioPlayBtn, isPlayingTgt && styles.audioPlayBtnActive]}
                          onPress={() => playIsolatedAudio(tgtId, item.translatedText, item.targetLanguage)}
                        >
                          <Text style={styles.audioPlayBtnText}>
                            {isPlayingTgt ? '⏹️ Stop' : '🔊 Listen'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.translatedText}>{item.translatedText}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Footer */}
          <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
            <Text style={styles.doneBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#12151E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '82%',
    borderTopWidth: 1,
    borderTopColor: '#2D3446',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  closeHeaderBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1E2333',
  },
  closeHeaderBtnText: {
    color: '#D1D5DB',
    fontSize: 16,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  saveToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  saveToggleActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  saveToggleInactive: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    borderColor: '#4B5563',
  },
  saveToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  saveToggleTextActive: {
    color: '#6EE7B7',
  },
  saveToggleTextInactive: {
    color: '#9CA3AF',
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  clearBtnText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollList: {
    marginBottom: 12,
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181C26',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#252936',
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  chatCard: {
    backgroundColor: '#181C26',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#262D3D',
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#232838',
  },
  cardIndexBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#60A5FA',
    letterSpacing: 0.5,
  },
  cardTimestamp: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  exchangeBox: {
    marginBottom: 10,
  },
  responseBox: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#252936',
    marginBottom: 0,
  },
  exchangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  exchangeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  responseLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60A5FA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  audioPlayBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#232938',
    borderWidth: 1,
    borderColor: '#374151',
  },
  audioPlayBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#60A5FA',
  },
  audioPlayBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  sourceText: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
    fontWeight: '400',
  },
  translatedText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    fontWeight: '700',
  },
  doneBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
