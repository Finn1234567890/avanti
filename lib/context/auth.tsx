import { createContext, useContext, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../supabase/supabase'
import { router, useSegments } from 'expo-router'

type AuthContextType = {
  session: Session | null
  loading: boolean
  hasProfile: boolean
}

const AuthContext = createContext<AuthContextType>({ session: null, loading: true, hasProfile: false })

// This hook will protect the route access based on user authentication
function useProtectedRoute(session: Session | null, hasProfile: boolean) {
  const segments = useSegments()
  
  useEffect(() => {
    console.log('Current segments:', segments)
    
    if (!segments?.[0]) {
      router.replace('/(public)/login')
      return
    }

    const isPublicGroup = segments[0] === '(public)'
    const isAuthGroup = segments[0] === '(auth)'

    // Not logged in users can only access public routes
    if (!session && isAuthGroup) {
      router.replace('/(public)/login')
      return
    }

    // Logged in users with no profile must complete onboarding
    if (session && !hasProfile && isAuthGroup) {
      router.replace('/(public)/onboarding/name')
      return
    }

    // Logged in users with profile should be in auth routes
    if (session && hasProfile && isPublicGroup) {
      // Exception for verify-phone and onboarding flow
      const isVerifyOrOnboarding = segments.some(segment => 
        segment === 'verify-phone' || segment === 'onboarding'
      )
      if (!isVerifyOrOnboarding) {
        router.replace('/(auth)/home')
        return
      }
    }
  }, [session, hasProfile, segments])
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)

  // Check if user has profile
  const checkProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('Profile')
        .select('P-ID')
        .eq('User-ID', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found
          return false
        }
        console.error('Profile check error:', error)
        return false
      }

      return !!data
    } catch (e) {
      console.error('Profile check failed:', e)
      return false
    }
  }

  useEffect(() => {
    // Clear any existing session on mount
    supabase.auth.signOut().then(() => {
      supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
        setSession(initialSession)
        if (initialSession?.user) {
          checkProfile(initialSession.user.id).then(setHasProfile)
        }
        setLoading(false)
      })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      console.log('Auth state changed:', _event, !!newSession)
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

  useProtectedRoute(session, hasProfile)

  if (loading) {
    return null // or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ session, loading, hasProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 