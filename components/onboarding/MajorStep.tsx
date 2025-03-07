import { TextInput, StyleSheet } from 'react-native'
import { useState, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OnboardingStepProps } from '../../lib/types/onboarding'
import { OnboardingScreenLayout } from '../OnboardingScreenLayout'
import { colors } from '../../lib/theme/colors'

export function MajorStep({ onNext, onBack }: OnboardingStepProps) {
  const [major, setMajor] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<boolean>(false)
  const inputRef = useRef<TextInput | null>(null)

  const handleNext = async () => {
    if (!major.trim()) {
      setError('Bitte gib deinen Studiengang ein')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await AsyncStorage.setItem('onboarding_major', major.trim())
      onNext()
    } catch (e) {
      setError('Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <OnboardingScreenLayout
      currentStep={2}
      totalSteps={5}
      title="Was"
      subtitle="studierst du?"
      onNext={handleNext}
      onBack={onBack}
      loading={loading}
      error={error}
      buttonDisabled={!major.trim()}
      hint="Dein aktueller Studiengang"
    >
      <TextInput
        style={[
          styles.input,
          focusedField && styles.inputFocused
        ]}
        value={major}
        onChangeText={setMajor}
        placeholder="Dein Studiengang"
        placeholderTextColor="#666"
        autoFocus
        onFocus={() => setFocusedField(true)}
        onBlur={() => setFocusedField(false)}
        ref={inputRef}
      />
    </OnboardingScreenLayout>
  )
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: colors.accent.primary,
  },
}) 