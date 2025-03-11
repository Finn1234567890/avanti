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

const calculateSimilarityIndex = async (user: ProfileEntry, profile: ProfileEntry) => {
    let similarityIndex = 0

    if (user && profile) {
        const penalty = await penaltilizedViewedProfile(profile, user)
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
    let indexedEntries: EntryWithIndex[] = []

    const profiles = await getAllUserProfiles(user)

    for (const profile of profiles) {
        const similarityIndex = await calculateSimilarityIndex(user, profile)
        const indexedEntry: EntryWithIndex = {profileEntry: profile, similarityIndex: similarityIndex}
        indexedEntries.push(indexedEntry)
    }

    const sortedByHighestSimilarityWithIndex = indexedEntries.sort((a, b) => b.similarityIndex - a.similarityIndex)

    console.log('Sorted Profiles: ', sortedByHighestSimilarityWithIndex)

    const sortedByHighestSimilarity = sortedByHighestSimilarityWithIndex.map((entry) => entry.profileEntry)

    return sortedByHighestSimilarity
}


const penaltilizedViewedProfile = async (profile: ProfileEntry, user: ProfileEntry) => {
    console.log('Penalty for profile: ', profile['User-ID'])
    let penalty = 0
    const { data, error } = await supabase
        .from('ProfileViews')
        .select('viewed_at')
        .eq('viewed_profile_id', profile['User-ID'])
        .eq('user_id', user['User-ID'])
    
    if (error) {
        console.log('Error fetching profile views:', error)
        return penalty
    }

    // Check if data exists AND has at least one entry
    if (data && data.length > 0) {
        const viewedAt = data[0].viewed_at
        const now = new Date()
        const timeDiff = now.getTime() - new Date(viewedAt).getTime()
        const hoursDiff = timeDiff / (1000 * 60 * 60)
        // Logarithmic decay with base 2, rounded to 2 decimal places
        penalty = 2 * Number((1 / (1 + Math.log2(1 + hoursDiff))).toFixed(2))
    }

    console.log('Penalty: ', penalty)
    
    return penalty
}
