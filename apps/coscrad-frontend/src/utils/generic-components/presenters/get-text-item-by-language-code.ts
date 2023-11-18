import { IMultilingualText, IMultilingualTextItem, LanguageCode } from '@coscrad/api-interfaces';

export const getTextItemByLanguageCode = (
    { items }: IMultilingualText,
    languageCodeToFind: LanguageCode
): IMultilingualTextItem => {
    return items.find(({ languageCode }) => languageCode === languageCodeToFind);
};
