import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native'
import { useAuth } from '../../../lib/context/auth'
import { supabase } from '../../../lib/supabase/supabase'
import { SafeAreaWrapper } from '../../../components/SafeAreaWrapper'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { decode } from 'base64-arraybuffer'
import DraggableGrid from './components/DraggableGrid'
import { debounce } from 'lodash'

type Profile = {
  name: string
  major: string
  description: string
  tags: string[]
  images: { url: string }[]
}

export default function Profile() {
  const { session, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>({
    name: '',
    major: '',
    description: '',
    tags: [],
    images: []
  })
  const [editingTag, setEditingTag] = useState('')

  // Debounced save functions
  const saveField = debounce(async (field: string, value: any) => {
    try {
      const { error } = await supabase
        .from('Profile')
        .update({ [field]: value })
        .eq('User-ID', session?.user?.id)

      if (error) throw error
    } catch (error) {
      console.error(`Error saving ${field}:`, error)
      Alert.alert('Error', `Failed to save ${field}`)
    }
  }, 500)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      if (!session?.user?.id) return

      const { data, error } = await supabase
        .from('Profile')
        .select('*')
        .eq('User-ID', session.user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
      Alert.alert('Error', 'Failed to load profile')
    }
  }

  const handleImagePick = async () => {
    try {
      if (!profile || profile.images.length >= 6) {
        Alert.alert('Error', 'Maximum 6 images allowed')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.7,
        base64: true
      })

      if (!result.canceled && result.assets[0].base64) {
        const { data, error } = await supabase.storage
          .from('profile-images')
          .upload(
            `${session?.user?.id}/${Date.now()}.jpg`,
            decode(result.assets[0].base64),
            { contentType: 'image/jpeg' }
          )

        if (error) throw error

        const { error: updateError } = await supabase
          .from('Profile')
          .update({
            images: [...profile.images, { url: data.path }]
          })
          .eq('User-ID', session?.user?.id)

        if (updateError) throw updateError
        loadProfile()
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      Alert.alert('Error', 'Failed to upload image')
    }
  }

  const handleDeleteImage = async (imageUrl: string) => {
    try {
      if (!profile || profile.images.length <= 2) {
        Alert.alert('Error', 'Minimum 2 images required')
        return
      }

      const { error } = await supabase
        .from('Profile')
        .update({
          images: profile.images.filter(img => img.url !== imageUrl)
        })
        .eq('User-ID', session?.user?.id)

      if (error) throw error
      loadProfile()
    } catch (error) {
      console.error('Error deleting image:', error)
      Alert.alert('Error', 'Failed to delete image')
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
              const { error } = await supabase
                .from('Users')
                .delete()
                .eq('id', session?.user?.id)

              if (error) throw error
              signOut()
            } catch (error) {
              console.error('Error deleting account:', error)
              Alert.alert('Error', 'Failed to delete account')
            }
          }
        }
      ]
    )
  }

  const handleImagesReorder = async (newOrder: { url: string }[]) => {
    try {
      const { error } = await supabase
        .from('Profile')
        .update({ images: newOrder })
        .eq('User-ID', session?.user?.id)

      if (error) throw error
      setProfile(prev => prev ? { ...prev, images: newOrder } : null)
    } catch (error) {
      console.error('Error reordering images:', error)
      Alert.alert('Error', 'Failed to reorder images')
    }
  }

  const handleAddTag = () => {
    if (!editingTag.trim() || !profile) return

    const newTags = [...profile.tags, editingTag.trim()]
    setProfile(prev => prev ? { ...prev, tags: newTags } : null)
    saveField('tags', newTags)
    setEditingTag('')
  }

  const handleRemoveTag = (index: number) => {
    if (!profile) return

    const newTags = profile.tags.filter((_, i) => i !== index)
    setProfile(prev => prev ? { ...prev, tags: newTags } : null)
    saveField('tags', newTags)
  }

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container}>
        {profile && (
          <>
            <View style={styles.header}>
              {profile.images?.[0] && (
                <Image 
                  source={{ uri: profile.images[0].url }} 
                  style={styles.profileImage}
                />
              )}
              <TextInput
                style={styles.nameInput}
                value={profile.name || ''}
                onChangeText={(text) => {
                  setProfile(prev => prev ? { ...prev, name: text } : null)
                  saveField('name', text)
                }}
                placeholder="Your name"
              />
              <TextInput
                style={styles.majorInput}
                value={profile.major || ''}
                onChangeText={(text) => {
                  setProfile(prev => prev ? { ...prev, major: text } : null)
                  saveField('major', text)
                }}
                placeholder="Your major"
              />
            </View>

            <DraggableGrid
              data={profile.images || []}
              onReorder={handleImagesReorder}
              onDelete={handleDeleteImage}
              onAdd={handleImagePick}
              maxItems={6}
              minItems={2}
            />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <TextInput
                style={styles.descriptionInput}
                value={profile.description || ''}
                onChangeText={(text) => {
                  setProfile(prev => prev ? { ...prev, description: text } : null)
                  saveField('description', text)
                }}
                placeholder="Tell others about yourself"
                multiline
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.tagsContainer}>
                {(profile.tags || []).map((tag, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.tag}
                    onPress={() => handleRemoveTag(index)}
                  >
                    <Text style={styles.tagText}>{tag}</Text>
                    <Text style={styles.removeTagText}>×</Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.addTagContainer}>
                  <TextInput
                    style={styles.tagInput}
                    value={editingTag}
                    onChangeText={setEditingTag}
                    onSubmitEditing={handleAddTag}
                    placeholder="Add interest"
                    returnKeyType="done"
                  />
                </View>
              </View>
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity 
                style={[styles.button, styles.logoutButton]}
                onPress={signOut}
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
          </>
        )}
      </ScrollView>
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
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  majorInput: {
    fontSize: 16,
    color: '#666',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  imageContainer: {
    width: '31%',
    aspectRatio: 0.8,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  deleteButton: {
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
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  addImageButton: {
    width: '31%',
    aspectRatio: 0.8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    fontSize: 32,
    color: '#666',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  descriptionInput: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  removeTagText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  addTagContainer: {
    padding: 12,
  },
  tagInput: {
    flex: 1,
    padding: 12,
  },
  buttons: {
    padding: 20,
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  logoutButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}) 