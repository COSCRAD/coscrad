import { IMultilingualText } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { parseLanguageCode } from './parse-language-code-from-query';

export const doesSomeMultilingualTextItemInclude = (
    multilingualText: IMultilingualText,
    query: string
) => {
    const languageCodeInQuery = parseLanguageCode(query);

    if (isNullOrUndefined(languageCodeInQuery)) {
        // language independent search
        return multilingualText.items.some(({ text }) =>
            text.toLowerCase().includes(query.toLowerCase())
        );
    }

    const splitQuery = query.split(`{${languageCodeInQuery}}:`);

    if (isNullOrUndefined(splitQuery[1])) return undefined;

    const searchTerms = query.split(`{${languageCodeInQuery}}:`)[1];

    return multilingualText.items.some(
        ({ text, languageCode }) =>
            text.toLowerCase().includes(searchTerms.toLowerCase()) &&
            languageCodeInQuery === languageCode
    );
};
