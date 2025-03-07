import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OnboardingStepProps } from '../../lib/types/onboarding'
import { OnboardingScreenLayout } from '../OnboardingScreenLayout'
import { colors } from '../../lib/theme/colors'
import { INTERESTS } from '../../lib/utils/constants'

export function InterestsStep({ onNext, onBack }: OnboardingStepProps) {
  const [interests, setInterests] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  const handleNext = async () => {
    if (interests.length === 0) {
      setError('Bitte wähle mindestens ein Interesse')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await AsyncStorage.setItem('onboarding_interests', JSON.stringify(interests))
      onNext()
    } catch (e) {
      setError('Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <OnboardingScreenLayout
      currentStep={4}
      totalSteps={5}
      title="Was sind deine"
      subtitle="Interessen?"
      onNext={handleNext}
      onBack={onBack}
      loading={loading}
      error={error}
      buttonDisabled={interests.length === 0}
      hint="Wähle alle Interessen die auf dich zutreffen"
    >
      <ScrollView style={styles.container}>
        <View style={styles.interestsGrid}>
          {INTERESTS.map(interest => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.interest,
                interests.includes(interest) && styles.interestSelected
              ]}
              onPress={() => toggleInterest(interest)}
            >
              <Text style={[
                styles.interestText,
                interests.includes(interest) && styles.interestTextSelected
              ]}>
                {interest}
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
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 10,
  },
  interest: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background.secondary,
  },
  interestSelected: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  interestText: {
    color: colors.text.primary,
  },
  interestTextSelected: {
    color: colors.text.light,
  },
}) 