import AsyncStorage from '@react-native-async-storage/async-storage'

export const StorageKeys = {
  HAS_SEEN_TUTORIAL: 'has_seen_tutorial',
  // Add other storage keys here
} as const

export const Storage = {
  async setHasSeenTutorial(value: boolean) {
    try {
      await AsyncStorage.setItem(StorageKeys.HAS_SEEN_TUTORIAL, JSON.stringify(value))
    } catch (error) {
      console.error('Error saving tutorial state:', error)
    }
  },

  async getHasSeenTutorial(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(StorageKeys.HAS_SEEN_TUTORIAL)
      return value ? JSON.parse(value) : false
    } catch (error) {
      console.error('Error getting tutorial state:', error)
      return false
    }
  }
} 