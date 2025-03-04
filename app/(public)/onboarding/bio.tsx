import { TextInput, StyleSheet } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../../../lib/supabase/supabase'
import { useAuth } from '../../../lib/context/auth'
import { OnboardingLayout } from '../../../components/OnboardingLayout'
import { onboardingStyles as styles } from '../../../lib/styles/onboarding'
import { ProfileData } from '../../../lib/types/profile'

const TOTAL_STEPS = 4
const CURRENT_STEP = 4

export default function OnboardingBio() {
  const { session } = useAuth()
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleComplete = async () => {
    if (!bio.trim()) {
      setError('Please write something about yourself')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get all stored onboarding data
      const name = await AsyncStorage.getItem('onboarding_name')
      const major = await AsyncStorage.getItem('onboarding_major')
      const interests = JSON.parse(await AsyncStorage.getItem('onboarding_interests') || '[]')

      if (!session?.user?.id || !name || !major) {
        console.log(session?.user?.id, name, major)
        throw new Error('Missing required profile information')
      }

      const profileData: ProfileData = {
        'User-ID': session.user.id,
        'name': name,
        'major': major,
        'tags': interests,
        'description': bio.trim()
      }

      console.log('Final Profile Data:', profileData)

      // Create profile
      const { error: profileError } = await supabase
        .from('Profile')
        .insert([profileData])

      if (profileError) throw profileError

      // Clear onboarding data
      await AsyncStorage.multiRemove([
        'onboarding_name',
        'onboarding_major',
        'onboarding_interests',
        'onboarding_bio'
      ])

      // Complete onboarding
      router.replace('/(auth)/home')
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred'
      console.error('Profile creation error:', e)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <OnboardingLayout
      currentStep={CURRENT_STEP}
      totalSteps={TOTAL_STEPS}
      title="Tell us about yourself"
      error={error}
      buttonText="Complete"
      buttonDisabled={!bio.trim()}
      onButtonPress={handleComplete}
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