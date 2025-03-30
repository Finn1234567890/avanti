export type ProfileEntry = {
  name: string
  major: string
  'P-ID': string 
  'User-ID': string
  description?: string
  tags?: string[]
  created_at: string
  degreeType: string
  semester?: number
  preferences?: string[]
  party_mode?: boolean
  on_campus?: boolean
}

export type FullProfileData = ProfileEntry & {
  images: { 
    url: string
    publicUrl: string 
  }[]
} 