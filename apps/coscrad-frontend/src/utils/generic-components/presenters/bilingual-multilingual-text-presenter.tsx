import { IMultilingualText } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box } from '@mui/material';
import { useContext } from 'react';
import { formatBilingualText } from '../../../components/resources/vocabulary-lists/utils';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { isInLanguage } from './is-in-language';
import { isOriginalTextItem } from './is-original-text-item';
import { MultilingualTextWithoutTranslations } from './multilingual-text-without-translations-presenter';

export interface MultilingualTextPresenterProps {
    text: IMultilingualText;
}

export const BilingualTextPresenter = ({ text }: MultilingualTextPresenterProps): JSX.Element => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

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

    return (
        <Box width={'fit-content'} data-testid="multilingual-text-display">
            {isTranslated ? (
                // TODO clean this up
                /**
                 * Note that we are prioritizing a translation item is in the default
                 * language code or English as this will almost always be the case
                 * in the data. Otherwise, we just pick the first translation. For now,
                 * we aren't doing N-lingual sites with n>2, but if we ever move to this,
                 * we need to update our logic here to be more robust to the fully
                 * multilingual case.
                 */
                formatBilingualText(
                    primaryMultilingualTextItem.text,
                    (
                        translations.find(
                            ({ languageCode }) => languageCode === defaultLanguageCode
                        ) || translations[0]
                    ).text
                )
            ) : (
                <MultilingualTextWithoutTranslations
                    primaryMultilingualTextItem={primaryMultilingualTextItem}
                />
            )}
        </Box>
    );
};
