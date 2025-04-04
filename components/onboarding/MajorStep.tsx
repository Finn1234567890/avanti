import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Keyboard } from 'react-native'
import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OnboardingStepProps } from '../../lib/types/onboarding'
import { OnboardingScreenLayout } from '../OnboardingScreenLayout'
import { colors } from '../../lib/theme/colors'
import { MAJORS } from '../../lib/utils/constants'
import { debounce } from 'lodash'

const DEGREE_TYPES = ['Bachelor', 'Master'] as const
type DegreeType = typeof DEGREE_TYPES[number]

export function MajorStep({ onNext, onBack }: OnboardingStepProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMajor, setSelectedMajor] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState(false)
  const [degreeType, setDegreeType] = useState<DegreeType | ''>('')
  const [semester, setSemester] = useState('')

  // Load previously stored values
  useEffect(() => {
    const loadStoredValues = async () => {
      try {
        const [storedMajor, storedDegree, storedSemester] = await Promise.all([
          AsyncStorage.getItem('onboarding_major'),
          AsyncStorage.getItem('onboarding_degree_type'),
          AsyncStorage.getItem('onboarding_semester')
        ])
        
        if (storedMajor) {
          setSelectedMajor(storedMajor)
          setSearchTerm(storedMajor)
        }
        if (storedDegree) setDegreeType(storedDegree as DegreeType)
        if (storedSemester) setSemester(storedSemester)
      } catch (e) {
        console.error('Error loading stored values:', e)
      }
    }
    loadStoredValues()
  }, [])

  // Debounced search function
  const searchMajors = useCallback(
    debounce((term: string) => {
      if (!term.trim()) {
        setSuggestions([])
        return
      }

      const searchResults = MAJORS.filter(major =>
        major.toLowerCase().includes(term.toLowerCase())
      ).slice(0, 15) // Limit to 5 suggestions

      setSuggestions(searchResults)
    }, 300),
    []
  )

  // Update suggestions when search term changes
  useEffect(() => {
    if (selectedMajor) return // Don't show suggestions if major is selected
    searchMajors(searchTerm)
  }, [searchTerm])

  const handleSelectMajor = async (major: string) => {
    setSelectedMajor(major)
    setSearchTerm(major)
    setSuggestions([])
    Keyboard.dismiss()

    try {
      await AsyncStorage.setItem('onboarding_major', major)
    } catch (e) {
      console.error('Error storing major:', e)
    }
  }

  const handleClearSelection = () => {
    setSelectedMajor('')
    setSearchTerm('')
    setFocusedField(true)
  }

  const handleNext = async () => {
    if (!selectedMajor) {
      setSelectedMajor('')
    }
    if (!degreeType) {
      setDegreeType('')
    }
    onNext()
  }

  const toggleDegreeType = async (type: DegreeType) => {
    setDegreeType(type)
    try {
      await AsyncStorage.setItem('onboarding_degree_type', type)
    } catch (e) {
      console.error('Error storing degree type:', e)
    }
  }

  const handleSemesterChange = async (value: string) => {
    // Only allow numbers 1-12
    const num = parseInt(value)
    if (value === '' || (num >= 1 && num <= 12)) {
      setSemester(value)
      try {
        await AsyncStorage.setItem('onboarding_semester', value)
      } catch (e) {
        console.error('Error storing semester:', e)
      }
    }
  }

  return (
    <OnboardingScreenLayout
      title="Was"
      subtitle="studierst du?"
      onNext={handleNext}
      onBack={onBack}
      buttonDisabled={!selectedMajor || !degreeType}
      error={error}
      keepKeyboardUp={!selectedMajor}
      skippable={true}
    >
      <View style={styles.container}>
        <View style={styles.topInputsRow}>
          <View style={styles.degreeTypeWrapper}>
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
                  onPress={() => toggleDegreeType(type)}
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
            <Text style={styles.optionalText}>{"(optional)"}</Text>
            <TextInput
              style={styles.semesterInput}
              value={semester}
              onChangeText={handleSemesterChange}
              placeholder="Semester"
              placeholderTextColor="#666"
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>
        </View>

        <View style={[styles.inputContainer, { marginTop: 12 }]}>
          <TextInput
            style={[
              styles.input,
              focusedField && styles.inputFocused,
              selectedMajor && styles.inputSelected
            ]}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Dein Studiengang"
            placeholderTextColor="#666"
            onFocus={() => setFocusedField(true)}
            onBlur={() => setFocusedField(false)}
            editable={!selectedMajor}
          />
          {selectedMajor && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearSelection}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {!selectedMajor && suggestions.length > 0 && (
          <View style={styles.suggestionsWrapper}>
            <ScrollView 
              style={styles.suggestionsContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              indicatorStyle="black"
              contentContainerStyle={styles.suggestionsContent}
            >
              {suggestions.map((major, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.suggestionItem,
                    index === suggestions.length - 1 && styles.lastSuggestionItem
                  ]}
                  onPress={() => handleSelectMajor(major)}
                >
                  <Text style={styles.suggestionText} numberOfLines={1}>
                    {major}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </OnboardingScreenLayout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  degreeTypeWrapper: {
    flex: 2,
  },
  degreeTypeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
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
    color: colors.text.primary,
  },
  degreeTypeTextSelected: {
    color: colors.text.light,
    fontWeight: '600',
  },
  semesterContainer: {
    flex: 1,
    position: 'relative',
  },
  optionalText: {
    position: 'absolute',
    top: -18,
    left: 26,
    fontSize: 10,
    color: colors.text.secondary,
    marginBottom: 4,
    marginLeft: 4,
  },
  semesterInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: colors.accent.primary,
  },
  inputSelected: {
    backgroundColor: colors.accent.primary + '20',
    borderColor: colors.accent.primary,
  },
  clearButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
  },
  suggestionsWrapper: {
    marginTop: 8,
    maxHeight: 200,
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
  },
  suggestionsHint: {
    fontSize: 12,
    color: colors.text.secondary,
    padding: 8,
    paddingLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.primary,
  },
  suggestionsContainer: {
    maxHeight: 110,
  },
  suggestionsContent: {
    paddingVertical: 2,
  },
  suggestionItem: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.primary + '40',
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastSuggestionItem: {
    borderBottomWidth: 0,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
  },
}) 