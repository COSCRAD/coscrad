import { IMultilingualText } from '@coscrad/api-interfaces';
import { Box } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { getTextItemsForMultilingualTextPresenter } from './get-text-items-for-multilingual-text-presenter';
import { MultilingualTextWithTranslations } from './multilingual-text-with-translations-presenter';
import { MultilingualTextWithoutTranslations } from './multilingual-text-without-translations-presenter';

export interface MultilingualTextPresenterProps {
    text: IMultilingualText;
    expanded: boolean;
}

export const MultilingualTextPresenter = ({
    text,
    expanded,
}: MultilingualTextPresenterProps): JSX.Element => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const { primaryMultilingualTextItem, isTranslated, translations } =
        getTextItemsForMultilingualTextPresenter(text, defaultLanguageCode);

    return (
        <Box width={'fit-content'} data-testid="multilingual-text-display">
            {isTranslated ? (
                <MultilingualTextWithTranslations
                    primaryMultilingualTextItem={primaryMultilingualTextItem}
                    translations={translations}
                    expanded={expanded}
                />
            ) : (
                <MultilingualTextWithoutTranslations
                    primaryMultilingualTextItem={primaryMultilingualTextItem}
                />
            )}
        </Box>
    );
};
