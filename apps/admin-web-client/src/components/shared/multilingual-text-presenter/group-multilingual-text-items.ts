import { IMultilingualTextItem } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { isInLanguage } from './is-in-language';
import { isOriginalTextItem } from './is-original-text-item';

interface TextItemsForMultilingualTextPresenterProps {
    primaryMultilingualTextItem: IMultilingualTextItem;
    translations: IMultilingualTextItem[];
    isTranslated: boolean;
}

/**
 * TODO If we find a way to share the MultilingualText class with the client,
 * we can just use the methods we have already written and tested on the back-end.
 */
export const groupMultilingualTextItems = (
    text,
    defaultLanguageCode
): TextItemsForMultilingualTextPresenterProps => {
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
