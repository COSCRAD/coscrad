import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import LanguageIcon from '@mui/icons-material/Language';
import { AccordionDetails, IconButton, Tooltip, Typography } from '@mui/material';
import { getLabelForLanguage } from './get-label-for-language';

interface TranslatedLanguageTextPresenterProps {
    languageCode: LanguageCode;
    text: string;
    role: MultilingualTextItemRole;
    onTextSelection?: (charRange: [number, number]) => void;
}

export const TranslatedLanguageTextPresenter = ({
    languageCode,
    text,
    role,
    onTextSelection,
}: TranslatedLanguageTextPresenterProps): JSX.Element => {
    return (
        <AccordionDetails key={`${languageCode}-${role}`}>
            <Typography color={'text.primary'}>
                <textarea
                    onSelect={(e) => {
                        console.log({ eventdata: e });

                        const charRange: [number, number] = [
                            e.currentTarget.selectionStart,
                            e.currentTarget.selectionEnd,
                        ];

                        if (typeof onTextSelection === 'function') onTextSelection(charRange);
                    }}
                >
                    {text}
                </textarea>
                <Tooltip title={`${getLabelForLanguage(languageCode)}, '${role}'`}>
                    <IconButton>
                        <LanguageIcon />
                    </IconButton>
                </Tooltip>
            </Typography>
        </AccordionDetails>
    );
};
