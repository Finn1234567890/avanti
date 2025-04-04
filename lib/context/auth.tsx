import { createContext, useContext, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../supabase/supabase'
import { router, useSegments } from 'expo-router'
import { View, ActivityIndicator, StyleSheet, AppStateStatus, AppState } from 'react-native'
import { LoadingView } from '@/components/home/LoadingView'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type AuthContextType = {
  session: Session | null
  signOut: () => Promise<void>
  loading: boolean
  hasProfile: boolean
  refreshProfile: () => Promise<void>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  hasProfile: false,
  refreshProfile: async () => {},
  signOut: async () => {},
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
})

function useProtectedRoute(session: Session | null, hasPhone: boolean, hasProfile: boolean) {
  const segments = useSegments() as string[]

  useEffect(() => {
    const route = async () => {
      // Get current route group
      const isAuthGroup = segments[0] === '(auth)'
      const isOnboarding = segments.includes('onboarding')

      // No session -> Welcome
      if (!session) {
        if (isAuthGroup) {
          await router.replace('/(public)/welcome')
        }
        return
      }

      // Has session but no phone -> Phone
      if (!hasPhone) {
        if (!segments.includes('phone')) {
          await router.replace('/(public)/phone')
        }
        return
      }

      // Has phone but no profile -> Onboarding
      if (!hasProfile) {
        if (!isOnboarding) {
          await router.replace('/(public)/onboarding')
        }
        return
      }

      // Has everything -> Home
      if (!isAuthGroup) {
        await router.replace('/(auth)/home')
      }
    }

    route()
  }, [session, hasPhone, hasProfile, segments])
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [initializing, setInitializing] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [hasPhone, setHasPhone] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)

  const checkProfile = async (userId: string) => {
    const { data } = await supabase
      .from('Profile')
      .select('User-ID')
      .eq('User-ID', userId)
      .single()
    return !!data
  }

  const checkPhone = async (userId: string) => {
    const { data } = await supabase
      .from('PhoneNumbers')
      .select('*')
      .eq('User-ID', userId)
      .single()
    return !!data
  }

  const refreshProfile = async () => {
    if (session?.user) {
      const [profileExists, phoneExists] = await Promise.all([
        checkProfile(session.user.id),
        checkPhone(session.user.id)
      ])
      setHasProfile(profileExists)
      setHasPhone(phoneExists)
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error: initialError } = await supabase.auth.getSession()
        setSession(initialSession)

        if (initialError) {
          throw new Error(initialError.message)
        }
        
        if (initialSession?.user) {
          const [profileExists, phoneExists] = await Promise.all([
            checkProfile(initialSession.user.id),
            checkPhone(initialSession.user.id)
          ])
          setHasProfile(profileExists)
          setHasPhone(phoneExists)
        }
      } catch (e) {
        console.error('Error initializing auth:', e)
      } finally {
        setInitializing(false)
      }
    }

    initializeAuth()

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('app returned from background')
        await initializeAuth()
      }
    }

    const appStateListener = AppState.addEventListener('change', handleAppStateChange)
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      
      if (newSession?.user) {
        const [profileExists, phoneExists] = await Promise.all([
          checkProfile(newSession.user.id),
          checkPhone(newSession.user.id)
        ])
        setHasProfile(profileExists)
        setHasPhone(phoneExists)
      } else {
        setHasProfile(false)
        setHasPhone(false)
      }
    })

    return () => {
      subscription.unsubscribe()
      appStateListener.remove()
    }
  }, [])

  useProtectedRoute(session, hasPhone, hasProfile)

  useEffect(() => {
    const saveState = async () => {
      if (session) {
        await AsyncStorage.setItem('session', JSON.stringify(session));
      }
    };
    saveState();
  }, [session]);

  useEffect(() => {
    const restoreState = async () => {
      const savedSession = await AsyncStorage.getItem('session');
      if (savedSession) {
        setSession(JSON.parse(savedSession));
      }
    };
    restoreState();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingView />
      </View>
    )
  }

  console.log('initializing', initializing)

  return (
    <AuthContext.Provider value={{ 
      session, 
      hasProfile,
      refreshProfile,
      signOut: async () => {
        await supabase.auth.signOut()
      },
      signUp,
      signIn,
      loading: true
    }}>
      {children}
    </AuthContext.Provider>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
})

export const useAuth = () => useContext(AuthContext) 