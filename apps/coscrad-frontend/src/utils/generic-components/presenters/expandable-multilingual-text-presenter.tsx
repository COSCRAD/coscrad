import { IMultilingualText } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { isInLanguage } from './is-in-language';
import { isOriginalTextItem } from './is-original-text-item';
import { MultilingualTextWithTranslations } from './multilingual-text-with-translations-presenter';
import { MultilingualTextWithoutTranslations } from './multilingual-text-without-translations-presenter';

export interface MultilingualTextPresenterProps {
    text: IMultilingualText;
}

export const ExpandableMultilingualTextPresenter = ({
    text,
}: MultilingualTextPresenterProps): JSX.Element => {
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
