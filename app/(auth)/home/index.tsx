import { View, Text, StyleSheet } from 'react-native'
import { useAuth } from '../../../lib/context/auth'

export default function Home() {
  const { session } = useAuth()
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome {session?.user.email}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
}) 