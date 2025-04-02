import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, RefreshControl, ScrollView, Image, Linking, AppState, Dimensions, Platform } from 'react-native'
import { SafeAreaWrapper } from '../../../components/SafeAreaWrapper'
import { useAuth } from '../../../lib/context/auth'
import { supabase } from '../../../lib/supabase/supabase'
import * as Haptics from 'expo-haptics'
import { openMessaging } from '../../../lib/utils/messaging'
import * as Clipboard from 'expo-clipboard'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../../../lib/theme/colors'
import { ProfileEntry } from '@/lib/types/profile'
import { Profile } from '../../../types/home/types'
import { ProfileCard } from '../../../components/home/ProfileCard'
import { router } from 'expo-router'
import { BOTTOM_NAV_HEIGHT } from '../../../lib/utils/constants'

export type FriendshipEntry = {
  'friendship-id': string
  status: string
  'requester-ID': string
  'receiver-ID': string

}

export type FriendshipWithProfile =
  FriendshipEntry & {
    friendName: string
    userName: string
    displayedPhone?: string
  }

export type FriendshipWithProfileAndImages = 
  FriendshipWithProfile & Profile

const SCREEN_HEIGHT = Dimensions.get('window').height


export default function Friends() {
  const { session } = useAuth()
  const [friendships, setFriendships] = useState<FriendshipWithProfileAndImages[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userName, setUserName] = useState<string>('')
  const [isInspecting, setIsInspecting] = useState<FriendshipWithProfileAndImages | null>(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  const FACTOR = Platform.OS === 'ios' ? 2 : 1

  useEffect(() => {
    loadFriendships()

    const subscription = AppState.addEventListener('change', handleAppStateChange)
    return () => {
      subscription.remove()
    }
  }, [])

  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active') {
      loadFriendships()
    }
  }

  const loadFriendships = async () => {
    try {
      if (!session?.user?.id) return
      setLoading(true)
      setFriendships([]) // Clear existing data

      //get name of user
      const { data: userData, error: userError } = await supabase
        .from('Profile')
        .select('name')
        .eq('User-ID', session.user.id)
        .single()
      
      if (userError) {
        console.error('Error fetching user data:', userError)
        throw userError
      }

      setUserName(userData?.name)

      // Get all friendships where user is involved
      const { data: friendshipsData, error } = await supabase
        .from('Friendships')
        .select('*')
        .or(`requester-ID.eq.${session.user.id},receiver-ID.eq.${session.user.id}`)
        .returns<FriendshipEntry[]>()

      if (error) throw error


      if (friendshipsData) {
        friendshipsData.map(async (friendship) => {
          const nonUserId = session.user.id === friendship['requester-ID'] ? friendship['receiver-ID'] : friendship['requester-ID']

          const { data: profilesData, error: profilesError } = await supabase
            .from('Profile')
            .select('*')
            .eq('User-ID', nonUserId)
            .single()

          if (profilesError) {
            console.error('Error fetching profiles:', profilesError)
            throw profilesError
          }

          const friendName = profilesData.name

          const { data: imagesData, error: imagesError } = await supabase
            .from('Images')
            .select('*')
            .eq('P-ID', profilesData['P-ID'])
            .returns<{ url: string }[]>()
            
          if (imagesError) {
            console.error('Error fetching images:', imagesError)
            throw imagesError
          }

          const images = imagesData.map((image) => ({url: image.url}))

          const friendshipDataEntry: FriendshipWithProfileAndImages = {
            'friendship-id': friendship['friendship-id'],
            status: friendship.status,
            'requester-ID': friendship['requester-ID'],
            'receiver-ID': friendship['receiver-ID'],
            friendName: friendName,
            userName: userName!,
            images: images,
            ...profilesData
          }

          if (friendship.status === 'accepted') {
            const { data: phoneData, error: phoneError } = await supabase
              .from('PhoneNumbers')
              .select('phone_number')
              .eq('User-ID', nonUserId)
              .single()

            if (phoneError) {
              console.error('Error fetching phone number:', phoneError)
              throw phoneError
            }

            friendshipDataEntry.displayedPhone = phoneData?.phone_number
          }

          setFriendships((prev) => [...prev, friendshipDataEntry])
        })

        if (error) throw error
        if (!friendshipsData) return
      }
    } catch (error) {
      console.error('Error loading friendships:', error)
      Alert.alert('Error', 'Failed to load friendships')
    } finally {
      setLoading(false)
    }
  }


  const handleAccept = async (friendshipId: string) => {
    await Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    )
    try {
      const { error } = await supabase
        .from('Friendships')
        .update({ status: 'accepted' })
        .eq('friendship-id', friendshipId)

      if (error) throw error
      loadFriendships()
    } catch (error) {
      console.error('Error accepting friendship:', error)
      Alert.alert('Error', 'Failed to accept request')
    }
  }

  const handleDecline = async (friendshipId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    try {
      const { error } = await supabase
        .from('Friendships')
        .delete()
        .eq('friendship-id', friendshipId)

      if (error) throw error
      loadFriendships()
    } catch (error) {
      console.error('Error declining friendship:', error)
      Alert.alert('Error', 'Failed to decline request')
    }
  }

  const handleMessage = async (profile: FriendshipWithProfile, platform: string) => {
    if (!profile.displayedPhone) return
    try {
      const messageBy = userName
      await openMessaging(platform, profile.displayedPhone, messageBy)
    } catch (error) {
      console.error('Error opening messaging:', error)
      Alert.alert('Error', 'Could not open messaging')
    }
  }

  const handleCopyNumber = async (friend: FriendshipWithProfileAndImages) => {
    if (!friend.displayedPhone) return
    await Clipboard.setStringAsync(friend.displayedPhone)
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    Alert.alert('Copied!', 'Phone number copied to clipboard')
  }

  // Helper functions to filter friendships
  const incomingRequests = friendships.filter(f =>
    f.status === 'pending' && f['receiver-ID'] === session?.user?.id
  )

  const outgoingRequests = friendships.filter(f =>
    f.status === 'pending' && f['requester-ID'] === session?.user?.id
  )

  const acceptedFriendships = friendships.filter(f =>
    f.status === 'accepted'
  )

  const onRefresh = React.useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setRefreshing(true)
    setFriendships([])
    await loadFriendships()
    setRefreshing(false)
  }, [])

  const handleInspect = (profile: FriendshipWithProfileAndImages) => {
    setIsInspecting(profile)
  }

  const handleCloseInspect = () => {
    setIsInspecting(null)
  }

  const handleDeleteFriend = (friend: FriendshipWithProfileAndImages) => {
    Alert.alert(
      'Freund entfernen',
      `Bist du dir sicher, dass du ${friend.friendName} als Freund entfernen willst?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Entfernen',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('Friendships')
                .delete()
                .eq('friendship-id', friend['friendship-id'])

              if (error) throw error
              loadFriendships()
            } catch (error) {
              console.error('Error removing friend:', error)
              Alert.alert('Error', 'Failed to remove friend')
            }
          }
        }
      ]
    )
  }

  const EmptyFriendsList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        Hier sieht's noch ziemlich leer aus. Suche im Feed Studenten mit ähnlichen Interessen und schicke ihnen eine Freundschaftsanfrage.
      </Text>
      <TouchableOpacity 
        style={styles.findButton}
        onPress={() => router.push('/(auth)/home')}
      >
        <Ionicons name="people" size={20} color={colors.text.light} />
        <Text style={styles.findButtonText}>Studenten finden</Text>
      </TouchableOpacity>
    </View>
  )

  const renderFriendCard = (item: FriendshipWithProfileAndImages) => (
    <View key={item['friendship-id']} style={styles.friendCard}>
      <LinearGradient
        colors={[colors.background.secondary, colors.background.secondary]}
        style={styles.friendCardContent}
      >
        <TouchableOpacity 
          style={styles.friendHeader}
          onPress={() => handleInspect(item)}
        >
          {item.images?.[0] && (
            <Image 
              src={item.images[0].url}
              style={styles.profileImage}
            />
          )}
          <View style={styles.friendInfo}>
            <Text style={styles.name}>{item.friendName}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                <Text style={styles.statusDot}>●{' '}</Text>
                Verbunden
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={34} color={colors.text.secondary} />
        </TouchableOpacity>

        {item.displayedPhone && (
          <View style={styles.phoneContainer}>
            <Text style={styles.phone}>{item.displayedPhone}</Text>
            <TouchableOpacity onPress={() => handleCopyNumber(item)}>
              <Ionicons name="copy-outline" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.messageSection}>
          <Text style={styles.messageLabel}>ANSCHREIBEN VIA</Text>
          <View style={styles.messageButtons}>
            <TouchableOpacity 
              style={[styles.messageButton, styles.whatsappButton]}
              onPress={() => handleMessage(item, 'whatsapp')}
            >
              <Ionicons name="logo-whatsapp" size={20} color={'#25D366'} />
              <Text style={styles.whatsappButtonText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.messageButton, styles.smsButton]}
              onPress={() => handleMessage(item, 'sms')}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.text.primary} />
              <Text style={styles.smsButtonText}>SMS</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteFriend(item)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.text.light} />
            <Text style={styles.deleteButtonText}>Freund Entfernen</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaWrapper>
      {isInspecting ? (
        <View style={styles.container}>
          <View style={styles.header}
           onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setHeaderHeight(height);
          }}
        >
            <TouchableOpacity onPress={handleCloseInspect} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profil</Text>
          </View>
          <ProfileCard 
            profile={{
              'P-ID': isInspecting['P-ID'],
              'User-ID': isInspecting['User-ID'],
              name: isInspecting.friendName,
              major: isInspecting.major,
              description: isInspecting.description || '',
              tags: isInspecting.tags || [],
              preferences: isInspecting.preferences || [],
              degreeType: isInspecting.degreeType,
              images: isInspecting.images,
            }} 
            preview={true}
            style={{ height: SCREEN_HEIGHT - FACTOR * headerHeight - BOTTOM_NAV_HEIGHT}}
          />
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Avanti</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://policiesavanti.vercel.app/')}>
              <Ionicons name="shield-checkmark" size={28} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.accent.primary}
              />
            }
          >
            {/* Requests Section - Horizontal Scrolling */}
            {(incomingRequests.length > 0 || outgoingRequests.length > 0) && (
              <View style={styles.requestsSection}>
                <Text style={styles.sectionTitle}>Ausstehende Anfragen</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.requestsScroll}
                >
                  {[...incomingRequests, ...outgoingRequests].map(request => (
                    <View key={request['friendship-id']} style={styles.requestCard}>
                      <LinearGradient
                        colors={[colors.background.secondary, colors.background.secondary]}
                        style={styles.requestCardContent}
                      >
                        <TouchableOpacity 
                          style={styles.friendHeader}
                          onPress={() => handleInspect(request)}
                        >
                          {request.images[0] && (
                            <Image 
                              source={{ uri: request.images[0].url }}
                              style={styles.profileImage}
                            />
                          )}
                          <View style={styles.friendInfo}>
                            <Text style={styles.name}>{request.friendName}</Text>
                            <View style={styles.badge}>
                              <Text style={styles.badgeText}>
                                <Text style={styles.statusDot}>●{' '}</Text>
                                {request['receiver-ID'] === session?.user?.id ? 'Neue Anfrage' : 'Gesendet'}
                              </Text>
                            </View>
                          </View>
                          <Ionicons name="chevron-forward" size={34} color={colors.text.secondary} />
                        </TouchableOpacity>

                        <View style={styles.actionButtons}>
                          {request['receiver-ID'] === session?.user?.id ? (
                            <>
                              <TouchableOpacity 
                                style={[styles.button, styles.acceptButton]}
                                onPress={() => handleAccept(request['friendship-id'])}
                              >
                                <Ionicons name="checkmark" size={20} color={colors.text.light} />
                              </TouchableOpacity>
                              <TouchableOpacity 
                                style={[styles.button, styles.declineButton]}
                                onPress={() => handleDecline(request['friendship-id'])}
                              >
                                <LinearGradient
                                  colors={['#FE3C72', '#FF2D55']}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 0 }}
                                  style={StyleSheet.absoluteFill}
                                />
                                <Ionicons name="close" size={20} color={colors.text.light} />
                              </TouchableOpacity>
                            </>
                          ) : (
                            <TouchableOpacity 
                              style={[styles.button, styles.declineButton]}
                              onPress={() => handleDecline(request['friendship-id'])}
                            >
                              <LinearGradient
                                colors={['#FE3C72', '#FF2D55']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                              />
                              <Ionicons name="trash-outline" size={20} color={colors.text.light} />
                              <Text style={styles.buttonText}>Zurückziehen</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </LinearGradient>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Friends List - Vertical Scrolling */}
            <View style={[
              styles.friendsSection, 
              !(incomingRequests.length > 0 || outgoingRequests.length > 0) && { marginTop: 0 }
            ]}>
              <Text style={styles.sectionTitle}>Freunde</Text>
              {acceptedFriendships.length === 0 ? (
                <EmptyFriendsList />
              ) : (
                <View>
                  {acceptedFriendships.map(renderFriendCard)}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: 16,
    paddingBottom: 5,
    paddingTop: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
  },
  requestsSection: {
    paddingHorizontal: 16,
  },
  friendsSection: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 24,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  requestsScroll: {
    paddingRight: 16,
    gap: 12,
  },
  requestCard: {
    width: 260,
  },
  friendCard: {
    marginBottom: 12,
  },
  requestCardContent: {
    padding: 10,
    borderRadius: 16,
  },
  friendCardContent: {
    padding: 16,
    borderRadius: 16,
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  badge: {
    backgroundColor: colors.accent.primary + '10',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  badgeText: {
    color: colors.accent.primary,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phone: {
    fontSize: 14,
    color: colors.text.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    minWidth: 100,
  },
  acceptButton: {
    backgroundColor: colors.accent.primary,
  },
  declineButton: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  messageSection: {
    marginTop: 16,
  },
  messageLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  messageButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 20,
    maxHeight: 40,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 20,
    maxHeight: 40,
    backgroundColor: '#FF2D55',
    marginTop: 10,
  },
  deleteButtonText: {
    color: colors.text.light,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  whatsappButton: {
    borderWidth: 1,
    borderColor: '#25D366',
  },
  smsButton: {
    borderWidth: 1,
    borderColor: colors.text.primary,
  },
  smsButtonText: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  whatsappButtonText: {
    color: '#25D366',
    fontSize: 13,
    fontWeight: '600',
  },
  buttonText: {
    color: colors.text.light,
    fontSize: 14,
    fontWeight: '600',
  },
  friendItem: {
    marginBottom: 12,
    marginHorizontal: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  backButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  findButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  findButtonText: {
    color: colors.text.light,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statusDot: {
    fontSize: 8,
    color: colors.accent.primary,
    includeFontPadding: false,
    textAlignVertical: 'center',
    marginBottom: 2,
  },
}) 