import { IMultilingualTextItem } from '@coscrad/api-interfaces';

export const findTextItemByLanguageCode = (items, languageCodeToFind): IMultilingualTextItem => {
    return items.find(({ languageCode }) => languageCode === languageCodeToFind);
};
