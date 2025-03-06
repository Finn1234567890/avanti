export type Profile = {
  name: string
  major: string
  'P-ID': number
  'User-ID': string
  description?: string
  tags?: string[]
  created_at: string
}

export type FullProfileData = Profile & {
  images: { 
    url: string
    publicUrl: string 
  }[]
} 