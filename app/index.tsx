import { Redirect } from 'expo-router'

export default function Root() {
  // Always redirect to register - auth middleware will handle the rest
  return <Redirect href="/(public)/register" />
} 