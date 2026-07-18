import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { Typography, TypographyProps } from '@mui/material';
import { getLabelForLanguage } from './get-label-for-language';

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
            {text} ({`${getLabelForLanguage(languageCode)}, '${role}'`})
        </Typography>
    );
};
