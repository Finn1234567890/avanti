import { View, StyleSheet, Animated } from 'react-native'
import { useState, useRef } from 'react'
import { SafeAreaWrapper } from '../../components/SafeAreaWrapper'
import { OnboardingProgress } from '../../components/OnboardingProgress'
import { NameStep } from '../../components/onboarding/NameStep'
import { MajorStep } from '../../components/onboarding/MajorStep'
import { BioStep } from '../../components/onboarding/BioStep'
import { InterestsStep } from '../../components/onboarding/InterestsStep'
import { ImagesStep } from '../../components/onboarding/ImagesStep'
import { colors } from '../../lib/theme/colors'
import { useAuth } from '../../lib/context/auth'
import { router } from 'expo-router'

export const TOTAL_STEPS = 5

export default function Onboarding() {
  const { session } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const slideAnim = useRef(new Animated.Value(0)).current

  // Redirect if no session
  if (!session) {
    router.replace('/(public)/welcome')
    return null
  }

  const handleNext = () => {
    Animated.timing(slideAnim, {
      toValue: -1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(prev => prev + 1)
      slideAnim.setValue(1)
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    })
  }

  const handleBack = () => {
    if (currentStep > 1) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(prev => prev - 1)
        slideAnim.setValue(-1)
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start()
      })
    }
  }

  const renderStep = () => {
    const animatedStyle = {
      transform: [
        {
          translateX: slideAnim.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: ['-100%', '0%', '100%']
          })
        }
      ]
    }

    return (
      <Animated.View style={[styles.stepContainer, animatedStyle]}>
        {currentStep === 1 && <NameStep onNext={handleNext} />}
        {currentStep === 2 && <MajorStep onNext={handleNext} onBack={handleBack} />}
        {currentStep === 3 && <BioStep onNext={handleNext} onBack={handleBack} />}
        {currentStep === 4 && <InterestsStep onNext={handleNext} onBack={handleBack} />}
        {currentStep === 5 && <ImagesStep onNext={handleNext} onBack={handleBack} />}
      </Animated.View>
    )
  }

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          <OnboardingProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </View>
        {renderStep()}
      </View>
    </SafeAreaWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  stepContainer: {
    flex: 1,
  },
}) 