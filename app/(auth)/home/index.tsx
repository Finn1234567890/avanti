import { View, Text, StyleSheet, FlatList, ViewToken, Dimensions, Platform, RefreshControl, TouchableOpacity } from 'react-native'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../../lib/context/auth'
import { supabase } from '../../../lib/supabase/supabase'
import { SafeAreaWrapper } from '../../../components/SafeAreaWrapper'
import { ProfileCard } from './components/ProfileCard'
import { Profile } from './types'
import { LoadingView } from './components/LoadingView'
import { ErrorView } from './components/ErrorView'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../../../lib/theme/colors'
import { Ionicons } from '@expo/vector-icons'

const PROFILES_PER_PAGE = 5
const BOTTOM_NAV_HEIGHT = Platform.OS === 'ios' ? 83 : 60
const { height } = Dimensions.get('window')
const SCREEN_HEIGHT = height - BOTTOM_NAV_HEIGHT


export default function Home() {
  const { session } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{[key: string]: number}>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 10
  })
  const [refreshing, setRefreshing] = useState(false)
  const insets = useSafeAreaInsets()
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async (pageNumber = 0) => {
    setLoading(true)
    try {
      const from = pageNumber * PROFILES_PER_PAGE
      const to = from + PROFILES_PER_PAGE - 1

      // First, fetch profile data with image URLs
      const { data: profilesData, error: profilesError } = await supabase
        .from('Profile')
        .select(`
          *,
          images:Images(url)
        `)
        .neq('User-ID', session?.user?.id)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (profilesError) throw profilesError

      // Get public URLs for all images
      const profilesWithPublicUrls = await Promise.all(
        profilesData.map(async (profile) => ({
          ...profile,
          images: await Promise.all(
            profile.images.map(async (img: { url: string }) => {
              const { data: publicUrl } = supabase.storage
                .from('public-images')
                .getPublicUrl(img.url)
              return {
                ...img,
                publicUrl: publicUrl.publicUrl
              }
            })
          )
        }))
      )

      setHasMore(profilesData?.length === PROFILES_PER_PAGE)
      
      const newIndexes = profilesWithPublicUrls?.reduce((acc, profile) => ({
        ...acc,
        [profile['P-ID']]: 0
      }), {})
      
      setCurrentImageIndexes(prev => ({ ...prev, ...newIndexes }))
      
      if (pageNumber === 0) {
        setProfiles(profilesWithPublicUrls || [])
      } else {
        setProfiles(prev => [...prev, ...(profilesWithPublicUrls || [])])
      }
    } catch (e) {
      console.error('Error loading profiles:', e)
      setError('Failed to load profiles')
    } finally {
      setLoading(false)
    }
  }

  // Handle reaching end of list
  const handleEndReached = () => {
    if (!hasMore || loading) return
    
    const nextPage = page + 1
    setPage(nextPage)
    loadProfiles(nextPage)
  }

  // Handle image cycling
  const handleImagePress = (profileId: string, imagesLength: number) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [profileId]: (prev[profileId] + 1) % imagesLength
    }))
  }

  const handleRetry = () => {
    setPage(0)
    loadProfiles(0)
  }

  // Handle viewability changes
  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0)
    }
  }, [])

  const onRefresh = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setRefreshing(true)
    setProfiles([])  // Clear existing profiles
    await loadProfiles(0)  // Reload from first page
    setPage(0)  // Reset page counter
    setRefreshing(false)
  }, [])

  if (loading && profiles.length === 0) {
    return <LoadingView />
  }

  if (error) {
    return <ErrorView error={error} onRetry={handleRetry} />
  }

  return (
    <SafeAreaWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Avanti</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="arrow-undo" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="menu" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.container}>
        <FlatList
          data={profiles}
          keyExtractor={(item) => item['P-ID']}
          renderItem={({ item, index }) => (
            <ProfileCard
              profile={item}
              preview={false}
            />
          )}
          pagingEnabled
          snapToInterval={SCREEN_HEIGHT - 112}
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
}) 