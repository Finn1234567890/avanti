import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native'
import { ImageGrid } from './ImageGrid'
import type { FullProfileData } from '../types'
import { IMAGE_LIMITS, INTERESTS } from '../../../../lib/utils/constants'
import { useAuth } from '../../../../lib/context/auth'
import { supabase } from '../../../../lib/supabase/supabase'

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
          <Text style={styles.sectionTitle}>MEDIA</Text>
          <Text style={styles.addNowButton}>ADD NOW</Text>
          <Text style={styles.percentage}>+40%</Text>
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
        <Text style={styles.sectionTitle}>BASIC INFO</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone</Text>
          <View style={styles.phoneContainer}>
            <Text style={styles.phoneText}>{phoneNumber || 'Loading...'}</Text>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={profile.name}
            onChangeText={(text) => onProfileUpdate({ name: text })}
            placeholder="Enter your name"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Major</Text>
          <TextInput
            style={styles.input}
            value={profile.major}
            onChangeText={(text) => onProfileUpdate({ major: text })}
            placeholder="Your major"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={profile.description}
            onChangeText={(text) => onProfileUpdate({ description: text })}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INTERESTS</Text>
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
    backgroundColor: '#fff',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  interestTagSelected: {
    backgroundColor: '#E94057',
  },
  interestText: {
    color: '#666',
    fontSize: 14,
  },
  interestTextSelected: {
    color: '#fff',
  },
  addNowButton: {
    marginLeft: 8,
    fontSize: 14,
    color: '#E94057',
    fontWeight: '600',
  },
  percentage: {
    marginLeft: 'auto',
    fontSize: 14,
    color: '#E94057',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  phoneContainer: {
    padding: 15,
    paddingLeft: 0,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  phoneText: {
    fontSize: 16,
    color: '#666',
  },
}) 