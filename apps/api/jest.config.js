module.exports = {
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
        '^.+\\.[tj]s$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/apps/api',
    setupFiles: ['./jest-setup.ts'],
};
