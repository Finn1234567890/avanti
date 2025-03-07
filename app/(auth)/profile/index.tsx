import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { useAuth } from '../../../lib/context/auth'
import { supabase } from '../../../lib/supabase/supabase'
import { SafeAreaWrapper } from '../../../components/SafeAreaWrapper'
import { router } from 'expo-router'
import { EditProfile } from './edit'
import type { Profile, FullProfileData } from './types'

export default function Profile() {
  const { session, signOut } = useAuth()
  const [profile, setProfile] = useState<FullProfileData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    try {
      if (!session?.user?.id) return

      const { data, error } = await supabase
        .from('Profile')
        .select('tags, name, major, P-ID, User-ID, created_at, description')
        .eq('User-ID', session.user.id)
        .single()
        .returns<Profile>()

      if (error) throw error

      const { data: images, error: imagesError } = await supabase
        .from('Images')
        .select('url')
        .eq('P-ID', data['P-ID'])

      if (imagesError) throw imagesError

      const imagesWithUrls = await Promise.all(
        images.map(async (img) => {
          const { data: publicUrl } = supabase.storage
            .from('public-images')
            .getPublicUrl(img.url)
          return {
            url: img.url,
            publicUrl: publicUrl.publicUrl
          }
        })
      )

      setProfile({
        ...data,
        images: imagesWithUrls
      })
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.rpc('delete_user_account')
              
              if (error) throw error

              // Account deleted successfully, sign out
              await signOut()
              router.replace('/(public)/welcome')
            } catch (e) {
              console.error('Error deleting account:', e)
              Alert.alert('Error', 'Failed to delete account. Please try again.')
            }
          }
        }
      ]
    )
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      await signOut()
      router.replace('/(public)/welcome')
    } catch (error) {
      console.error('Error signing out:', error)
      Alert.alert('Error', 'Failed to sign out')
    }
  }

  return (
    <SafeAreaWrapper>
      {isEditing ? (
        <EditProfile 
          profile={profile!}
          onClose={() => setIsEditing(false)}
          onSave={(updatedProfile) => {
            setProfile(updatedProfile)
            setIsEditing(false)
          }}
        />
      ) : (
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <View style={styles.profileImageContainer}>
              {profile?.images[0] && (
                <Image 
                  source={{ uri: profile.images[0].url }}
                  style={styles.profileImage}
                />
              )}
              {!loading && (
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={styles.editButtonText}>✎</Text>
                </TouchableOpacity>
              )}
            </View>
            
              <>
                <Text style={styles.name}>{profile?.name}</Text>
                <Text style={styles.major}>{profile?.major}</Text>
              </>
            
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.logoutButton]} 
              onPress={handleSignOut}
            >
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.deleteButton]} 
              onPress={handleDeleteAccount}
            >
              <Text style={styles.buttonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  editButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  major: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#FF9500',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nameSkeleton: {
    width: 150,
    height: 24,
    marginBottom: 4,
  },
  majorSkeleton: {
    width: 100,
    height: 16,
  },
}) 