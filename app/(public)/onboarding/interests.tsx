import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OnboardingLayout } from '../../../components/OnboardingLayout'
import { onboardingStyles as styles } from '../../../lib/styles/onboarding'
import { INTERESTS } from '../../../lib/utils/constants'

const TOTAL_STEPS = 4
const CURRENT_STEP = 3



export default function OnboardingInterests() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleNext = async () => {
    if (selectedTags.length === 0) {
      setError('Please select at least one interest')
      return
    }
    await AsyncStorage.setItem('onboarding_interests', JSON.stringify(selectedTags))
    const name = await AsyncStorage.getItem('onboarding_name')
    const major = await AsyncStorage.getItem('onboarding_major')
    console.log('Onboarding Progress - Interests:', {
      name,
      major,
      interests: selectedTags
    })
    router.push('/onboarding/bio')
  }

  return (
    <OnboardingLayout
      currentStep={CURRENT_STEP}
      totalSteps={TOTAL_STEPS}
      title="Select your interests"
      error={error}
      buttonText="Next"
      buttonDisabled={selectedTags.length === 0}
      onButtonPress={handleNext}
    >
      <ScrollView style={localStyles.tagsContainer}>
        <View style={localStyles.tagsGrid}>
          {INTERESTS.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[
                localStyles.tag,
                selectedTags.includes(tag) && localStyles.tagSelected
              ]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={[
                localStyles.tagText,
                selectedTags.includes(tag) && localStyles.tagTextSelected
              ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </OnboardingLayout>
  )
}

// Local styles specific to interests screen
const localStyles = StyleSheet.create({
  tagsContainer: {
    flex: 1,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 10,
  },
  tag: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  tagSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  tagText: {
    color: '#000',
  },
  tagTextSelected: {
    color: '#fff',
  },
}) 