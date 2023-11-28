import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { Language as LanguageIcon } from '@mui/icons-material';
import { IconButton, Tooltip, Typography, TypographyProps } from '@mui/material';
import { getLabelForLanguage } from './text-presenters/get-label-for-language';

interface MultilingualTextItemPresenterProps {
    variant: TypographyProps['variant'];
    text: string;
    languageCode: LanguageCode;
    role: MultilingualTextItemRole;
}

export const MultilingualTextItemPresenter = ({
    variant,
    text,
    languageCode,
    role,
}: MultilingualTextItemPresenterProps): JSX.Element => {
    return (
        <Typography component="span" variant={variant} margin={'auto 0'}>
            {text}
            <Tooltip title={`${getLabelForLanguage(languageCode)}, '${role}'`}>
                <IconButton>
                    <LanguageIcon />
                </IconButton>
            </Tooltip>
        </Typography>
    );
};
