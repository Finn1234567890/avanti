import { TextInput } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OnboardingLayout } from '../../../components/OnboardingLayout'
import { onboardingStyles as styles } from '../../../lib/styles/onboarding'

const TOTAL_STEPS = 6
const CURRENT_STEP = 2

export default function OnboardingName() {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isValidName = (name: string) => {
    if (name.length < 2) return false
    // First letter must be uppercase, second letter must be lowercase
    return /^[A-Z][a-z]/.test(name)
  }

  const handleNameChange = (text: string) => {
    setName(text)
    if (text && !isValidName(text)) {
      setError('Name must start with a capital letter followed by a lowercase letter')
    } else {
      setError(null)
    }
  }

  const handleNext = async () => {
    if (!name.trim()) {
      setError('Name is required')
      return
    }

    if (!isValidName(name)) {
      setError('Name must start with a capital letter followed by a lowercase letter')
      return
    }

    await AsyncStorage.setItem('onboarding_name', name.trim())
    console.log('Onboarding Progress - Name:', {
      name: name.trim()
    })
    router.push('/onboarding/major')
  }

  return (
    <OnboardingLayout
      currentStep={CURRENT_STEP}
      totalSteps={TOTAL_STEPS}
      title="What's your name?"
      error={error}
      buttonText="Next"
      buttonDisabled={!name.trim() || !isValidName(name)}
      onButtonPress={handleNext}
    >
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={handleNameChange}
        placeholder="Enter your name (e.g. John)"
        autoFocus
      />
    </OnboardingLayout>
  )
} 