import { View, Text, StyleSheet, FlatList, ViewToken, Dimensions, Platform } from 'react-native'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../../lib/context/auth'
import { supabase } from '../../../lib/supabase/supabase'
import { SafeAreaWrapper } from '../../../components/SafeAreaWrapper'
import { ProfileCard } from './components/ProfileCard'
import { Profile } from './types'
import { LoadingView } from './components/LoadingView'
import { ErrorView } from './components/ErrorView'

const PROFILES_PER_PAGE = 5
const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const BOTTOM_NAV_HEIGHT = Platform.OS === 'ios' ? 83 : 60

export default function Home() {
  const { session } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{[key: string]: number}>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  })

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

  const renderProfile = ({ item: profile }: { item: Profile }) => (
    <ProfileCard
      profile={profile}
      currentImageIndex={currentImageIndexes[profile['P-ID']] || 0}
      onImagePress={handleImagePress}
    />
  )

  // Handle viewability changes
  const onViewableItemsChanged = useCallback(({ viewableItems }: { 
    viewableItems: ViewToken[]
  }) => {
    if (viewableItems.length > 0) {
      console.log('Currently viewing profile:', viewableItems[0].item['P-ID'])
    }
  }, [])

  if (loading && profiles.length === 0) {
    return <LoadingView />
  }

  if (error) {
    return <ErrorView error={error} onRetry={handleRetry} />
  }

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <FlatList
          data={profiles}
          renderItem={renderProfile}
          keyExtractor={(item) => item['P-ID']}
          showsVerticalScrollIndicator={false}
          snapToInterval={SCREEN_HEIGHT}
          decelerationRate="fast"
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
        />
      </View>
    </SafeAreaWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  listContent: {
    flexGrow: 1,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
}) 