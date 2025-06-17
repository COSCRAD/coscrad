import { IMultilingualText } from '@coscrad/api-interfaces';
import { Box } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { FlatMultilingualTextPresenter } from './flat-multilingual-text-presenter';
import { groupMultilingualTextItems } from './group-multilingual-text-items';
import { ExpandableMultilingualTextWithTranslationsPresenter } from './multilingual-text-with-translations-presenter';

export interface MultilingualTextPresenterProps {
    text: IMultilingualText;
}

export const MultilingualTextPresenter = ({
    text,
}: MultilingualTextPresenterProps): JSX.Element => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const { primaryMultilingualTextItem, isTranslated, translations } = groupMultilingualTextItems(
        text,
        defaultLanguageCode
    );

    return (
        <Box width={'fit-content'} data-testid="multilingual-text-display">
            {isTranslated ? (
                <ExpandableMultilingualTextWithTranslationsPresenter
                    primaryMultilingualTextItem={primaryMultilingualTextItem}
                    translations={translations}
                />
            ) : (
                <FlatMultilingualTextPresenter
                    primaryMultilingualTextItem={primaryMultilingualTextItem}
                    translations={[]}
                />
            )}
        </Box>
    );
};
