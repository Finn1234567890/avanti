import { TextInput, StyleSheet } from 'react-native'
import { useState, useRef, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OnboardingStepProps } from '../../lib/types/onboarding'
import { OnboardingScreenLayout } from '../OnboardingScreenLayout'
import { colors } from '../../lib/theme/colors'

export function NameStep({ onNext, onBack }: OnboardingStepProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<boolean>(false)
  const inputRef = useRef<TextInput | null>(null)

  useEffect(() => {
    const loadStoredName = async () => {
      try {
        const storedName = await AsyncStorage.getItem('onboarding_name')
        if (storedName) setName(storedName)
      } catch (e) {
        console.error('Error loading stored name:', e)
      }
    }
    loadStoredName()
  }, [])

  const handleNext = async () => {
    if (!name.trim()) {
      setError('Bitte gib deinen Namen ein')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await AsyncStorage.setItem('onboarding_name', name.trim())
      onNext()
    } catch (e) {
      setError('Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <OnboardingScreenLayout
      title="Wie ist dein"
      subtitle="Name?"
      onNext={handleNext}
      onBack={onBack}
      buttonDisabled={!name.trim()}
      error={error}
      keepKeyboardUp={true}
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