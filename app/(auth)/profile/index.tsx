import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native'
import { useAuth } from '../../../lib/context/auth'
import { supabase } from '../../../lib/supabase/supabase'
import { router } from 'expo-router'

interface ProfileData {
  'P-ID': number
}

export default function Profile() {
  const { session } = useAuth()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.replace('/(public)/register')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!session?.user?.id) {
                console.log('No user session found')
                throw new Error('No user session')
              }

              console.log('Starting account deletion for user:', session.user.id)

              // 1. Delete the entire user folder from storage
              console.log('Deleting storage folder...')
              const { error: storageError } = await supabase.storage
                .from('profile-images')
                .remove([`${session.user.id}`])

              if (storageError) {
                console.error('Storage deletion error:', storageError)
              }

              // 2. Delete user via secure database function
              const { error: deleteError } = await supabase.rpc('delete_user_account')

              if (deleteError) {
                console.error('User deletion error:', deleteError)
                throw deleteError
              }

              // 3. Sign out and redirect
              await supabase.auth.signOut()
              router.replace('/(public)/register')
            } catch (error) {
              console.error('Error in delete account flow:', error)
              Alert.alert('Error', 'Failed to delete account. Please try again.')
            }
          }
        }
      ]
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={handleDeleteAccount}
      >
        <Text style={styles.buttonText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logoutButton: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 8,
    width: 200,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}) 