import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Clear all mock AsyncStorage data between tests
 */
export async function clearStorage(): Promise<void> {
    await AsyncStorage.clear();
}

/**
 * Populate mock AsyncStorage with key-value pairs
 */
export async function seedStorage(data: Record<string, string>): Promise<void> {
    const entries = Object.entries(data).map(([key, value]) => [key, value] as [string, string]);
    await AsyncStorage.multiSet(entries);
}
