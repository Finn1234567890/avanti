import { Platform, Linking, Alert } from 'react-native'

export async function openMessaging(platform: string, phoneNumber: string, name: string) {
  try {
    // Clean the number but keep the + for country code
    const cleanedPhoneNumber = phoneNumber.trim()
    const defaultMessage = encodeURIComponent(`Hi, ich bin ${name} von Avanti!`)

    if (platform === 'whatsapp') {
      // WhatsApp requires country code without +
      const whatsappNumber = cleanedPhoneNumber.startsWith('+') 
        ? cleanedPhoneNumber.substring(1) 
        : cleanedPhoneNumber
        
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`
      console.log("Trying WhatsApp URL:", whatsappUrl)
      
      const canOpenWhatsapp = await Linking.canOpenURL(whatsappUrl)

      if (canOpenWhatsapp) {
        console.log("Opening WhatsApp")
        await Linking.openURL(whatsappUrl)
        return
    }}


    if (platform === 'sms') {
      // SMS can use the original phone number with +
      const smsUrl = Platform.select({
        ios: `sms:${cleanedPhoneNumber}&body=${defaultMessage}`,
        android: `sms:${cleanedPhoneNumber}?body=${defaultMessage}`,
        default: `sms:${cleanedPhoneNumber}?body=${defaultMessage}`
      })
    

      console.log("Trying SMS URL:", smsUrl)
      const canOpenSms = await Linking.canOpenURL(smsUrl)
      if (canOpenSms) {
        console.log("Opening SMS")
        await Linking.openURL(smsUrl)
        return
      }
    }

    throw new Error('No messaging apps available')
  } catch (error) {
    console.error('Error opening messaging:', error)
    Alert.alert(
      'Error',
      'Could not open messaging app. Make sure WhatsApp or Messages is installed.'
    )
  }
} 