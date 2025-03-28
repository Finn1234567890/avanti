import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OnboardingStepProps } from '../../lib/types/onboarding'
import { OnboardingScreenLayout } from '../OnboardingScreenLayout'
import { colors } from '../../lib/theme/colors'
import { PREFRENCES } from '../../lib/utils/constants'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'

// Map preferences to icons
const PREFERENCE_ICONS = {
  'Lerngruppen oder Lernpartner': 'people',
  'Nachhilfe anbieten oder suchen': 'school',
  'Studentenpartys & Feiern gehen': 'beer',
  'Studiengangübergreifende Kontakte': 'globe',
  'Projekt oder Startup Partner': 'rocket',
  'Gaming & E-Sports Gruppen': 'game-controller',
} as const

export function PreferencesStep({ onNext, onBack }: OnboardingStepProps) {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStoredPreferences = async () => {
      try {
        const storedPreferences = await AsyncStorage.getItem('onboarding_preferences')
        if (storedPreferences) {
          setSelectedPreferences(JSON.parse(storedPreferences))
        }
      } catch (e) {
        console.error('Error loading stored preferences:', e)
      }
    }
    loadStoredPreferences()
  }, [])

  const togglePreference = async (preference: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    const newPreferences = selectedPreferences.includes(preference)
      ? selectedPreferences.filter(i => i !== preference)
      : [...selectedPreferences, preference]
    
    setSelectedPreferences(newPreferences)
    
    try {
      await AsyncStorage.setItem('onboarding_preferences', JSON.stringify(newPreferences))
    } catch (e) {
      console.error('Error storing preferences:', e)
    }
  }

  const handleNext = () => {
    if (selectedPreferences.length < 1) {
      setError('Bitte wähle mindestens eine Option')
      return
    }
    onNext()
  }

  return (
    <OnboardingScreenLayout
      title="Warum nutzt du"
      subtitle="Avanti?"
      onNext={handleNext}
      onBack={onBack}
      buttonDisabled={selectedPreferences.length < 1}
      error={error}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.hint}>
          Wir verbinden dich mit Studenten, die Ähnliches suchen. Du kannst es später noch ändern.
        </Text>
        <View style={styles.preferencesGrid}>
          {PREFRENCES.map((preference) => (
            <TouchableOpacity
              key={preference}
              style={[
                styles.preferenceButton,
                selectedPreferences.includes(preference) && styles.preferenceButtonSelected
              ]}
              onPress={() => togglePreference(preference)}
            >
              <Ionicons
                name={PREFERENCE_ICONS[preference] as keyof typeof Ionicons.glyphMap}
                size={20}
                color={selectedPreferences.includes(preference) ? colors.accent.primary : colors.text.primary}
                style={styles.icon}
              />
              <Text
                style={[
                  styles.preferenceText,
                  selectedPreferences.includes(preference) && styles.preferenceTextSelected
                ]}
                numberOfLines={2}
              >
                {preference}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </OnboardingScreenLayout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    color: colors.text.secondary,
    marginBottom: 16,
    marginHorizontal: 4,
    opacity: 0.8,
    lineHeight: 16,
  },
  preferencesGrid: {
    flexDirection: 'column',
    gap: 8,
  },
  preferenceButton: {
    width: '100%',
    backgroundColor: colors.background.secondary,
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceButtonSelected: {
    backgroundColor: colors.accent.primary + '15',
    borderColor: colors.accent.primary,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  icon: {
    marginRight: 16,
    width: 24,
    alignItems: 'center',
  },
  preferenceText: {
    fontSize: 15,
    color: colors.text.primary,
    flex: 1,
  },
  preferenceTextSelected: {
    color: colors.accent.primary,
  },
}) 