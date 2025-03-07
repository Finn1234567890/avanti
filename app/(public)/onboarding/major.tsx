import { TextInput } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OnboardingLayout } from '../../../components/OnboardingLayout'
import { onboardingStyles as styles } from '../../../lib/styles/onboarding'

const TOTAL_STEPS = 6
const CURRENT_STEP = 3

export default function OnboardingMajor() {
  const [major, setMajor] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleNext = async () => {
    if (!major.trim()) {
      setError('Major is required')
      return
    }
    await AsyncStorage.setItem('onboarding_major', major.trim())
    const name = await AsyncStorage.getItem('onboarding_name')
    console.log('Onboarding Progress - Major:', {
      name,
      major: major.trim()
    })
    router.push('/onboarding/interests')
  }

  return (
    <OnboardingLayout
      currentStep={CURRENT_STEP}
      totalSteps={TOTAL_STEPS}
      title="What's your major?"
      error={error}
      buttonText="Next"
      buttonDisabled={!major.trim()}
      onButtonPress={handleNext}
    >
      <TextInput
        style={styles.input}
        value={major}
        onChangeText={setMajor}
        placeholder="Enter your major"
        autoFocus
      />
    </OnboardingLayout>
  )
} 