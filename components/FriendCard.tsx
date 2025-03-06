import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type Props = {
  friendship: {
    'friendship-id': string
    requester: { name: string }
    receiver: { name: string }
    'requester-ID': string
    'receiver-ID': string
  }
  onUnfriend: (id: string) => void
}

export function FriendCard({ friendship, onUnfriend }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={24} color="#666" />
        </View>
        <Text style={styles.name}>
          {friendship.requester.name}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.unfriendButton}
        onPress={() => onUnfriend(friendship['friendship-id'])}
      >
        <Ionicons name="person-remove-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  unfriendButton: {
    padding: 8,
  },
}) 