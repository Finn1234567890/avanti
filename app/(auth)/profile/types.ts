export type ProfileEntry = {
  name: string
  major: string
  'P-ID': number
  'User-ID': string
  description?: string
  tags?: string[]
  created_at: string
  degreeType: string
  semester?: number
  preferences?: string[]
  party_mode?: boolean
}

export type FullProfileData = ProfileEntry & {
  images: { 
    url: string
    publicUrl: string 
  }[]
} 