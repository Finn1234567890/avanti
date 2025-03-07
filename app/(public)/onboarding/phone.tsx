import React, { useState } from 'react'
import { TextInput } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../../lib/supabase/supabase'
import { useAuth } from '../../../lib/context/auth'
import { OnboardingLayout } from '../../../components/OnboardingLayout'
import { onboardingStyles as styles } from '../../../lib/styles/onboarding'

const TOTAL_STEPS = 6  // Updated total steps
const CURRENT_STEP = 1 // After name, before major

export default function OnboardingPhone() {
  const { session } = useAuth()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleNext = async () => {
    if (!phoneNumber.trim()) {
      setError('Phone number is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('PhoneNumbers')
        .insert([{
          'User-ID': session?.user.id,
          phone_number: phoneNumber.trim()
        }])

      if (error) throw error
      
      router.push('/onboarding/name')
    } catch (e) {
      console.error('Error saving phone number:', e)
      setError('Failed to save phone number')
    } finally {
      setLoading(false)
    }
  }

  return (
    <OnboardingLayout
      currentStep={CURRENT_STEP}
      totalSteps={TOTAL_STEPS}
      title="What's your phone number?"
      error={error}
      buttonText="Next"
      buttonDisabled={!phoneNumber.trim()}
      onButtonPress={handleNext}
      loading={loading}
    >
      <TextInput
        style={styles.input}
        value={phoneNumber}
        onChangeText={(text) => {
          const cleaned = text.replace(/[^\d+]/g, '')
          if (!cleaned.startsWith('+49') && cleaned.startsWith('49')) {
            setPhoneNumber('+' + cleaned)
          } else {
            setPhoneNumber(cleaned)
          }
        }}
        placeholder="+491234567890"
        keyboardType="phone-pad"
      />
    </OnboardingLayout>
  )
} 