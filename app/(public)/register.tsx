import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase/supabase'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (!phone.match(/^\+[1-9]\d{1,14}$/)) {
        throw new Error('Please enter a valid phone number with country code (e.g., +1234567890)')
      }

      // First sign up
      const { error: signUpError, data } = await supabase.auth.signUp({
        phone,
        password,
        email,
      })
      
      if (signUpError) {
        console.error('SignUp Error:', signUpError)
        throw new Error(`Registration failed: ${signUpError.message}`)
      }

      if (!data.user) {
        throw new Error('No user created during signup')
      }

      // Then immediately sign in
      const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('SignIn Error:', signInError)
        throw new Error(`Auto-login failed: ${signInError.message}`)
      }

      // Store phone number in session metadata for verification
      await supabase.auth.updateUser({
        data: { 
          phone_number: phone,
          phone_verified: false
        }
      })
      
      // Redirect to phone verification
      router.replace('/(public)/verify-phone')
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
      <Text style={styles.title}>Create Account</Text>
      
      {error && <Text style={styles.error}>{error}</Text>}
      
      <Text>Email</Text>
      <TextInput
        testID="email-input"
        accessibilityLabel="Email input field"
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <Text>Phone Number</Text>
      <Text style={styles.hint}>Format: +[country code][number] (e.g., +1234567890)</Text>
      <TextInput
        testID="phone-input"
        accessibilityLabel="Phone input field"
        style={styles.input}
        placeholder="+1234567890"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      
      <Text>Password</Text>
      <TextInput
        testID="password-input"
        accessibilityLabel="Password input field"
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/(public)/login')}>
        <Text style={styles.link}>Already have an account? Log in</Text>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
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
  link: {
    color: '#000',
    textAlign: 'center',
  },
  hint: {
    color: '#666',
    fontSize: 12,
    marginBottom: 5,
  },
}) 