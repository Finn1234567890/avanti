import { View, StyleSheet, SafeAreaView, Platform } from 'react-native'

export function SafeAreaWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
}) 