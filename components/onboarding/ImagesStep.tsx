import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useState, useEffect } from 'react'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OnboardingStepProps } from '../../lib/types/onboarding'
import { OnboardingScreenLayout } from '../OnboardingScreenLayout'
import { colors } from '../../lib/theme/colors'
import { IMAGE_LIMITS } from '../../lib/utils/constants'
import { supabase } from '../../lib/supabase/supabase'
import { useAuth } from '../../lib/context/auth'
import { uploadImage } from '../../lib/utils/imageUpload'
type ImageInfo = {
  uri: string
  base64: string
  fileName: string | null
  type: string | null
}

export function ImagesStep({ onBack }: OnboardingStepProps) {
  const { session, refreshProfile } = useAuth()
  const [images, setImages] = useState<ImageInfo[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadStoredImages = async () => {
      try {
        const storedImages = await AsyncStorage.getItem('onboarding_images')
        if (storedImages) {
          setImages(JSON.parse(storedImages))
        }
      } catch (e) {
        console.error('Error loading stored images:', e)
      }
    }
    loadStoredImages()
  }, [])

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
        base64: true
      })

      if (!result.canceled && result.assets[0].base64) {
        const newImage: ImageInfo = {
          uri: result.assets[0].uri,
          base64: result.assets[0].base64,
          fileName: result.assets[0].fileName || 'upload.jpg',
          type: result.assets[0].type || 'image/jpeg'
        }
        setImages([...images, newImage])
        setError(null)
      } else {
        setError('Bild konnte nicht geladen werden')
      }
    } catch (e) {
      console.error('Error picking image:', e)
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

    if (!session?.user?.id) {
      setError('Nicht eingeloggt. Bitte versuche es erneut.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get all stored onboarding data
      const name = await AsyncStorage.getItem('onboarding_name')
      const degreeType = await AsyncStorage.getItem('onboarding_degree_type')
      const semester = await AsyncStorage.getItem('onboarding_semester') || null
      const major = await AsyncStorage.getItem('onboarding_major')
      const preferences = JSON.parse(await AsyncStorage.getItem('onboarding_preferences') || '[]')
      const bio = await AsyncStorage.getItem('onboarding_bio')
      const interests = JSON.parse(await AsyncStorage.getItem('onboarding_interests') || '[]')

      // Create profile
      const { error: profileError } = await supabase
        .from('Profile')
        .insert([{
          'User-ID': session.user.id,
          name,
          major,
          description: bio,
          tags: interests,
          degree_type: degreeType,
          semester: semester,
          preferences: preferences
        }])

      if (profileError) throw profileError

      const { data: profile, error: fetchError } = await supabase
        .from('Profile')
        .select('P-ID')
        .eq('User-ID', session.user.id)
        .single()
        .returns<{'P-ID': number}>()

      if (fetchError || !profile) {
        throw new Error('Profile not found after creation')
      }

      // Upload images
      for (const image of images) {
        if (!image.base64) {
          console.error('Missing base64 for image:', image)
          continue
        }

        console.log("image upload" )
        
        await uploadImage({
          base64Image: image.base64,
          userId: session.user.id,
          profileId: profile['P-ID']
        })
      }

      // Clear onboarding data
      await AsyncStorage.multiRemove([
        'onboarding_name',
        'onboarding_major',
        'onboarding_bio',
        'onboarding_interests',
        'onboarding_degree_type',
        'onboarding_preferences',
        'onboarding_semester'
      ])

      await refreshProfile()
      router.replace('/(auth)/home')
    } catch (e) {
      console.error('Error completing onboarding:', e)
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <OnboardingScreenLayout
      title="Füge ein paar"
      subtitle="Bilder hinzu"
      onNext={handleComplete}
      onBack={onBack}
      loading={loading}
      error={error}
      buttonText={`${images.length}/${IMAGE_LIMITS.MIN_IMAGES} · Ferting`}
      buttonDisabled={images.length < IMAGE_LIMITS.MIN_IMAGES}
      hint={`Wähle bis zu ${IMAGE_LIMITS.MAX_IMAGES} Bilder. Keine Panik! Du kannst sie später noch bearbeiten`}
    >
      <View style={styles.container}>
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
      </View>
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
    justifyContent: 'flex-start',
    paddingVertical: 10,
  },
  imageContainer: {
    width: '31%',
    aspectRatio: 4/6,
    position: 'relative',

  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 20,
    backgroundColor: colors.background.primary,
    borderColor: colors.accent.secondary,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: colors.accent.secondary,
    fontSize: 18,
    fontWeight: 400,
    lineHeight: 20,
  },
  addButton: {
    width: '31%',
    minHeight: 160,
    aspectRatio: 4/6,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 32,
    color: colors.accent.secondary,
  },
}) 