import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { colors } from '../lib/theme/colors'

type Props = {
  children: React.ReactNode
  title: string
  subtitle: string
  onNext: () => void
  onBack?: () => void
  loading?: boolean
  error?: string | null
  buttonText?: string
  buttonDisabled?: boolean
  hint?: string
}

export function OnboardingScreenLayout({
  children,
  title,
  subtitle,
  onNext,
  onBack,
  loading,
  error,
  buttonText = 'Weiter',
  buttonDisabled = false,
  hint,
}: Props) {
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoid}
    >
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack || (() => router.back())}
        >
          <Ionicons name="chevron-back" size={32} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>
            {title}{'\n'}
            <Text style={styles.highlight}>{subtitle}</Text>
          </Text>
        </View>

        <View style={styles.form}>
          {children}
          {error && <Text style={styles.errorText}>{error}</Text>}
          {hint && <Text style={styles.hint}>{hint}</Text>}
        </View>

        <TouchableOpacity 
          style={[
            styles.submitButton,
            buttonDisabled && styles.submitButtonDisabled
          ]}
          onPress={onNext}
          disabled={buttonDisabled || loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Lädt...' : buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
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
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.text.light,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
}) 