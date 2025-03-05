import React from 'react'
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'

type Props = {
  data: { url: string }[]
  onReorder: (newOrder: { url: string }[]) => void
  onDelete: (url: string) => void
  onAdd: () => void
  maxItems: number
  minItems: number
}

export default function DraggableGrid({ 
  data = [],
  onReorder, 
  onDelete, 
  onAdd,
  maxItems,
  minItems
}: Props) {
  if (!data) return null;

  const positions = data.map(() => ({
    x: useSharedValue(0),
    y: useSharedValue(0)
  }))

  const getOrderedData = () => {
    return [...data].sort((a, b) => {
      const aIndex = data.findIndex(item => item.url === a.url)
      const bIndex = data.findIndex(item => item.url === b.url)
      const aPos = positions[aIndex]
      const bPos = positions[bIndex]
      
      if (Math.abs(aPos.y.value - bPos.y.value) < 50) {
        return aPos.x.value - bPos.x.value
      }
      return aPos.y.value - bPos.y.value
    })
  }

  const renderItem = (item: { url: string }, index: number) => {
    const gesture = Gesture.Pan()
      .onUpdate((e) => {
        positions[index].x.value = e.translationX
        positions[index].y.value = e.translationY
      })
      .onEnd(() => {
        positions[index].x.value = withSpring(0)
        positions[index].y.value = withSpring(0)
        onReorder(getOrderedData())
      })

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: positions[index].x.value },
        { translateY: positions[index].y.value }
      ]
    }))

    return (
      <GestureDetector gesture={gesture} key={item.url}>
        <Animated.View style={[styles.imageContainer, animatedStyle]}>
          <Image source={{ uri: item.url }} style={styles.image} />
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => data.length > minItems && onDelete(item.url)}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    )
  }

  return (
    <View style={styles.container}>
      {data.map((item, index) => renderItem(item, index))}
      {data.length < maxItems && (
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  imageContainer: {
    width: '31%',
    aspectRatio: 0.8,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  addButton: {
    width: '31%',
    aspectRatio: 0.8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 32,
    color: '#666',
  },
}) 