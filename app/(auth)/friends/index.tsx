import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, RefreshControl, ScrollView, Image } from 'react-native'
import { SafeAreaWrapper } from '../../../components/SafeAreaWrapper'
import { useAuth } from '../../../lib/context/auth'
import { supabase } from '../../../lib/supabase/supabase'
import * as Haptics from 'expo-haptics'
import { openMessaging } from '../../../lib/utils/messaging'
import * as Clipboard from 'expo-clipboard'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../../../lib/theme/colors'
import type { ProfileEntry } from '../profile/types'
import { Profile } from '../home/types'


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


export default function Friends() {
  const { session } = useAuth()
  const [friendships, setFriendships] = useState<FriendshipWithProfileAndImages[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  useEffect(() => {
    loadFriendships()
  }, [])

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

      console.log('logged in user name', userData?.name)
      console.log('session.user.id', session.user.id)

      setUserName(userData?.name)

      // Get all friendships where user is involved
      const { data: friendshipsData, error } = await supabase
        .from('Friendships')
        .select('*')
        .or(`requester-ID.eq.${session.user.id},receiver-ID.eq.${session.user.id}`)
        .returns<FriendshipEntry[]>()

      if (error) throw error

      console.log('friendshipsData', friendshipsData)

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

          console.log('friendshipDataEntry', friendshipDataEntry)

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
      const messageBy = profile.userName
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

  console.log('Friendships', friendships)

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Avanti</Text>
          <Ionicons name="shield-checkmark" size={28} color={colors.text.primary} />
        </View>

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
                    {request.images[0] && (
                      <Image 
                        source={{ uri: request.images[0].url }}
                        style={styles.profileImage}
                      />
                    )}
                    <Text style={styles.name}>{request.friendName}</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {request['receiver-ID'] === session?.user?.id ? 'Neue Anfrage' : 'Gesendet'}
                      </Text>
                    </View>
                    <View style={styles.actionButtons}>
                      {request['receiver-ID'] === session?.user?.id ? (
                        <>
                          <TouchableOpacity 
                            style={[styles.button, styles.acceptButton]}
                            onPress={() => handleAccept(request['friendship-id'])}
                          >
                            <Text style={styles.buttonText}>Annehmen</Text>
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
                            <Text style={styles.buttonText}>Zurückziehen</Text>
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
        <View style={styles.friendsSection}>
          <Text style={styles.sectionTitle}>Freunde</Text>
          <FlatList
            data={acceptedFriendships}
            renderItem={({ item }) => (
              <View style={styles.friendCard}>
                <LinearGradient
                  colors={[colors.background.secondary, colors.background.secondary]}
                  style={styles.friendCardContent}
                >
                  <View style={styles.friendHeader}>
                    {item.images?.[0] && (
                      <Image 
                        src={item.images[0].url}
                        style={styles.profileImage}
                      />
                    )}
                    <View style={styles.friendInfo}>
                      <Text style={styles.name}>{item.friendName}</Text>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>Verbunden</Text>
                      </View>
                    </View>
                  </View>

                  {item.displayedPhone && (
                    <View style={styles.phoneContainer}>
                      <Text style={styles.phone}>{item.displayedPhone}</Text>
                      <TouchableOpacity onPress={() => handleCopyNumber(item)}>
                        <Ionicons name="copy-outline" size={20} color={colors.text.secondary} />
                      </TouchableOpacity>
                    </View>
                  )}

                  <View style={styles.messageButtons}>
                    <TouchableOpacity 
                      style={[styles.messageButton, styles.whatsappButton]}
                      onPress={() => handleMessage(item, 'whatsapp')}
                    >
                      <Ionicons name="logo-whatsapp" size={24} color={colors.text.light} />
                      <Text style={styles.messageButtonText}>WhatsApp</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.messageButton, styles.smsButton]}
                      onPress={() => handleMessage(item, 'sms')}
                    >
                      <Ionicons name="chatbubble-outline" size={24} color={colors.text.light} />
                      <Text style={styles.messageButtonText}>SMS</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.accent.primary}
              />
            }
          />
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
  header: {
    padding: 16,
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
    width: 200,
    minHeight: 140,
  },
  friendCard: {
    marginBottom: 12,
  },
  requestCardContent: {
    padding: 16,
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
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  badge: {
    backgroundColor: colors.accent.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.accent.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  phone: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: colors.accent.primary,
  },
  declineButton: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  messageButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  smsButton: {
    backgroundColor: colors.accent.primary,
  },
  messageButtonText: {
    color: colors.text.light,
    fontSize: 14,
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
    marginBottom: 12,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
}) 