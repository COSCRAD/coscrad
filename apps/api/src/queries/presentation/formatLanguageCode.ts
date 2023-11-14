import { LanguageCode } from '@coscrad/api-interfaces';

/**
 * Note that the keys that our developers use are actually the user-facing labels,
 * e.g., `English` is the key for `en`.
 */
export const formatLanguageCode = (languageCodeToFormat: LanguageCode): string =>
    Object.entries(LanguageCode).find(
        ([_languageName, languageCode]) => languageCode === languageCodeToFormat
    )?.[0];
