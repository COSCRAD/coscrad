import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import LanguageIcon from '@mui/icons-material/Language';
import { AccordionDetails, IconButton, Tooltip, styled } from '@mui/material';
import { getLabelForLanguage } from './get-label-for-language';

interface TranslatedLanguageTextPresenterProps {
    languageCode: LanguageCode;
    text: string;
    role: MultilingualTextItemRole;
    onTextSelection?: (charRange: [number, number], languageCode: LanguageCode) => void;
}

const MultilingualTextField = styled('textarea')({
    minHeight: '10px',
    border: '0px',
    backgroundColor: 'inherit',
    resize: 'none',
    fontFamily: 'inherit',
    outline: 'none',
    overflow: 'auto',
});

export const TranslatedLanguageTextPresenter = ({
    languageCode,
    text,
    role,
    onTextSelection,
}: TranslatedLanguageTextPresenterProps): JSX.Element => {
    return (
        <AccordionDetails
            key={`${languageCode}-${role}`}
            sx={{ display: 'flex', alignItems: 'center' }}
        >
            <MultilingualTextField
                onSelect={(e) => {
                    console.log({ eventdata: e });

                    const charRange: [number, number] = [
                        e.currentTarget.selectionStart,
                        e.currentTarget.selectionEnd,
                    ];

                    if (typeof onTextSelection === 'function')
                        onTextSelection(charRange, languageCode);
                }}
                readOnly
            >
                {text}
            </MultilingualTextField>
            <Tooltip title={`${getLabelForLanguage(languageCode)}, '${role}'`}>
                <IconButton>
                    <LanguageIcon />
                </IconButton>
            </Tooltip>
        </AccordionDetails>
    );
};
