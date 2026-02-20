/** @type {import('jest').Config} */
module.exports = {
    preset: 'jest-expo',
    setupFilesAfterEnv: ['./jest.setup.ts'],
    testPathIgnorePatterns: ['/node_modules/', '__tests__/helpers/'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    collectCoverageFrom: [
        'utils/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'contexts/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        '!**/__tests__/**',
        '!**/node_modules/**',
    ],
};
