import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native'
import { Profile } from '../types'
import { ImageIndicators } from './ImageIndicators'
import { supabase } from '../../../../lib/supabase/supabase'
import { useAuth } from '../../../../lib/context/auth'
import { useState, useEffect } from 'react'
import * as Haptics from 'expo-haptics'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

type ProfileCardProps = {
  profile: Profile
  currentImageIndex: number
  onImagePress: (profileId: string, imagesLength: number) => void
}

export function ProfileCard({ profile, currentImageIndex, onImagePress }: ProfileCardProps) {
  const { session } = useAuth()
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null)
  const hasMultipleImages = profile.images && profile.images.length > 1

  useEffect(() => {
    checkExistingConnection()
  }, [])

  const checkExistingConnection = async () => {
    try {
      if (!session?.user?.id) return

      const { data, error } = await supabase
        .from('Friendships')
        .select('status')
        .or(`requester-ID.eq.${session.user.id},receiver-ID.eq.${session.user.id}`)
        .or(`requester-ID.eq.${profile['User-ID']},receiver-ID.eq.${profile['User-ID']}`)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"
      if (data) setConnectionStatus(data.status)
    } catch (error) {
      console.log('There is not friendship yet:', error)
    }
  }

  const getButtonText = () => {
    switch (connectionStatus) {
      case 'pending':
        return 'Pending'
      case 'accepted':
        return 'Connected'
      default:
        return 'Connect'
    }
  }

  const handleConnect = async () => {
    try {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      )
      if (!session?.user?.id) return

      const { error } = await supabase
        .from('Friendships')
        .insert({
          'requester-ID': session.user.id,
          'receiver-ID': profile['User-ID'],
          'status': 'pending'
        })

      setConnectionStatus('pending')

      if (error) throw error

      Alert.alert('Success', 'Connection request sent!')
    } catch (error) {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      )
      console.error('Error sending connection request:', error)
      Alert.alert('Error', 'Failed to send connection request')
    }
  }

  const handleImageTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onImagePress(profile['P-ID'], profile.images.length)
  }

  return (
    <View style={styles.profileCard}>
      {profile.images && profile.images.length > 0 && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleImageTap}
          disabled={!hasMultipleImages}
          style={styles.imageContainer}
        >
          <Image 
            source={{ uri: profile.images[currentImageIndex].url }}
            style={styles.profileImage}
          />
          {hasMultipleImages && (
            <ImageIndicators 
              total={profile.images.length} 
              current={currentImageIndex} 
            />
          )}
        </TouchableOpacity>
      )}
      
      <View style={styles.profileInfo}>
        <View style={styles.headerContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.major}>{profile.major}</Text>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.connectButton,
              connectionStatus && styles.connectButtonDisabled
            ]}
            onPress={handleConnect}
            disabled={!!connectionStatus}
          >
            <Text style={styles.connectButtonText}>{getButtonText()}</Text>
          </TouchableOpacity>
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

const styles = StyleSheet.create({
  profileCard: {
    height: SCREEN_HEIGHT,
    backgroundColor: '#fff',
  },
  imageContainer: {
    height: '65%',
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileInfo: {
    flex: 0.3,
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
    marginRight: 12,
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
  connectButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  connectButtonDisabled: {
    backgroundColor: '#ccc',
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  }
}) 