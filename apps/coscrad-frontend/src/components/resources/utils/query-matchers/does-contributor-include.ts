import { ContributorWithId } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { parseLanguageCode } from './parse-language-code-from-query';

export const doesContributorInclude = (
    contributiorsWithIds: ContributorWithId[],
    query: string
) => {
    const languageCodeInQuery = parseLanguageCode(query);

    const searchTerms = isNullOrUndefined(languageCodeInQuery)
        ? query
        : query.split(`{${languageCodeInQuery}}:`)[1];

    if (isNullOrUndefined(searchTerms)) return undefined;

    return contributiorsWithIds
        .map(({ fullName }) => fullName.toLowerCase())
        .join(' ')
        .includes(searchTerms.toLowerCase());
};
