import { LanguageCode } from '@coscrad/api-interfaces';

export /**
 * Clearly this doesn't belong here. However, we want to generalize it to
 * work for other resource types. It's a matter of parsing the query string
 * based on the `CoscradDataType` of each field.
 *
 * We may end up moving this logic to the server.
 */
const compileMultilingualTextContainsQuery = (
    fieldName: string,
    queryString: string
    // TODO return type
) => {
    const extractedLanguageCode = queryString.slice(1).split('}')[0];

    const searchTermsWithLanguageCodeRemoved = queryString.split('}')[1];

    if (Object.values(LanguageCode).some((lc) => lc === extractedLanguageCode)) {
        return {
            type: 'SIMPLE',
            operator: 'MULTILINGUAL_TEXT_INCLUDES',
            field: fieldName,
            params: [searchTermsWithLanguageCodeRemoved, extractedLanguageCode],
        };
    }

    /**
     * If the language code is not a known language code, we naively search
     * for the text, e.g., including `{foo}` in `{foo}Ooops`.
     */
    return {
        type: 'SIMPLE',
        field: fieldName,
        operator: 'MULTILINGUAL_TEXT_INCLUDES',
        params: [queryString],
    };
};
