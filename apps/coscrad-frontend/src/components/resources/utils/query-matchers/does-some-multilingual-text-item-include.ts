import { IMultilingualTextRecord } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { parseLanguageCode } from './parse-language-code-from-query';

// This function name would need to change if we're using IMultilingualTextRecord
export const doesSomeMultilingualTextItemInclude = (
    multilingualText: IMultilingualTextRecord,
    query: string
) => {
    const languageCodeInQuery = parseLanguageCode(query);

    if (isNullOrUndefined(languageCodeInQuery)) {
        // language independent search
        const textForSearch = `${Object.values(multilingualText.translations).join(' ')} ${
            multilingualText.original.text
        }`;

        return textForSearch.toLowerCase().includes(query.toLowerCase());
    }

    const splitQuery = query.split(`{${languageCodeInQuery}}:`);

    if (isNullOrUndefined(splitQuery[1])) return undefined;

    const searchTerms = query.split(`{${languageCodeInQuery}}:`)[1];

    if (multilingualText.original.languageCode === languageCodeInQuery)
        return multilingualText.original.text.toLowerCase().includes(searchTerms.toLowerCase());

    if (isNullOrUndefined(multilingualText.translations[languageCodeInQuery])) return undefined;

    const languageTextToSearch = multilingualText.translations[languageCodeInQuery];

    return Object.values(languageTextToSearch)
        .join(' ')
        .toLowerCase()
        .includes(searchTerms.toLowerCase());
};
