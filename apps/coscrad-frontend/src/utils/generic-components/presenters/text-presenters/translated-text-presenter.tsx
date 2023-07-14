import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import LanguageIcon from '@mui/icons-material/Language';
import { AccordionDetails, IconButton, Tooltip, Typography } from '@mui/material';
import { getLabelForLanguage } from './get-label-for-language';

interface TranslatedLanguageTextPresenterProps {
    languageCode: LanguageCode;
    text: string;
    role: MultilingualTextItemRole;
    onTextSelection?: (charRange: [number, number], languageCode: LanguageCode) => void;
}

const isWindowContext = typeof window !== 'undefined';

export const TranslatedLanguageTextPresenter = ({
    languageCode,
    text,
    role,
    onTextSelection,
}: TranslatedLanguageTextPresenterProps): JSX.Element => {
    const onSelect = (e) => {
        const startOffset = isWindowContext && window.getSelection().getRangeAt(0).startOffset;
        const endOffset = isWindowContext && window.getSelection().getRangeAt(0).endOffset;

        const charRange: [number, number] = [startOffset, endOffset];

        if (typeof onTextSelection === 'function') onTextSelection(charRange, languageCode);
    };

    return (
        <AccordionDetails
            key={`${languageCode}-${role}`}
            sx={{ display: 'flex', alignItems: 'center' }}
        >
            <Typography color={'text.primary'} onMouseUp={onSelect}>
                {text}
            </Typography>
            <Tooltip title={`${getLabelForLanguage(languageCode)}, '${role}'`}>
                <IconButton>
                    <LanguageIcon />
                </IconButton>
            </Tooltip>
        </AccordionDetails>
    );
};
