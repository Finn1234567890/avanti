import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native'
import { ImageGrid } from './ImageGrid'
import type { FullProfileData } from '../types'
import { IMAGE_LIMITS, INTERESTS } from '../../../../lib/utils/constants'
import { useAuth } from '../../../../lib/context/auth'
import { supabase } from '../../../../lib/supabase/supabase'
import { colors } from '../../../../lib/theme/colors'

type EditScreenProps = {
  profile: FullProfileData | null
  onDeleteImage: (url: string) => Promise<void>
  onImagePick: () => Promise<void>
  onProfileUpdate: (updates: Partial<FullProfileData>) => void
}

export function EditScreen({ 
  profile, 
  onDeleteImage, 
  onImagePick,
  onProfileUpdate 
}: EditScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null)
  const { session } = useAuth()

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      if (!session?.user?.id) return

      const { data, error } = await supabase
        .from('PhoneNumbers')
        .select('phone_number')
        .eq('User-ID', session.user.id)
        .single()

      if (!error && data) {
        setPhoneNumber(data.phone_number)
      }
    }

    fetchPhoneNumber()
  }, [session?.user?.id])

  if (!profile) return null

  const handleInterestToggle = (interest: string) => {
    const currentTags = profile.tags || []
    const newTags = currentTags.includes(interest)
      ? currentTags.filter(tag => tag !== interest)
      : [...currentTags, interest]
    
    onProfileUpdate({ tags: newTags })
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bilder</Text>
        </View>
        <ImageGrid 
          images={profile.images}
          onDelete={onDeleteImage}
          onAdd={onImagePick}
          maxItems={IMAGE_LIMITS.MAX_IMAGES}
          minItems={IMAGE_LIMITS.MIN_IMAGES}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Über dich</Text>
        <View style={styles.inputContainer}>
          <View style={styles.phoneHeader}>
            <Text style={styles.label}>Telefonnummer</Text>
            <Text style={styles.phoneHint}>NICHT VERÄNDERBAR</Text>
          </View>
          <View style={styles.phoneContainer}>
            <Text style={styles.phoneText}>{phoneNumber || 'Loading...'}</Text>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.phoneHeader}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.phoneHint}>NICHT VERÄNDERBAR</Text>
          </View>
          <View style={[styles.phoneContainer, styles.disabledInput]}>
            <Text style={styles.phoneText}>{profile.name}</Text>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Studiengang</Text>
          <TextInput
            style={styles.input}
            value={profile.major}
            onChangeText={(text) => onProfileUpdate({ major: text })}
            placeholder="Dein Studiengang"
            placeholderTextColor={colors.text.secondary}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Beschreibung</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={profile.description}
            onChangeText={(text) => onProfileUpdate({ description: text })}
            placeholder="Erzähl etwas über dich"
            placeholderTextColor={colors.text.secondary}
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interessen</Text>
        <View style={styles.interestsGrid}>
          {INTERESTS.map((interest) => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.interestTag,
                profile.tags?.includes(interest) && styles.interestTagSelected
              ]}
              onPress={() => handleInterestToggle(interest)}
            >
              <Text style={[
                styles.interestText,
                profile.tags?.includes(interest) && styles.interestTextSelected
              ]}>
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    paddingBottom: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
  },
  interestTagSelected: {
    backgroundColor: colors.accent.secondary,
  },
  interestText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  interestTextSelected: {
    color: colors.text.light,
  },
  addNowButton: {
    fontSize: 14,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  percentage: {
    fontSize: 14,
    color: colors.accent.secondary,
  },
  phoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phoneHint: {
    fontSize: 12,
    color: colors.accent.secondary,
    fontWeight: '500',
  },
  phoneContainer: {
    opacity: 0.5,
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: 12,
  },
  phoneText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  disabledInput: {
    opacity: 0.5,
  },
}) 