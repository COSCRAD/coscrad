/* eslint-disable */
export default {
    displayName: 'api',
    preset: '../../jest.preset.js',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
        },
    },
    testEnvironment: 'node',
    testMatch: ['<rootDir>/**/*.spec.ts', '<rootDir>/**/*.test.ts'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/apps/api',
    setupFiles: ['./jest-setup.ts'],
};
