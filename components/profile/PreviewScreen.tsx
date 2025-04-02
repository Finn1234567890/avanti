import React, { useState } from 'react'
import { View, Text, Image, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native'
import type { FullProfileData } from '../../types/profile/types'
import { ProfileCard } from '@/components/home/ProfileCard'
import { Profile } from '../../lib/types/profile'
import { BOTTOM_NAV_HEIGHT } from '@/lib/utils/constants'

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

  const SCREEN_HEIGHT = Dimensions.get('window').height
  const FACTOR = Platform.OS === 'ios' ? 2 : 1
  const HEADER_HEIGHT = 50

  return (
    <ProfileCard profile={profileData} preview={true} style={{height: SCREEN_HEIGHT - FACTOR * BOTTOM_NAV_HEIGHT - HEADER_HEIGHT}}/>
  )
}
