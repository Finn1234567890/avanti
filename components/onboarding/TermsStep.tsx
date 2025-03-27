import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { OnboardingScreenLayout } from '../OnboardingScreenLayout'
import { useState } from 'react'
import { colors } from '../../lib/theme/colors'
import { Checkbox } from '../Checkbox'

type Props = {
  onNext: () => void
  onBack: () => void
}

export function TermsStep({ onNext, onBack }: Props) {
  const [accepted, setAccepted] = useState(false)

  return (
    <OnboardingScreenLayout
      title="Terms"
      subtitle="Verhaltenskodex"
      onNext={onNext}
      onBack={onBack}
      buttonDisabled={!accepted}
      buttonText="Akzeptieren"
      useKeyboardAvoid={false}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.text}>
          Willkommen bei Avanti! Um eine sichere und respektvolle Umgebung für alle Nutzer zu gewährleisten, bitten wir dich, unseren Verhaltenskodex zu akzeptieren:
        </Text>

        <Text style={styles.section}>1. Respektvoller Umgang</Text>
        <Text style={styles.text}>
          • Behandle alle Nutzer mit Respekt{'\n'}
          • Keine Belästigung, Diskriminierung oder Hassrede{'\n'}
          • Keine anstößigen oder unangemessenen Inhalte
        </Text>

        <Text style={styles.section}>2. Authentische Profile</Text>
        <Text style={styles.text}>
          • Nutze echte und aktuelle Fotos von dir{'\n'}
          • Gib wahrheitsgemäße Informationen an{'\n'}
          • Ein Konto pro Person
        </Text>

        <Text style={styles.section}>3. Sicherheit</Text>
        <Text style={styles.text}>
          • Melde unangemessenes Verhalten{'\n'}
          • Teile keine persönlichen Daten anderer{'\n'}
          • Befolge die Community-Richtlinien
        </Text>

        <View style={styles.checkboxContainer}>
          <Checkbox
            checked={accepted}
            onCheck={() => setAccepted(!accepted)}
          />
        </View>
      </ScrollView>
    </OnboardingScreenLayout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 20,
    paddingBottom: 120, // Space for button
  },
  section: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 24,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.primary,
    marginBottom: 8,
  },
  checkboxContainer: {
    marginTop: 32,
    marginBottom: 32,
  },
}) 