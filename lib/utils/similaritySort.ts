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

const calculateSimilarityIndex = (user: ProfileEntry, profile: ProfileEntry) => {
    let similarityIndex = 0

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

    profiles.forEach((profile) => {
        const similarityIndex = calculateSimilarityIndex(user, profile)
        const indexedEntry: EntryWithIndex = {profileEntry: profile, similarityIndex: similarityIndex}
        indexedEntries.push(indexedEntry)
    })

    const sortedByHighestSimilarityWithIndex = indexedEntries.sort((a, b) => b.similarityIndex - a.similarityIndex)

    console.log('Sorted Profiles: ', sortedByHighestSimilarityWithIndex)

    const sortedByHighestSimilarity = sortedByHighestSimilarityWithIndex.map((entry) => entry.profileEntry)

    return sortedByHighestSimilarity
}
