import { IMultilingualTextItem } from '@coscrad/api-interfaces';
import { Language as LanguageIcon } from '@mui/icons-material';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { getLabelForLanguage } from './text-presenters/get-label-for-language';

interface MultilingualTextItemPresenterProps {
    isHeading: boolean;
    item: IMultilingualTextItem;
}

export const MultilingualTextItemPresenter = ({
    isHeading,
    item,
}: MultilingualTextItemPresenterProps): JSX.Element => {
    const { text, languageCode, role } = item;
    return (
        <Typography variant={isHeading ? 'h4' : 'body1'} margin={'auto 0'}>
            {text}
            <Tooltip title={`${getLabelForLanguage(languageCode)}, '${role}'`}>
                <IconButton>
                    <LanguageIcon />
                </IconButton>
            </Tooltip>
        </Typography>
    );
};
