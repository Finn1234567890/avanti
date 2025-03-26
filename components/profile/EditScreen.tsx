import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native'
import { ImageGrid } from './ImageGrid'
import type { FullProfileData } from '../../types/profile/types'
import { IMAGE_LIMITS, INTERESTS, MAJORS, PREFRENCES } from '../../lib/utils/constants'
import { useAuth } from '../../lib/context/auth'
import { supabase } from '../../lib/supabase/supabase'
import { colors } from '../../lib/theme/colors'
import { debounce } from 'lodash'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

type EditScreenProps = {
  profile: FullProfileData | null
  onDeleteImage: (url: string) => Promise<void>
  onImagePick: () => Promise<void>
  onProfileUpdate: (updates: Partial<FullProfileData>) => void
}

const DEGREE_TYPES = ['Bachelor', 'Master'] as const
type DegreeType = typeof DEGREE_TYPES[number]

const PREFERENCE_ICONS = {
  'Lerngruppen oder Lernpartner': 'people',
  'Nachhilfe anbieten oder suchen': 'school',
  'Studentenpartys & Feiern gehen': 'beer',
  'Studiengangübergreifende Kontakte': 'globe',
  'Projekt oder Startup Partner': 'rocket',
  'Gaming & E-Sports Gruppen': 'game-controller',
} as const

const INTEREST_ICONS: Partial<Record<string, keyof typeof Ionicons.glyphMap>> = {
  'Sport / Fitness': 'fitness',
  'Gym': 'barbell',
  'Gaming': 'game-controller',
  'Bars': 'beer',
  '420': 'leaf',
  'Fotografie': 'camera',
  'Musik machen': 'musical-notes',
  'Musik hören': 'headset',
  'Coffee': 'cafe',
  'Tanzen': 'musical-note',
  'Mit Freunden': 'people',
  'Kochen & Backen': 'restaurant',
  'Reisen & Kultur': 'airplane',
  'Clubbing': 'wine',
  'Raves': 'pulse',
  'Filme & Serien': 'film',
  'Kunst': 'brush',
  'Wandern & Outdoor': 'trail-sign',
  'Tabletop': 'dice',
  'Ehrenamt': 'heart',

  // Academic interests
  'Wissenschaftliches Schreiben': 'document-text',
  'Forschungsprojekte': 'flask',
  'Programmierung & IT': 'code-slash',
  'Sprachen lernen': 'language',
  'Debattieren & Rhetorik': 'chatbubbles',
  'Studentische Initiativen': 'people-circle',
  'Akademische Workshops': 'school',
  'Fachschaftsarbeit': 'business',
  'Laborarbeit & Experimente': 'flask',
  'Wissenschaftliche Publikationen': 'newspaper',
  'Interdisziplinäre Projekte': 'git-network',
  'Konferenzen & Fachvorträge': 'mic',
}

const MAX_CHARS = 200

