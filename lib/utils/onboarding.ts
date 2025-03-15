import AsyncStorage from '@react-native-async-storage/async-storage'

export const TOTAL_STEPS = 6

export const saveOnboardingStep = async (step: string, data: any) => {
  try {
    await AsyncStorage.setItem(`onboarding_${step}`, JSON.stringify(data))
  } catch (e) {
    throw e
  }
}

export const getOnboardingStep = async (step: string) => {
  try {
    const data = await AsyncStorage.getItem(`onboarding_${step}`)
    return data ? JSON.parse(data) : null
  } catch (e) {
    return null
  }
} 