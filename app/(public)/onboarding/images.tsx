import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../../../lib/supabase/supabase'
import { useAuth } from '../../../lib/context/auth'
import { OnboardingLayout } from '../../../components/OnboardingLayout'
import { onboardingStyles as styles } from '../../../lib/styles/onboarding'
import { decode } from 'base64-arraybuffer'
import { uploadImage } from '../../../lib/utils/imageUpload'
import { IMAGE_LIMITS } from '../../../lib/utils/constants'

type ImageInfo = {
  uri: string
  fileName: string | null
  type: string | null
}

const TOTAL_STEPS = 4
const CURRENT_STEP = 4


async function uriToBase64(uri: string): Promise<string> {
  const response = await fetch(uri)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64String = reader.result as string
      // Remove the data:image/jpeg;base64, prefix
      resolve(base64String.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export default function OnboardingImages() {
  const { session, refreshProfile } = useAuth()
  const [images, setImages] = useState<ImageInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pickImage = async () => {
    if (images.length >= IMAGE_LIMITS.MAX_IMAGES) {
      setError(`Maximum ${IMAGE_LIMITS.MAX_IMAGES} images allowed`)
      return
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      })

      console.log('Result:', result)

      if (!result.canceled) {
        const newImage: ImageInfo = {
          uri: result.assets[0].uri,
          fileName: result.assets[0].fileName || 'upload.jpg',
          type: result.assets[0].type || 'image/jpeg'
        }

        console.log('New image:', newImage)
        setImages([...images, newImage])
        setError(null)
      }
    } catch (e) {
      console.error('Error picking image:', e)
      setError('Failed to select image')
    }
  }

  const removeImage = (index: number) => {
    console.log('Removing image at index:', index)
    setImages(images.filter((_, i) => i !== index))
  }

  const handleComplete = async () => {
    if (images.length < IMAGE_LIMITS.MIN_IMAGES) {
      setError(`Please select at least ${IMAGE_LIMITS.MIN_IMAGES} images`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get all stored onboarding data
      const name = await AsyncStorage.getItem('onboarding_name')
      const major = await AsyncStorage.getItem('onboarding_major')
      const interests = JSON.parse(await AsyncStorage.getItem('onboarding_interests') || '[]')
      const bio = await AsyncStorage.getItem('onboarding_bio')

      if (!session?.user?.id || !name || !major || !bio) {
        throw new Error('Missing required profile information')
      }

      // Create profile first
      const { error: profileError, data: profileData } = await supabase
        .from('Profile')
        .insert([{
          'User-ID': session.user.id,
          'name': name,
          'major': major,
          'tags': interests,
          'description': bio
        }])
        .select()
        .single()

      const profileId = profileData['P-ID']

      if (profileError) throw profileError
      if (!profileData) throw new Error('Failed to create profile')

      // Upload images and create entries
      for (const image of images) {
        try {
          await uploadImage({
            base64Image: await uriToBase64(image.uri),
            userId: session.user.id,
            profileId: profileId
          })
        } catch (error) {
          console.error('Error uploading image:', error)
          // Continue with other images
        }
      }

      // Clear onboarding data
      await AsyncStorage.multiRemove([
        'onboarding_name',
        'onboarding_major',
        'onboarding_interests',
        'onboarding_bio'
      ])

      // Refresh profile status and redirect
      await refreshProfile()
      router.replace('/(auth)/home')
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred'
      console.error('Profile creation error:', e)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <OnboardingLayout
      currentStep={CURRENT_STEP}
      totalSteps={TOTAL_STEPS}
      title="Add some photos"
      error={error}
      buttonText="Complete"
      buttonDisabled={images.length < IMAGE_LIMITS.MIN_IMAGES || loading}
      onButtonPress={handleComplete}
      loading={loading}
    >
      <ScrollView style={localStyles.container}>
        <Text style={localStyles.subtitle}>
          Add at least {IMAGE_LIMITS.MIN_IMAGES} photos to continue
        </Text>
        
        <View style={localStyles.imageGrid}>
          {images.map((image, index) => (
            <View key={index} style={localStyles.imageContainer}>
              <Image source={{ uri: image.uri }} style={localStyles.image} />
              <TouchableOpacity
                style={localStyles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Text style={localStyles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          
          {images.length < IMAGE_LIMITS.MAX_IMAGES && (
            <TouchableOpacity 
              style={localStyles.addButton}
              onPress={pickImage}
            >
              <Text style={localStyles.addButtonText}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </OnboardingLayout>
  )
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 10,
  },
  imageContainer: {
    width: '48%',
    aspectRatio: 4/5,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    width: '48%',
    aspectRatio: 4/5,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 40,
    color: '#666',
  },
}) 