export function EditScreen({ 
  profile, 
  onDeleteImage, 
  onImagePick,
  onProfileUpdate 
}: EditScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null)
  const { session } = useAuth()
  const [searchTerm, setSearchTerm] = useState(profile?.major || '')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [majorFocused, setMajorFocused] = useState(false)
  const [bioFocused, setBioFocused] = useState(false)
  const [degreeType, setDegreeType] = useState(profile?.degreeType || '')
  const [semester, setSemester] = useState(profile?.semester?.toString() || '')

  // Debounced search function
  const searchMajors = useCallback(
    debounce((term: string) => {
      if (!term.trim()) {
        setSuggestions([])
        return
      }

      const searchResults = MAJORS.filter(major =>
        major.toLowerCase().includes(term.toLowerCase())
      ).slice(0, 15)

      setSuggestions(searchResults)
    }, 300),
    []
  )

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

  useEffect(() => {
    searchMajors(searchTerm)
  }, [searchTerm])

  const handleSemesterChange = (value: string) => {
    const num = parseInt(value)
    if (value === '' || (num >= 1 && num <= 12)) {
      setSemester(value)
      onProfileUpdate({ semester: num })
    }
  }

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
        <View style={styles.topInputsRow}>
          <View style={styles.degreeTypeWrapper}>
            <Text style={styles.label}>Abschluss</Text>
            <View style={styles.degreeTypeContainer}>
              {DEGREE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.degreeTypeButton,
                    degreeType === type && styles.degreeTypeButtonSelected,
                    type === 'Bachelor' && styles.leftButton,
                    type === 'Master' && styles.rightButton,
                  ]}
                  onPress={() => {
                    setDegreeType(type)
                    onProfileUpdate({ degreeType: type })
                  }}
                >
                  <Text
                    style={[
                      styles.degreeTypeText,
                      degreeType === type && styles.degreeTypeTextSelected
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.semesterContainer}>
            <Text style={styles.label}>Semester</Text>
            <TextInput
              style={styles.semesterInput}
              value={semester}
              onChangeText={handleSemesterChange}
              placeholder="1-12"
              placeholderTextColor={colors.text.secondary}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>
        </View>

        <View style={[styles.inputContainer, { marginTop: 12 }]}>
          <Text style={styles.label}>Studiengang</Text>
          <View style={styles.majorInputContainer}>
            <TextInput
              style={[
                styles.input,
              ]}
              value={searchTerm}
              onChangeText={(text) => {
                setSearchTerm(text)
                onProfileUpdate({ major: text })
              }}
              placeholder="Dein Studiengang"
              placeholderTextColor={colors.text.secondary}
              onFocus={() => setMajorFocused(true)}
              onBlur={() => setMajorFocused(false)}
            />
          </View>

          {suggestions.length > 0 && majorFocused && (
            <View style={styles.suggestionsWrapper}>
              <ScrollView 
                style={styles.suggestionsContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {suggestions.map((major, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.suggestionItem,
                      index === suggestions.length - 1 && styles.lastSuggestionItem,
                      searchTerm === major && styles.suggestionItemSelected
                    ]}
                    onPress={() => {
                      setSearchTerm(major)
                      onProfileUpdate({ major })
                      setSuggestions([])
                      setMajorFocused(false)
                    }}
                  >
                    <Text style={[
                      styles.suggestionText,
                      searchTerm === major && styles.suggestionTextSelected
                    ]} numberOfLines={1}>
                      {major}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Beschreibung</Text>
          <View style={styles.bioInputContainer}>
            <Text style={styles.charCount}>
              {(profile.description || '').length}/{MAX_CHARS}
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.bioInput,
                (profile.description?.length || 0) > MAX_CHARS && styles.inputError
              ]}
              value={profile.description}
              onChangeText={(text) => onProfileUpdate({ description: text })}
              placeholder="Erzähl etwas über dich"
              placeholderTextColor={colors.text.secondary}
              multiline
              textAlignVertical="top"
              numberOfLines={7}
              maxLength={MAX_CHARS + 50}
              onFocus={() => setBioFocused(true)}
              onBlur={() => setBioFocused(false)}
            />
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Warum du hier bist</Text>
        <Text style={styles.hint}>
          Wir verbinden dich mit Studenten, die Ähnliches suchen.
        </Text>
        <View style={styles.preferencesGrid}>
          {PREFRENCES.map((preference) => (
            <TouchableOpacity
              key={preference}
              style={[
                styles.preferenceButton,
                profile.preferences?.includes(preference) && styles.preferenceButtonSelected
              ]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                const currentPrefs = profile.preferences || []
                const newPrefs = currentPrefs.includes(preference)
                  ? currentPrefs.filter(p => p !== preference)
                  : [...currentPrefs, preference]
                onProfileUpdate({ preferences: newPrefs })
              }}
            >
              <Ionicons
                name={PREFERENCE_ICONS[preference]}
                size={20}
                color={profile.preferences?.includes(preference) ? colors.accent.primary : colors.text.primary}
                style={styles.icon}
              />
              <Text
                style={[
                  styles.preferenceText,
                  profile.preferences?.includes(preference) && styles.preferenceTextSelected
                ]}
                numberOfLines={2}
              >
                {preference}
              </Text>
            </TouchableOpacity>
          ))}
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
              {INTEREST_ICONS[interest] && (
                <Ionicons
                  name={INTEREST_ICONS[interest]!}
                  size={16}
                  color={profile.tags?.includes(interest) ? colors.text.light : colors.text.secondary}
                  style={styles.interestIcon}
                />
              )}
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
    marginBottom: 10,
    marginTop: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  topInputsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  degreeTypeWrapper: {
    flex: 2,
  },
  degreeTypeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    marginTop: 8,
  },
  degreeTypeButton: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  degreeTypeButtonSelected: {
    backgroundColor: colors.accent.secondary,
  },
  leftButton: {
    marginRight: 2,
  },
  rightButton: {
    marginLeft: 2,
  },
  degreeTypeText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  degreeTypeTextSelected: {
    color: colors.text.light,
    fontWeight: '600',
  },
  semesterContainer: {
    flex: 1,
  },
  semesterInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 8,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    color: colors.text.primary,
  },
  majorInputContainer: {
    position: 'relative',
  },
  suggestionsWrapper: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 200,
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
    zIndex: 1,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.background.primary + '40',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionsContainer: {
    maxHeight: 200,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.primary + '20',
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionItemSelected: {
    backgroundColor: colors.accent.primary + '15',
  },
  suggestionTextSelected: {
    color: colors.accent.primary,
    fontWeight: '600',
  },
  lastSuggestionItem: {
    borderBottomWidth: 0,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
  },
  hint: {
    fontSize: 12,
    textAlign: 'left',
    color: colors.text.secondary,
    marginBottom: 16,
    marginHorizontal: 4,
    opacity: 0.8,
    lineHeight: 16,
  },
  preferencesGrid: {
    flexDirection: 'column',
    gap: 8,
  },
  preferenceButton: {
    width: '100%',
    backgroundColor: colors.background.secondary,
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceButtonSelected: {
    backgroundColor: colors.accent.primary + '15',
    borderColor: colors.accent.primary,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  icon: {
    marginRight: 16,
    width: 24,
    alignItems: 'center',
  },
  preferenceText: {
    fontSize: 15,
    color: colors.text.primary,
    flex: 1,
  },
  preferenceTextSelected: {
    color: colors.accent.primary,
  },
  bioInputContainer: {
    position: 'relative',
    width: '100%',
  },
  bioInput: {
    height: 160,
    textAlignVertical: 'top',
    lineHeight: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  inputError: {
    borderColor: 'red',
  },
  charCount: {
    position: 'absolute',
    right: 8,
    top: -24,
    fontSize: 14,
    color: colors.text.secondary,
    zIndex: 1,
  },
  interestIcon: {
    marginRight: 4,
  },
}) 