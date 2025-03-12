import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { router } from 'expo-router'
import { colors } from '../../lib/theme/colors'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Dimensions } from 'react-native'


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
              Dein Netzwerk an der{'\n'}
              <View style={styles.uniContainer}>
                <Image 
                  source={require('../../assets/images/uni-hamburg-icon.webp')}
                  style={styles.uniIcon}
                />
                <Text style={styles.highlight}>UHH</Text>
              </View>
            </Text>
          </View>

          

          <View style={styles.buttonContainer}>
            <Text style={styles.terms}>
                Durch Tippen auf 'Mit Email registrieren' stimmst du unseren Nutzungsbedingungen zu. Erfahre in unserer Datenschutzerklärung und Cookie-Richtlinie, wie wir deine Daten verarbeiten.
            </Text>
            <TouchableOpacity 
            style={styles.signInButton}
            onPress={() => router.push('/(public)/register')}
          >
            <Text style={styles.signInText}>Mit Email registrieren</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => router.push('/(public)/login')}
          >
            <Text style={styles.registerText}>Bereits registriert? Anmelden</Text>
          </TouchableOpacity>
          </View>
          
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
    fontSize: 24,
    flexDirection: 'row',
    width: '100%',
    fontWeight: '600',
    justifyContent: 'center',
    color: colors.text.light,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  uniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    gap: 8,
  },
  uniIcon: {
    width: 35,
    height: 35,
    borderRadius: 5,
    resizeMode: 'contain',
  },
  highlight: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.background.primary,
  },
  signInButton: {
    backgroundColor: colors.primary,
    width: '100%',
    padding: 16,
    borderRadius: 30,
  },
  registerButton: {
    width: '100%',
    padding: 16,
    marginBottom: 20,
  },
  registerText: {
    color: colors.text.light,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
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
    marginBottom: 10,
    paddingHorizontal: 10,
  }
}) 