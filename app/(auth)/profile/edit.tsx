import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { SafeAreaWrapper } from '../../../components/SafeAreaWrapper'
import { useAuth } from '../../../lib/context/auth'
import { supabase } from '../../../lib/supabase/supabase'
import * as ImagePicker from 'expo-image-picker'
import { decode } from 'base64-arraybuffer'
import { EditScreen } from './components/EditScreen'
import { PreviewScreen } from './components/PreviewScreen'
import type { FullProfileData } from './types'
import { uploadImage } from '../../../lib/utils/imageUpload'

type ViewMode = 'edit' | 'preview'

type EditProfileProps = {
  profile: FullProfileData
  onClose: () => void
  onSave: (profile: FullProfileData) => void
}

export function EditProfile({ profile: initialProfile, onClose, onSave }: EditProfileProps) {
  const { session } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  const [profile, setProfile] = useState(initialProfile)

  
  
  const handleSave = async () => {
    try {
      if (!profile || !session?.user?.id) return

      const { error } = await supabase
        .from('Profile')
        .update({
          name: profile.name,
          major: profile.major,
          description: profile.description,
          tags: profile.tags
        })
        .eq('User-ID', session.user.id)

      if (error) throw error
      onSave(profile)
    } catch (error) {
      console.error('Error saving profile:', error)
      Alert.alert('Error', 'Failed to save profile')
    }
  }

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.7,
        base64: true
      })

      if (!result.canceled && result.assets[0].base64) {
        const newImage = await uploadImage({
          base64Image: result.assets[0].base64,
          userId: session!.user.id,
          profileId: profile['P-ID']
        })

        // Update local state with the new image
        setProfile({
          ...profile,
          images: [...profile.images, newImage]
        })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      Alert.alert('Error', 'Failed to upload image')
    }
  }

  const handleDeleteImage = async (imageUrl: string) => {
    if (!profile || profile.images.length <= 2) {
      console.log('more than 2 images required')
      Alert.alert('Error', 'Minimum 2 images required')
      return
    }

    const { error } = await supabase.storage
      .from('public-images')
      .remove([imageUrl])

    if (error) throw error

    const { error: imageError } = await supabase
      .from('Images')
      .delete()
      .eq('url', imageUrl)

    if (imageError) throw imageError

    console.log('image deleted', imageUrl)

    setProfile({
      ...profile,
      images: profile.images.filter(img => img.url !== imageUrl)
    })
  }

  const handleProfileUpdate = (updates: Partial<FullProfileData>) => {
    console.log('Profile updated')
    setProfile(prev => prev && { ...prev, ...updates })
  }

  console.log('profile in edit', profile)
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <View style={styles.viewToggle}>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'edit' && styles.activeToggle]}
            onPress={() => setViewMode('edit')}
          >
            <Text style={styles.toggleText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'preview' && styles.activeToggle]}
            onPress={() => setViewMode('preview')}
          >
            <Text style={styles.toggleText}>Preview</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.doneButton}>Done</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {viewMode === 'edit' ? (
          <EditScreen 
            profile={profile}
            onDeleteImage={handleDeleteImage}
            onImagePick={handleImagePick}
            onProfileUpdate={handleProfileUpdate}
          />
        ) : (
          <PreviewScreen profile={profile} />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  cancelButton: {
    fontSize: 17,
    color: '#007AFF',
  },
  doneButton: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
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
  toggleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}) 