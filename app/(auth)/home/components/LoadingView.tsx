import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { colors } from '@/lib/theme/colors'

export function LoadingView() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent.primary} style={styles.spinner} />
      <Text style={styles.text}>Profile Laden...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: colors.accent.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 10,
    color: colors.accent.primary,
  },
}) 