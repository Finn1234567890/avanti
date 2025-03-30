import { supabase } from "../supabase/supabase"
import type { ProfileEntry } from "../types/profile"

type EntryWithIndex = {
    profileEntry: ProfileEntry
    similarityIndex: number
}

const PREFERENCES_WEIGHT = 3
const TAGS_WEIGHT = 1
const DEGREETYPE_WEIGHT = 0.5
const SEMESTER_WEIGHT = 0.5 

const getAllUserProfiles = async (user: ProfileEntry): Promise<ProfileEntry[]> => {
    try {
        const { data, error } = await supabase
            .rpc('get_non_friend_profiles', {
                userid: user['User-ID']
            })
        if (error) throw error
        return data
    } catch (error) {
        console.error('Error fetching user profiles:', error)
        throw error
    }
} 

const calculateSimilarityIndex = (
    user: ProfileEntry, 
    profile: ProfileEntry, 
    viewedAt?: number
) => {
    let similarityIndex = 0

    if (user.party_mode && profile.party_mode) {
        similarityIndex += 3 
    }

    if (user.on_campus && profile.on_campus) {
        similarityIndex += 2 
    }

    if (user && profile) {
        const penalty = viewedAt ? 2 * Number((1 / (1 + Math.log2(1 + (Date.now() - viewedAt) / (1000 * 60 * 60)))).toFixed(2)) : 0
        similarityIndex -= penalty
    }

    user.preferences?.forEach((preference) => {
        if (profile.preferences?.includes(preference)) {
            similarityIndex += PREFERENCES_WEIGHT
        }
    })

    user.tags?.forEach((tag) => {
        if (profile.tags?.includes(tag)) {
            similarityIndex += TAGS_WEIGHT
        }
    })

    user.degreeType === profile.degreeType ? (similarityIndex += DEGREETYPE_WEIGHT) : similarityIndex += 0

    if (user.semester && profile.semester) {
        let differenceSemester = user?.semester - profile?.semester
        differenceSemester = differenceSemester < 0 ? (-1 * differenceSemester) : differenceSemester

        similarityIndex += SEMESTER_WEIGHT - (differenceSemester / 10)
    }

    return similarityIndex
}

export const sortBySimilarity = async (user: ProfileEntry) => {
    const profiles = await getAllUserProfiles(user)
    
    // Get all profile views in one query
    const { data: viewsData } = await supabase
        .from('ProfileViews')
        .select('viewed_profile_id, viewed_at')
        .eq('user_id', user['User-ID'])
        .in('viewed_profile_id', profiles.map(p => p['User-ID']))

    // Create a map for quick lookup
    const profileViewsMap = new Map(
        viewsData?.map(view => [
            view.viewed_profile_id,
            new Date(view.viewed_at).getTime()
        ]) || []
    )

    const indexedEntries = profiles.map(profile => {
        const similarityIndex = calculateSimilarityIndex(
            user, 
            profile, 
            profileViewsMap.get(profile['User-ID'])
        )
        return { profileEntry: profile, similarityIndex }
    })

    return indexedEntries
        .sort((a, b) => b.similarityIndex - a.similarityIndex)
        .map(entry => entry.profileEntry)
}
