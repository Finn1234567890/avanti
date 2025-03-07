import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, RefreshControl } from 'react-native'
import { SafeAreaWrapper } from '../../../components/SafeAreaWrapper'
import { useAuth } from '../../../lib/context/auth'
import { supabase } from '../../../lib/supabase/supabase'
import * as Haptics from 'expo-haptics'
import { openMessaging } from '../../../lib/utils/messaging'
import * as Clipboard from 'expo-clipboard'
import { Ionicons } from '@expo/vector-icons'

type TabType = 'incoming' | 'outgoing' | 'friends'

export type FriendshipWithProfile = {
  'friendship-id': string
  status: string
  'requester-ID': string
  'receiver-ID': string
  requester: {
    name: string
  }
  receiver: {
    name: string
  }
  displayedPhone?: string
}

export default function Friends() {
  const { session } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('friends')
  const [friendships, setFriendships] = useState<FriendshipWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadFriendships()
  }, [])

  const loadFriendships = async () => {
    try {
      if (!session?.user?.id) return

      const { data, error } = await supabase
        .from('Friendships')
        .select(`
          friendship-id,
          status,
          requester-ID,
          receiver-ID
        `)
        .or(`requester-ID.eq.${session.user.id},receiver-ID.eq.${session.user.id}`)
        .returns<FriendshipWithProfile[]>()

      if (error) throw error
      if (!data) return

      console.log(data)

      data.forEach(async (friendship) => {
        const requesterId: string = friendship['requester-ID']
        const receiverId = friendship['receiver-ID']

        const { data: requesterName, error: requesterNameError } = await supabase
          .from('Profile')
          .select('name')
          .eq('User-ID', requesterId)
          .single()

        if (requesterNameError) throw requesterNameError

        const { data: receiverName, error: receiverNameError } = await supabase
          .from('Profile')
          .select('name')
          .eq('User-ID', receiverId)
          .single()

        if (receiverNameError) throw receiverNameError


        if (requesterName && receiverName) {

          const friendId = session.user.id === requesterId ? receiverId : requesterId
          const phoneNumber = await getPhoneNumber(friendId)

          console.log("Phone Number: ", phoneNumber)

          const friendshipData: FriendshipWithProfile = {
            'friendship-id': data[0]['friendship-id'],
            status: data[0]!.status,
            'requester-ID': data[0]['requester-ID'],
            'receiver-ID': data[0]['receiver-ID'],
            requester: {
              name: requesterName.name,
            },
            receiver: {
              name: receiverName.name,
            },
            displayedPhone: phoneNumber
          }

          setFriendships(friendships => [...friendships, friendshipData])
        }
      })


    } catch (error) {
      console.error('Error loading friendships:', error)
      Alert.alert('Error', 'Failed to load friendships')
    } finally {
      setLoading(false)
    }
  }

  const getPhoneNumber = async (friendId: string) => {
    const { data: phoneData, error: phoneError } = await supabase
      .from('PhoneNumbers')
      .select('phone_number')
      .eq('User-ID', friendId)
      .single()

    if (phoneError) return undefined

    return phoneData?.phone_number
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
      const messageBy = session?.user?.id === profile['requester-ID'] ? profile.requester.name : profile.receiver.name
      await openMessaging(platform, profile.displayedPhone, messageBy)
    } catch (error) {
      console.error('Error opening messaging:', error)
      Alert.alert('Error', 'Could not open messaging')
    }
  }

  const filteredFriendships = friendships.filter(friendship => {
    switch (activeTab) {
      case 'incoming':
        return friendship.status === 'pending' && friendship['receiver-ID'] === session?.user?.id
      case 'outgoing':
        return friendship.status === 'pending' && friendship['requester-ID'] === session?.user?.id
      case 'friends':
        return friendship.status === 'accepted'
    }
  })

  const onRefresh = React.useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setRefreshing(true)
    setFriendships([])
    await loadFriendships()
    setRefreshing(false)
  }, [])

  const renderFriendItem = ({ item }: { item: FriendshipWithProfile }) => {
    const isRequester = item['requester-ID'] === session?.user?.id
    const profile = isRequester ? item.receiver : item.requester

    const handleCopyNumber = async () => {
      if (!item.displayedPhone) return
      await Clipboard.setStringAsync(item.displayedPhone)
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Alert.alert('Copied!', 'Phone number copied to clipboard')
    }

    return (
      <View style={styles.friendItem}>
        <View style={styles.friendInfo}>
          <Text style={styles.name}>{profile.name}</Text>
          {item.status === 'accepted' && item.displayedPhone && (
            <View style={styles.phoneContainer}>
              <Text style={styles.phone}>{item.displayedPhone}</Text>
              <TouchableOpacity 
                onPress={handleCopyNumber}
                style={styles.copyButton}
              >
                <Ionicons name="copy-outline" size={18} color="#666" />
              </TouchableOpacity>
            </View>
          )}
          {item.status === 'pending' && (
            <View style={styles.actionButtons}>
              {!isRequester ? (
                <>
                  <TouchableOpacity
                    style={[styles.button, styles.acceptButton]}
                    onPress={() => handleAccept(item['friendship-id'])}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.declineButton]}
                    onPress={() => handleDecline(item['friendship-id'])}
                  >
                    <Text style={styles.buttonText}>Decline</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.button, styles.declineButton]}
                  onPress={() => handleDecline(item['friendship-id'])}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {item.status === 'accepted' && (
            <TouchableOpacity
              style={[styles.button, styles.declineButton]}
              onPress={() => handleDecline(item['friendship-id'])}
            >
              <Text style={styles.buttonText}>Unfriend</Text>
            </TouchableOpacity>
          )}
          {item.status === 'accepted' && (
            <View>
              <TouchableOpacity
                style={styles.messageButton}
                onPress={() => handleMessage(item, 'whatsapp')}
              >
                <Text style={styles.messageButtonText}>Message WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.messageButton}
                onPress={() => handleMessage(item, 'sms')}
              >
                <Text style={styles.messageButtonText}>Message SMS</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    )
  }

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
            onPress={() => setActiveTab('friends')}
          >
            <Text style={styles.tabText}>Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'incoming' && styles.activeTab]}
            onPress={() => setActiveTab('incoming')}
          >
            <Text style={styles.tabText}>Incoming</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'outgoing' && styles.activeTab]}
            onPress={() => setActiveTab('outgoing')}
          >
            <Text style={styles.tabText}>Outgoing</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredFriendships}
          renderItem={renderFriendItem}
          keyExtractor={item => item['friendship-id']}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#007AFF"
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {loading ? 'Loading...' : 'No requests found'}
            </Text>
          }
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
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#333',
  },
  list: {
    padding: 16,
  },
  friendItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    marginBottom: 12,
  },
  friendInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
  declineButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  phone: {
    fontSize: 14,
    color: '#666',
  },
  copyButton: {
    padding: 4,
    marginLeft: 8,
  },
  messageButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
}) 