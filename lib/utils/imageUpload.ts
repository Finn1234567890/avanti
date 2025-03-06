import { supabase } from '../supabase/supabase'
import { decode } from 'base64-arraybuffer'

type UploadImageParams = {
  base64Image: string
  userId: string
  profileId: number
}


export async function uploadImage({ base64Image, userId, profileId }: UploadImageParams) {
  try {
    // 1. Upload to public-images bucket
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(
        `${userId}/${Date.now()}.jpg`,
        decode(base64Image),
        { contentType: 'image/jpeg' }
      )

    if (error) throw error

    // 2. Get the public URL
    const { data: imageData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(data.path)

    // 3. Store URL in Images table
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
    console.error('Error uploading image:', error)
    throw error
  }
} 