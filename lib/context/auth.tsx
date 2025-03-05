import { createContext, useContext, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../supabase/supabase'
import { router, useSegments } from 'expo-router'
import { View, ActivityIndicator, StyleSheet } from 'react-native'

export type AuthContextType = {
  session: Session | null
  signOut: () => Promise<void>
  loading: boolean
  hasProfile: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  hasProfile: false,
  refreshProfile: async () => {},
  signOut: async () => {},
})

function useProtectedRoute(session: Session | null, hasProfile: boolean, loading: boolean) {
  const segments = useSegments()

  useEffect(() => {
    if (loading) return

    const isPublicGroup = segments[0] === '(public)'
    const isAuthGroup = segments[0] === '(auth)'

    if (!session) {
      // Not logged in - only allow public routes
      if (isAuthGroup) {
        router.replace('/(public)/register')
      }
      return
    }

    if (!hasProfile) {
      // Logged in but no profile - must complete onboarding
      if (isAuthGroup) {
        router.replace('/(public)/onboarding/name')
      }
      return
    }

    // Logged in with profile - should be in auth routes
    if (isPublicGroup) {
      router.replace('/(auth)/home')
    }
  }, [session, hasProfile, segments, loading])
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [initializing, setInitializing] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)

  const checkProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('Profile')
        .select('User-ID')
        .eq('User-ID', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Profile check error:', error)
        return false
      }

      return !!data
    } catch (e) {
      console.error('Profile check failed:', e)
      return false
    }
  }

  const refreshProfile = async () => {
    if (session?.user) {
      const hasProfile = await checkProfile(session.user.id)
      setHasProfile(hasProfile)
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        setSession(initialSession)
        
        if (initialSession?.user) {
          const profileExists = await checkProfile(initialSession.user.id)
          setHasProfile(profileExists)
        }
      } catch (e) {
        console.error('Error initializing auth:', e)
      } finally {
        setLoading(false)
        setInitializing(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      
      if (newSession?.user) {
        const hasProfile = await checkProfile(newSession.user.id)
        setHasProfile(hasProfile)
      } else {
        setHasProfile(false)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useProtectedRoute(session, hasProfile, loading)

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    )
  }

  return (
    <AuthContext.Provider value={{ session, loading, hasProfile, refreshProfile, signOut: async () => {} }}>
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