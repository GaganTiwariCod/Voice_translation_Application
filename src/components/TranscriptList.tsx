import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { TranscriptItem } from '../types/protocol';

interface Props {
  transcripts: TranscriptItem[];
  currentPartialSource: string;
}

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

export const TranscriptList: React.FC<Props> = ({ transcripts, currentPartialSource }) => {
  const renderItem = ({ item }: { item: TranscriptItem }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sequenceBadge}>#{item.sequence}</Text>
          {item.latencyMetrics && (
            <View style={styles.latencyRow}>
              <Text style={styles.latencyText}>
                STT: {item.latencyMetrics.sttLatencyMs}ms | MT: {item.latencyMetrics.translationLatencyMs}ms | Total: {item.latencyMetrics.totalServerLatencyMs}ms
              </Text>
            </View>
          )}
        </View>

        {/* Source Text */}
        <View style={styles.textSection}>
          <Text style={styles.speakerLabel}>
            Original ({LANGUAGE_NAMES[item.sourceLanguage.toLowerCase()] || item.sourceLanguage.toUpperCase()}):
          </Text>
          <Text style={styles.sourceText}>{item.sourceText}</Text>
        </View>

        {/* Translated Text */}
        {item.translatedText ? (
          <View style={[styles.textSection, styles.translatedSection]}>
            <Text style={styles.listenerLabel}>
              Translated ({LANGUAGE_NAMES[item.targetLanguage.toLowerCase()] || item.targetLanguage.toUpperCase()}):
            </Text>
            <Text style={styles.translatedText}>{item.translatedText}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Real-Time Live Partial Hypothesis Box */}
      {currentPartialSource ? (
        <View style={styles.partialBox}>
          <View style={styles.partialHeader}>
            <View style={styles.liveDot} />
            <Text style={styles.partialTitle}>LIVE RECOGNITION (UNFINALIZED)</Text>
          </View>
          <Text style={styles.partialText}>{currentPartialSource}...</Text>
        </View>
      ) : null}

      {/* Finalized Subtitles / Transcripts History */}
      <FlatList
        data={transcripts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !currentPartialSource ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transcripts yet.</Text>
              <Text style={styles.emptySubtext}>Spoken phrases and translations will stream here in real time.</Text>
            </View>
          ) : undefined
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 4,
  },
  partialBox: {
    backgroundColor: '#1E2333',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  partialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginRight: 6,
  },
  partialTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
    letterSpacing: 0.8,
  },
  partialText: {
    fontSize: 14,
    color: '#F3F4F6',
    fontStyle: 'italic',
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#161922',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#252936',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sequenceBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    backgroundColor: '#1E2333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  latencyRow: {
    flexDirection: 'row',
  },
  latencyText: {
    fontSize: 10,
    color: '#10B981',
    fontFamily: 'monospace',
  },
  textSection: {
    marginBottom: 6,
  },
  translatedSection: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#252936',
  },
  speakerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  listenerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#60A5FA',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  sourceText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  translatedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
    maxWidth: 260,
  },
});
