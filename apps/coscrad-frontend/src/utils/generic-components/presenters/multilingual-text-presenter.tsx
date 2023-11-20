import { IMultilingualText } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { getOriginalTextItem } from './get-original-text-item';
import { getTextItemByLanguageCode } from './get-text-item-by-language-code';
import { getTextItemsNotInLanguage } from './get-text-items-not-in-language';
import { MultilingualTextWithTranslations } from './multilingual-text-with-translations-presenter';
import { MultilingualTextWithoutTranslations } from './multilingual-text-without-translations-presenter';

export interface MultilingualTextPresenterProps {
    text: IMultilingualText;
}

export const MultilingualTextPresenter = ({
    text,
}: MultilingualTextPresenterProps): JSX.Element => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const textItemWithDefaultLanguage = getTextItemByLanguageCode(text, defaultLanguageCode);

    const primaryMultilingualTextItem = isNullOrUndefined(textItemWithDefaultLanguage)
        ? getOriginalTextItem(text)
        : textItemWithDefaultLanguage;

    const { languageCode: languageCodeOfPrimaryTextItem } = primaryMultilingualTextItem;

    const translations = getTextItemsNotInLanguage(text, languageCodeOfPrimaryTextItem);

    const isTranslated: boolean = translations.length > 0 ? true : false;

    return (
        <Box width={'fit-content'} data-testid="multilingual-text-display">
            {isTranslated ? (
                <MultilingualTextWithTranslations
                    primaryMultilingualTextItem={primaryMultilingualTextItem}
                    translations={translations}
                />
            ) : (
                <MultilingualTextWithoutTranslations
                    primaryMultilingualTextItem={primaryMultilingualTextItem}
                />
            )}
        </Box>
    );
};
