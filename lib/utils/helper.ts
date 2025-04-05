import AsyncStorage from "@react-native-async-storage/async-storage"

export const waitForStorage = async (timeout = 5000) => {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      try {
        const test = await AsyncStorage.getItem('supabase.auth.token')
        if (test !== null) return
      } catch (e) {
        console.log('storage')
      }
      await new Promise((r) => setTimeout(r, 100))
    }
    console.log('!!!!AsyncStorage not ready in time')
    return
}