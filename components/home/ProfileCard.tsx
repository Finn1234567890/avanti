import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert, ActivityIndicator, Animated } from 'react-native'
import { ImageIndicators } from './ImageIndicators'
import { supabase } from '../../lib/supabase/supabase'
import { useAuth } from '../../lib/context/auth'
import { useState, useEffect } from 'react'
import * as Haptics from 'expo-haptics'
import { colors } from '../../lib/theme/colors'
import { LinearGradient } from 'expo-linear-gradient'
import { GestureResponderEvent } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { openMessaging } from '../../lib/utils/messaging'
import { Image as ExpoImage } from 'expo-image'
import { Profile } from '../../lib/types/profile'
import { PREFRENCES } from '../../lib/utils/constants'
import { INTEREST_ICONS } from '../onboarding/InterestsStep'

type PreferenceKey = typeof PREFRENCES[number]

const SCREEN_HEIGHT = Dimensions.get('window').height
const NAV_HEIGHT = SCREEN_HEIGHT > 700 ? 195 : 133
const PADDING_VERTICAL = SCREEN_HEIGHT > 700 ? 10 : 5

const PREFERENCE_ICONS = {
  'Lerngruppen oder Lernpartner': 'people',
  'Nachhilfe anbieten oder suchen': 'school',
  'Studentenpartys & Feiern gehen': 'beer',
  'Studiengangübergreifende Kontakte': 'globe',
  'Projekt oder Startup Partner': 'rocket',
  'Gaming & E-Sports Gruppen': 'game-controller',
} as const

// Add type for interest keys
type InterestKey = keyof typeof INTEREST_ICONS

