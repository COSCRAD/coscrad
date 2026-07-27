import { Typography } from '@mui/material';
import { TruncateTextForDisplay } from './truncate-text-for-display';

const WORD_LENGTH_LIMIT = 10;

export const renderAbbreviatedTranscriptionTextCell = (text: string) => {
    if (text.length === 0) return null;

    return (
        <Typography variant="body1">
            <TruncateTextForDisplay text={text} limit={WORD_LENGTH_LIMIT} />
        </Typography>
    );
};
