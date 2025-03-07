import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { router } from 'expo-router'
import { useState } from 'react'
import { colors } from '../../lib/theme/colors'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../lib/context/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null)
  const { signIn } = useAuth()

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Bitte fülle alle Felder aus')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await signIn(email, password)
      if (error) throw error
    } catch (e) {
      console.log('Login error:', e)
      setError('Login fehlgeschlagen. Bitte versuche es erneut.')
    } finally {
      setLoading(false)
      console.log('Login successful')
      router.replace('/(auth)/home')
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={32} color={colors.text.primary} />
            </TouchableOpacity>

            <View style={styles.headerContainer}>
              <Text style={styles.title}>
                Willkommen{'\n'}
                <Text style={styles.highlight}>zurück</Text>
              </Text>
            </View>

            <View style={styles.form}>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'email' && styles.inputFocused
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#666"
                autoCapitalize="none"
                keyboardType="email-address"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'password' && styles.inputFocused
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="Passwort"
                placeholderTextColor="#666"
                secureTextEntry
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>

            <View style={styles.bottomButtons}>
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Lädt...' : 'Anmelden'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.registerButton}
                onPress={() => router.push('/(public)/register')}
              >
                <Text style={styles.registerButtonText}>
                  Noch kein Konto? Registrieren
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 12,
    padding: 8,
    zIndex: 1,
  },
  headerContainer: {
    alignItems: 'flex-start',
    marginTop: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 20,
  },
  highlight: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.accent.primary,
  },
  form: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: colors.accent.primary,
  },
  errorText: {
    color: colors.status.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: colors.accent.primary,
    padding: 16,
    borderRadius: 30,
    marginBottom: 16,
  },
  loginButtonText: {
    color: colors.text.light,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  registerButton: {
    marginBottom: 60,
  },
  registerButtonText: {
    color: colors.accent.primary,
    fontSize: 16,
    textAlign: 'center',
  },
  bottomButtons: {
    width: '100%',
    marginTop: 'auto',
    paddingBottom: Platform.OS === 'android' ? 20 : 0,
  },
}) 