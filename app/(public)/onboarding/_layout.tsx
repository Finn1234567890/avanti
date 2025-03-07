import { Stack } from 'expo-router'
import { View } from 'react-native'
import { OnboardingProgress } from '../../../components/OnboardingProgress'

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 200,
      }}
    >
      <Stack.Screen name="name" />      // Step 1: Name
      <Stack.Screen name="major" />     // Step 2: Major
      <Stack.Screen name="interests" /> // Step 3: Interest Tags
      <Stack.Screen name="bio" />       // Step 4: Description  
      <Stack.Screen name="images" />    // Step 5: Images + Submit
    </Stack>
  )
} 