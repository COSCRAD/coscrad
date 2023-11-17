import { IMultilingualTextItem } from '@coscrad/api-interfaces';
import LanguageIcon from '@mui/icons-material/Language';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
import { getLabelForLanguage } from './text-presenters/get-label-for-language';

interface MultilingualTextItemPresenterProps {
    variant: Variant;
    item: IMultilingualTextItem;
}

export const MultilingualTextItemPresenter = ({
    variant,
    item,
}: MultilingualTextItemPresenterProps): JSX.Element => {
    const { text, languageCode, role } = item;
    return (
        <Typography variant={variant} margin={'auto 0'}>
            {text}
            <Tooltip title={`${getLabelForLanguage(languageCode)}, '${role}'`}>
                <IconButton>
                    <LanguageIcon />
                </IconButton>
            </Tooltip>
        </Typography>
    );
};
