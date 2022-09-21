module.exports = {
    displayName: 'tsilhqotin-language-hub',
    preset: '../../jest.preset.js',
    transform: {
        '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
        '^.+\\.[tj]sx?$': 'babel-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../coverage/apps/tsilhqotin-language-hub',
    setupFilesAfterEnv: ['./setupTests.js'],
};
