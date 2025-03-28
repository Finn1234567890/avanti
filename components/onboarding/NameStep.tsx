import { TextInput, StyleSheet } from 'react-native'
import { useState, useRef, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OnboardingStepProps } from '../../lib/types/onboarding'
import { OnboardingScreenLayout } from '../OnboardingScreenLayout'
import { colors } from '../../lib/theme/colors'
import { profanityCheck } from '@/lib/utils/profanityCheck'

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
      const myRe = /^[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/
      const validInput = myRe.test(name.trim())

      if (!validInput || name.trim().length < 2 ) throw new Error("REGEX_ERROR")

      const containsProfanity = profanityCheck(name.trim())

      if (containsProfanity) throw new Error("PROFANITY_ERROR")

      await AsyncStorage.setItem('onboarding_name', name.trim())
      onNext()
    } catch (error) {
      if (error instanceof Error && error.message === "PROFANITY_ERROR") {
        setError('Das ist nicht dein Name...')
      } else if (error instanceof Error && error.message === "REGEX_ERROR") {
        setError('Gebe bitte nur dein Namen an') 
      } else {
        setError('Ein Fehler ist aufgetreten')
      }
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