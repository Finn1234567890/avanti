import React, { useState } from 'react'
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../lib/context/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function Register() {
  const { sendVerificationCode, verifyPhone, signUp } = useAuth()
  const [step, setStep] = useState<'credentials' | 'phone' | 'verify'>('credentials')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCredentialsNext = async () => {
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    setStep('phone')
  }

  const handlePhoneNext = async () => {
    if (!phoneNumber) {
      setError('Please enter your phone number')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await sendVerificationCode(phoneNumber)
      if (error) throw error
      setStep('verify')
    } catch (e) {
      console.log(e)
      setError('Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!verificationCode) {
      setError('Please enter verification code')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await verifyPhone(phoneNumber, verificationCode)
      if (error) {
        console.log('verifyError', error)
        setError('Invalid verification code')
        return
      }

      router.replace('/(public)/onboarding/name')
    } catch (error) {
      console.log(error)
      setError('Registration failed: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    const loginLink = (
      <TouchableOpacity 
        style={styles.linkContainer} 
        onPress={() => router.push('/(public)/login')}
      >
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
    )

    switch (step) {
      case 'credentials':
        return (
          <>
            <Text style={styles.title}>Create Account</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Choose a password"
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={styles.button}
              onPress={handleCredentialsNext}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Sending Code...' : 'Next'}
              </Text>
            </TouchableOpacity>
            {loginLink}
          </>
        )

      case 'phone':
        return (
          <>
            <Text style={styles.title}>Enter Phone Number</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
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
              <Text style={styles.hint}>Enter in format: +49XXXXXXXXXX</Text>
            </View>

            <TouchableOpacity 
              style={styles.button}
              onPress={handlePhoneNext}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Sending Code...' : 'Next'}
              </Text>
            </TouchableOpacity>
            {loginLink}
          </>
        )

      case 'verify':
        return (
          <>
            <Text style={styles.title}>Verify Phone Number</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={styles.input}
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="Enter code"
                keyboardType="number-pad"
              />
            </View>
            <TouchableOpacity 
              style={styles.button}
              onPress={handleVerify}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Verifying...' : 'Complete Registration'}
              </Text>
            </TouchableOpacity>
            {loginLink}
          </>
        )
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {error && <Text style={styles.error}>{error}</Text>}
        {renderStep()}
      </View>
    </TouchableWithoutFeedback>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 5,
    fontSize: 16,
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
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  linkContainer: {
    marginTop: 10,
  },
  link: {
    color: '#000',
    textAlign: 'center',
  },
}) 