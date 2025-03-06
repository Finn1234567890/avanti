import React from 'react'
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native'
import * as Haptics from 'expo-haptics'

type Props = {
  images: { url: string, publicUrl: string }[]
  onDelete: (url: string) => void
  onAdd: () => void
  maxItems: number
  minItems: number
}

export function ImageGrid({ 
  images,
  onDelete, 
  onAdd,
  maxItems,
  minItems,
}: Props) {
  if (!images) return null

  const handleDelete = async (url: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onDelete(url)
  }

  const handleAdd = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onAdd()
  }

  return (
    <View style={styles.container}>
      {images.map((item) => (
        <View key={item.url} style={styles.imageContainer}>
          <Image 
            source={{ uri: item.url }}
            style={styles.image}
          />
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => images.length > minItems && handleDelete(item.url)}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      ))}
      {images.length < maxItems && (
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
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