import { supabase } from '../supabase/supabase'
import { decode } from 'base64-arraybuffer'

type UploadImageParams = {
  base64Image: string
  userId: string
  profileId: number
}

export async function uploadImage({ base64Image, userId, profileId }: UploadImageParams) {
  try {
    console.log("uploading image")
    
    // Validate base64Image
    if (!base64Image || typeof base64Image !== 'string') {
      throw new Error('Invalid image data')
    }

    // Check if the base64 string contains the data URI prefix
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1]
      : base64Image

    if (!base64Data) {
      throw new Error('Invalid base64 data')
    }

    // Create unique filename using timestamp and user ID
    const fileName = `${userId}_${Date.now()}.jpg`
    const filePath = `${userId}/${fileName}`

    // Convert base64 to array buffer
    const arrayBuffer = decode(base64Data)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (error) {
      console.error('Error uploading image:', error)
      throw error
    }

    // Get the public URL
    const { data: imageData } = supabase.storage
      .from('profile-images') // Changed from profile-images to match upload bucket
      .getPublicUrl(data.path)

    // Store URL in Images table
    const { error: imageError } = await supabase
      .from('Images')
      .insert([{
        'P-ID': profileId,
        'url': imageData.publicUrl
      }])

    if (imageError) throw imageError

    return {
      url: imageData.publicUrl,
      publicUrl: imageData.publicUrl
    }
  } catch (error) {
    console.error('Error in uploadImage:', error)
    throw error
  }
} 