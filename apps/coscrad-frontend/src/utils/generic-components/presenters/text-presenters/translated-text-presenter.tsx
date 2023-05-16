import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import LanguageIcon from '@mui/icons-material/Language';
import { AccordionDetails, IconButton, Tooltip, Typography } from '@mui/material';

const getLabelForLanguage = (languageCodeToFind: LanguageCode): string => {
    const label =
        Object.entries(LanguageCode).find(
            ([_label, languageCode]) => languageCode === languageCodeToFind
        )?.[0] || null;

    if (isNullOrUndefined(label)) {
        throw new Error(`failed to find a label for language code: ${languageCodeToFind}`);
    }

    return label;
};

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
