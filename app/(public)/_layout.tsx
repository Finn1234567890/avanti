import { Stack } from 'expo-router'

export default function PublicLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-phone" />
      <Stack.Screen name="onboarding" />
    </Stack>
  )
} 