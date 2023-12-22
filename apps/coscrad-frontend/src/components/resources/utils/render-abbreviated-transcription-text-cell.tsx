import { Typography } from '@mui/material';

export const renderAbbreviatedTranscriptionTextCell = (text: string) => {
    if (text.length === 0) return null;

    return (
        <Typography variant="body1">
            {text.split(' ').map((word, index) => (index < 10 ? `${word} ` : ''))}&hellip;
        </Typography>
    );
};
