import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

type ErrorViewProps = {
  error: string
  onRetry: () => void
}

export function ErrorView({ error, onRetry }: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.error}>{error}</Text>
      <TouchableOpacity onPress={onRetry}>
        <Text>Retry</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
}) 