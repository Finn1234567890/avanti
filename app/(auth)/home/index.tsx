import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Animated, FlatList } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../../lib/context/auth'
import { supabase } from '../../../lib/supabase/supabase'
import { SafeAreaWrapper } from '../../../components/SafeAreaWrapper'

type Profile = {
  'P-ID': string
  'User-ID': string
  name: string
  major: string
  description: string
  tags: string[]
  images: { url: string }[]
}

export default function Home() {
  const { session } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{[key: string]: number}>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('Profile')
        .select(`
          *,
          images:Images(url)
        `)
        .neq('User-ID', session?.user?.id)
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Initialize image indexes
      const indexes = profilesData?.reduce((acc, profile) => ({
        ...acc,
        [profile['P-ID']]: 0
      }), {})
      
      setCurrentImageIndexes(indexes || {})
      setProfiles(profilesData || [])
    } catch (e) {
      console.error('Error loading profiles:', e)
      setError('Failed to load profiles')
    } finally {
      setLoading(false)
    }
  }

  const handleImagePress = (profileId: string, imagesLength: number) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [profileId]: (prev[profileId] + 1) % imagesLength
    }))
  }

  const renderProfile = ({ item: profile }: { item: Profile }) => {
    const currentImageIndex = currentImageIndexes[profile['P-ID']] || 0
    const hasMultipleImages = profile.images && profile.images.length > 1

    return (
      <View style={styles.profileCard}>
        {profile.images && profile.images.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleImagePress(profile['P-ID'], profile.images.length)}
            disabled={!hasMultipleImages}
            style={styles.imageContainer}
          >
            <Image 
              source={{ uri: profile.images[currentImageIndex].url }} 
              style={styles.profileImage}
            />
            {hasMultipleImages && (
              <View style={styles.imageIndicators}>
                {profile.images.map((_, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.imageIndicator,
                      index === currentImageIndex && styles.imageIndicatorActive
                    ]} 
                  />
                ))}
              </View>
            )}
          </TouchableOpacity>
        )}
        
        <View style={styles.profileInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.major}>{profile.major}</Text>
          </View>
          
          <View style={styles.tagsContainer}>
            {profile.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.bio} numberOfLines={3}>
            {profile.description}
          </Text>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading profiles...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity onPress={loadProfiles}>
          <Text>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>avanti</Text>
        </View>
        
        {profiles.length > 0 && (
          <View style={styles.profileContainer}>
            {renderProfile({ item: profiles[0] })}
          </View>
        )}
      </View>
    </SafeAreaWrapper>
  )
}

const { height } = Dimensions.get('window')
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
  profileContainer: {
    flex: 1,
    padding: 10,
  },
  profileCard: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    flex: 0.7,
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    top: 12,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  imageIndicator: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  imageIndicatorActive: {
    backgroundColor: '#fff',
  },
  profileInfo: {
    flex: 0.3,
    padding: 20,
  },
  nameContainer: {
    marginBottom: 12,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
  },
  major: {
    fontSize: 18,
    color: '#666',
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  bio: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
}) 