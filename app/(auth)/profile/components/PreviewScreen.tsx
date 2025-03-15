import React, { useState } from 'react'
import { View, Text, Image, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import type { FullProfileData } from '../types'
import { ProfileCard } from '../../home/components/ProfileCard'
import { Profile } from '../../../../lib/types/profile'

export function PreviewScreen({ profile }: {profile: FullProfileData}) {

  const profileImages = profile.images.map((image) => image.url)

  const profileData: Profile = {
    'P-ID': profile['P-ID'].toString(),
    'User-ID': profile['User-ID'],
    name: profile.name,
    major: profile.major,
    description: profile.description || '',
    tags: profile.tags || [],
    degreeType: profile.degreeType,
    preferences: profile.preferences || [],
    semester: profile.semester,
    images: profileImages.map((image) => ({ url: image })),
  }
  
  return (
    <ProfileCard profile={profileData} preview={true}/>
  )
}
