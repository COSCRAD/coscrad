import { IMultilingualText, LanguageCode } from '@coscrad/api-interfaces';
import { Box } from '@mui/material';
import { FlatMultilingualTextPresenter } from './flat-multilingual-text-presenter';
import { groupMultilingualTextItems } from './group-multilingual-text-items';
import { MultilingualTextTooltipPresenter } from './multilingual-text-tooltip-presenter';

export interface MultilingualTextPresenterProps {
    text: IMultilingualText;
    termId?: string;
}

export const MultilingualTextPresenter = ({
    text,
    termId,
}: MultilingualTextPresenterProps): JSX.Element => {
    const defaultLanguageCode = LanguageCode.Haida;

    const { primaryMultilingualTextItem, isTranslated, translations } = groupMultilingualTextItems(
        text,
        defaultLanguageCode
    );

    return (
        <Box data-testid="multilingual-text-display">
            {isTranslated ? (
                <MultilingualTextTooltipPresenter
                    termId={termId}
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
