import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { SafeAreaWrapper } from '../SafeAreaWrapper'
import { useAuth } from '../../lib/context/auth'
import { supabase } from '../../lib/supabase/supabase'
import * as ImagePicker from 'expo-image-picker'
import { decode } from 'base64-arraybuffer'
import { EditScreen } from '@/components/profile/EditScreen'
import { PreviewScreen } from '@/components/profile/PreviewScreen'
import type { FullProfileData } from '../../types/profile/types'
import { uploadImage } from '../../lib/utils/imageUpload'
import { colors } from '../../lib/theme/colors'
import { Ionicons } from '@expo/vector-icons'

export type ViewMode = 'edit' | 'preview'

type EditProfileProps = {
  profile: FullProfileData
  onClose: () => void
  onSave: (profile: FullProfileData) => void
  view: ViewMode
}

export function EditProfile({ profile: initialProfile, onClose, onSave, view }: EditProfileProps) {
  const { session } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>(view)
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
          tags: profile.tags,
          preferences: profile.preferences,
          semester: profile.semester,
          degree_type: profile.degreeType
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
      Alert.alert('Error', 'Fehler beim Hochladen des Bildes')
    }
  }

  const handleDeleteImage = async (imageUrl: string) => {
    if (!profile || profile.images.length <= 2) {
      Alert.alert('Error', 'Mindestens 2 Bilder benötigt')
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

    setProfile({
      ...profile,
      images: profile.images.filter(img => img.url !== imageUrl)
    })
  }

  const handleProfileUpdate = (updates: Partial<FullProfileData>) => {
    setProfile(prev => prev && { ...prev, ...updates })
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.headerButton}>ABBRUCH</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.headerButton]}>FERTIG</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={styles.tabButton}
            onPress={() => setViewMode('edit')}
          >
            <Text style={[
              styles.tabText,
              viewMode === 'edit' && styles.activeTabText
            ]}>Bearbeiten</Text>
            {viewMode === 'edit' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.tabButton}
            onPress={() => setViewMode('preview')}
          >
            <Text style={[
              styles.tabText,
              viewMode === 'preview' && styles.activeTabText
            ]}>Vorschau</Text>
            {viewMode === 'preview' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        </View>
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
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: colors.background.primary,
  },
  headerButton: {
    paddingTop: 0,
    fontWeight: '600',
    fontSize: 12,
    color: colors.accent.primary,
  },
  doneButton: {
    fontWeight: '600',
  },
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  tabButton: {
    position: 'relative',
    marginHorizontal: 12,
    paddingVertical: 6,
    paddingBottom: 6,
  },
  tabText: {
    fontSize: 18,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.accent.primary,
    fontWeight: '500',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.accent.primary,
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
}) 