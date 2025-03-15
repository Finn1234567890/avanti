import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { colors } from '../../lib/theme/colors'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { OnboardingStepProps } from '../../lib/types/onboarding'
import { OnboardingScreenLayout } from '../OnboardingScreenLayout'

export default function WelcomeStep({ onNext }: OnboardingStepProps) {
  return (
    <OnboardingScreenLayout
      title="Willkommen bei"
      subtitle="Avanti!"
      onNext={onNext}
      buttonDisabled={false}
      buttonText="Los geht's!"
    >
      <View style={styles.rulesContainer}>
        <LinearGradient
          colors={[colors.background.secondary, colors.background.secondary]}
          style={styles.ruleCard}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="people" size={28} color={colors.accent.primary} />
          </View>
          <View style={styles.ruleContent}>
            <View style={styles.titleContainer}>

              <Text style={styles.ruleTitle}>Entdecke Kommilitonen</Text>
            </View>
            <Text style={styles.ruleText}>
              Finde Studenten der Uni Hamburg mit ähnlichen Interessen
            </Text>
          </View>
        </LinearGradient>

        <LinearGradient
          colors={[colors.background.secondary, colors.background.secondary]}
          style={styles.ruleCard}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="link" size={28} color={colors.accent.primary} />
          </View>
          <View style={styles.ruleContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.ruleTitle}>Vernetze dich</Text>
            </View>
            <Text style={styles.ruleText}>
              Sende Verbindungsanfragen und baue dein studentisches Netzwerk auf
            </Text>
          </View>
        </LinearGradient>

        <LinearGradient
          colors={[colors.background.secondary, colors.background.secondary]}
          style={styles.ruleCard}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="chatbubbles" size={28} color={colors.accent.primary} />
          </View>
          <View style={styles.ruleContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.ruleTitle}>Bleib in Kontakt</Text>
            </View>
            <Text style={styles.ruleText}>
              Tausche dich direkt aus und finde neue Lernpartner und Freunde
            </Text>
          </View>
        </LinearGradient>
      </View>

      <Text style={styles.footer}>
        Lass uns dein Profil erstellen, damit andere Studenten dich finden können
      </Text>

      
    </OnboardingScreenLayout>
  )
}

const styles = StyleSheet.create({
  rulesContainer: {
    gap: 16,
    marginBottom: 40,
  },
  ruleCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleContent: {
    flex: 1,
    gap: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ruleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  highlight: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accent.primary,
  },
  ruleText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  nextButton: {
    backgroundColor: colors.accent.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: colors.text.light,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
}) 