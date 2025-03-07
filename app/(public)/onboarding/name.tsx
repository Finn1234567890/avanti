import { TextInput, StyleSheet } from 'react-native'
import { useState, useRef } from 'react'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OnboardingScreenLayout } from '../../../components/OnboardingScreenLayout'
import { colors } from '../../../lib/theme/colors'
import { TOTAL_STEPS } from '../../../lib/utils/onboarding'

const CURRENT_STEP = 1

export default function Name() {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<boolean>(false)
  const inputRef = useRef<TextInput | null>(null)

  const handleNext = async () => {
    if (!name.trim()) {
      setError('Bitte gib deinen Namen ein')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await AsyncStorage.setItem('onboarding_name', name.trim())
      router.push('/onboarding/major')
    } catch (e) {
      setError('Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <OnboardingScreenLayout
      currentStep={CURRENT_STEP}
      totalSteps={TOTAL_STEPS}
      title="Wie ist dein"
      subtitle="Name?"
      onNext={handleNext}
      loading={loading}
      error={error}
      buttonDisabled={!name.trim()}
    >
      <TextInput
        style={[
          styles.input,
          focusedField && styles.inputFocused
        ]}
        value={name}
        onChangeText={setName}
        placeholder="Dein Vorname"
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