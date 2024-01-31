import { LanguageCode } from '@coscrad/api-interfaces';
import { Tooltip, Typography } from '@mui/material';

export interface TranslatedTranscriptTextItemPresenterProps {
    text: string;
    languageCode: LanguageCode;
}

export const TranslatedTranscriptTextItemPresenter = ({
    languageCode,
    text,
}: TranslatedTranscriptTextItemPresenterProps): JSX.Element => {
    return (
        <Tooltip title={languageCode}>
            <Typography variant="body1">
                <p>{text}</p>
            </Typography>
        </Tooltip>
    );
};
