import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
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
  useKeyboardAvoid?: boolean
  keepKeyboardUp?: boolean
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
  useKeyboardAvoid = true,
  keepKeyboardUp = false,
}: Props) {
  const ContentWrapper = useKeyboardAvoid ? KeyboardAvoidingView : View

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (!keepKeyboardUp) {
      Keyboard.dismiss()
    }
    onNext()
  }

  return (
    <ContentWrapper 
      behavior={useKeyboardAvoid ? (Platform.OS === 'ios' ? 'padding' : 'height') : undefined}
      style={styles.container}
    >
      <View style={styles.content}>
        {onBack && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onBack || (() => router.back())}
          >
            <Ionicons name="chevron-back" size={32} color={colors.text.primary} />
          </TouchableOpacity>)}

        <View style={onBack ? styles.headerContainer : styles.headerContainerNoBack}>
          <Text style={styles.title}>
            {title}{'\n'}
            <Text style={styles.highlight}>{subtitle}</Text>
          </Text>
        </View>

        <View style={styles.mainContent}>
          {children}
          {hint && <Text style={styles.hint}>{hint}</Text>}
        </View>
      </View>

      <View style={styles.footer}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <TouchableOpacity 
          style={[
            styles.submitButton,
            buttonDisabled && styles.submitButtonDisabled
          ]}
          onPress={handlePress}
          disabled={buttonDisabled || loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Lädt...' : buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    </ContentWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  mainContent: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 12,
    padding: 8,
    zIndex: 1,
  },
  backButtonDisabled: {
    opacity: 0.5,
  },
  headerContainer: {
    alignItems: 'flex-start',
    marginTop: 40,
  },
  headerContainerNoBack: {
    alignItems: 'flex-start',
    marginTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 20,
    marginTop: 10,
  },
  highlight: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.accent.primary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  errorText: {
    color: colors.status.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  hint: {
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: colors.accent.primary,
    padding: 16,
    borderRadius: 30,
    marginBottom: 50,
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