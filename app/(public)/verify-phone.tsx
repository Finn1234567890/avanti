import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase/supabase'
import { useAuth } from '../../lib/context/auth'

export default function VerifyPhone() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { session } = useAuth()

  const phoneNumber = session?.user?.user_metadata?.phone_number

  const handleVerify = async () => {
    if (!session?.user) {
      setError('No user session found')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      // TODO: Replace with actual Twilio verification
      if (code !== '1234') {
        throw new Error('Invalid verification code')
      }


      // Navigate to onboarding
      router.replace('/(public)/onboarding/profile')
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred'
      console.error('Full Error:', e)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Phone Number</Text>
      
      {error && <Text style={styles.error}>{error}</Text>}
      
      <Text style={styles.description}>
        Enter the verification code sent to {phoneNumber}
      </Text>
      
      <Text style={styles.hint}>
        For testing, use code: 1234
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Verification Code"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={4}
        testID="verification-code-input"
        accessibilityLabel="Verification code input field"
      />
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleVerify}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Verifying...' : 'Verify'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
  },
  hint: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 8,
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
}) 