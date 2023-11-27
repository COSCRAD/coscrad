import { isNonEmptyString } from './is-non-empty-string';

const NON_PRINTING_CHARACTERS = [' ', '\t', '\n'];

const maxPageNumberLengthInclusive = 9;

export const isPageNumber = (input: unknown): input is string => {
    if (!isNonEmptyString(input)) return false;

    const hasInvalidCharacters = NON_PRINTING_CHARACTERS.some(
        (invalidCharacter) => input.indexOf(invalidCharacter) !== -1
    );

    if (hasInvalidCharacters) return false;

    return input.length <= maxPageNumberLengthInclusive;
};
