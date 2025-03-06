import { View, StyleSheet } from 'react-native'
import { SafeAreaView, Edge } from 'react-native-safe-area-context'

type Props = {
  children: React.ReactNode
  style?: object
  edges?: Edge[]  // Allow customizing which edges to protect
}

export function SafeAreaWrapper({ children, style, edges = ['top'] }: Props) {
  return (
    <SafeAreaView style={[styles.container, style]} edges={edges}>
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