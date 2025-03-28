import { TextInput, StyleSheet, Text, View, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { useState, useRef, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OnboardingStepProps } from '../../lib/types/onboarding'
import { OnboardingScreenLayout } from '../OnboardingScreenLayout'
import { colors } from '../../lib/theme/colors'
import { profanityCheck } from '@/lib/utils/profanityCheck'

const PLACEHOLDER_EXAMPLES = [
  "Suche Nachhilfe in Mathe 2,\nfalls jemand ganz gut ist\nbitte schreib mir",

  "Bin neu in Hamburg und\nsuche mit ein paar Freundinnen\nStudentenpartys! Meldet euch",

  "Spiele in einer U21\nVolleyball-Mannschaft. Wer\nLust hat zu joinen, schreibt mich an",
] as const

const MAX_CHARS = 200 // Suitable length for a bio

export function BioStep({ onNext, onBack }: OnboardingStepProps) {
  const [bio, setBio] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<boolean>(false)
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0)
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('')
  const inputRef = useRef<TextInput | null>(null)
  const typingSpeedRef = useRef<NodeJS.Timeout | null>(null)

  // Typing effect for placeholders
  useEffect(() => {
    if (bio.length > 0) {
      setDisplayedPlaceholder('')
      return
    }

    let currentText = ''
    let currentIndex = 0
    const targetText = PLACEHOLDER_EXAMPLES[currentPlaceholder]

    const typeNextChar = () => {
      if (currentIndex < targetText.length) {
        // Handle newline characters properly
        const nextChar = targetText[currentIndex]
        currentText += nextChar
        setDisplayedPlaceholder(currentText)
        currentIndex++

        // Adjust timing for better readability
        const delay = nextChar === '\n' ? 200 : 50 // Longer pause at line breaks
        typingSpeedRef.current = setTimeout(typeNextChar, delay)
      }
    }

    typeNextChar()

    return () => {
      if (typingSpeedRef.current) {
        clearTimeout(typingSpeedRef.current)
      }
    }
  }, [currentPlaceholder, bio])

  // Cycle through placeholders every 7 seconds when empty
  useEffect(() => {
    if (bio.length > 0) return

    const interval = setInterval(() => {
      if (typingSpeedRef.current) {
        clearTimeout(typingSpeedRef.current)
      }
      setDisplayedPlaceholder('')
      setCurrentPlaceholder((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length)
    }, 7000) // Increased time to allow for typing effect

    return () => clearInterval(interval)
  }, [bio])

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
      if (bio.length > MAX_CHARS) {
        setError(`Dein Text ist zu lang (maximal ${MAX_CHARS} Zeichen)`)
        return
      }

      if (profanityCheck(bio.trim())) {
        throw new Error("PROFANITY_ERROR")
      }

      await AsyncStorage.setItem('onboarding_bio', bio.trim())
      onNext()
    } catch (e) {
      if (e instanceof Error && e.message === "PROFANITY_ERROR") {
        setError('Bitte gebe was vernünftiges ein...')
      } else {
        setError('Ein Fehler ist aufgetreten')
      }
    } finally {
      setLoading(false)
    }
  }

  const dismissKeyboard = () => {
    Keyboard.dismiss()
  }

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={{ flex: 1 }}>
        <OnboardingScreenLayout
          title="Erzähl uns von dir."
          subtitle="Warum bist du hier?"
          onNext={handleNext}
          onBack={onBack}
          loading={loading}
          error={error}
          buttonDisabled={!bio.trim() || bio.length > MAX_CHARS}
        >
          <View style={styles.inputContainer}>
            <Text style={styles.charCount}>
              {bio.length}/{MAX_CHARS}
            </Text>
            {!bio && (
              <Text style={[styles.placeholderText]}>
                {displayedPlaceholder}
              </Text>
            )}
            <TextInput
              style={[
                styles.input,
                styles.bioInput,
                focusedField && styles.inputFocused,
                bio.length > MAX_CHARS && styles.inputError
              ]}
              value={bio}
              onChangeText={setBio}
              multiline={true}
              textAlignVertical="top"
              numberOfLines={7}
              maxLength={MAX_CHARS + 50}
              autoFocus
              onFocus={() => setFocusedField(true)}
              onBlur={() => setFocusedField(false)}
              ref={inputRef}
            />
          </View>
        </OnboardingScreenLayout>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: 10,
    position: 'relative',
    width: '100%',
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bioInput: {
    height: 160,
    textAlignVertical: 'top',
    lineHeight: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  inputFocused: {
    borderColor: colors.accent.primary,
  },
  inputError: {
    borderColor: 'red',
  },
  charCount: {
    position: 'absolute',
    right: 8,
    top: -24,
    fontSize: 14,
    color: colors.text.secondary,
    zIndex: 1,
  },
  placeholderText: {
    position: 'absolute',
    color: '#666',
    fontSize: 16,
    padding: 16,
    lineHeight: 24,
    zIndex: 1,
  },
}) 