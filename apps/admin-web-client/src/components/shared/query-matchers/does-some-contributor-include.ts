import { IContributionSummary } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { parseLanguageCode } from './parse-language-code-from-query';

export const doesSomeContributorInclude = (
    contributionSummaries: IContributionSummary[],
    query: string
) => {
    const languageCodeInQuery = parseLanguageCode(query);

    const searchTerms = isNullOrUndefined(languageCodeInQuery)
        ? query
        : query.split(`{${languageCodeInQuery}}:`)[1];

    if (isNullOrUndefined(searchTerms)) return false;

    return contributionSummaries.some(({ statement }) =>
        statement.toLowerCase().includes(searchTerms.toLowerCase())
    );
};
