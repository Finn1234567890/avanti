import { Tabs } from 'expo-router'
import * as Haptics from 'expo-haptics'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Platform } from 'react-native'
import { colors } from '../../lib/theme/colors'

export default function AuthLayout() {
  const handleTabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopColor: colors.background.secondary,
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 40 : 20,
          paddingTop: 10,
          paddingHorizontal: 20,
        },
        tabBarIconStyle: {
          width: 30,
          height: 30,
        },
        tabBarActiveTintColor: colors.accent.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
        },
      }}
      screenListeners={{
        tabPress: () => handleTabPress()
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => (
            <Ionicons name="rocket" size={25} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={25} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends/index"
        options={{
          title: 'Freunde',
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart" marginBottom={-5} size={25} color={color} />
          ),
        }}
      />
    </Tabs>
  )
} 