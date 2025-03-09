import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Animated } from 'react-native'
import { router } from 'expo-router'
import { useState, useRef } from 'react'
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

  const emailLabelAnim = useRef(new Animated.Value(email ? 1 : 0)).current
  const passwordLabelAnim = useRef(new Animated.Value(password ? 1 : 0)).current

  const animateLabel = (anim: Animated.Value, toValue: number) => {
    Animated.timing(anim, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  const handleEmailFocus = () => {
    setFocusedField('email')
    animateLabel(emailLabelAnim, 1)
  }

  const handleEmailBlur = () => {
    setFocusedField(null)
    if (!email) animateLabel(emailLabelAnim, 0)
  }

  const handlePasswordFocus = () => {
    setFocusedField('password')
    animateLabel(passwordLabelAnim, 1)
  }

  const handlePasswordBlur = () => {
    setFocusedField(null)
    if (!password) animateLabel(passwordLabelAnim, 0)
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Bitte fülle alle Felder aus')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email oder Passwort ist falsch')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Bitte bestätige zuerst deine Email')
        } else {
          setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.')
        }
        return
      }

      // Login successful - router.replace not needed as auth state change will trigger navigation
    } catch (error) {
      setError('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setLoading(false)
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
                <Text style={styles.highlight}>zurück!</Text>
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <Animated.Text style={[
                  styles.floatingLabel,
                  {
                    transform: [
                      {
                        translateY: emailLabelAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -25]
                        })
                      },
                      {
                        scale: emailLabelAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 0.75]
                        })
                      }
                    ]
                  }
                ]}>
                  Email
                </Animated.Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === 'email' && styles.inputFocused
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder=""
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={handleEmailFocus}
                  onBlur={handleEmailBlur}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Animated.Text style={[
                  styles.floatingLabel,
                  {
                    transform: [
                      {
                        translateY: passwordLabelAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -25]
                        })
                      },
                      {
                        scale: passwordLabelAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 0.85]
                        })
                      }
                    ]
                  }
                ]}>
                  Passwort
                </Animated.Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === 'password' && styles.inputFocused
                  ]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder=""
                  secureTextEntry
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                />
              </View>

              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Lädt...' : 'Anmelden'}
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
    backgroundColor: colors.background.primary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 12,
    padding: 8,
    zIndex: 1,
  },
  headerContainer: {
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  highlight: {
    color: colors.accent.primary,
  },
  form: {
    gap: 20,
  },
  inputWrapper: {
    position: 'relative',
    height: 52,
  },
  floatingLabel: {
    position: 'absolute',
    left: 16,
    top: 16,
    fontSize: 16,
    borderRadius: 12,
    color: colors.text.secondary,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 4,
    zIndex: 1,
    height: 20,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 2,
    borderColor: 'transparent',
    height: '100%',
    paddingTop: 0,
    paddingBottom: 0,
  },
  inputFocused: {
    borderColor: colors.accent.primary,
  },
  button: {
    backgroundColor: colors.accent.primary,
    padding: 16,
    borderRadius: 30,
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.text.light,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    color: colors.status.error,
    textAlign: 'center',
  },
}) 