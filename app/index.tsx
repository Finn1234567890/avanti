import { Redirect } from 'expo-router'
import { Platform, StatusBar } from 'react-native'

if (Platform.OS === 'android') {
  StatusBar.setTranslucent(true)
  StatusBar.setBackgroundColor('transparent')
}

export default function Index() {
  return <Redirect href="/(public)/welcome" />
} 