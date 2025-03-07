import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native'
import { Profile } from '../types'
import { ImageIndicators } from './ImageIndicators'
import { supabase } from '../../../../lib/supabase/supabase'
import { useAuth } from '../../../../lib/context/auth'
import { useState, useEffect } from 'react'
import * as Haptics from 'expo-haptics'
import { colors } from '../../../../lib/theme/colors'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')
const CARD_MARGIN = 16 // Margin from screen edges
const CARD_WIDTH = SCREEN_WIDTH - (CARD_MARGIN * 2) // Card width with margins

type ProfileCardProps = {
  profile: Profile
  isActive: boolean
  onImagePress: (profileId: string, imagesLength: number) => void
}

export function ProfileCard({ profile, isActive, onImagePress }: ProfileCardProps) {
  const { session } = useAuth()
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null)
  const hasMultipleImages = profile.images && profile.images.length > 1
  const insets = useSafeAreaInsets()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

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
    <View style={[
      styles.profileCard
    ]}>
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={handleImageTap}
        disabled={!hasMultipleImages}
        style={styles.imageContainer}
      >
        {profile.images && profile.images.length > 0 && (
          <View>
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
            <LinearGradient
              colors={[
                'transparent',
                'rgba(0,0,0,0.4)',
                'rgba(0,0,0,0.8)'
              ]}
              style={styles.gradient}
            >
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
            </LinearGradient>
          </View>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: colors.background.primary,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    height: SCREEN_HEIGHT * 0.75,
    marginBottom: SCREEN_HEIGHT * 0.1,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  imageContainer: {
    height: '100%',
    width: '100%',
    backgroundColor: colors.background.secondary,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%', // Increased slightly for better text visibility
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 20, // Match parent border radius
    borderBottomRightRadius: 20,
  },
  profileInfo: {
    padding: 20,
    paddingBottom: 30,
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
    fontSize: 28,
    fontWeight: '600',
    color: colors.text.light,
  },
  major: {
    fontSize: 18,
    color: colors.text.light,
    opacity: 0.9,
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    color: colors.text.light,
    fontWeight: '500',
  },
  bio: {
    fontSize: 16,
    color: colors.text.light,
    opacity: 0.9,
    lineHeight: 24,
  },
  connectButton: {
    backgroundColor: colors.accent.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  connectButtonDisabled: {
    backgroundColor: colors.background.secondary,
    opacity: 0.8,
  },
  connectButtonText: {
    color: colors.text.light,
    fontSize: 14,
    fontWeight: '600',
  }
}) 