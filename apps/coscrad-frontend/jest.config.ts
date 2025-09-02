/* eslint-disable */
export default {
    displayName: 'coscrad-frontend',
    preset: '../../jest.preset.js',
    transform: {
        '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
        '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
    },
    transformIgnorePatterns: [`/node_modules/(?!@react-leaflet|react-leaflet)`],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    setupFilesAfterEnv: ['./setupTests.js'],
};