export function ProfileCard({ profile, preview }: { profile: Profile, preview: boolean }) {
  const { session } = useAuth()
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null)
  const hasMultipleImages = profile.images && profile.images.length > 1
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [rotationValue] = useState(new Animated.Value(0))
  const [scaleValue] = useState(new Animated.Value(1))
  const [buttonColorValue] = useState(new Animated.Value(0))

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
    }
  }


  const animateButton = () => {
    // Reset values
    rotationValue.setValue(0)
    scaleValue.setValue(1)
    buttonColorValue.setValue(0)

    Animated.parallel([
      // Rotation animation for icon
      Animated.timing(rotationValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      // Scale pulse animation
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]),
      // Enhanced color transition with longer glow
      Animated.sequence([
        // Quick transition to magenta
        Animated.timing(buttonColorValue, {
          toValue: 0.5,
          duration: 250,
          useNativeDriver: false,
        }),
        // Extended hold at magenta
        Animated.delay(500),
        // Slower transition to final green
        Animated.timing(buttonColorValue, {
          toValue: 1,
          duration: 450,
          useNativeDriver: false,
        }),
      ]),
    ]).start()
  }

  const handleConnect = async () => {
    try {
      if (!session?.user?.id) return

      // If there's a pending request, cancel it
      if (connectionStatus === 'pending') {
        // Reset animation values immediately when canceling
        rotationValue.setValue(0)
        buttonColorValue.setValue(0)
        scaleValue.setValue(1)
        
        const { error } = await supabase
          .from('Friendships')
          .delete()
          .match({
            'requester-ID': session.user.id,
            'receiver-ID': profile['User-ID'],
            'status': 'pending'
          })

        if (error) throw error

        setConnectionStatus(null)
        return
      }

      // Original connect logic with animation
      animateButton()
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      )

      const { error } = await supabase
        .from('Friendships')
        .insert({
          'requester-ID': session.user.id,
          'receiver-ID': profile['User-ID'],
          'status': 'pending'
        })

      if (error) throw error

      setConnectionStatus('pending')
    } catch (error) {
      // Reset animation values on error
      rotationValue.setValue(0)
      buttonColorValue.setValue(0)
      scaleValue.setValue(1)
      
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      )
      console.error('Error handling connection request:', error)
      Alert.alert('Error', 'Failed to handle connection request')
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

  const handleReport = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      Alert.alert(
        'Profil melden',
        'Möchtest du dieses Profil melden, weil es gegen unsere Richtlinien verstößt? Wenn du das Profil meldest, wird es dir nicht mehr angezeigt.',
        [
          {
            text: 'Abbrechen',
            style: 'cancel',
          },
          {
            text: 'Melden',
            style: 'destructive',
            onPress: async () => {
              if (!session?.user?.id) return;
              
              const { error } = await supabase.from('Reports').insert({
                reporter_id: session.user.id,
                reported_user_id: profile['User-ID'],
              })

              const { error: deleteError } = await supabase
                .from('Friendships')
                .delete()
                .or(`requester-ID.eq.${session.user.id},requester-ID.eq.${profile['User-ID']}`)
                .or(`receiver-ID.eq.${profile['User-ID']},receiver-ID.eq.${session.user.id}`)

              if (deleteError) {
                console.error('Error deleting friendship:', deleteError)
              }

              if (error) {
                console.error('Error reporting:', error)
                Alert.alert('Error', 'Could not report profile')
                return
              }

              Alert.alert('Erfolg', 'Profil wurde gemeldet')
            },
          },
        ]
      )
    } catch (error) {
      console.error('Error reporting profile:', error)
    }
  }

  const renderPreferences = () => {
    if (!profile.preferences) return null;
    
    const preferences = Array.isArray(profile.preferences) 
      ? profile.preferences 
      : [profile.preferences];

    return (
      <View style={styles.preferencesContainer}>
        {preferences.slice(0, 2).map((pref, index) => (
          <View key={index} style={styles.preferenceTag}>
            <Ionicons 
              name={PREFERENCE_ICONS[pref as PreferenceKey]}
              size={16} 
              color={colors.text.light}
              style={styles.preferenceIcon} 
            />
            <Text style={styles.preferenceText}>{pref}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderFirstScreen = () => (
    <LinearGradient
      colors={[
        'transparent',
        'rgba(0,0,0,0.6)',
        'rgba(0,0,0,0.95)'
      ]}
      style={styles.firstScreenGradient}
    >
      <View style={preview ? styles.profileInfoPreview : styles.profileInfo}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{profile.name}</Text>
        </View>
        {renderMajorWithIcon()}
        <Text style={styles.bio} numberOfLines={5}>
          {profile.description}
        </Text>
        <View style={styles.divider} />
        {renderPreferences()}
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
      <View style={preview ? styles.profileInfoPreview : styles.profileInfo}>
        <View style={styles.headerContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{profile.name}</Text>
            {renderMajorWithIcon()}
          </View>
        </View>

        <View style={styles.tagsContainer}>
          {profile.tags?.slice(0, 8).map((tag: string, index: number) => (
            <View key={index} style={styles.tag}>
              {INTEREST_ICONS[tag as InterestKey] && (
                <Ionicons 
                  name={INTEREST_ICONS[tag as InterestKey]!}
                  size={16} 
                  color={colors.text.light}
                  style={styles.tagIcon} 
                />
              )}
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
      <View style={preview ? styles.profileInfoPreview : styles.profileInfo}>
        <View style={styles.headerContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{profile.name}</Text>
            {renderMajorWithIcon()}
          </View>
        </View>
      </View>
    </LinearGradient>
  )

  const renderMajorWithIcon = () => (
    <View style={styles.majorContainer}>
      <View style={styles.majorInfo}>
        <Ionicons 
          name="school" 
          size={18} 
          color={'white'} 
          style={styles.majorIcon} 
        />
        <Text style={styles.major}>
          {profile.major}
          {profile.semester && ` • ${profile.semester}. Semester`}
        </Text>
      </View>
      <View style={styles.statusTags}>
        {profile.party_mode && (
          <LinearGradient
            colors={['#FF2D55', '#FF3B69', '#FE3C72']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.partyModeTag}
          >
            <Ionicons 
              name="beer" 
              size={14} 
              color={colors.text.light}
              style={styles.partyModeIcon} 
            />
            <Text style={styles.partyModeText}>Heute unterwegs</Text>
          </LinearGradient>
        )}
        {profile.on_campus && (
          <LinearGradient
            colors={['#34C759', '#32D184', '#2EDC9C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.campusTag}
          >
            <Ionicons 
              name="location" 
              size={14} 
              color={colors.text.light}
              style={styles.campusIcon} 
            />
            <Text style={styles.campusText}>Am Campus</Text>
          </LinearGradient>
        )}
      </View>
    </View>
  )

  const buttonBackgroundColor = buttonColorValue.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [
      'white', 
      colors.accent.secondary,
      colors.accent.secondary,
      colors.accent.primary
    ]
  })

  const shadowOpacity = buttonColorValue.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0.1, 0.5, 0.5, 0.2]
  })

  const shadowRadius = buttonColorValue.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [2, 8, 8, 2]
  })


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
              {session?.user?.id !== profile['User-ID'] && (
                <TouchableOpacity 
                  onPress={handleReport}
                  style={styles.reportButton}
                >
                  <Ionicons 
                    name="flag-outline" 
                    size={24} 
                    color={colors.text.light} 
                  />
                </TouchableOpacity>)}
              
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
        
        {/* Floating connect button - moved outside of screens */}
        {!preview && (
          <View style={styles.bottomButtonContainer}>
            <Animated.View
              style={[
                styles.connectButtonContainer,
                {
                  backgroundColor: connectionStatus === 'pending' 
                    ? colors.accent.primary 
                    : buttonBackgroundColor,
                  transform: [{ scale: scaleValue }],
                  shadowOpacity: shadowOpacity,
                  shadowRadius: shadowRadius,
                  shadowColor: colors.accent.secondary,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 6,
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.connectButton}
                onPress={connectionStatus === 'accepted' ? handleMessage : handleConnect}
              >
                {connectionStatus === 'accepted' ? (
                  <Ionicons 
                    name="chatbubble-outline"
                    size={28} 
                    color={colors.text.light}
                  />
                ) : (
                  <View style={styles.connectButtonContent}>
                    <Text 
                      style={[
                        styles.connectButtonText,
                        { 
                          color: connectionStatus === 'pending' 
                            ? colors.text.light 
                            : "black"
                        }
                      ]}
                    >
                      {connectionStatus === 'pending' ? 'Angefragt' : 'Verbinden'}
                    </Text>
                    <Animated.View
                      style={{
                        transform: [{
                          rotate: rotationValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg']
                          })
                        }]
                      }}
                    >
                      <Ionicons 
                        name={connectionStatus === 'pending' ? 'checkmark' : 'link'}
                        size={18} 
                        color={connectionStatus === 'pending' 
                          ? colors.text.light 
                          : 'black'}
                      />
                    </Animated.View>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  cardContainer: {
    height: SCREEN_HEIGHT - NAV_HEIGHT,
    paddingVertical: PADDING_VERTICAL,
    minHeight: 500,
    maxHeight: '100%',
  },
  profileCard: {
    backgroundColor: colors.background.primary,
    marginHorizontal: 10,
    borderRadius: 40,
    overflow: 'hidden',
    flex: 1,
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
    height: '60%',
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileInfo: {
    padding: 20,
    marginBottom: 50,
    gap: 12,
  },
  profileInfoPreview: {
    padding: 20,
    marginBottom: 0,
    gap: 12,
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
    fontSize: 32,
    fontWeight: '600',
    color: colors.text.light,
  },
  majorContainer: {
    gap: 8,
  },
  majorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  majorIcon: {
    marginRight: 8,
  },
  major: {
    fontSize: 14,
    color: colors.text.light,
    opacity: 0.95,
  },
  tagsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 0,
    marginTop: -10,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagIcon: {
    marginRight: 6,
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
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  connectButtonContainer: {
    borderRadius: 20,
    minWidth: 140,
    overflow: 'visible',
  },
  connectButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    alignItems: 'center',
  },
  connectButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectButtonText: {
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-start',
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preferenceTag: {
    backgroundColor: colors.accent.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceIcon: {
    marginRight: 6,
  },
  preferenceText: {
    color: colors.text.light,
    fontSize: 14,
    fontWeight: '600',
  },
  firstScreenGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.text.light,
    opacity: 0.2,
    marginVertical: 4,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partyModeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  partyModeIcon: {
    marginRight: 4,
  },
  partyModeText: {
    color: colors.text.light,
    fontSize: 12,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  reportButton: {
    position: 'absolute',
    top: 18,
    left: 16,
    padding: 8,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  statusTags: {
    flexDirection: 'row',
    gap: 8,
  },
  campusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  campusIcon: {
    marginRight: 4,
  },
  campusText: {
    color: colors.text.light,
    fontSize: 12,
    paddingRight: 3,
    fontWeight: '600',
  },
}) 