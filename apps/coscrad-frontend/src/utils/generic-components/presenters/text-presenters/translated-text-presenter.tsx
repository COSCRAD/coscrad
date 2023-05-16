import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { AccordionDetails, Typography } from '@mui/material';

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
                <br />
                {`${languageCode}, '${role}'`}
            </Typography>
        </AccordionDetails>
    );
};
