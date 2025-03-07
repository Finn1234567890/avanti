import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { router } from 'expo-router'
import { useState, useRef } from 'react'
import { colors } from '../../lib/theme/colors'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase/supabase'
import { useAuth } from '../../lib/context/auth'

export default function Phone() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<boolean>(false)
  const { session, refreshProfile } = useAuth()
  const inputRef = useRef<TextInput | null>(null)

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '')
    
    // Format: XXX XXXXXXX
    let formatted = ''
    if (cleaned.length > 0) {
      formatted += cleaned.slice(0, 3)
      if (cleaned.length > 3) {
        formatted += ' ' + cleaned.slice(3)
      }
    }
    setPhoneNumber(formatted)
  }

  const handleSubmit = async () => {
    // Remove spaces for validation
    const cleanedNumber = phoneNumber.replace(/\s/g, '')
    if (!cleanedNumber || cleanedNumber.length < 10) { // XXX XXXXXXX
      setError('Bitte gib eine gültige deutsche Telefonnummer ein')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Add +49 prefix when saving to DB
      const fullNumber = `+49${cleanedNumber}`
      
      const { error } = await supabase
        .from('PhoneNumbers')
        .insert([
          {
            'User-ID': session?.user?.id,
            phone_number: fullNumber,
          },
        ])

      if (error) throw error

      await refreshProfile()
      router.replace('/(public)/onboarding/name')
    } catch (e) {
      console.error('Phone number error:', e)
      setError('Fehler beim Speichern der Telefonnummer. Bitte versuche es erneut.')
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
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={32} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text style={styles.title}>
              Deine{'\n'}
              <Text style={styles.highlight}>Telefonnummer!</Text>
            </Text>
          </View>

          <View style={styles.form}>
            <View style={[
              styles.phoneInputContainer,
              focusedField && styles.inputFocused
            ]}>
              <View style={styles.prefixContainer}>
                <Text style={styles.flag}>🇩🇪</Text>
                <Text style={styles.prefix}>+49</Text>
              </View>
              <View style={styles.separator} />
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={formatPhoneNumber}
                placeholder="123 4567890"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
                autoFocus={true}
                onFocus={() => setFocusedField(true)}
                onBlur={() => {
                  setFocusedField(false)
                  Keyboard.dismiss()
                  setTimeout(() => {
                    inputRef.current?.focus()
                  }, 100)
                }}
                ref={inputRef}
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
            <Text style={styles.hint}>
              Gib deine deutsche Handynummer ein
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Lädt...' : 'Weiter'}
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 0,
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
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  prefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    gap: 4,
  },
  flag: {
    fontSize: 16,
  },
  prefix: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: colors.text.secondary,
    marginHorizontal: 12,
    opacity: 0.2,
  },
  input: {
    flex: 1,
    padding: 16,
    paddingLeft: 0,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  inputFocused: {
    borderColor: colors.accent.primary,
  },
  errorText: {
    color: colors.status.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  hint: {
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: colors.accent.primary,
    padding: 16,
    borderRadius: 30,
    marginBottom: 16,
    marginHorizontal: 24,
  },
  submitButtonText: {
    color: colors.text.light,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
}) 