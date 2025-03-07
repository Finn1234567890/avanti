import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { colors } from '../../lib/theme/colors'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Welcome() {
  return (
    <LinearGradient
        colors={[colors.accent.primary, colors.accent.secondary]}
        style={styles.container}
        start={{ x: 0.5, y: 0.3 }}
        end={{ x: 0, y: 1 }}
      >
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={styles.logo}>Avanti</Text>
            <Text style={styles.title}>
              Freundschaften an der{'\n'}
              <Text style={styles.highlight}>Uni Hamburg</Text>
            </Text>
          </View>

          <Text style={styles.terms}>
            Durch Tippen auf 'Mit Email anmelden' stimmst du unseren Nutzungsbedingungen zu. Erfahre in unserer Datenschutzerklärung und Cookie-Richtlinie, wie wir deine Daten verarbeiten.
          </Text>
          <TouchableOpacity 
            style={styles.signInButton}
            onPress={() => router.push('/(public)/register')}
          >
            <Text style={styles.signInText}>Mit Email anmelden</Text>
          </TouchableOpacity>
        </View>
    </SafeAreaView>
      </LinearGradient>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.light,
    marginBottom: 20,
  },
  title: {
    marginTop: 40,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.light,
    textAlign: 'center',
    marginBottom: 20,
  },
  highlight: {
    fontSize: 30,
    fontWeight: '800',
  },
  signInButton: {
    backgroundColor: colors.primary,
    width: '100%',
    padding: 16,
    borderRadius: 30,
    marginBottom: 60,
  },
  signInText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  terms: {
    color: colors.text.light,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: -260,
    paddingHorizontal: 20,
  }
}) 