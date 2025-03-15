import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native'
import { colors } from '@/lib/theme/colors'
import { useEffect, useRef } from 'react'
import { Dimensions } from 'react-native'

const screenHeight = Dimensions.get('window').height

export function LoadingView() {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, { transform: [{ translateY }] }]}>
        <Image source={require('../../../../assets/images/load-icon.png')} style={styles.icon} />
      </Animated.View>

    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: colors.accent.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
  container: {
    borderWidth: 1,
    borderColor: 'red',
    height: screenHeight,
    width: '100%',
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
  },
  icon: {
    width: 100,
    height: 100,
  }
}) 