import { AlphabetData } from './Menu';

export const buildTestAlphabetData = (): AlphabetData => {
    return {
        data: {
            name: 'mock name',
            name_english: 'mock english',
            poster: {
                name: 'mock poster name',
                url: 'https://mockposterurl.com/mock.png',
            },
        },
    };
};
