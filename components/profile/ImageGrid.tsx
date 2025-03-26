import React from 'react'
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors } from '../../lib/theme/colors'

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
    gap: 10,
    justifyContent: 'flex-start',
    paddingVertical: 10,
  },
  imageContainer: {
    width: '31%',
    aspectRatio: 4/6,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 20,
    backgroundColor: colors.background.primary,
    borderColor: colors.accent.secondary,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: colors.accent.secondary,
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 20,
  },
  addButton: {
    width: '31%',
    minHeight: 160,
    aspectRatio: 4/6,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 32,
    color: colors.accent.secondary,
  },
}) 