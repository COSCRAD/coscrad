import { LanguageCode } from '@coscrad/api-interfaces';

export const parseLanguageCode = (query: string): LanguageCode | undefined => {
    if (!query.includes('{')) return undefined;

    const splitOnBracket = query.split('{');

    const beforeClosingBracket = splitOnBracket[1].split('}')[0];

    return Object.values(LanguageCode).find(
        (languageCode) => languageCode === beforeClosingBracket
    );
};
