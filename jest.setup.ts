// AsyncStorage mock (built-in from the package)
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// expo-localization mock (jest.fn so tests can override with mockReturnValue)
jest.mock('expo-localization', () => ({
    getLocales: jest.fn(() => [{ languageCode: 'en' }]),
}));

// expo-router mock
jest.mock('expo-router', () => ({
    useLocalSearchParams: jest.fn(() => ({})),
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    })),
    router: {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    },
    Link: 'Link',
    useFocusEffect: jest.fn(),
}));

// @react-navigation/native mock
jest.mock('@react-navigation/native', () => ({
    useFocusEffect: jest.fn(),
}));

// react-native-reanimated mock
jest.mock('react-native-reanimated', () =>
    require('react-native-reanimated/mock')
);
