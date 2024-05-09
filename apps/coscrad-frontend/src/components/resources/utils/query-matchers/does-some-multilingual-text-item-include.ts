import { IMultilingualText } from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';

export const doesSomeMultilingualTextItemInclude = (
    multilingualText: IMultilingualText,
    query: string
) => {
    // const languageCodeInQuery = parseLanguageCode(query);

    if (!isNonEmptyString(languageCodeInQuery)) {
        // language independent search
        return multilingualText.items.some(({ text }) =>
            text.toLowerCase().includes(query.toLowerCase())
        );
    }

    const searchTerms = query.split(`{${languageCodeInQuery}}:`)[1];

    return multilingualText.items.some(
        ({ text, languageCode }) =>
            text.toLowerCase().includes(searchTerms.toLowerCase()) &&
            languageCodeInQuery === languageCode
    );
};
