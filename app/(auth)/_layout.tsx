import { Tabs } from 'expo-router'
import * as Haptics from 'expo-haptics'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Dimensions, Platform } from 'react-native'
import { colors } from '../../lib/theme/colors'
import { FontAwesome5 } from '@expo/vector-icons'
import { BOTTOM_NAV_HEIGHT } from '@/lib/utils/constants'

export default function AuthLayout() {
  const handleTabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const screenHeight = Dimensions.get('window').height

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopColor: colors.background.secondary,
          height: BOTTOM_NAV_HEIGHT,
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
          title: `${screenHeight < 700 && Platform.OS === 'android' ? '' : 'Studenten'}`,
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="user-graduate" size={25} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: `${screenHeight < 700 && Platform.OS === 'android' ? '' : 'Profil'}`,
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={25} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends/index"
        options={{
          title: `${screenHeight < 700 && Platform.OS === 'android' ? '' : 'Freunde'}`,
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart" marginBottom={-5} size={25} color={color} />
          ),
        }}
      />
    </Tabs>
  )
} 