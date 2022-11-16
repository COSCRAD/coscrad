// TODO Unit test this helper

import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';

// Too bad we can't use `isDeepStrictEqual` in the browser.
/**
 * Note that this is curried because the current use case is comparing one fixed
 * resource composite identifier to an array of other identifiers. Feel free to
 * overload with a non curried signature if you need it.
 */
export const compositeIdentifierMatches =
    ({ id, type }: ResourceCompositeIdentifier) =>
    ({ id: idToMatch, type: typeToMatch }: ResourceCompositeIdentifier) =>
        id === idToMatch && type === typeToMatch;
