import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../supabase/supabase'
import { router, useSegments } from 'expo-router'
import { View, ActivityIndicator, StyleSheet, AppState, AppStateStatus, Alert } from 'react-native'
import { LoadingView } from '@/components/home/LoadingView'

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
  const [session, setSession] = useState<Session | null>(null)
  const [hasPhone, setHasPhone] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [loading, setLoading] = useState(true)

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log(_event)

      console.log(newSession)
      setSession(newSession)
    
      setTimeout(async () => {
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
        setLoading(false)
      }, 0)
    })

    const onAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('active')
      }
    }
    

    const stateListener = AppState.addEventListener('change', onAppStateChange)

    return () => {
      stateListener.remove()
      subscription.unsubscribe()
    }

    
  }, [])

  useProtectedRoute(session, hasPhone, hasProfile)

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

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingView />
      </View>
    )
  }

  return (
    <AuthContext.Provider value={{ 
      session, 
      hasProfile,
      refreshProfile,
      signOut,
      signUp,
      signIn,
      loading
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