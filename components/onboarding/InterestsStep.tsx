import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OnboardingStepProps } from '../../lib/types/onboarding'
import { OnboardingScreenLayout } from '../OnboardingScreenLayout'
import { colors } from '../../lib/theme/colors'
import { INTERESTS } from '../../lib/utils/constants'

export function InterestsStep({ onNext, onBack }: OnboardingStepProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(i => i !== interest)
      }
      if (prev.length >= 5) return prev // Max 5 interests
      return [...prev, interest]
    })
    setError(null)
  }

  const handleNext = async () => {
    if (selectedInterests.length < 2) {
      setError('Bitte wähle mindestens 2 Interessen')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await AsyncStorage.setItem('onboarding_interests', JSON.stringify(selectedInterests))
      onNext()
    } catch (e) {
      setError('Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <OnboardingScreenLayout
      title="Was sind deine"
      subtitle="Interessen?"
      onNext={handleNext}
      onBack={onBack}
      loading={loading}
      error={error}
      buttonDisabled={selectedInterests.length < 2}
      hint={`${selectedInterests.length}/2 · Wähle mindestens 2 Interessen`}
      useKeyboardAvoid={false}
    >
      <View style={styles.container}>
        <View style={styles.pillContainer}>
          {INTERESTS.map(interest => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.pill,
                selectedInterests.includes(interest) && styles.pillSelected
              ]}
              onPress={() => toggleInterest(interest)}
              disabled={selectedInterests.length >= 5 && !selectedInterests.includes(interest)}
            >
              <Text 
                style={[
                  styles.pillText,
                  selectedInterests.includes(interest) && styles.pillTextSelected
                ]}
              >
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </OnboardingScreenLayout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 10,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  pill: {
    backgroundColor: colors.background.secondary,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.text.secondary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 4,

  },
  pillSelected: {
    color: colors.accent.secondary,
    backgroundColor: colors.accent.secondary,
    borderColor: colors.accent.secondary,
  },
  pillText: {
    color: colors.text.secondary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  pillTextSelected: {
    color: colors.background.primary,
  },
}) 