import { IMultilingualText, LanguageCode } from '@coscrad/api-interfaces';

const _parseLanguageCode = (query: string): LanguageCode | undefined => {
    if (!query.includes('{')) return undefined;

    const splitOnBracket = query.split('{');

    const beforeClosingBracket = splitOnBracket[1].split('}')[0];

    return Object.values(LanguageCode).find(
        (languageCode) => languageCode === beforeClosingBracket
    );
};

export const doesSomeMultilingualTextItemInclude = (
    multilingualText: IMultilingualText,
    query: string
) => {
    // const languageCodeInQuery = parseLanguageCode(query);

    // if (!isNonEmptyString(languageCodeInQuery)) {
    // language independent search
    return multilingualText.items.some(({ text }) =>
        text.toLowerCase().includes(query.toLowerCase())
    );
    // }

    // return multilingualText.items.some(
    //     ({ text, languageCode }) =>
    //         text.toLowerCase().includes(query.toLowerCase()) && languageCodeInQuery === languageCode
    // );
};
