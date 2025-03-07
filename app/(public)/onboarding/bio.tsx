import { TextInput, StyleSheet } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../../../lib/supabase/supabase'
import { useAuth } from '../../../lib/context/auth'
import { OnboardingLayout } from '../../../components/OnboardingLayout'
import { onboardingStyles as styles } from '../../../lib/styles/onboarding'
import { ProfileData } from '../../../lib/types/profile'

const TOTAL_STEPS = 6 
const CURRENT_STEP = 5

export default function OnboardingBio() {
  const { session, refreshProfile } = useAuth()
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNext = async () => {
    if (!bio.trim()) {
      setError('Please write something about yourself')
      return
    }

    await AsyncStorage.setItem('onboarding_bio', bio.trim())
    router.push('/onboarding/images')
  }

  return (
    <OnboardingLayout
      currentStep={CURRENT_STEP}
      totalSteps={TOTAL_STEPS}
      title="Tell us about yourself"
      error={error}
      buttonText="Next"
      buttonDisabled={!bio.trim()}
      onButtonPress={handleNext}
      loading={loading}
    >
      <TextInput
        style={[styles.input, localStyles.bioInput]}
        value={bio}
        onChangeText={setBio}
        placeholder="Write a short bio..."
        multiline
        numberOfLines={6}
        maxLength={500}
        autoFocus
      />
    </OnboardingLayout>
  )
}

const localStyles = StyleSheet.create({
  bioInput: {
    height: 150,
    textAlignVertical: 'top',
  },
}) 