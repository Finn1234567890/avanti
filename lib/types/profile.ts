export type ProfileData = {
  'P-ID'?: string
  'User-ID'?: string
  name?: string
  major?: string
  tags?: string[]
  description?: string
}

export type Profile = 
  ProfileEntry & {
  images: { url: string }[]
}


export type ProfileEntry = {
  'P-ID'?: string
  'User-ID'?: string
  name?: string
  major?: string
  semester?: number
  degreeType: string
  preferences?: string[]
  tags?: string[]
  description?: string
}