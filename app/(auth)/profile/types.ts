export type ProfileEntry = {
  name: string
  major: string
  'P-ID': number
  'User-ID': string
  description?: string
  tags?: string[]
  created_at: string
}

export type FullProfileData = ProfileEntry & {
  images: { 
    url: string
    publicUrl: string 
  }[]
} 