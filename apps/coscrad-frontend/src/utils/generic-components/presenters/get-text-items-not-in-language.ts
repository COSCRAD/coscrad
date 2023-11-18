import { IMultilingualText, IMultilingualTextItem, LanguageCode } from '@coscrad/api-interfaces';

export const getTextItemsNotInLanguage = (
    { items }: IMultilingualText,
    languageCodeToEliminate: LanguageCode
): IMultilingualTextItem[] => {
    return items.filter(({ languageCode }) => languageCode !== languageCodeToEliminate);
};
