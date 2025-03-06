import { TextInput } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OnboardingLayout } from '../../../components/OnboardingLayout'
import { onboardingStyles as styles } from '../../../lib/styles/onboarding'

const TOTAL_STEPS = 4
const CURRENT_STEP = 1

export default function OnboardingName() {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)


  const handleNext = async () => {
    if (!name.trim()) {
      setError('Name is required')
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
      buttonDisabled={!name.trim()}
      onButtonPress={handleNext}
    >
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        autoFocus
      />
    </OnboardingLayout>
  )
} 