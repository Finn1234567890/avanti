import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native'
import { router } from 'expo-router'
import { colors } from '../../lib/theme/colors'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Dimensions } from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'
import { supabase } from '../../lib/supabase/supabase'
import Ionicons from '@expo/vector-icons/Ionicons'

export default function Welcome() {
  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })

      if (credential.identityToken) {
        // Log what we get from Apple

        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        })

        if (error) throw error

      }
    } catch (e: any) {
      if (e.code !== 'ERR_CANCELED') {
        console.error('Apple Sign In Error:', e)
      }
    }
  }

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
                <Text style={styles.highlight}>UHH.</Text>
              </View>
            </Text>
          </View>

          

          <View style={styles.buttonContainer}>
            <Text style={styles.terms}>
              Durch Tippen auf 'Mit Email registrieren' oder 'Mit Apple fortfahren' stimmst du unseren{' '}
              <Text 
                style={styles.link}
                onPress={() => Linking.openURL('https://policiesavanti.vercel.app/')}
              >
                Nutzungsbedingungen
              </Text>
              {' '}zu. Erfahre in unserer{' '}
              <Text 
                style={styles.link}
                onPress={() => Linking.openURL('https://policiesavanti.vercel.app/terms')}
              >
                Datenschutzerklärung
              </Text>
              {' '}und{' '}
              <Text 
                style={styles.link}
                onPress={() => Linking.openURL('https://policiesavanti.vercel.app/cookies')}
              >
                Cookie-Richtlinie
              </Text>
              , wie wir deine Daten verarbeiten.
            </Text>
            <TouchableOpacity 
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            >
              <View style={styles.appleButtonContent}>
                <Ionicons name="logo-apple" size={24} style={styles.appleIcon} color="#000" />
                <Text style={styles.appleButtonText}>
                  Mit Apple fortfahren
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.signInButton, styles.emailButton]}
              onPress={() => router.push('/(public)/register')}
            >
              <View style={styles.emailButtonContent}>
                <Ionicons name="mail-outline" size={24} style={styles.emailIcon} color="#000" />
                <Text style={styles.emailButtonText}>
                  Mit Email registrieren
                </Text>
              </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.light,
    marginBottom: 20,
  },
  title: {
    marginTop: 40,
    fontSize: 28,
    flexDirection: 'row',
    width: '100%',
    fontWeight: '600',
    justifyContent: 'flex-start',
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
  terms: {
    color: colors.text.light,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  appleButton: {
    backgroundColor: '#FFF',
    width: '100%',
    padding: 16,
    borderRadius: 30,
  },
  appleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  appleButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  appleIcon: {
    marginBottom: 4,
  },
  emailButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  emailButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emailButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emailIcon: {
    color: '#000',
  },
  link: {
    color: colors.text.light,
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
}) 