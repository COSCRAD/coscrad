import { LanguageCode } from '@coscrad/api-interfaces';

export const parseLanguageCode = (query: string): LanguageCode | undefined => {
    if (!query.includes('{')) return undefined;

    const splitOnBracket = query.split('{');

    if (!splitOnBracket[1].includes('}')) {
        return undefined;
    }

    const beforeClosingBracket = splitOnBracket[1].split('}')[0];

    return Object.values(LanguageCode).find(
        (languageCode) => languageCode === beforeClosingBracket
    );
};
