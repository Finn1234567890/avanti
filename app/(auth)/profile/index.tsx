import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { useAuth } from '../../../lib/context/auth'
import { supabase } from '../../../lib/supabase/supabase'
import { SafeAreaWrapper } from '../../../components/SafeAreaWrapper'
import { router } from 'expo-router'
import { EditProfile } from './edit'
import { Image as ExpoImage } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../../../lib/theme/colors'
import type { ProfileEntry, FullProfileData } from './types'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { ViewMode } from './edit';
type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  value: string
  action: string
  color: string
  onPress: () => void
}

const StatCard = ({ icon, title, value, action, color, onPress }: StatCardProps) => (
  <TouchableOpacity onPress={onPress}>
    <LinearGradient
      colors={[colors.accent.primary, colors.accent.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.statCard}
    >
      <View style={styles.statHeader}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statAction}>{action}
        </Text>
        
      </View>
      <View style={styles.statContent}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={22} color={colors.text.light} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        
      </View>
    </LinearGradient>
  </TouchableOpacity>
)

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  onPress: () => void
  color?: string
  isDelete?: boolean
}

const MenuItem = ({ icon, title, onPress, color = colors.text.primary, isDelete }: MenuItemProps) => (
  <TouchableOpacity 
    style={[
      styles.menuItem,
      isDelete && styles.deleteMenuItem
    ]} 
    onPress={onPress}
  >
    <LinearGradient
      colors={isDelete ? ['#FE3C72', '#FF2D55'] : [colors.background.secondary, colors.background.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={StyleSheet.absoluteFill}
    />
    <Ionicons name={icon} size={24} color={isDelete ? colors.text.light : color} />
    <Text style={[styles.menuTitle, { color: isDelete ? colors.text.light : color }]}>{title}</Text>
    <Ionicons 
      name="chevron-forward" 
      size={24} 
      color={isDelete ? colors.text.light : colors.text.secondary} 
    />
  </TouchableOpacity>
)

export default function Profile() {
  const { session, signOut } = useAuth()
  const [profile, setProfile] = useState<FullProfileData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  const [loading, setLoading] = useState(true)
  const [friendshipCount, setFriendshipCount] = useState(0)

  useEffect(() => {
    loadProfile()
    loadFriendshipCount()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    try {
      if (!session?.user?.id) return

      const { data, error } = await supabase
        .from('Profile')
        .select('tags, name, major, P-ID, User-ID, created_at, description')
        .eq('User-ID', session.user.id)
        .single()
        .returns<ProfileEntry>()

      if (error) throw error

      const { data: images, error: imagesError } = await supabase
        .from('Images')
        .select('url')
        .eq('P-ID', data['P-ID'])

      if (imagesError) throw imagesError

      const imagesWithUrls = await Promise.all(
        images.map(async (img) => {
          const { data: publicUrl } = supabase.storage
            .from('public-images')
            .getPublicUrl(img.url)
          return {
            url: img.url,
            publicUrl: publicUrl.publicUrl
          }
        })
      )

      setProfile({
        ...data,
        images: imagesWithUrls
      })
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFriendshipCount = async () => {
    try {
      if (!session?.user?.id) return

      const { data, error } = await supabase
        .from('Friendships')
        .select('*')
        .or(`requester-ID.eq.${session.user.id},receiver-ID.eq.${session.user.id}`)
        .eq('status', 'accepted')

      if (error) throw error
      console.log("Friendships", data)
      setFriendshipCount(data?.length || 0)
    } catch (error) {
      console.error('Error loading friendship count:', error)
    }
  }

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('Users')
                .delete()
                .eq('id', session?.user?.id)

              if (error) throw error
              signOut()
            } catch (error) {
              console.error('Error deleting account:', error)
              Alert.alert('Error', 'Failed to delete account')
            }
          }
        }
      ]
    )
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      await signOut()
      router.replace('/(public)')
    } catch (error) {
      console.error('Error signing out:', error)
      Alert.alert('Error', 'Failed to sign out')
    }
  }

  return (
    <SafeAreaWrapper>
      {isEditing ? (
        <EditProfile 
          profile={profile!}
          view={viewMode}
          onClose={() => {setViewMode('edit'), setIsEditing(false)}}
          onSave={(updatedProfile) => {
            setProfile(updatedProfile)
            setIsEditing(false)
          }}
        />
      ) : (
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerLeft} />
            <Text style={styles.headerTitle}>Avanti</Text>
            <TouchableOpacity style={styles.headerRight}>
              <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.profileSection}>
              <View style={styles.imageContainer}>
                {profile?.images[0] ? (
                  <>
                    <ExpoImage 
                      source={{ uri: profile.images[0].url }}
                      style={styles.profileImage}
                      contentFit="cover"
                    />
                    <TouchableOpacity 
                      style={styles.editImageButton}
                      onPress={() => setIsEditing(true)}
                    >
                      <FontAwesome5 name="pen" size={22} color={colors.accent.primary} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.emptyProfileImage}>
                    <Ionicons name="person" size={80} color={colors.text.secondary} />
                  </View>
                )}
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.name}>{profile?.name}</Text>
                <View style={styles.majorContainer}>
                  <Ionicons 
                    name="school" 
                    size={20} 
                    color={colors.accent.secondary}
                    style={styles.majorIcon} 
                  />
                  <Text style={styles.major}>{profile?.major || 'Add your major'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.statsSection}>
              <StatCard
                icon="people"
                title="Freundschaften"
                value={friendshipCount.toString()}
                action="Alle ansehen"
                color={colors.accent.primary}
                onPress={() => router.push('/(auth)/friends')}
              />
            </View>

            <View style={styles.menuSection}>
              <MenuItem icon="person" title="Profil bearbeiten" onPress={() => {setViewMode('edit'), setIsEditing(true)}} />
              <MenuItem icon="images" title="Vorschau" onPress={() => {setViewMode('preview'), setIsEditing(true)}} />
              <MenuItem icon="shield-checkmark" title="Sicherheit & Datenschutz" onPress={() => {}} />
              <MenuItem icon="log-out" title="Logout" onPress={handleSignOut} />
              <MenuItem 
                icon="trash" 
                title="Delete Account" 
                onPress={handleDeleteAccount}
                isDelete
              />
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  headerLeft: {
    width: 32,  // Match the width of settings button
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  headerRight: {
    width: 32,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 0,
  },
  imageContainer: {
    position: 'relative',
    marginVertical: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 90,
    borderWidth: 5,
    borderColor: colors.accent.primary,
  },
  editImageButton: {
    position: 'absolute',
    top: 4,
    right: 0,
    backgroundColor: colors.background.primary,
    width: 50,
    height: 50,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyProfileImage: {
    width: 120,
    height: 120,
    borderRadius: 90,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.accent.primary,
  },
  infoContainer: {
    alignItems: 'center',
  },
  majorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  majorIcon: {
    marginRight: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  major: {
    fontSize: 18,
    color: colors.text.secondary,
  },
  statsSection: {
    padding: 20,
  },
  menuSection: {
    padding: 20,
    gap: 12,
  },
  statCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.light,
  },
  statAction: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.light,
    opacity: 0.9,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.light,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  deleteMenuItem: {
    backgroundColor: 'transparent',
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
}) 