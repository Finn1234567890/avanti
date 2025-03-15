import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as Haptics from 'expo-haptics';
import { colors } from '../../../../lib/theme/colors';

type OutingToggleProps = {
  isEnabled: boolean;
  onToggle: () => void;
}

export const OutingToggle = ({ isEnabled, onToggle }: OutingToggleProps) => {
  const borderAnim = new Animated.Value(0);
  const glowAnim = new Animated.Value(0);
  const switchAnim = new Animated.Value(isEnabled ? 1 : 0);
  const waveAnim = new Animated.Value(0);
  const cardWaveAnim = new Animated.Value(0);

  useEffect(() => {
    // Border animation
    Animated.loop(
      Animated.timing(borderAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Switch animation
    Animated.spring(switchAnim, {
      toValue: isEnabled ? 1 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    // Card wave animation when active
    if (isEnabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(cardWaveAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(cardWaveAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      cardWaveAnim.setValue(0);
    }
  }, [isEnabled]);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle();
  };

  const translateX = switchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 24]
  });

  const cardScale = cardWaveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  return (
    <TouchableOpacity 
      onPress={handleToggle}
      activeOpacity={1}
    >
      <View style={styles.container}>
        {isEnabled && (
          <>
            <LinearGradient
              colors={['#FF2D55', '#FE3C72', '#FF2D55']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.gradientBorder]}
            >
              <Animated.View 
                style={[
                  styles.gradientBorderInner,
                  {
                    opacity: glowAnim,
                  }
                ]}
              />
            </LinearGradient>
            <View style={styles.borderMask} />
          </>
        )}
        <Animated.View style={[
          styles.cardContainer,
          {
            transform: [{ scale: isEnabled ? cardScale : 1 }]
          }
        ]}>
          <LinearGradient
            colors={isEnabled 
              ? ['#FF2D55', '#FF3B69', '#FE3C72']
              : ['#4A00E0', '#6B5ECD', '#8E8BE0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.contentCard,
              isEnabled && styles.contentCardActive
            ]}
          >
            <View style={styles.content}>
              <View style={styles.leftContent}>
                <FontAwesome5 
                  name="glass-cheers" 
                  size={24} 
                  color={colors.text.light}
                  style={[
                    styles.icon,
                  ]} 
                />
                <Text style={styles.title}>Heute unterwegs</Text>
              </View>
              <View style={[styles.toggleSwitch, isEnabled && styles.toggleSwitchActive]}>
                <Animated.View 
                  style={[
                    styles.toggleKnob, 
                    { transform: [{ translateX }] }
                  ]} 
                />
              </View>
            </View>
            <Text style={styles.subtext}>
              Zeige anderen, dass du heute unterwegs bist oder Bock hast was zu unternehmen. Profile mit aktivem Status werden bevorzugt angezeigt!
            </Text>
          </LinearGradient>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 2, // Space for the glowing border
  },
  gradientBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
    padding: 2,
  },
  gradientBorderInner: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 45, 85, 0.5)',
  },
  borderMask: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  contentCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#4A00E0',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  contentCardActive: {
    shadowColor: '#FF2D55',
    shadowOffset: {
      width: 4,
      height: 10,
    },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 12,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.light,
  },
  subtext: {
    fontSize: 14,
    color: colors.text.light,
    opacity: 0.9,
  },
  icon: {
    transform: [{ scale: 1 }],
  },
  iconActive: {
    transform: [{ scale: 1.1 }],
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  toggleSwitch: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  toggleSwitchActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.text.light,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cardContainer: {
    borderRadius: 16,
  },
}); 