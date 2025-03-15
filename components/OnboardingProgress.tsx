import { View, StyleSheet, Animated } from 'react-native'
import { colors } from '../lib/theme/colors'
import { useEffect, useRef } from 'react'

type Props = {
  currentStep: number
  totalSteps: number
}

export function OnboardingProgress({ currentStep, totalSteps }: Props) {
  const progressAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentStep,
      duration: 300,
      useNativeDriver: false
    }).start()
  }, [currentStep])

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        {[...Array(totalSteps)].map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.progressBar,
              {
                backgroundColor: progressAnim.interpolate({
                  inputRange: [index, index + 1],
                  outputRange: [colors.background.secondary, colors.accent.primary],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 2,
  }
}) 