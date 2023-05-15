import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import LanguageIcon from '@mui/icons-material/Language';
import { AccordionDetails, IconButton, Tooltip, Typography } from '@mui/material';
import { getLabelForLanguage } from './get-label-for-language';

interface TranslatedLanguageTextPresenterProps {
    languageCode: LanguageCode;
    text: string;
    role: MultilingualTextItemRole;
}

export const TranslatedLanguageTextPresenter = ({
    languageCode,
    text,
    role,
}: TranslatedLanguageTextPresenterProps): JSX.Element => {
    return (
        <AccordionDetails key={`${languageCode}-${role}`}>
            <Typography color={'text.primary'}>
                {text}
                <Tooltip title={`${getLabelForLanguage(languageCode)}, '${role}'`}>
                    <IconButton>
                        <LanguageIcon />
                    </IconButton>
                </Tooltip>
            </Typography>
        </AccordionDetails>
    );
};
