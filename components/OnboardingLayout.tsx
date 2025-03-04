import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { onboardingStyles as styles } from '../lib/styles/onboarding'

type OnboardingLayoutProps = {
  children: React.ReactNode
  currentStep: number
  totalSteps: number
  title: string
  error?: string | null
  buttonText: string
  buttonDisabled?: boolean
  onButtonPress: () => void
  loading?: boolean
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  title,
  error,
  buttonText,
  buttonDisabled = false,
  onButtonPress,
  loading = false,
}: OnboardingLayoutProps) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Step {currentStep} of {totalSteps}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          
          {error && <Text style={styles.error}>{error}</Text>}
          
          {children}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.button, buttonDisabled && styles.buttonDisabled]}
            onPress={onButtonPress}
            disabled={loading || buttonDisabled}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Loading...' : buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
} 