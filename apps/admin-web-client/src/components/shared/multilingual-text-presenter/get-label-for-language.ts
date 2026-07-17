import { LanguageCode } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';

export const getLabelForLanguage = (languageCodeToFind: LanguageCode): string => {
    const label =
        Object.entries(LanguageCode).find(
            ([_label, languageCode]) => languageCode === languageCodeToFind
        )?.[0] || null;

    if (isNullOrUndefined(label)) {
        throw new Error(`failed to find a label for language code: ${languageCodeToFind}`);
    }

    return label;
};
