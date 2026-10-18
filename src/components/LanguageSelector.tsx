import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export interface LanguageOption {
  code: string;
  label: string;
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'mr', label: 'Marathi (मराठी)' },
  { code: 'gu', label: 'Gujarati (ગુજરાતી)' },
  { code: 'bn', label: 'Bengali (বাংলা)' },
  { code: 'ta', label: 'Tamil (தமிழ்)' },
  { code: 'te', label: 'Telugu (తెలుగు)' },
  { code: 'es', label: 'Spanish (Español)' },
  { code: 'fr', label: 'French (Français)' },
  { code: 'de', label: 'German (Deutsch)' },
];

interface Props {
  sourceLanguage: string;
  targetLanguage: string;
  onSourceChange: (lang: string) => void;
  onTargetChange: (lang: string) => void;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<Props> = ({
  sourceLanguage,
  targetLanguage,
  onSourceChange,
  onTargetChange,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      {/* Source Language */}
      <View style={styles.column}>
        <Text style={styles.label}>SPEAKER (SOURCE)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
          {AVAILABLE_LANGUAGES.map((lang) => {
            const isSelected = sourceLanguage === lang.code;
            return (
              <TouchableOpacity
                key={`src-${lang.code}`}
                style={[styles.pill, isSelected && styles.pillActive, disabled && styles.pillDisabled]}
                disabled={disabled}
                onPress={() => onSourceChange(lang.code)}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{lang.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Target Language */}
      <View style={styles.column}>
        <Text style={styles.label}>LISTENER (TRANSLATED TARGET)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
          {AVAILABLE_LANGUAGES.map((lang) => {
            const isSelected = targetLanguage === lang.code;
            return (
              <TouchableOpacity
                key={`tgt-${lang.code}`}
                style={[styles.pill, isSelected && styles.pillActive, disabled && styles.pillDisabled]}
                disabled={disabled}
                onPress={() => onTargetChange(lang.code)}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{lang.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161922',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#252936',
  },
  column: {
    marginVertical: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A92A6',
    letterSpacing: 1,
    marginBottom: 8,
  },
  pillScroll: {
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#202430',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2C3242',
  },
  pillActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#60A5FA',
  },
  pillDisabled: {
    opacity: 0.5,
  },
  pillText: {
    color: '#D1D5DB',
    fontSize: 13,
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
