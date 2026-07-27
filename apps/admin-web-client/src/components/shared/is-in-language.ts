import { IMultilingualTextItem, LanguageCode } from '@coscrad/api-interfaces';

export const isInLanguage = (
    languageCode: LanguageCode,
    textItem: IMultilingualTextItem
): boolean => {
    return textItem.languageCode === languageCode;
};
