import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native'
import { Profile } from '../types'
import { ImageIndicators } from './ImageIndicators'
import { supabase } from '../../../../lib/supabase/supabase'
import { useAuth } from '../../../../lib/context/auth'
import { useState, useEffect } from 'react'
import * as Haptics from 'expo-haptics'
import { colors } from '../../../../lib/theme/colors'
import { LinearGradient } from 'expo-linear-gradient'
import { GestureResponderEvent } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { openMessaging } from '../../../../lib/utils/messaging'
import { Image as ExpoImage } from 'expo-image'

const SCREEN_HEIGHT = Dimensions.get('window').height


export function ProfileCard({ profile, preview }: { profile: Profile, preview: boolean }) {
  const { session } = useAuth()
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null)
  const hasMultipleImages = profile.images && profile.images.length > 1
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    checkExistingConnection() 
    
    if (profile.images) {
      profile.images.forEach(img => {
        ExpoImage.prefetch(img.url)
      })
    }
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


  const handleConnect = async () => {
    try {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      )
      if (!session?.user?.id) return

      if(connectionStatus === 'pending') {
        const { error } = await supabase
          .from('Friendships')
          .update({
            status: 'accepted'
          })
          .eq('requester-ID', profile['User-ID'])
          .eq('receiver-ID', session.user.id)

        if (error) throw error

        setConnectionStatus('accepted')
        Alert.alert('Success', 'Connection request accepted!')
        return
      }

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

  const handleMessage = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      
      if (profile) {
        Alert.alert('Error', 'No phone number available')
        return
      }

      // Try WhatsApp first, fallback to SMS
      await openMessaging('whatsapp', "+4917658875279", session?.user?.user_metadata?.name || 'Someone')
    } catch (error) {
      console.error('Error opening messaging:', error)
    }
  }

  const handleImageTap = (event: GestureResponderEvent) => {
    if (!hasMultipleImages) return
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    
    // Get tap position relative to screen width
    const tapX = event.nativeEvent.locationX
    const screenWidth = Dimensions.get('window').width
    const isRightSide = tapX > screenWidth / 2

    setCurrentImageIndex(prev => {
      if (isRightSide) {
        // Cycle forward
        return (prev + 1) % profile.images.length
      } else {
        // Cycle backward
        return prev === 0 ? profile.images.length - 1 : prev - 1
      }
    })
  }

  const renderFirstScreen = () => (
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
            {renderMajorWithIcon()}
          </View>
        </View>

        <Text style={styles.bio} numberOfLines={8}>
          {profile.description}
        </Text>
      </View>
    </LinearGradient>
  )

  const renderSecondScreen = () => (
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
            {renderMajorWithIcon()}
          </View>
        </View>

        <View style={styles.tagsContainer}>
          {profile.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </LinearGradient>
  )

  const renderOtherScreens = () => (
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
            {renderMajorWithIcon()}
          </View>
        </View>

        <View style={styles.tagsContainer}>
          
        </View>
      </View>
    </LinearGradient>
  )

  const renderMajorWithIcon = () => (
    <View style={styles.majorContainer}>
      <Ionicons 
        name="school" 
        size={18} 
        color={colors.accent.secondary} 
        style={styles.majorIcon} 
      />
      <Text style={styles.major}>{profile.major}</Text>
    </View>
  )

  return (
    <View style={styles.cardContainer}>
      <View style={styles.profileCard}>
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={handleImageTap}
          style={styles.imageContainer}
        >
          {profile.images && profile.images.length > 0 && (
            <View>
              <ExpoImage 
                source={{ uri: profile.images[currentImageIndex].url }}
                style={styles.profileImage}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
              {/* Remove button from header gradient */}
              <LinearGradient
                colors={[
                  'rgba(0,0,0,0.6)',
                  'rgba(0,0,0,0.3)',
                  'transparent'
                ]}
                style={styles.headerGradient}
              />
              {hasMultipleImages && (
                <ImageIndicators 
                  total={profile.images.length} 
                  current={currentImageIndex} 
                />
              )}
              {currentImageIndex !== 0 
                ? (currentImageIndex !== 1 
                  ? renderOtherScreens() 
                  : renderSecondScreen()) 
                : renderFirstScreen()}
            </View>
          )}
        </TouchableOpacity>
        
        {/* Floating connect button */}
        {!preview && (
          <TouchableOpacity 
          style={[
            styles.connectButton,
            connectionStatus === 'accepted' && styles.messageButton,
            connectionStatus === 'pending' && styles.connectButtonDisabled
          ]}
          onPress={connectionStatus === 'accepted' ? handleMessage : handleConnect}
          disabled={connectionStatus === 'pending'}
        >
          <Ionicons 
            name={
              connectionStatus === 'accepted' 
                ? "chatbubble-outline" 
                : connectionStatus === 'pending' 
                  ? "checkmark" 
                  : "person-add"
            } 
            size={28} 
            color={
              connectionStatus === 'accepted'
                ? colors.text.light
                : connectionStatus === 'pending'
                  ? colors.accent.secondary
                  : colors.text.light
            } 
          />
        </TouchableOpacity>
        )}
        
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  cardContainer: {
    height: SCREEN_HEIGHT - 195,
    paddingVertical: 10,
  },
  profileCard: {
    backgroundColor: colors.background.primary,
    marginHorizontal: 10,
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    height: '100%',
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
    width: '100%',
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
  majorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  majorIcon: {
    marginRight: 6,
    opacity: 0.9,
  },
  major: {
    fontSize: 18,
    color: colors.text.light,
    opacity: 0.9,
  },
  tagsContainer: {
    width: '80%',
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
    width: '85%',
    fontSize: 14,
    color: colors.text.light,
    opacity: 0.9,
    fontWeight: '300',
    lineHeight: 24,
  },
  connectButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: colors.accent.primary,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  connectButtonDisabled: {
    borderWidth: 2,
    borderColor: colors.accent.secondary,
    backgroundColor: colors.background.secondary,
    opacity: 0.9,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-start',
  },
  messageButton: {
    backgroundColor: colors.accent.secondary,
  },
}) 