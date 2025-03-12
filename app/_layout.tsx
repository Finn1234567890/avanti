import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Stack } from 'expo-router'
import { AuthProvider } from '../lib/context/auth'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

export default function RootLayout() {
  return (
    <> 
      <StatusBar style="dark" />
      <GestureHandlerRootView style={{ flex: 1, }}> 
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </AuthProvider>
      </GestureHandlerRootView>
    </>
  )
} 