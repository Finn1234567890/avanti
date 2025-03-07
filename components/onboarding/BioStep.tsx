import { TextInput, StyleSheet } from 'react-native'
import { useState, useRef, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OnboardingStepProps } from '../../lib/types/onboarding'
import { OnboardingScreenLayout } from '../OnboardingScreenLayout'
import { colors } from '../../lib/theme/colors'

export function BioStep({ onNext, onBack }: OnboardingStepProps) {
  const [bio, setBio] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<boolean>(false)
  const inputRef = useRef<TextInput | null>(null)

  useEffect(() => {
    const loadStoredBio = async () => {
      try {
        const storedBio = await AsyncStorage.getItem('onboarding_bio')
        if (storedBio) setBio(storedBio)
      } catch (e) {
        console.error('Error loading stored bio:', e)
      }
    }
    loadStoredBio()
  }, [])

  const handleNext = async () => {
    if (!bio.trim()) {
      setError('Bitte schreib etwas über dich')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await AsyncStorage.setItem('onboarding_bio', bio.trim())
      onNext()
    } catch (e) {
      setError('Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <OnboardingScreenLayout
      title="Erzähl uns"
      subtitle="von dir"
      onNext={handleNext}
      onBack={onBack}
      loading={loading}
      error={error}
      buttonDisabled={!bio.trim()}
      hint="Eine kurze Beschreibung über dich"
    >
      <TextInput
        style={[
          styles.input,
          styles.bioInput,
          focusedField && styles.inputFocused
        ]}
        value={bio}
        onChangeText={setBio}
        placeholder="Schreib etwas über dich..."
        placeholderTextColor="#666"
        multiline
        numberOfLines={6}
        maxLength={500}
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
  bioInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  inputFocused: {
    borderColor: colors.accent.primary,
  },
}) 