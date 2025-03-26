import { View, StyleSheet } from 'react-native'

type ImageIndicatorsProps = {
  total: number
  current: number
}

export function ImageIndicators({ total, current }: ImageIndicatorsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View 
          key={index} 
          style={[
            styles.indicator,
            index === current && styles.indicatorActive
          ]} 
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 12,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  indicator: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  indicatorActive: {
    backgroundColor: '#fff',
  },
}) 