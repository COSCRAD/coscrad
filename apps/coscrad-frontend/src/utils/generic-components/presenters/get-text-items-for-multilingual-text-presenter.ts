import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { isInLanguage } from './is-in-language';
import { isOriginalTextItem } from './is-original-text-item';

export const getTextItemsForMultilingualTextPresenter = (text, defaultLanguageCode) => {
    const textItemWithDefaultLanguage = text.items.find((item) =>
        isInLanguage(defaultLanguageCode, item)
    );

    const primaryMultilingualTextItem = isNullOrUndefined(textItemWithDefaultLanguage)
        ? text.items.find((item) => isOriginalTextItem(item))
        : textItemWithDefaultLanguage;

    const { languageCode: languageCodeOfPrimaryTextItem } = primaryMultilingualTextItem;

    const translations = text.items.filter(
        (item) => !isInLanguage(languageCodeOfPrimaryTextItem, item)
    );

    const isTranslated: boolean = translations.length > 0 ? true : false;

    return {
        primaryMultilingualTextItem: primaryMultilingualTextItem,
        translations: translations,
        isTranslated: isTranslated,
    };
};
