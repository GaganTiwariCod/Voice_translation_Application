import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslationSession } from '../hooks/useTranslationSession';
import { LanguageSelector } from '../components/LanguageSelector';
import { ListeningIndicator } from '../components/ListeningIndicator';
import { TranscriptList } from '../components/TranscriptList';
import { ChatHistoryModal } from '../components/ChatHistoryModal';
import { HeadphoneGuideModal } from '../components/HeadphoneGuideModal';
import { ServerIssueModal } from '../components/ServerIssueModal';
import { ENV } from '../config/env';

export const TranslatorScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0
  );

  const {
    sourceLanguage,
    targetLanguage,
    connectionState,
    isListening,
    isPlayingAudio,
    isAudioEnabled,
    toggleAudio,
    transcripts,
    currentPartialSource,
    errorMessage,
    clearErrorMessage,
    retryConnection,
    historyItems,
    isSaveHistoryEnabled,
    toggleSaveHistory,
    clearChatHistory,
    serverUrl,
    setServerUrl,
    setSourceLanguage,
    setTargetLanguage,
    startListening,
    stopListening,
  } = useTranslationSession();

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showHeadphoneGuide, setShowHeadphoneGuide] = useState(true);
  const [showHeadphoneBanner, setShowHeadphoneBanner] = useState(true);

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View
        style={[
          styles.container,
          {
            paddingTop: topInset + 10,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>Mic Translation</Text>
            <Text style={styles.appSubtitle}>Real-Time Streaming Translation</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.guideHeaderButton}
              onPress={() => setShowHeadphoneGuide(true)}
            >
              <Text style={styles.guideHeaderButtonText}>🎧 Guide</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.audioToggleButton, isAudioEnabled ? styles.audioOnButton : styles.audioOffButton]}
              onPress={toggleAudio}
            >
              <Text style={styles.audioToggleText}>
                {isAudioEnabled ? '🔊 ON' : '🔇 OFF'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.historyHeaderButton}
              onPress={() => setShowHistoryModal(true)}
            >
              <Text style={styles.historyHeaderButtonText}>
                📜 {historyItems.length > 0 ? `${historyItems.length}` : 'Chat'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Headphone Advisory Pop Banner */}
        {showHeadphoneBanner && (
          <View style={styles.headphoneBanner}>
            <TouchableOpacity
              style={styles.headphoneBannerContent}
              onPress={() => setShowHeadphoneGuide(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.headphoneBannerIcon}>🎧</Text>
              <Text style={styles.headphoneBannerText}>
                Recommended: Use headphones for zero audio echo loop.{' '}
                <Text style={styles.headphoneBannerLink}>Open Guide →</Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headphoneBannerClose}
              onPress={() => setShowHeadphoneBanner(false)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.headphoneBannerCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Language Selection */}
        <LanguageSelector
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          onSourceChange={setSourceLanguage}
          onTargetChange={setTargetLanguage}
          disabled={isListening}
        />

        {/* Listening & Audio Visualizer */}
        <ListeningIndicator
          isListening={isListening}
          connectionState={connectionState}
          isPlayingAudio={isPlayingAudio}
        />

        {/* Action Controls */}
        <View style={styles.buttonRow}>
          {!isListening ? (
            <TouchableOpacity
              style={styles.startButton}
              activeOpacity={0.8}
              onPress={startListening}
            >
              <Text style={styles.startButtonText}>Start Listening</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.stopButton}
              activeOpacity={0.8}
              onPress={stopListening}
            >
              <Text style={styles.stopButtonText}>Stop Listening</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Continuous Audio Flow Toggle Banner */}
        <TouchableOpacity
          style={[styles.audioFlowBar, isAudioEnabled ? styles.audioFlowActive : styles.audioFlowMuted]}
          onPress={toggleAudio}
          activeOpacity={0.8}
        >
          <Text style={[styles.audioFlowText, isAudioEnabled ? styles.audioFlowTextActive : styles.audioFlowTextMuted]}>
            {isAudioEnabled ? '🔊 Audio Speech Response: ON (Continuous Flow)' : '🔇 Audio Speech Response: OFF (Muted)'}
          </Text>
        </TouchableOpacity>

        {/* Memory & History Action Row */}
        <View style={styles.memoryActionRow}>
          <TouchableOpacity
            style={[styles.memoryToggleBtn, isSaveHistoryEnabled ? styles.memoryActive : styles.memoryMuted]}
            onPress={toggleSaveHistory}
            activeOpacity={0.8}
          >
            <Text style={[styles.memoryToggleText, isSaveHistoryEnabled ? styles.memoryTextActive : styles.memoryTextMuted]}>
              {isSaveHistoryEnabled ? '💾 Auto-Save: ON' : '💾 Auto-Save: OFF'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewHistoryBtn}
            onPress={() => setShowHistoryModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.viewHistoryBtnText}>
              📜 View Session History ({historyItems.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subtitles & Transcripts History */}
        <View style={styles.historyContainer}>
          <Text style={styles.sectionTitle}>TRANSLATION STREAM</Text>
          <TranscriptList
            transcripts={transcripts}
            currentPartialSource={currentPartialSource}
          />
        </View>

        {/* Chat History View Modal */}
        <ChatHistoryModal
          visible={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          historyItems={historyItems}
          isSaveEnabled={isSaveHistoryEnabled}
          onToggleSave={toggleSaveHistory}
          onClearHistory={clearChatHistory}
        />

        {/* Headphone Setup Guide Modal */}
        <HeadphoneGuideModal
          visible={showHeadphoneGuide}
          onClose={() => setShowHeadphoneGuide(false)}
        />

        {/* Server Connection Issue Modal */}
        <ServerIssueModal
          visible={!!errorMessage}
          errorMessage={errorMessage}
          onRetry={retryConnection}
          onClose={clearErrorMessage}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D0F15',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  guideHeaderButton: {
    backgroundColor: '#1E1B4B',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6366F1',
    marginRight: 6,
  },
  guideHeaderButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A5B4FC',
  },
  headphoneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  headphoneBannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  headphoneBannerIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  headphoneBannerText: {
    flex: 1,
    fontSize: 11.5,
    color: '#C7D2FE',
    lineHeight: 16,
  },
  headphoneBannerLink: {
    color: '#818CF8',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  headphoneBannerClose: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headphoneBannerCloseText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  historyHeaderButton: {
    backgroundColor: '#1A2234',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    marginRight: 6,
  },
  historyHeaderButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#93C5FD',
  },
  settingsButton: {
    backgroundColor: '#1E2333',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D3446',
    marginRight: 6,
  },
  settingsButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  audioToggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  audioOnButton: {
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    borderColor: '#3B82F6',
  },
  audioOffButton: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    borderColor: '#4B5563',
  },
  audioToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#93C5FD',
  },
  audioFlowBar: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 6,
  },
  audioFlowActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  audioFlowMuted: {
    backgroundColor: 'rgba(107, 114, 128, 0.15)',
    borderColor: '#4B5563',
  },
  audioFlowText: {
    fontSize: 12,
    fontWeight: '600',
  },
  audioFlowTextActive: {
    color: '#6EE7B7',
  },
  audioFlowTextMuted: {
    color: '#9CA3AF',
  },
  memoryActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  memoryToggleBtn: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 6,
  },
  memoryActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  memoryMuted: {
    backgroundColor: 'rgba(107, 114, 128, 0.15)',
    borderColor: '#4B5563',
  },
  memoryToggleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  memoryTextActive: {
    color: '#6EE7B7',
  },
  memoryTextMuted: {
    color: '#9CA3AF',
  },
  viewHistoryBtn: {
    flex: 1.2,
    backgroundColor: '#1E2333',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    alignItems: 'center',
  },
  viewHistoryBtnText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  settingsPanel: {
    backgroundColor: '#161922',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2D3446',
  },
  settingsTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A92A6',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urlInput: {
    flex: 1,
    backgroundColor: '#0D0F15',
    color: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#252936',
    fontSize: 13,
    marginRight: 8,
  },
  applyButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  presetRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  presetButton: {
    backgroundColor: '#202430',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2C3242',
  },
  presetActive: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  presetText: {
    fontSize: 11,
    color: '#D1D5DB',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '600',
  },
  errorHint: {
    color: '#F87171',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 6,
  },
  errorActionRow: {
    marginTop: 4,
  },
  errorActionButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: '#EF4444',
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  errorActionText: {
    color: '#FECACA',
    fontSize: 11,
    fontWeight: '600',
  },
  buttonRow: {
    marginVertical: 10,
  },
  startButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  stopButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  historyContainer: {
    flex: 1,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 8,
  },
});
