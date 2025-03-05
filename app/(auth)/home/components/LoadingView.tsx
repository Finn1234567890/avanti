import { View, Text, StyleSheet } from 'react-native'

export function LoadingView() {
  return (
    <View style={styles.container}>
      <Text>Loading profiles...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}) 