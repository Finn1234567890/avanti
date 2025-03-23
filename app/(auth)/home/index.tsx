import { View, Text, StyleSheet, FlatList, ViewToken, Dimensions, Platform, RefreshControl, TouchableOpacity, ScrollView } from 'react-native'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../../lib/context/auth'
import { supabase } from '../../../lib/supabase/supabase'
import { SafeAreaWrapper } from '../../../components/SafeAreaWrapper'
import { ProfileCard } from './components/ProfileCard'
import { LoadingView } from './components/LoadingView'
import { ErrorView } from './components/ErrorView'
import * as Haptics from 'expo-haptics'
import { colors } from '../../../lib/theme/colors'
import { Ionicons } from '@expo/vector-icons'
import { Storage } from '../../../lib/utils/storage'
import { TutorialOverlay } from './components/TutorialOverlay'
import { TESTING_TUTORIAL, PROFILES_PER_PAGE } from '../../../lib/utils/constants'
import { router } from 'expo-router'
import { sortBySimilarity } from '../../../lib/utils/similaritySort'
import { ProfileEntry } from '../../../lib/types/profile'
import { Profile } from '../../../lib/types/profile'

const BOTTOM_NAV_HEIGHT = Platform.OS === 'ios' ? 83 : 60

const { height } = Dimensions.get('window')
const SCREEN_HEIGHT = height - BOTTOM_NAV_HEIGHT
const SNAP_HEIGHT = height > 700 ? 112 : 50

export default function Home() {
  const { session } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [userProfile, setUserProfile] = useState<ProfileEntry>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 10
  })
  const [refreshing, setRefreshing] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [shouldShowTutorial, setShouldShowTutorial] = useState(false)
  const [sortedProfiles, setSortedProfiles] = useState<ProfileEntry[]>([])

  useEffect(() => {
    initializeProfiles()
  }, [])

  useEffect(() => {
    const checkTutorialStatus = async () => {
      if (TESTING_TUTORIAL) {
        setShouldShowTutorial(true)
        return
      }
      const hasSeenTutorial = await Storage.getHasSeenTutorial()
      setShouldShowTutorial(!hasSeenTutorial)
    }
    
    checkTutorialStatus()
  }, [])

  const initializeProfiles = async () => {
    setLoading(true)
    try {
      // 1. Load user profile
      const { data: userProfileData, error: userError } = await supabase
        .from('Profile')
        .select('*')
        .eq('User-ID', session?.user?.id)
        .single()

      if (userError) throw userError
      setUserProfile(userProfileData)

      // 2. Get all profiles sorted by similarity and store their IDs
      const sortedProfiles = await sortBySimilarity(userProfileData)
      setSortedProfiles(sortedProfiles)

      // 3. Load first page using the local sortedProfiles variable
      await loadProfilePage(0, sortedProfiles, userProfileData)
    } catch (e) {
      setError('Failed to load profiles')
    } finally {
      setLoading(false)
    }
  }

  const setProfileAsViewed = async (profile: ProfileEntry, userProfile: ProfileEntry) => {
    const viewedTime = new Date().toISOString()

    const { error } = await supabase
      .from('ProfileViews')
      .upsert({ user_id: userProfile!['User-ID'], viewed_profile_id: profile['User-ID'], viewed_at: viewedTime })

    if (error) {
      throw error
    }
  }

  const loadProfilePage = async (pageNumber: number, profilesOverride?: ProfileEntry[], userProfileOverride?: ProfileEntry) => {
    try {
      const from = pageNumber * PROFILES_PER_PAGE
      const to = from + PROFILES_PER_PAGE - 1
      
      // Use provided profiles or fall back to state
      const profilesToUse = profilesOverride || sortedProfiles
      const pageProfiles = profilesToUse.slice(from, to + 1)

      const userProfileToUse = userProfileOverride || userProfile

      // Only try to set as viewed if we actually have profiles AND userProfile
      if (pageProfiles && pageProfiles.length > 0 && userProfileToUse) {
        for (const profile of pageProfiles) {
          await setProfileAsViewed(profile, userProfileToUse)
        }
      }
      
      // Fetch images for this page of profiles
      const profilesWithImages = await Promise.all(
        pageProfiles.map(async (profile) => {
          // Fetch images for this profile
          const { data: imageData, error: imageError } = await supabase
            .from('Images')
            .select('url')
            .eq('P-ID', profile['P-ID'])

          if (imageError) throw imageError

          // Get public URLs for all images
          const imagesWithPublicUrls = await Promise.all(
            (imageData || []).map(async (img: { url: string }) => {
              const { data: publicUrl } = supabase.storage
                .from('public-images')
                .getPublicUrl(img.url)
              return {
                ...img,
                publicUrl: publicUrl.publicUrl
              }
            })
          )

          return {
            ...profile,
            images: imagesWithPublicUrls
          }
        })
      )

      setHasMore(pageProfiles.length === PROFILES_PER_PAGE)
      
      if (pageNumber === 0) {
        setProfiles(profilesWithImages)
      } else {
        setProfiles(prev => [...prev, ...profilesWithImages])
      }

    } catch (e) {
      console.error('Error loading profile page:', e)
      setError('Failed to load profiles')
    }
  }

  const handleEndReached = () => {
    if (!hasMore || loading) return
    
    const nextPage = page + 1
    setPage(nextPage)
    loadProfilePage(nextPage)
  }

  const handleRetry = () => {
    setPage(0)
    initializeProfiles()
  }

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0)
    }
  }, [])

  const onRefresh = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setRefreshing(true)
    setProfiles([])  // Clear existing profiles
    await initializeProfiles()  // Reload everything from scratch
    setPage(0)  // Reset page counter
    setRefreshing(false)
  }, [])

  const handleDismissTutorial = async () => {
    setTimeout(async () => {
      await Storage.setHasSeenTutorial(true)
      setShouldShowTutorial(false)
    }, 500)
  }

  if (loading && profiles.length === 0) {
    return <LoadingView />
  }

  if (error) {
    return <ErrorView error={error} onRetry={handleRetry} />
  }

  if (!loading && profiles.length === 0) {
    return (
      <SafeAreaWrapper>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Avanti</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/(auth)/profile')}>
              <Ionicons name="menu" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView 
          contentContainerStyle={[styles.container, styles.emptyContainer]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent.primary}
            />
          }
        >
          <Text style={styles.emptyText}>
            Gerade können dir keine Profile mehr angezeigt werden. Versuche es später nochmal
          </Text>
        </ScrollView>
      </SafeAreaWrapper>
    )
  }

  return (
    <SafeAreaWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Avanti</Text>
        <View style={styles.headerRight}>
         
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/(auth)/profile')}>
            <Ionicons name="menu" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.container}>
        <View style={styles.content}>
          <FlatList
            data={profiles}
            keyExtractor={(item) => item['P-ID'] || ''}
            renderItem={({ item, index }) => (
              <ProfileCard
                profile={item}
                preview={false}
              />
            )}
            pagingEnabled
            snapToInterval={SCREEN_HEIGHT - SNAP_HEIGHT}
            decelerationRate="fast"
            viewabilityConfig={viewabilityConfig.current}
            onViewableItemsChanged={onViewableItemsChanged}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.accent.primary}
              />
            }
          />
          
          {shouldShowTutorial && (
            <TutorialOverlay onDismiss={handleDismissTutorial} />
          )}
        </View>
      </View>
    </SafeAreaWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 2, 
    backgroundColor: colors.background.primary,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 24,
  },
}) 