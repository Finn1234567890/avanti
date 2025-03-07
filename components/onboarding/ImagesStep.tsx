import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OnboardingStepProps } from '../../lib/types/onboarding'
import { OnboardingScreenLayout } from '../OnboardingScreenLayout'
import { colors } from '../../lib/theme/colors'
import { IMAGE_LIMITS } from '../../lib/utils/constants'
import { supabase } from '../../lib/supabase/supabase'
import { useAuth } from '../../lib/context/auth'

type ImageInfo = {
  uri: string
  fileName: string | null
  type: string | null
}

export function ImagesStep({ onBack }: OnboardingStepProps) {
  const { session, refreshProfile } = useAuth()
  const [images, setImages] = useState<ImageInfo[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const pickImage = async () => {
    if (images.length >= IMAGE_LIMITS.MAX_IMAGES) {
      setError(`Maximal ${IMAGE_LIMITS.MAX_IMAGES} Bilder erlaubt`)
      return
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      })

      if (!result.canceled) {
        const newImage: ImageInfo = {
          uri: result.assets[0].uri,
          fileName: result.assets[0].fileName || 'upload.jpg',
          type: result.assets[0].type || 'image/jpeg'
        }
        setImages([...images, newImage])
        setError(null)
      }
    } catch (e) {
      setError('Fehler beim Auswählen des Bildes')
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleComplete = async () => {
    if (images.length < IMAGE_LIMITS.MIN_IMAGES) {
      setError(`Bitte wähle mindestens ${IMAGE_LIMITS.MIN_IMAGES} Bilder aus`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get all stored onboarding data
      const name = await AsyncStorage.getItem('onboarding_name')
      const major = await AsyncStorage.getItem('onboarding_major')
      const bio = await AsyncStorage.getItem('onboarding_bio')
      const interests = JSON.parse(await AsyncStorage.getItem('onboarding_interests') || '[]')

      // Create profile
      const { error: profileError } = await supabase
        .from('Profile')
        .insert([{
          'User-ID': session?.user?.id,
          name,
          major,
          bio,
          interests
        }])

      if (profileError) throw profileError

      // Clear onboarding data
      await AsyncStorage.multiRemove([
        'onboarding_name',
        'onboarding_major',
        'onboarding_bio',
        'onboarding_interests'
      ])

      await refreshProfile()
      router.replace('/(auth)/home')
    } catch (e) {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <OnboardingScreenLayout
      currentStep={5}
      totalSteps={5}
      title="Füge einige"
      subtitle="Bilder hinzu"
      onNext={handleComplete}
      onBack={onBack}
      loading={loading}
      error={error}
      buttonText="Fertig"
      buttonDisabled={images.length < IMAGE_LIMITS.MIN_IMAGES}
      hint={`Füge mindestens ${IMAGE_LIMITS.MIN_IMAGES} Bilder hinzu`}
    >
      <ScrollView style={styles.container}>
        <View style={styles.imageGrid}>
          {images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          
          {images.length < IMAGE_LIMITS.MAX_IMAGES && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={pickImage}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </OnboardingScreenLayout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: colors.text.light,
    fontSize: 18,
    lineHeight: 20,
  },
  addButton: {
    width: '48%',
    aspectRatio: 4/5,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 32,
    color: colors.text.secondary,
  },
}) 