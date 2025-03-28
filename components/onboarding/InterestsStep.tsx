import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OnboardingStepProps } from '../../lib/types/onboarding'
import { OnboardingScreenLayout } from '../OnboardingScreenLayout'
import { colors } from '../../lib/theme/colors'
import { RECREATIONAL_INTERESTS, ACADEMIC_INTERESTS } from '../../lib/utils/constants'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'

// Map interests to icons
export const INTEREST_ICONS = {
  'Sport / Fitness': 'fitness',
  'Gym': 'barbell',
  'Gaming': 'game-controller',
  'Bars': 'beer',
  'Fotografie': 'camera',
  'Musik machen': 'musical-notes',
  'Musik hören': 'headset',
  'Coffee': 'cafe',
  'Tanzen': 'musical-note',
  'Mit Freunden': 'people',
  'Kochen & Backen': 'restaurant',
  'Reisen & Kultur': 'airplane',
  'Clubbing': 'wine',
  'Raves': 'pulse',
  'Filme & Serien': 'film',
  'Kunst': 'brush',
  'Wandern & Outdoor': 'trail-sign',
  'Tabletop': 'dice',
  'Ehrenamt & Soziales': 'heart',
  // Academic icons
  'Programmierung & IT': 'code-slash',
  'Sprachen lernen': 'language',
  'Laborarbeit & Experimente': 'flask',
  'Wissenschaftliche Publikationen': 'document-text',
  'Forschungsprojekte': 'telescope',
} as const

export function InterestsStep({ onNext, onBack }: OnboardingStepProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStoredInterests = async () => {
      try {
        const storedInterests = await AsyncStorage.getItem('onboarding_interests')
        if (storedInterests) {
          setSelectedInterests(JSON.parse(storedInterests))
        }
      } catch (e) {
        console.error('Error loading stored interests:', e)
      }
    }
    loadStoredInterests()
  }, [])

  const toggleInterest = async (interest: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    
    const newInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest]
    
    setSelectedInterests(newInterests)
    
    try {
      await AsyncStorage.setItem('onboarding_interests', JSON.stringify(newInterests))
    } catch (e) {
      console.error('Error storing interests:', e)
    }
  }

  const handleNext = () => {
    if (selectedInterests.length < 2) {
      setError('Bitte wähle mindestens 2 Interessen')
      return
    }
    onNext()
  }

  const renderInterestPill = (interest: string) => (
    <TouchableOpacity
      key={interest}
      style={[
        styles.pill,
        selectedInterests.includes(interest) && styles.pillSelected
      ]}
      onPress={() => toggleInterest(interest)}
    >
      {INTEREST_ICONS[interest as keyof typeof INTEREST_ICONS] && (
        <Ionicons
          name={INTEREST_ICONS[interest as keyof typeof INTEREST_ICONS] as keyof typeof Ionicons.glyphMap}
          size={14}
          color={selectedInterests.includes(interest) ? colors.background.primary : colors.text.secondary}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.pillText,
          selectedInterests.includes(interest) && styles.pillTextSelected
        ]}
      >
        {interest}
      </Text>
    </TouchableOpacity>
  )

  const renderInterestSection = (title: string, interests: readonly string[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.pillContainer}>
        {interests.map(renderInterestPill)}
      </View>
    </View>
  )

  const renderInterestSection2 = (title: string, interests: readonly string[]) => (
    <View style={styles.section2}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.pillContainer}>
        {interests.map(renderInterestPill)}
      </View>
    </View>
  )

  return (
    <OnboardingScreenLayout
      title="Was sind deine"
      subtitle="Interessen?"
      onNext={handleNext}
      onBack={onBack}
      buttonDisabled={selectedInterests.length < 2}
      error={error}
      buttonText={`${selectedInterests.length}/2 · Weiter`}
      useKeyboardAvoid={false}
    >
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {renderInterestSection('Freizeit & Hobbys', RECREATIONAL_INTERESTS)}
        {renderInterestSection2('Akademische Interessen', ACADEMIC_INTERESTS)}
      </ScrollView>
    </OnboardingScreenLayout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  section2: {
    marginBottom: 120,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
    marginLeft: 4,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'flex-start',
  },
  pill: {
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.text.secondary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillSelected: {
    backgroundColor: colors.accent.secondary,
    borderColor: colors.accent.secondary,
  },
  icon: {
    marginRight: 4,
  },
  pillText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextSelected: {
    color: colors.background.primary,
  },
}) 