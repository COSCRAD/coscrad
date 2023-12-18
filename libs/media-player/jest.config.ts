/* eslint-disable */
export default {
    displayName: 'media-player',
    preset: '../../jest.preset.js',
    transform: {
        '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
        '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }],
    },
    transformIgnorePatterns: [`/node_modules/(?!@react-leaflet|react-leaflet)`],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};
