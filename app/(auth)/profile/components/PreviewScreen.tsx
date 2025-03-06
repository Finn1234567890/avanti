import React, { useState } from 'react'
import { View, Text, Image, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import type { FullProfileData } from '../types'
import { ImageIndicators } from '../../home/components/ImageIndicators'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

type PreviewScreenProps = {
  profile: FullProfileData
}

export function PreviewScreen({ profile }: PreviewScreenProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const hasMultipleImages = profile.images && profile.images.length > 1

  const handleImagePress = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % profile.images.length)
    }
  }

  return (
    <View style={styles.container}>
      {profile.images && profile.images.length > 0 && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleImagePress}
          disabled={!hasMultipleImages}
          style={styles.imageContainer}
        >
          <Image 
            source={{ uri: profile.images[currentImageIndex].url }} 
            style={styles.profileImage}
          />
          {hasMultipleImages && (
            <ImageIndicators 
              total={profile.images.length} 
              current={currentImageIndex} 
            />
          )}
        </TouchableOpacity>
      )}
      
      <View style={styles.profileInfo}>
        <View style={styles.headerContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.major}>{profile.major}</Text>
          </View>
          
          <View style={styles.connectButton}>
            <Text style={styles.connectButtonText}>Preview</Text>
          </View>
        </View>
        
        <View style={styles.tagsContainer}>
          {profile?.tags?.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.bio} numberOfLines={3}>
          {profile.description}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    height: '65%',
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileInfo: {
    flex: 0.3,
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
  },
  major: {
    fontSize: 18,
    color: '#666',
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  bio: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  connectButton: {
    backgroundColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  }
}) 