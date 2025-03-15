import { Stack } from 'expo-router'
import type { FullProfileData } from './types'

export type ProfileStackParamList = {
  index: undefined
  edit: { profile: FullProfileData }
}

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" />
    </Stack>
  )
} 