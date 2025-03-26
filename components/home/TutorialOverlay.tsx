import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../lib/theme/colors'
import { useState, useEffect } from 'react'

type Props = {
  onDismiss: () => void
}

export function TutorialOverlay({ onDismiss }: Props) {
  const [isDismissing, setIsDismissing] = useState(false)
  
  // Change to opacity animations
  const leftPulse = new Animated.Value(1)
  const rightPulse = new Animated.Value(1)
  const scrollAnim = new Animated.Value(0)

  useEffect(() => {
    // Create more subtle pulsating animation
    const createPulse = (animValue: Animated.Value) => {
      return Animated.sequence([
        Animated.timing(animValue, {
          toValue: 0.7, // Less fade (was 0.4)
          duration: 1200, // Slower animation
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        })
      ])
    }

    // Run animations
    Animated.parallel([
      Animated.loop(createPulse(leftPulse)),
      Animated.loop(createPulse(rightPulse)),
      Animated.loop(Animated.sequence([
        Animated.timing(scrollAnim, {
          toValue: -15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scrollAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        })
      ]))
    ]).start()
  }, [])

  const handlePress = () => {
    if (isDismissing) return
    setIsDismissing(true)
    onDismiss()
  }

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={1}
      onPress={handlePress}
      disabled={isDismissing}
    >
      <View style={styles.content}>
        <View style={styles.separator} />
        
        <Animated.View 
          style={[
            styles.leftAction,
            { opacity: leftPulse }
          ]}
        >
          <View style={styles.tapIndicator}>
            <Ionicons name="finger-print" size={24} color={colors.text.light} />
            <Text style={styles.tapText}>Tippen</Text>
          </View>
          <Text style={styles.actionText}>Vorheriges Bild</Text>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.rightAction,
            { opacity: rightPulse }
          ]}
        >
          <View style={styles.tapIndicator}>
            <Ionicons name="finger-print" size={24} color={colors.text.light} />
            <Text style={styles.tapText}>Tippen</Text>
          </View>
          <Text style={styles.actionText}>Nächstes Bild</Text>
        </Animated.View>

        <Animated.View 
          style={[
            styles.scrollHint,
            { transform: [{ translateY: scrollAnim }] }
          ]}
        >
          <Text style={styles.scrollText}>Nach oben wischen für mehr Profile</Text>
          <Ionicons name="chevron-up" size={30} color={colors.text.light} />
        </Animated.View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 40,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    zIndex: 1000,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center',
  },
  leftAction: {
    position: 'absolute',
    left: 20,
    top: '40%',
    alignItems: 'center',
    gap: 16,
  },
  rightAction: {
    position: 'absolute',
    right: 20,
    top: '40%',
    alignItems: 'center',
    gap: 16,
  },
  scrollHint: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: colors.text.light,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollText: {
    color: colors.text.light,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  separator: {
    position: 'absolute',
    height: '50%',
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    top: '20%',
  },
  tapIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  tapText: {
    color: colors.text.light,
    fontSize: 14,
    fontWeight: '600',
  },
}) 