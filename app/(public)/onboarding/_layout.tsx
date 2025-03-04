import { Stack } from 'expo-router'

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="name" />      // Step 1: Name
      <Stack.Screen name="major" />     // Step 2: Major
      <Stack.Screen name="interests" /> // Step 3: Interest Tags
      <Stack.Screen name="bio" />       // Step 4: Description + Submit
    </Stack>
  )
} 