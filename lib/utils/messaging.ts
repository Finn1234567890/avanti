import { Share, Platform, Linking } from 'react-native'
import { supabase } from '../supabase/supabase'

export async function openMessaging(friendId: string) {
  try {
    // Get friend's phone number
    const { data: friend, error } = await supabase
      .from('Profile')
      .select('phone_number')
      .eq('User-ID', friendId)
      .single()

    if (error) throw error
    if (!friend?.phone_number) throw new Error('No phone number found')

    const phoneNumber = friend.phone_number.replace(/\D/g, '') // Strip non-digits

    // Prepare messaging options
    const messageOptions = []

    // WhatsApp
    messageOptions.push(`whatsapp://send?phone=${phoneNumber}`)
    
    // iMessage (iOS) or SMS (Android)
    if (Platform.OS === 'ios') {
      messageOptions.push(`sms:${phoneNumber}&body=`)
    } else {
      messageOptions.push(`sms:${phoneNumber}`)
    }

    // Regular phone call
    messageOptions.push(`tel:${phoneNumber}`)

    // Open system share sheet
    await Share.share({
      title: 'Message Friend',
      message: 'Choose how to message your friend',
      url: messageOptions[0]
    })
  } catch (error) {
    console.error('Error opening messaging:', error)
    throw error
  }
} 